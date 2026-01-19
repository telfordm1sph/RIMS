import React from "react";
import {
    Card,
    Descriptions,
    Table,
    Tag,
    Typography,
    Button,
    Space,
} from "antd";
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    StopOutlined,
} from "@ant-design/icons";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage, router } from "@inertiajs/react";
import dayjs from "dayjs";

const { Title } = Typography;

const RequestDetailView = () => {
    const { request, actions } = usePage().props;
    console.log(usePage().props);

    const handleBack = () => {
        const appName = window.location.pathname.split("/")[1];
        router.visit(`/${appName}/request/table`);
    };

    const itemColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 60,
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
        },
        {
            title: "Type of Request",
            dataIndex: "type_of_request",
            key: "type_of_request",
        },
        {
            title: "Request Mode",
            dataIndex: "request_mode",
            key: "request_mode",
            render: (mode) => (
                <Tag color={mode === "bulk" ? "blue" : "green"}>
                    {mode?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Issued To",
            dataIndex: "issued_to_name",
            key: "issued_to_name",
        },
        {
            title: "Location",
            dataIndex: "location_name",
            key: "location_name",
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
        },
        {
            title: "Purpose of Request",
            dataIndex: "purpose_of_request",
            key: "purpose_of_request",
        },
        {
            title: "Item Status",
            key: "item_status",
            align: "center",
            render: (_, record) => (
                <Tag color={record.item_status_color}>
                    {record.item_status_label}
                </Tag>
            ),
        },
    ];

    // Define action configuration
    const availableActionConfig = {
        APPROVE: {
            label: "Approve",
            icon: <CheckCircleOutlined />,
            type: "primary",
        },
        DISAPPROVE: {
            label: "Disapprove",
            icon: <CloseCircleOutlined />,
            type: "primary",
            danger: true,
        },
        ONGOING: {
            label: "Ongoing",
            icon: <CheckCircleOutlined />,
            type: "default",
            style: { color: "orange", borderColor: "orange" },
        },
        DONE: {
            label: "Done",
            icon: <CheckCircleOutlined />,
            type: "primary",
        },
        ACKNOWLEDGE: {
            label: "Acknowledge",
            icon: <CheckCircleOutlined />,
            type: "primary",
        },
        CANCEL: {
            label: "Cancel",
            icon: <StopOutlined />,
            type: "primary",
            danger: true,
        },
    };

    return (
        <AuthenticatedLayout>
            <div style={{ padding: "24px" }}>
                {/* Back Button */}
                <Space style={{ marginBottom: "24px" }}>
                    <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                        Back to Requests
                    </Button>
                </Space>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                    }}
                >
                    <Title level={2} style={{ margin: 0 }}>
                        Request Details
                    </Title>

                    {actions?.length > 0 && (
                        <Space>
                            {actions
                                .filter((a) => a.toUpperCase() !== "VIEW")
                                .map((a) => {
                                    const key = a.toUpperCase();
                                    const cfg = availableActionConfig[key];

                                    if (!cfg) return null;

                                    return (
                                        <Button
                                            key={key}
                                            icon={cfg.icon}
                                            type={cfg.type}
                                            danger={cfg.danger || false}
                                            style={cfg.style || {}}
                                            onClick={() =>
                                                console.log(
                                                    "Action clicked:",
                                                    key,
                                                )
                                            }
                                        >
                                            {cfg.label}
                                        </Button>
                                    );
                                })}
                        </Space>
                    )}
                </div>

                {/* Request Info */}
                <Card style={{ marginBottom: "24px" }}>
                    <Descriptions bordered>
                        <Descriptions.Item label="Request Number">
                            {request.request_number}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={request.status_color}>
                                {request.status_label}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Requestor Name">
                            {request.requestor_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Department">
                            {request.requestor_department}
                        </Descriptions.Item>
                        <Descriptions.Item label="Product Line">
                            {request.requestor_prodline}
                        </Descriptions.Item>
                        <Descriptions.Item label="Station">
                            {request.requestor_station}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created Date">
                            {dayjs(request.created_at).format(
                                "MMM D, YYYY h:mm A",
                            )}
                        </Descriptions.Item>
                        {request.remarks && (
                            <Descriptions.Item label="Remarks" span={3}>
                                {request.remarks}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Card>

                {/* Request Items Card with Action Buttons */}
                <Card>
                    <Title level={4} style={{ margin: 0 }}>
                        Request Items ({request.items?.length || 0})
                    </Title>

                    <Table
                        columns={itemColumns}
                        dataSource={request.items}
                        rowKey="id"
                        pagination={false}
                        bordered
                        size="middle"
                    />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
};

export default RequestDetailView;
