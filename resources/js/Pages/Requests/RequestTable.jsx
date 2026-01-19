import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage, router } from "@inertiajs/react";
import React, { useMemo } from "react";
import { Table, Tag, Button, Space, Card } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import StatCard from "@/Components/StatCard";
import TableToolbar from "@/Components/TableToolbar";
import useRequestTable from "@/Hooks/useRequestTable";

const RequestTable = () => {
    const {
        requests,
        pagination,
        statusCounts,
        filters: initialFilters,
        emp_data,
    } = usePage().props;
    console.log(usePage().props);
    console.log(requests.actions);

    const handleViewRequest = (record) => {
        console.log("RECORD", record);

        const appName = window.location.pathname.split("/")[1];

        const encodedId = btoa(record.id);
        const encodedActions = btoa(JSON.stringify(record.actions));

        router.visit(`/${appName}/requests/show/${encodedId}`, {
            data: {
                actions: encodedActions,
            },
            preserveState: true,
        });
    };

    const {
        loading,
        searchValue,
        statusFilter,
        handleStatusChange,

        handleSearch,
    } = useRequestTable({ initialFilters, pagination });
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 60,
        },
        {
            title: "Request Number",
            dataIndex: "request_number",
            key: "request_number",
        },
        {
            title: "Requestor Name",
            dataIndex: "requestor_name",
            key: "requestor_name",
        },
        {
            title: "Request Department",
            dataIndex: "requestor_department",
            key: "requestor_department",
        },
        {
            title: "Status",
            key: "status",
            render: (_, record) => (
                <Tag color={record.status_color}>{record.status_label}</Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            width: 100,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewRequest(record)}
                    >
                        View
                    </Button>
                </Space>
            ),
        },
    ];

    const paginationConfig = useMemo(
        () => ({
            current: pagination.current || pagination.currentPage,
            pageSize: pagination.pageSize || pagination.perPage,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} entries`,
        }),
        [pagination],
    );

    return (
        <AuthenticatedLayout>
            <StatCard stats={statusCounts} activeStatus={statusFilter} />
            <Card title="Requests" style={{ margin: "24px" }}>
                <div>
                    <TableToolbar
                        searchValue={searchValue}
                        onSearch={handleSearch}
                        statusFilter={statusFilter}
                        onStatusChange={handleStatusChange}
                        statusCounts={statusCounts}
                    />
                </div>
                <Table
                    columns={columns}
                    rowKey="id"
                    dataSource={requests}
                    pagination={paginationConfig}
                    bordered
                    size="middle"
                />
            </Card>
        </AuthenticatedLayout>
    );
};

export default RequestTable;
