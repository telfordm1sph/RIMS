import React from "react";
import { Col, Input, Row, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export default function TableToolbar({
    searchValue,
    onSearch,
    statusFilter,
    onStatusChange,
    statusCounts = {},
}) {
    const statusMap = {
        All: "all",
        New: 1,
        Triaged: 2,
        Approved: 3,
        Issued: 4,
        Acknowledged: 5,
        Canceled: 6,
        Disapproved: 7,
    };

    // Generate options dynamically from statusCounts
    const statusOptions = Object.keys(statusCounts).map((key) => {
        const value = statusMap[key] ?? key; // numeric value from map or fallback
        const count = statusCounts[key]?.count || 0;
        const color = statusCounts[key]?.color || "inherit";

        return {
            label: `${key} (${count})`,
            value, // numeric or "all"
        };
    });

    return (
        <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 16 }}
        >
            <Col>
                <Select
                    value={statusFilter}
                    onChange={onStatusChange}
                    style={{ width: 300 }}
                    placeholder="Filter by status"
                    options={statusOptions}
                    showSearch
                    optionFilterProp="label"
                />
            </Col>

            <Col>
                <Input
                    placeholder="Search JORF..."
                    prefix={<SearchOutlined />}
                    value={searchValue}
                    onChange={(e) => onSearch(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
            </Col>
        </Row>
    );
}
