import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useApiTableConfig } from "@/Hooks/useApiTableConfig";
import { Table, Card, Tag, Button, message } from "antd";
import { LikeOutlined } from "@ant-design/icons";
import SkeletonTable from "@/Components/skeleton/SkeletonTable";
import dayjs from "dayjs";
import axios from "axios";
import { useState } from "react";
import { usePage } from "@inertiajs/react";

const IssuanceItemsTable = () => {
    const [ackLoading, setAckLoading] = useState(false);
    const { emp_data } = usePage().props;

    // ==============================
    // Acknowledge Handler
    // ==============================
    const handleAcknowledge = async (record) => {
        if (!record) return;
        try {
            setAckLoading(true);
            const response = await axios.put(
                route("issuance.acknowledge", record.id),
                {
                    employee_id: emp_data?.emp_id,
                },
            );

            console.log(response);
            message.success("Acknowledged successfully");

            await fetchData();
        } catch (error) {
            console.error("Acknowledge failed:", error);
            message.error(
                error?.response?.data?.message || "Failed to acknowledge",
            );
        } finally {
            setAckLoading(false);
        }
    };

    const columnDefinitions = [
        {
            title: "Hostname",
            dataIndex: "hostname",
            sorter: true,
            key: "hostname",
        },
        {
            title: "Recipient Name",
            key: "recipient_name",
            render: (_, record) =>
                record.acknowledgement?.recipient_name || "N/A",
        },
        {
            title: "Item Type",
            dataIndex: "item_type",
            sorter: true,
            key: "item_type",
        },
        {
            title: "Item Name",
            dataIndex: "item_name",
            sorter: true,
            key: "item_name",
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            sorter: true,
            key: "quantity",
        },
        {
            title: "Acknowledgement Status",
            key: "acknowledgement_status",
            render: (_, record) => (
                <Tag color={record.acknowledgement?.status_color || "gold"}>
                    {record.acknowledgement?.status_label || "Pending"}
                </Tag>
            ),
        },
        {
            title: "Acknowledged At",
            key: "acknowledged_at",
            dataIndex: ["acknowledgement", "acknowledged_at"],
            render: (value, record) =>
                record.acknowledgement?.status === 1 && value
                    ? dayjs(value).format("MMM D, YYYY hh:mm A")
                    : "-",
            sorter: true,
        },
        {
            title: "Remarks",
            dataIndex: "remarks",
            sorter: true,
            key: "remarks",
        },
        {
            title: "Issued At",
            dataIndex: "created_at",
            sorter: true,
            key: "created_at",
            render: (value) =>
                value ? dayjs(value).format("MMM D, YYYY hh:mm A") : "-",
        },
        {
            title: "Issued By",
            dataIndex: "creator_name",
            sorter: true,
            key: "creator_name",
        },
        {
            title: "Actions",
            key: "actions",
            width: 120,
            fixed: "right", // Pin to the right side
            render: (_, record) => {
                const isAcknowledgable =
                    record.acknowledgement?.status === 0 &&
                    record.acknowledgement?.acknowledged_by ===
                        emp_data?.emp_id;

                if (!isAcknowledgable) {
                    return "-";
                }

                return (
                    <Button
                        color="primary"
                        variant="filled"
                        icon={<LikeOutlined />}
                        onClick={() => handleAcknowledge(record)}
                        loading={ackLoading}
                    >
                        Acknowledge
                    </Button>
                );
            },
        },
    ];

    const {
        data,
        loading,
        paginationConfig,
        columns,
        handleTableChange,
        fetchData,
    } = useApiTableConfig(route("issuance.items.list"), columnDefinitions);

    return (
        <AuthenticatedLayout>
            <Card title="Issuance Items Table" style={{ margin: "24px" }}>
                {loading ? (
                    <SkeletonTable columns={5} rows={5} />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
                        pagination={paginationConfig}
                        onChange={handleTableChange}
                        scroll={{ x: true }}
                    />
                )}
            </Card>
        </AuthenticatedLayout>
    );
};

export default IssuanceItemsTable;
