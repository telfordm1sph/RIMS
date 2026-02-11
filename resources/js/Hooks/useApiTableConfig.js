import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

export const useApiTableConfig = (
    apiRoute,
    columnDefinitions,
    initialFilters = {},
) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        search: "",
        sortField: "created_at",
        sortOrder: "desc",
        ...initialFilters,
    });

    // Fetch data from API
    const fetchData = useCallback(
        async (
            page = pagination.current,
            pageSize = pagination.pageSize,
            customFilters = filters,
        ) => {
            setLoading(true);
            try {
                const requestFilters = {
                    page,
                    pageSize,
                    ...customFilters,
                };
                const encodedFilters = btoa(JSON.stringify(requestFilters));

                const response = await axios.get(apiRoute, {
                    params: { f: encodedFilters },
                });

                if (response.data.success) {
                    setData(response.data.data);
                    setPagination({
                        current: response.data.pagination.current_page,
                        pageSize: response.data.pagination.page_size,
                        total: response.data.pagination.total_records,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch table data:", error);
            } finally {
                setLoading(false);
            }
        },
        [apiRoute, filters, pagination.current, pagination.pageSize],
    );

    // Fetch on mount
    useEffect(() => {
        fetchData();
    }, []);

    // Handle AntD table change (pagination, sorting)
    const handleTableChange = (pag, _filters, sorter) => {
        const sortField = sorter?.field || filters.sortField;
        const sortOrder =
            sorter?.order === "ascend"
                ? "asc"
                : sorter?.order === "descend"
                  ? "desc"
                  : filters.sortOrder;

        const newFilters = { ...filters, sortField, sortOrder };
        setFilters(newFilters);
        fetchData(pag.current, pag.pageSize, newFilters);
    };

    // Table columns with sorting
    const columns = useMemo(() => {
        return columnDefinitions.map((col) => {
            const newCol = { ...col };
            if (col.sorter) {
                newCol.sorter = true;
                newCol.sortOrder =
                    filters.sortField === col.dataIndex
                        ? filters.sortOrder === "asc"
                            ? "ascend"
                            : "descend"
                        : null;
            }
            return newCol;
        });
    }, [columnDefinitions, filters.sortField, filters.sortOrder]);

    // Pagination config for AntD Table
    const paginationConfig = useMemo(
        () => ({
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
        }),
        [pagination],
    );

    return {
        data,
        loading,
        paginationConfig,
        filters,
        columns,
        handleTableChange,
        fetchData,
    };
};
