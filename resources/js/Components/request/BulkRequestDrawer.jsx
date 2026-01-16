import React, { useState, useEffect } from "react";
import {
    Drawer,
    Row,
    Col,
    Select,
    Input,
    InputNumber,
    Button,
    Typography,
    Divider,
    Table,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const { TextArea } = Input;

const BulkRequestDrawer = ({
    open,
    onClose,
    item,
    onSave,
    employees,
    locations,
}) => {
    const [formData, setFormData] = useState({
        issued_to: "",
        issued_to_other: "",
        location: "",
        location_other: "",
        purpose: "",
        items: [],
    });

    useEffect(() => {
        if (item?.bulkData) {
            setFormData({
                issued_to: item.bulkData.issued_to || "",
                issued_to_other: item.bulkData.issued_to_other || "",
                location: item.bulkData.location || "",
                location_other: item.bulkData.location_other || "",
                purpose: item.bulkData.purpose || "",
                items: item.bulkData.items || [],
            });
        }
    }, [item]);

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addItem = (itemName) => {
        if (!formData.items.find((ri) => ri.name === itemName)) {
            setFormData((prev) => ({
                ...prev,
                items: [...prev.items, { name: itemName, qty: 1 }],
            }));
        }
    };

    const removeItem = (itemName) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((ri) => ri.name !== itemName),
        }));
    };

    const updateQty = (itemName, qty) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((ri) =>
                ri.name === itemName ? { ...ri, qty } : ri
            ),
        }));
    };

    const save = () => {
        const issuedTo = formData.issued_to;

        const issuedToName =
            formData.issued_to === "Other"
                ? formData.issued_to_other
                : employees.find((emp) => emp.emp_id === formData.issued_to)
                      ?.empname || "";

        const locationId = formData.location;

        const locationName =
            formData.location === "Other"
                ? formData.location_other
                : locations.find((l) => l.value === formData.location)?.label ||
                  "";

        const finalData = {
            issued_to: issuedTo,
            issued_to_name: issuedToName,
            location: locationId,
            location_name: locationName,
            purpose: formData.purpose,
            items: formData.items,
        };

        onSave(finalData);
        onClose();
    };

    const columns = [
        {
            title: "Item Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Quantity",
            dataIndex: "qty",
            key: "qty",
            width: 150,
            render: (qty, record) => (
                <InputNumber
                    min={1}
                    value={qty}
                    onChange={(val) => updateQty(record.name, val)}
                    style={{ width: "100%" }}
                />
            ),
        },
        {
            title: "Action",
            key: "action",
            width: 100,
            render: (_, record) => (
                <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(record.name)}
                >
                    Remove
                </Button>
            ),
        },
    ];

    const availableItems = item?.category
        ? item.allItems?.filter(
              (i) => !formData.items.find((ri) => ri.name === i)
          ) || []
        : [];

    return (
        <Drawer
            title={`Bulk Request - ${item?.category}`}
            open={open}
            onClose={onClose}
            size={900}
        >
            <div style={{ marginBottom: 24 }}>
                <Title level={5}>Request Details</Title>

                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                        <Text>Issued To</Text>
                        {formData.issued_to === "Other" ? (
                            <Input
                                placeholder="Enter name"
                                value={formData.issued_to_other}
                                onChange={(e) =>
                                    updateField(
                                        "issued_to_other",
                                        e.target.value
                                    )
                                }
                                style={{ marginTop: 8 }}
                            />
                        ) : (
                            <Select
                                placeholder="Select Employee"
                                value={formData.issued_to}
                                onChange={(val) =>
                                    updateField("issued_to", val)
                                }
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={[
                                    ...employees.map((emp) => ({
                                        label: `${emp.emp_id} - ${emp.empname}`,
                                        value: emp.emp_id,
                                    })),
                                    { label: "Other", value: "Other" },
                                ]}
                                style={{ width: "100%", marginTop: 8 }}
                            />
                        )}
                    </Col>

                    <Col span={12}>
                        <Text>Location</Text>
                        {formData.location === "Other" ? (
                            <Input
                                placeholder="Enter location"
                                value={formData.location_other}
                                onChange={(e) =>
                                    updateField(
                                        "location_other",
                                        e.target.value
                                    )
                                }
                                style={{ marginTop: 8 }}
                            />
                        ) : (
                            <Select
                                placeholder="Select Location"
                                value={formData.location}
                                onChange={(val) => updateField("location", val)}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={[
                                    ...locations,
                                    { label: "Other", value: "Other" },
                                ]}
                                style={{ width: "100%", marginTop: 8 }}
                            />
                        )}
                    </Col>
                </Row>

                <div style={{ marginBottom: 16 }}>
                    <Text>Purpose</Text>
                    <TextArea
                        placeholder="Enter purpose of request"
                        value={formData.purpose}
                        onChange={(e) => updateField("purpose", e.target.value)}
                        rows={3}
                        style={{ marginTop: 8 }}
                    />
                </div>
            </div>

            <Divider />

            <div style={{ marginBottom: 16 }}>
                <Title level={5}>Select Items</Title>
                <Select
                    placeholder="Add items to this bulk request"
                    style={{ width: "100%" }}
                    onChange={(val) => {
                        addItem(val);
                    }}
                    value={null}
                    showSearch
                    filterOption={(input, option) =>
                        (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                    }
                >
                    {availableItems.map((itemName) => (
                        <Select.Option
                            key={itemName}
                            value={itemName}
                            label={itemName}
                        >
                            {itemName}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            <Table
                columns={columns}
                dataSource={formData.items}
                rowKey="name"
                pagination={false}
                size="small"
            />

            <Divider />

            <Row gutter={8}>
                <Col>
                    <Button onClick={onClose}>Cancel</Button>
                </Col>
                <Col>
                    <Button type="primary" onClick={save}>
                        Save
                    </Button>
                </Col>
            </Row>
        </Drawer>
    );
};

export default BulkRequestDrawer;
