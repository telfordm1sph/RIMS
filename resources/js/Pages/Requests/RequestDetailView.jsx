import React, { useState } from "react";
import {
    Card,
    Descriptions,
    Table,
    Tag,
    Typography,
    Button,
    Space,
    message,
} from "antd";
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    StopOutlined,
    SendOutlined,
} from "@ant-design/icons";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage, router } from "@inertiajs/react";
import dayjs from "dayjs";
import ActionRemarksModal from "../../Components/request/ActionRemarksModal";
import IssueDrawer from "../../Components/request/IssueDrawer";

const { Title } = Typography;

const RequestDetailView = () => {
    const { request, actions } = usePage().props;

    // Modal & drawer state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [remarks, setRemarks] = useState("");

    const handleBack = () => {
        const appName = window.location.pathname.split("/")[1];
        router.visit(`/${appName}/request/table`);
    };

    const handleIssueItem = (item) => {
        setSelectedItem(item);
        setIsDrawerVisible(true);
    };

    const itemColumns = [
        { title: "ID", dataIndex: "id", key: "id", width: 60 },
        { title: "Category", dataIndex: "category", key: "category" },
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
        { title: "Location", dataIndex: "location_name", key: "location_name" },
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
        {
            title: "Actions",
            key: "actions",
            align: "center",
            width: 120,
            render: (_, record) => {
                // Only show ISSUE button if:
                // 1. User has ISSUE permission
                // 2. Request status is approved (status 3)
                // 3. Item hasn't been issued yet (adjust based on your item_status)
                const canIssue =
                    actions?.includes("ISSUE") &&
                    request.status === 3 &&
                    record.item_status === 1; // Adjust this based on your status values

                if (!canIssue) {
                    return <span style={{ color: "#999" }}>-</span>;
                }

                return (
                    <Button
                        type="primary"
                        size="small"
                        icon={<SendOutlined />}
                        onClick={() => handleIssueItem(record)}
                    >
                        Issue
                    </Button>
                );
            },
        },
    ];

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

    const handleActionClick = (key) => {
        if (["APPROVE", "DISAPPROVE"].includes(key)) {
            setSelectedAction(key);
            setRemarks("");
            setIsModalVisible(true);
        } else {
            console.log("Action clicked:", key);
        }
    };

    const handleModalOk = async ({ action, remarks }) => {
        if (!remarks?.trim()) {
            message.error("Please enter remarks.");
            return;
        }

        const payload = {
            request_number: request.request_number,
            action,
            remarks,
        };

        try {
            const res = await axios.post(route("request.action"), payload);

            if (res.data.success) {
                message.success(res.data.message);
                window.location.reload();
                setIsModalVisible(false);
            } else {
                message.error(res.data.message);
            }
        } catch (err) {
            message.error("Failed to update Request.");
        }
    };

    const handleModalCancel = () => setIsModalVisible(false);

    const handleDrawerClose = () => {
        setIsDrawerVisible(false);
        setSelectedItem(null);
    };

    const handleIssueSuccess = () => {
        window.location.reload();
    };

    // Filter actions - remove ISSUE from top-level actions since it's in the table
    const displayActions =
        actions?.filter((a) => {
            const key = a.toUpperCase();
            // Don't show VIEW or ISSUE action as buttons at the top
            return key !== "VIEW" && key !== "ISSUE";
        }) || [];

    return (
        <AuthenticatedLayout>
            <div style={{ padding: "24px" }}>
                {/* Back Button */}
                <Space style={{ marginBottom: "24px" }}>
                    <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                        Back to Requests
                    </Button>
                </Space>

                {/* Title + Actions */}
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
                    {displayActions.length > 0 && (
                        <Space>
                            {displayActions.map((a) => {
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
                                        onClick={() => handleActionClick(key)}
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

                {/* Request Items */}
                <Card>
                    <Title level={4} style={{ marginBottom: "16px" }}>
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

                {/* Modal Component */}
                <ActionRemarksModal
                    visible={isModalVisible}
                    action={selectedAction}
                    remarks={remarks}
                    setRemarks={setRemarks}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                />

                {/* Issue Drawer Component */}
                <IssueDrawer
                    visible={isDrawerVisible}
                    onClose={handleDrawerClose}
                    request={request}
                    item={selectedItem}
                    onSuccess={handleIssueSuccess}
                />
            </div>
        </AuthenticatedLayout>
    );
};

export default RequestDetailView;
