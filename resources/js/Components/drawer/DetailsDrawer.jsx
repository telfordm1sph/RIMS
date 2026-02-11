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
} from "antd";
const { Title } = Typography;

const DetailsDrawer = ({
    visible,
    fieldGroups = [],
    loading,
    onClose,
    onAcknowledge,
    showAcknowledge = false,
    acknowledgeLoading = false,
}) => {
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

    const hardwareGroup = fieldGroups.find(
        (g) => g.title === "Hardware Specifications",
    );
    const partsGroup = fieldGroups.find((g) => g.title === "Parts");
    const softwareGroup = fieldGroups.find((g) => g.title === "Software");

    const tabsItems = [
        {
            key: "hardware",
            label: "Hardware",
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
            label: "Parts",
            children: renderSubGroups(partsGroup?.subGroups, "No Parts Data"),
        },
        {
            key: "software",
            label: "Software",
            children: renderSubGroups(
                softwareGroup?.subGroups,
                "No Software Data",
            ),
        },
    ];

    return (
        <Drawer
            title="Hardware Details"
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
                <Tabs defaultActiveKey="hardware" items={tabsItems} />
            )}
        </Drawer>
    );
};

export default DetailsDrawer;
