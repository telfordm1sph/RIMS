import React, { useState, useEffect } from "react";
import {
    Drawer,
    Form,
    Input,
    Button,
    Space,
    message,
    Tag,
    Row,
    Col,
    Select,
    Typography,
} from "antd";
import { SendOutlined } from "@ant-design/icons";
import axios from "axios";
import HardwareModal from "./HardwareModal";

const { TextArea } = Input;
const { Text } = Typography;

const IssueDrawer = ({ visible, onClose, request, item, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState([]);
    const [hostnames, setHostnames] = useState([]);
    const [hostRows, setHostRows] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSearch, setModalSearch] = useState(null);
    const [modalRowIndex, setModalRowIndex] = useState(null); // track which row is editing

    const inputStyle = {
        marginBottom: 12,
        border: "1px solid #f0f0f0",
        padding: 8,
        borderRadius: 6,
    };
    const selectStyle = { width: "100%", height: 36, borderRadius: 6 };

    // Fetch locations & hostnames
    useEffect(() => {
        const fetchData = async () => {
            try {
                const locRes = await axios.get(route("locations.list"));
                setLocations(locRes.data.map((loc) => loc.location_name));

                if (item?.type_of_request) {
                    const hostRes = await axios.get(route("hostnames.list"), {
                        params: { type_of_request: item.type_of_request },
                    });
                    setHostnames(
                        hostRes.data.map((host) => ({
                            hostname: host.hostname,
                            serial: host.serial,
                        })),
                    );
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [item?.type_of_request]);

    // Initialize rows
    useEffect(() => {
        if (item?.quantity) {
            const rows = Array(item.quantity).fill({
                hostname: "",
                hostname_other: "",
                location: "",
                location_other: "",
                remarks: "",
            });
            setHostRows(rows);
            form.setFieldsValue({ hostnames: rows });
        }
    }, [item, form]);

    const updateRow = (index, field, value) => {
        const updated = [...hostRows];
        updated[index][field] = value;
        if (field === "hostname" && value !== "Other")
            updated[index].hostname_other = "";
        if (field === "location" && value !== "Other")
            updated[index].location_other = "";
        setHostRows(updated);
        form.setFieldsValue({ hostnames: updated });
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            setLoading(true);
            const payload = {
                request_number: request?.request_number,
                item_id: item?.id,
                action: "ISSUE",
                hostnames: hostRows.map((row) => ({
                    hostname:
                        row.hostname === "Other"
                            ? row.hostname_other
                            : row.hostname,
                    location:
                        row.location === "Other"
                            ? row.location_other
                            : row.location,
                    remarks: row.remarks,
                })),
            };
            const res = await axios.post(route("request.action"), payload);
            if (res.data.success) {
                message.success(res.data.message);
                form.resetFields();
                setHostRows([]);
                onClose();
                if (onSuccess) onSuccess();
            } else message.error(res.data.message);
        } catch (err) {
            message.error("Please fill in all required fields.");
        } finally {
            setLoading(false);
        }
    };

    // Open modal for a row
    const openModalForRow = (index) => {
        const row = hostRows[index];
        setModalSearch(row.hostname || row.hostname_other);
        setModalRowIndex(index);
        setModalOpen(true);
    };

    const handleModalSave = (updatedData) => {
        if (modalRowIndex !== null) {
            const updatedRows = [...hostRows];
            updatedRows[modalRowIndex] = {
                ...updatedRows[modalRowIndex],
                hostname: updatedData.hostname,
                hostname_other: updatedData.hostname,
                location: updatedData.location,
                remarks: updatedData.remarks,
            };
            setHostRows(updatedRows);
            form.setFieldsValue({ hostnames: updatedRows });
        }
    };

    const handleClose = () => {
        form.resetFields();
        setHostRows([]);
        onClose();
    };

    return (
        <>
            <Drawer
                title="Issue Request Items"
                placement="right"
                size={950}
                onClose={handleClose}
                open={visible}
                footer={
                    <div style={{ textAlign: "right" }}>
                        <Space>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSubmit}
                                loading={loading}
                            >
                                Issue Items
                            </Button>
                        </Space>
                    </div>
                }
            >
                <Space style={{ marginBottom: 24 }} wrap>
                    <Tag color="blue">Category: {item?.category || "-"}</Tag>
                    <Tag color="green">
                        Type: {item?.type_of_request || "-"}
                    </Tag>
                    <Tag color="purple">Quantity: {item?.quantity || "-"}</Tag>
                </Space>

                <Form form={form} layout="vertical">
                    {hostRows.map((row, i) => (
                        <div
                            key={i}
                            style={{
                                marginBottom: 16,
                                padding: 12,
                                border: "1px solid #f0f0f0",
                                borderRadius: 6,
                            }}
                        >
                            <h4>Item {i + 1}</h4>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Text>Hostname</Text>
                                    <Space
                                        style={{ width: "100%" }}
                                        align="start"
                                    >
                                        {row.hostname === "Other" ? (
                                            <Input
                                                placeholder="Enter hostname"
                                                value={row.hostname_other}
                                                style={{
                                                    ...inputStyle,
                                                    flex: 1,
                                                }}
                                                onChange={(e) =>
                                                    updateRow(
                                                        i,
                                                        "hostname_other",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <Select
                                                placeholder="Select Hostname"
                                                value={
                                                    row.hostname ||
                                                    row.serial ||
                                                    undefined
                                                }
                                                style={{
                                                    ...selectStyle,
                                                    flex: 1,
                                                }}
                                                showSearch
                                                onChange={(val) =>
                                                    updateRow(
                                                        i,
                                                        "hostname",
                                                        val,
                                                    )
                                                }
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(
                                                            input.toLowerCase(),
                                                        )
                                                }
                                                options={[
                                                    ...hostnames.map(
                                                        (host) => ({
                                                            label: `${host.hostname || host.serial} - ${host.serial}`,
                                                            value:
                                                                host.hostname ||
                                                                host.serial,
                                                        }),
                                                    ),
                                                    {
                                                        label: "Other",
                                                        value: "Other",
                                                    },
                                                ]}
                                            />
                                        )}
                                        <Button
                                            type="default"
                                            onClick={() => openModalForRow(i)}
                                        >
                                            Update
                                        </Button>
                                    </Space>
                                </Col>

                                <Col span={12}>
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
                                                    e.target.value,
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
                                                    .includes(
                                                        input.toLowerCase(),
                                                    )
                                            }
                                            options={[
                                                ...locations.map((loc) => ({
                                                    label: loc,
                                                    value: loc,
                                                })),
                                                {
                                                    label: "Other",
                                                    value: "Other",
                                                },
                                            ]}
                                        />
                                    )}
                                </Col>

                                <Col span={24}>
                                    <Form.Item label="Remarks">
                                        <TextArea
                                            rows={3}
                                            placeholder="Enter remarks (optional)"
                                            style={inputStyle}
                                            value={row.remarks}
                                            onChange={(e) =>
                                                updateRow(
                                                    i,
                                                    "remarks",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    ))}
                </Form>
            </Drawer>

            <HardwareModal
                open={modalOpen}
                searchValue={modalSearch}
                onClose={() => setModalOpen(false)}
                onSave={handleModalSave}
            />
        </>
    );
};

export default IssueDrawer;
