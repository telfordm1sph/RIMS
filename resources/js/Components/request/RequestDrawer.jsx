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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

const RequestDrawer = ({
    open,
    onClose,
    item,
    onSave,
    employees,
    locations,
}) => {
    const [rows, setRows] = useState([]);
    const [purpose, setPurpose] = useState("");

    useEffect(() => {
        setRows(item?.items || []);
        setPurpose(item?.purpose || "");
    }, [item]);

    const addRow = () =>
        setRows([
            ...rows,
            {
                issued_to: "",
                issued_to_other: "",
                location: "",
                location_other: "",
                qty: 1,
            },
        ]);

    const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

    const updateRow = (i, key, val) => {
        const copy = [...rows];
        copy[i][key] = val;
        setRows(copy);
    };

    const save = () => {
        const finalRows = rows.map((r) => ({
            issued_to:
                r.issued_to === "Other" ? r.issued_to_other : r.issued_to,
            location: r.location === "Other" ? r.location_other : r.location,
            qty: r.qty,
        }));
        onSave({ items: finalRows, purpose });
        onClose();
    };

    const inputStyle = {
        width: "100%",
        height: 36,
        borderColor: "#f0f0f0",
        borderRadius: 6,
    };
    const selectStyle = { width: "100%", height: 36, borderRadius: 6 };

    return (
        <Drawer
            title={`Edit ${item?.name}`}
            open={open}
            onClose={onClose}
            size={900}
        >
            {/* Purpose Field */}
            <div style={{ marginBottom: 16 }}>
                <Text strong>Purpose of Request</Text>
                <TextArea
                    placeholder="Enter purpose of request"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={3}
                    style={{ marginTop: 8 }}
                />
            </div>

            <Divider />

            {rows.map((row, i) => (
                <div
                    key={i}
                    style={{
                        marginBottom: 12,
                        border: "1px solid #f0f0f0",
                        padding: 8,
                        borderRadius: 6,
                    }}
                >
                    <Row gutter={8} align="middle">
                        {/* Issued To */}
                        <Col span={6}>
                            <Text>Issued To</Text>
                            {row.issued_to === "Other" ? (
                                <Input
                                    placeholder="Enter name"
                                    value={row.issued_to_other}
                                    style={inputStyle}
                                    onChange={(e) =>
                                        updateRow(
                                            i,
                                            "issued_to_other",
                                            e.target.value
                                        )
                                    }
                                />
                            ) : (
                                <Select
                                    placeholder="Select Employee"
                                    value={row.issued_to}
                                    style={selectStyle}
                                    onChange={(val) =>
                                        updateRow(i, "issued_to", val)
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
                                />
                            )}
                        </Col>

                        {/* Location */}
                        <Col span={6}>
                            <Text>Location</Text>
                            {row.location === "Other" ? (
                                <Input
                                    placeholder="Enter location"
                                    value={row.location_other}
                                    style={inputStyle}
                                    onChange={(e) =>
                                        updateRow(
                                            i,
                                            "location_other",
                                            e.target.value
                                        )
                                    }
                                />
                            ) : (
                                <Select
                                    placeholder="Select Location"
                                    value={row.location}
                                    style={selectStyle}
                                    showSearch
                                    onChange={(val) =>
                                        updateRow(i, "location", val)
                                    }
                                    filterOption={(input, option) =>
                                        (option?.label ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={[
                                        ...locations,
                                        { label: "Other", value: "Other" },
                                    ]}
                                />
                            )}
                        </Col>

                        {/* Qty */}
                        <Col span={4}>
                            <Text>Qty</Text>
                            <InputNumber
                                min={1}
                                value={row.qty}
                                style={{ width: "100%", height: 36 }}
                                onChange={(val) => updateRow(i, "qty", val)}
                            />
                        </Col>

                        {/* Remove */}
                        <Col span={4}>
                            <Button
                                danger
                                style={{ width: "100%", marginTop: 22 }}
                                onClick={() => removeRow(i)}
                            >
                                Remove
                            </Button>
                        </Col>
                    </Row>
                </div>
            ))}

            <Divider />

            <Row gutter={8}>
                <Col>
                    <Button
                        type="dashed"
                        onClick={addRow}
                        icon={<PlusOutlined />}
                    >
                        Add Item
                    </Button>
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

export default RequestDrawer;
