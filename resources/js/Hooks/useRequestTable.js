import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";

const encodeParams = (params) => {
    const filtered = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== "" && v !== null)
    );
    return { f: btoa(JSON.stringify(filtered)) };
};

export default function useRequestTable({ initialFilters, pagination }) {
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [statusFilter, setStatusFilter] = useState(
        initialFilters?.status || "all"
    );
    const [filters, setFilters] = useState(initialFilters || {});

    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        setSearchValue(filters?.search || "");
        setStatusFilter(filters?.status || "all");
    }, [filters?.search, filters?.status]);

    const fetchTableData = (params) => {
        setLoading(true);
        router.get(route("request.table"), encodeParams(params), {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);

        const params = {
            page: 1,
            pageSize: pagination?.per_page || 10,
            search: filters?.search || "",
            status: value,
            sortField: filters?.sortField || "created_at",
            sortOrder: filters?.sortOrder || "desc",
        };
        fetchTableData(params);
    };

    const handleTableChange = (paginationData, _, sorter) => {
        const params = {
            page: paginationData.current,
            pageSize: paginationData.pageSize,
            search: filters?.search || "",
            status: statusFilter,
            sortField: sorter?.field || "created_at",
            sortOrder: sorter?.order === "ascend" ? "asc" : "desc",
        };
        fetchTableData(params);
    };

    const handleSearch = (value) => {
        setSearchValue(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(() => {
            const params = {
                page: 1,
                pageSize: pagination?.per_page || 10,
                search: value,
                status: statusFilter,
                sortField: filters?.sortField || "created_at",
                sortOrder: filters?.sortOrder || "desc",
            };
            fetchTableData(params);
        }, 500);
    };

    return {
        loading,
        searchValue,
        statusFilter,
        filters,
        setFilters,
        handleStatusChange,
        handleTableChange,
        handleSearch,
    };
}
