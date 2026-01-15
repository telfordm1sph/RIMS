import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useMemo } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Button, Card, message, Popconfirm, Space, Table, Tag } from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useRequestTypeDrawer } from "@/Hooks/useRequestTypeDrawer";
import RequestTypeDrawer from "@/Components/requestType/RequestTypeDrawer";

const RequestType = () => {
    const { requestTypes } = usePage().props;
    console.log(usePage().props);

    const {
        drawerVisible,
        drawerMode,
        editingRequestType,
        openCreateDrawer,
        closeDrawer,
        handleRowClick,
    } = useRequestTypeDrawer();
    const dataSource = useMemo(
        () =>
            requestTypes?.map((type) => ({
                key: type.id,
                id: type.id,
                request_category: type.request_category,
                request_name: type.request_name,
                request_description: type.request_description,
                is_active: Boolean(type.is_active),
                created_at: type.created_at,
                updated_at: type.updated_at,
            })) || [],
        [requestTypes]
    );
    const handleSubmit = async (data) => {
        console.log("Form values:", data);

        try {
            const { id, ...formData } = data;
            let response;

            if (id) {
                response = await axios.put(
                    route("request-types.update", id),
                    formData
                );
            } else {
                response = await axios.post(
                    route("request-types.store"),
                    formData
                );
            }

            if (response.data.success) {
                message.success(
                    id
                        ? "Request type updated successfully!"
                        : `Request type created successfully! ID: ${
                              response.data.id || ""
                          }`
                );

                closeDrawer();
                router.reload({ only: ["requestTypes"] });
            } else {
                message.error(response.data.message || "Operation failed");
            }
        } catch (error) {
            message.error(
                id
                    ? "Failed to update request type. Please try again."
                    : "Failed to create request type. Please try again."
            );
            console.error("Request type submission error:", error);
        }
    };

    const handleDelete = async (id, e) => {
        // Stop propagation to prevent row click
        e?.stopPropagation();

        try {
            const response = await axios.delete(
                route("request-types.destroy", id)
            );

            if (response.data.success) {
                message.success("Request type deleted successfully!");
                router.reload({ only: ["requestTypes"] });
            } else {
                message.error(
                    response.data.message || "Delete operation failed"
                );
            }
        } catch (error) {
            message.error("Failed to delete request type. Please try again.");
            console.error("Request type deletion error:", error);
        }
    };
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },

        {
            title: "Category",
            dataIndex: "request_category",
            key: "request_category",
            sorter: (a, b) =>
                a.request_category.localeCompare(b.request_category),
        },
        {
            title: "Name",
            dataIndex: "request_name",
            key: "request_name",
            sorter: (a, b) => a.request_name.localeCompare(b.request_name),
        },
        {
            title: "Description",
            dataIndex: "request_description",
            key: "request_description",
            sorter: (a, b) =>
                a.request_description.localeCompare(b.request_description),
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            align: "center",
            width: 120,
            filters: [
                { text: "Active", value: "1" },
                { text: "Inactive", value: "0" },
            ],
            onFilter: (value, record) => record.is_active === value,
            render: (is_active) => {
                const isActive = is_active == "1";
                return (
                    <Tag
                        icon={
                            isActive ? (
                                <CheckCircleOutlined />
                            ) : (
                                <CloseCircleOutlined />
                            )
                        }
                        color={isActive ? "success" : "error"}
                    >
                        {isActive ? "Active" : "Inactive"}
                    </Tag>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            width: 100,
            render: (_, record) => (
                <Space size="small">
                    <Popconfirm
                        title="Delete Request Type"
                        description="Are you sure you want to delete this request type?"
                        onConfirm={(e) => handleDelete(record.id, e)}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];
    return (
        <AuthenticatedLayout>
            <Head title="Manage Request Types" />
            <div className="container mx-auto">
                <Card
                    title="Request Types"
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreateDrawer}
                        >
                            Create Request Type
                        </Button>
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        onRow={(record) => ({
                            onClick: () => handleRowClick(record),
                            style: { cursor: "pointer" },
                        })}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ["10", "25", "50", "100"],
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} items`,
                        }}
                        bordered
                        size="middle"
                        locale={{
                            emptyText: "No request types data available",
                        }}
                    />
                </Card>
                <RequestTypeDrawer
                    visible={drawerVisible}
                    mode={drawerMode}
                    requestType={editingRequestType}
                    onClose={closeDrawer}
                    onSubmit={handleSubmit}
                />
            </div>
        </AuthenticatedLayout>
    );
};

export default RequestType;
