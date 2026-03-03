import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";

const encodeParams = (params) => {
    // Filter out empty values
    const filtered = Object.fromEntries(
        Object.entries(params).filter(
            ([_, v]) => v !== "" && v !== null && v !== undefined,
        ),
    );

    // Convert to base64 only if there are parameters
    if (Object.keys(filtered).length > 0) {
        return { f: btoa(JSON.stringify(filtered)) };
    }

    return {};
};

export default function useRequestTable({ initialFilters, pagination }) {
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState(
        initialFilters?.search || "",
    );
    const [statusFilter, setStatusFilter] = useState(
        initialFilters?.status || "all",
    );
    const searchTimeoutRef = useRef(null);

    const fetchTableData = (params) => {
        setLoading(true);

        // Prepare the request parameters
        const requestParams = {
            page: params.page || 1,
            ...(params.perPage && { perPage: params.perPage }),
            ...(params.search && { search: params.search }),
            ...(params.status &&
                params.status !== "all" && { status: params.status }),
        };

        // Encode the parameters
        const encodedParams = encodeParams(requestParams);

        router.get(route("request.table"), encodedParams, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);

        const params = {
            page: 1,
            perPage: pagination?.perPage || 10,
            search: searchValue,
            status: value,
        };
        fetchTableData(params);
    };

    const handleSearch = (value) => {
        setSearchValue(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(() => {
            const params = {
                page: 1,
                perPage: pagination?.perPage || 10,
                search: value,
                status: statusFilter,
            };
            fetchTableData(params);
        }, 500);
    };

    const handlePageChange = (page, perPage) => {
        const params = {
            page,
            perPage: perPage || pagination?.perPage || 10,
            search: searchValue,
            status: statusFilter,
        };
        fetchTableData(params);
    };

    const handlePerPageChange = (perPage) => {
        const params = {
            page: 1,
            perPage,
            search: searchValue,
            status: statusFilter,
        };
        fetchTableData(params);
    };

    return {
        loading,
        searchValue,
        statusFilter,
        handleStatusChange,
        handleSearch,
        handlePageChange,
        handlePerPageChange,
    };
}
