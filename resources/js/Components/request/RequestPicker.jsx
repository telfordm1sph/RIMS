import React from "react";
import { Select, Button, Space, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const RequestPicker = ({
    catalog,
    selectedRequest,
    setSelectedRequest,
    onAdd,
}) => {
    return (
        <Card title="Add Request" style={{ marginBottom: 24 }}>
            <Space style={{ width: "100%" }}>
                <Select
                    showSearch
                    allowClear
                    placeholder="Select request type"
                    style={{ width: 300 }}
                    value={selectedRequest}
                    onChange={(val) => setSelectedRequest(val)}
                    optionFilterProp="label"
                >
                    {catalog.map((cat) => (
                        <Select.OptGroup
                            key={cat.category}
                            label={cat.category}
                        >
                            {cat.items.map((item) => (
                                <Option key={item} value={item} label={item}>
                                    {item}
                                </Option>
                            ))}
                        </Select.OptGroup>
                    ))}
                </Select>

                <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                    Add
                </Button>
            </Space>
        </Card>
    );
};

export default RequestPicker;
