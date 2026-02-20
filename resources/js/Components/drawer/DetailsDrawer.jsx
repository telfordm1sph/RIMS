import React from "react";
import {
    Drawer,
    Typography,
    Descriptions,
    Empty,
    Spin,
    Tabs,
    Tag,
    Button,
    Space,
    Card,
    Table,
} from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    ToolOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
    EditOutlined,
    CodeOutlined,
    AppstoreOutlined,
    HddOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const DetailsDrawer = ({
    visible,
    fieldGroups = [],
    issuanceData = null,
    loading,
    onClose,
    onAcknowledge,
    showAcknowledge = false,
    acknowledgeLoading = false,
}) => {
    // ==============================
    // Operation Type Icon & Color
    // ==============================
    const getOperationConfig = (type) => {
        switch (type) {
            case "add":
                return {
                    icon: <PlusCircleOutlined />,
                    color: "green",
                    text: "Add",
                };
            case "remove":
                return {
                    icon: <MinusCircleOutlined />,
                    color: "red",
                    text: "Remove",
                };
            case "replace":
                return {
                    icon: <EditOutlined />,
                    color: "blue",
                    text: "Replace",
                };
            default:
                return { icon: <ToolOutlined />, color: "default", text: type };
        }
    };

    // ==============================
    // Component Operations Table
    // ==============================
    const renderComponentOperations = () => {
        if (!issuanceData?.operations?.length) {
            return <Empty description="No component operations" />;
        }

        const columns = [
            {
                title: "Operation",
                key: "operation_type",
                width: 100,
                render: (_, record) => {
                    const config = getOperationConfig(record.operation_type);
                    return (
                        <Tag color={config.color} icon={config.icon}>
                            {config.text}
                        </Tag>
                    );
                },
            },
            {
                title: "Component Type",
                dataIndex: "component_type",
                key: "component_type",
                width: 120,
            },
            {
                title: "Component Details",
                key: "details",
                render: (_, record) => {
                    if (record.operation_type === "replace") {
                        return (
                            <div style={{ display: "flex", gap: 16 }}>
                                {/* Old Component */}
                                <div style={{ flex: 1 }}>
                                    <Text
                                        type="danger"
                                        style={{ fontSize: 12 }}
                                    >
                                        Removed:
                                    </Text>
                                    {record.old_component_data ? (
                                        <div style={{ fontSize: 13 }}>
                                            <div>
                                                <Text strong>Brand:</Text>{" "}
                                                {record.old_component_data
                                                    .brand || "-"}
                                            </div>
                                            <div>
                                                <Text strong>Model:</Text>{" "}
                                                {record.old_component_data
                                                    .model || "-"}
                                            </div>
                                            <div>
                                                <Text strong>S/N:</Text>{" "}
                                                {record.old_component_data
                                                    .serial_number || "-"}
                                            </div>
                                            <div>
                                                <Text strong>Condition:</Text>{" "}
                                                {record.old_component_condition ||
                                                    "-"}
                                            </div>
                                        </div>
                                    ) : (
                                        <Text type="secondary">No data</Text>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Text
                                        type="success"
                                        style={{ fontSize: 12 }}
                                    >
                                        Added:
                                    </Text>
                                    {record.new_component_data ? (
                                        <div style={{ fontSize: 13 }}>
                                            <div>
                                                <Text strong>Brand:</Text>{" "}
                                                {record.new_component_data
                                                    .brand || "-"}
                                            </div>
                                            <div>
                                                <Text strong>Model:</Text>{" "}
                                                {record.new_component_data
                                                    .model || "-"}
                                            </div>
                                            <div>
                                                <Text strong>S/N:</Text>{" "}
                                                {record.new_component_data
                                                    .serial_number || "-"}
                                            </div>
                                            <div>
                                                <Text strong>Condition:</Text>{" "}
                                                {record.new_component_condition ||
                                                    "-"}
                                            </div>
                                        </div>
                                    ) : (
                                        <Text type="secondary">No data</Text>
                                    )}
                                </div>
                            </div>
                        );
                    } else {
                        // For add or remove operations
                        const componentData =
                            record.operation_type === "add"
                                ? record.new_component_data
                                : record.old_component_data;

                        return componentData ? (
                            <div style={{ fontSize: 13 }}>
                                <div>
                                    <Text strong>Brand:</Text>{" "}
                                    {componentData.brand || "-"}
                                </div>
                                <div>
                                    <Text strong>Model:</Text>{" "}
                                    {componentData.model || "-"}
                                </div>
                                <div>
                                    <Text strong>Serial Number:</Text>{" "}
                                    {componentData.serial_number || "-"}
                                </div>
                                {componentData.part_type && (
                                    <div>
                                        <Text strong>Part Type:</Text>{" "}
                                        {componentData.part_type}
                                    </div>
                                )}
                                {componentData.specifications && (
                                    <div>
                                        <Text strong>Specs:</Text>{" "}
                                        {componentData.specifications}
                                    </div>
                                )}
                                <div>
                                    <Text strong>Condition:</Text>{" "}
                                    {record.operation_type === "add"
                                        ? record.new_component_condition
                                        : record.old_component_condition || "-"}
                                </div>
                            </div>
                        ) : (
                            <Text type="secondary">No details available</Text>
                        );
                    }
                },
            },
            {
                title: "Reason/Remarks",
                key: "remarks",
                width: 200,
                render: (_, record) => (
                    <div>
                        {record.reason && (
                            <div>
                                <Text strong>Reason:</Text> {record.reason}
                            </div>
                        )}
                        {record.remarks && (
                            <div>
                                <Text type="secondary">{record.remarks}</Text>
                            </div>
                        )}
                    </div>
                ),
            },
        ];

        return (
            <Table
                dataSource={issuanceData.operations}
                columns={columns}
                rowKey={(record, index) => index}
                size="small"
                pagination={false}
                scroll={{ x: true }}
            />
        );
    };

    // ==============================
    // Sub-group renderer (Parts/Software)
    // ==============================
    const renderSubGroups = (subGroups, emptyMessage) => {
        if (!subGroups?.length) return <Empty description={emptyMessage} />;

        return subGroups.map((sub, idx) => (
            <div
                key={idx}
                style={{
                    marginBottom: 16,
                    padding: 12,
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                }}
            >
                <Title level={5} style={{ marginBottom: 12 }}>
                    {sub.title}
                </Title>
                {!sub.fields?.length ? (
                    <Empty description={`No ${sub.title} Data`} />
                ) : (
                    <Descriptions
                        layout="vertical"
                        size="small"
                        column={sub.column || 2}
                        bordered={false}
                    >
                        {sub.fields.map((field, i) => {
                            const value = field.value;
                            if (
                                value &&
                                typeof value === "object" &&
                                "value" in value &&
                                "color" in value
                            ) {
                                return (
                                    <Descriptions.Item
                                        key={i}
                                        label={field.label}
                                    >
                                        <Tag color={value.color}>
                                            {value.value}
                                        </Tag>
                                    </Descriptions.Item>
                                );
                            }
                            return (
                                <Descriptions.Item key={i} label={field.label}>
                                    {value || "-"}
                                </Descriptions.Item>
                            );
                        })}
                    </Descriptions>
                )}
            </div>
        ));
    };

    // ==============================
    // Issuance Tab Content
    // ==============================
    const renderIssuanceTab = () => {
        if (!issuanceData) return <Empty description="No Issuance Data" />;

        const ack = issuanceData.acknowledgement;
        const users = issuanceData.hardware_users || [];

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Issuance Info */}
                <Card size="small" title="Issuance Information">
                    <Descriptions
                        layout="vertical"
                        size="small"
                        column={2}
                        bordered={false}
                    >
                        <Descriptions.Item label="Issuance No.">
                            {issuanceData.issuance_number || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Request No.">
                            {issuanceData.request_number || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Hostname">
                            {issuanceData.hostname || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Location">
                            {issuanceData.location_name || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Remarks">
                            {issuanceData.remarks || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Issued By">
                            {issuanceData.creator_name || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Issued At">
                            {issuanceData.created_at
                                ? dayjs(issuanceData.created_at).format(
                                      "MMM D, YYYY hh:mm A",
                                  )
                                : "-"}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Component Operations */}
                {issuanceData.operations?.length > 0 && (
                    <Card
                        size="small"
                        title={
                            <Space>
                                <ToolOutlined />
                                Component Operations
                                <Tag color="blue">
                                    {issuanceData.operations.length}
                                </Tag>
                            </Space>
                        }
                    >
                        {renderComponentOperations()}
                    </Card>
                )}

                {/* Assigned Hardware Users */}
                <Card
                    size="small"
                    title={
                        <Space>
                            <UserOutlined />
                            Assigned Users
                        </Space>
                    }
                >
                    {users.length ? (
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                            }}
                        >
                            {users.map((hu) => (
                                <Tag
                                    key={hu.user_id}
                                    color="blue"
                                    icon={<UserOutlined />}
                                >
                                    {hu.user_name}
                                    {hu.date_assigned && (
                                        <Text
                                            type="secondary"
                                            style={{
                                                fontSize: 11,
                                                marginLeft: 4,
                                            }}
                                        >
                                            (since{" "}
                                            {dayjs(hu.date_assigned).format(
                                                "MMM D, YYYY",
                                            )}
                                            )
                                        </Text>
                                    )}
                                </Tag>
                            ))}
                        </div>
                    ) : (
                        <Empty description="No assigned users" />
                    )}
                </Card>

                {/* Acknowledgement Status */}
                <Card
                    size="small"
                    title={
                        <Space>
                            {ack?.status === 1 ? (
                                <CheckCircleOutlined
                                    style={{ color: "#52c41a" }}
                                />
                            ) : (
                                <ClockCircleOutlined
                                    style={{ color: "#faad14" }}
                                />
                            )}
                            Acknowledgement
                        </Space>
                    }
                >
                    {ack ? (
                        <Descriptions
                            layout="vertical"
                            size="small"
                            column={2}
                            bordered={false}
                        >
                            <Descriptions.Item label="Status">
                                <Tag color={ack.status_color || "gold"}>
                                    {ack.status_label || "Pending"}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Acknowledged By">
                                {ack.status === 1 ? (
                                    ack.acknowledged_by_name || "-"
                                ) : (
                                    <Text type="secondary">
                                        Not yet acknowledged
                                    </Text>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Acknowledged At">
                                {ack.status === 1 && ack.acknowledged_at ? (
                                    dayjs(ack.acknowledged_at).format(
                                        "MMM D, YYYY hh:mm A",
                                    )
                                ) : (
                                    <Text type="secondary">-</Text>
                                )}
                            </Descriptions.Item>
                            {ack.remarks && (
                                <Descriptions.Item label="Remarks">
                                    {ack.remarks}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    ) : (
                        <Empty description="No acknowledgement record" />
                    )}
                </Card>
            </div>
        );
    };

    // ==============================
    // Tab Items
    // ==============================
    const hardwareGroup = fieldGroups.find(
        (g) => g.title === "Hardware Specifications",
    );
    const partsGroup = fieldGroups.find((g) => g.title === "Parts");
    const softwareGroup = fieldGroups.find((g) => g.title === "Software");

    const tabsItems = [
        {
            key: "issuance",
            label: (
                <Space>
                    <ToolOutlined />
                    Issuance
                    {issuanceData?.operations?.length > 0 && (
                        <Tag size="small" color="blue">
                            {issuanceData.operations.length}
                        </Tag>
                    )}
                </Space>
            ),
            children: renderIssuanceTab(),
        },
        {
            key: "hardware",
            label: (
                <Space>
                    <HddOutlined />
                    Hardware
                </Space>
            ),
            children: hardwareGroup?.fields?.length ? (
                <Descriptions
                    layout="vertical"
                    size="small"
                    column={hardwareGroup.column || 2}
                    bordered={false}
                >
                    {hardwareGroup.fields.map((field, i) => {
                        const value = field.value;
                        if (
                            value &&
                            typeof value === "object" &&
                            "value" in value &&
                            "color" in value
                        ) {
                            return (
                                <Descriptions.Item key={i} label={field.label}>
                                    <Tag color={value.color}>{value.value}</Tag>
                                </Descriptions.Item>
                            );
                        }
                        return (
                            <Descriptions.Item key={i} label={field.label}>
                                {value || "-"}
                            </Descriptions.Item>
                        );
                    })}
                </Descriptions>
            ) : (
                <Empty description="No Hardware Data" />
            ),
        },
        {
            key: "parts",
            label: (
                <Space>
                    <AppstoreOutlined />
                    Parts
                </Space>
            ),
            children: renderSubGroups(partsGroup?.subGroups, "No Parts Data"),
        },
        {
            key: "software",
            label: (
                <Space>
                    <CodeOutlined />
                    Software
                </Space>
            ),
            children: renderSubGroups(
                softwareGroup?.subGroups,
                "No Software Data",
            ),
        },
    ];

    return (
        <Drawer
            title="Issuance Details"
            placement="right"
            size={950}
            open={visible}
            onClose={onClose}
            footer={
                showAcknowledge && (
                    <Space
                        style={{ width: "100%", justifyContent: "flex-end" }}
                    >
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            type="primary"
                            onClick={onAcknowledge}
                            loading={acknowledgeLoading}
                            disabled={acknowledgeLoading}
                            icon={<CheckCircleOutlined />}
                        >
                            Acknowledge
                        </Button>
                    </Space>
                )
            }
        >
            {loading ? (
                <Spin />
            ) : (
                <Tabs defaultActiveKey="issuance" items={tabsItems} />
            )}
        </Drawer>
    );
};

export default DetailsDrawer;
