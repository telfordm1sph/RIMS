import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    FileTextOutlined,
    CloseCircleOutlined,
    StopOutlined,
} from "@ant-design/icons";
import { CircleCheckBigIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

export default function StatCard({ stats, activeStatus }) {
    const statusConfig = [
        {
            key: "New",
            title: "New",
            icon: <ClockCircleOutlined />,
            value: 1,
        },
        {
            key: "Triaged",
            title: "Triaged",
            icon: <ThumbsUpIcon />,
            value: 2,
        },
        {
            key: "Approved",
            title: "Approved",
            icon: <SyncOutlined />,
            value: 3,
        },
        {
            key: "Issued",
            title: "Issued",
            icon: <CircleCheckBigIcon />,
            value: 4,
        },
        {
            key: "Acknowledged",
            title: "Acknowledged",
            icon: <CheckCircleOutlined />,
            value: 5,
        },
        {
            key: "Canceled",
            title: "Canceled",
            icon: <StopOutlined />,
            value: 6,
        },
        {
            key: "Disapproved",
            title: "Disapproved",
            icon: <ThumbsDownIcon />,
            value: 7,
        },
    ];

    // Map Ant Design color names to hex values
    const colorMap = {
        gold: "#faad14",
        lime: "#a0d911",
        green: "#52c41a",
        blue: "#1890ff",
        volcano: "#fa541c",
        red: "#ff4d4f",
        default: "#d9d9d9",
    };

    return (
        <Row gutter={[12, 12]}>
            {statusConfig.map((status) => {
                const statusData = stats?.[status.key];
                const count =
                    typeof statusData === "object"
                        ? statusData?.count
                        : statusData;

                // Get color from backend data, fallback to default
                const colorName =
                    typeof statusData === "object"
                        ? statusData?.color
                        : "default";
                const hexColor = colorMap[colorName] || colorMap.default;

                // Check if this card is active (matches the selected filter)
                const isActive =
                    activeStatus === status.value ||
                    (activeStatus === "all" && status.key === "All");

                return (
                    <Col xs={12} sm={12} md={8} lg={6} xl={3} key={status.key}>
                        <Card
                            size="small"
                            variant="outlined"
                            style={{
                                borderColor: isActive ? hexColor : undefined,
                                borderWidth: isActive ? 2 : 1,
                                backgroundColor: isActive
                                    ? `${hexColor}10`
                                    : undefined,
                                transition: "all 0.3s ease",
                            }}
                        >
                            <Statistic
                                title={status.title}
                                value={count || 0}
                                prefix={
                                    <span style={{ color: hexColor }}>
                                        {status.icon}
                                    </span>
                                }
                                styles={{
                                    content: {
                                        value: {
                                            color: hexColor,
                                            fontSize: "1.25rem",
                                            fontWeight: isActive ? 700 : 600,
                                        },
                                    },
                                }}
                            />
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
}
