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
import { EditOutlined, SendOutlined } from "@ant-design/icons";
import axios from "axios";
import HardwareModal from "./HardwareModal";
import { usePage } from "@inertiajs/react";

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
    const [modalRowIndex, setModalRowIndex] = useState(null);
    const { emp_data } = usePage().props;
    const inputStyle = {
        marginBottom: 12,
        border: "1px solid #424242",
        padding: 8,
        borderRadius: 6,
        height: 36,
    };
    const selectStyle = { width: "100%", height: 36, borderRadius: 6 };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const locRes = await axios.get(route("locations.list"));
                setLocations(locRes.data.map((loc) => loc.location_name));

                if (item?.type_of_request) {
                    const hostRes = await axios.get(route("hostnames.list"), {
                        params: { type_of_request: item.type_of_request },
                    });
                    console.log("Host", hostRes);

                    setHostnames(
                        hostRes.data.map((host) => ({
                            hostname: host.hostname,
                            serial_number: host.serial_number,
                        })),
                    );
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [item?.type_of_request]);

    useEffect(() => {
        if (item?.quantity) {
            const rows = Array.from({ length: item.quantity }, () => ({
                issued_to: item?.issued_to || null,
                hostname: "",
                location: "",
                location_other: "",
                remarks: "",
            }));
            setHostRows(rows);
            form.setFieldsValue({ hostnames: rows });
        }
    }, [item, form]);

    const updateRow = (index, field, value) => {
        const updated = [...hostRows];
        updated[index][field] = value;
        if (field === "location" && value !== "Other")
            updated[index].location_other = "";
        setHostRows(updated);
        form.setFieldsValue({ hostnames: updated });
    };

    const handleSubmit = async () => {
        try {
            // Validate all required fields
            const hasEmptyHostname = hostRows.some(
                (row) =>
                    !row.hostname ||
                    (row.hostname === "Other" && !row.hostname_other),
            );
            const hasEmptyLocation = hostRows.some(
                (row) =>
                    !row.location ||
                    (row.location === "Other" && !row.location_other),
            );

            if (hasEmptyHostname) {
                message.error("Please fill in all hostnames");
                return;
            }

            if (hasEmptyLocation) {
                message.error("Please fill in all locations");
                return;
            }

            setLoading(true);

            const payload = {
                request_number: request?.request_number,
                employee_id: emp_data?.emp_id,
                hostnames: hostRows.map((row) => ({
                    issued_to: row.issued_to,
                    hostname: row.hostname,
                    location:
                        row.location === "Other"
                            ? row.location_other
                            : row.location,
                    remarks: row.remarks || null,
                })),
            };

            console.log("Issuance payload:", payload);

            // Use PUT instead of POST if you want it to behave like your hardware update
            // Make sure your backend route also allows PUT for /issuance/create
            const res = await axios.post(route("issuance.create"), payload);

            if (res.data.success) {
                // Update local request item status to ISSUED (2)
                await axios.post(route("request.update-status"), {
                    item_id: item.id,
                    status: 2, // ISSUED
                });

                message.success(
                    res.data.message || "Items issued successfully",
                );

                // Reset form and host rows
                form.resetFields();
                setHostRows([]);
                onClose();
                if (onSuccess) onSuccess();
            } else {
                message.error(res.data.message || "Failed to issue items");
            }
        } catch (err) {
            console.error("Issuance error:", err);
            message.error(
                err.response?.data?.message ||
                    "An error occurred while issuing items",
            );
        } finally {
            setLoading(false);
        }
    };

    const openModalForRow = (index) => {
        const row = hostRows[index];
        setModalSearch(row.hostname || row.hostname_other);
        setModalRowIndex(index);
        setModalOpen(true);
    };

    const handleModalSave = (updatedData) => {
        console.log("Received from modal:", updatedData);

        if (modalRowIndex !== null) {
            const updatedRows = [...hostRows];

            // Update the row with the new data from the modal
            updatedRows[modalRowIndex] = {
                ...updatedRows[modalRowIndex],
                hostname: updatedData.hostname || "",
                hostname_other: "", // Clear this since we now have a proper hostname
                location: updatedData.location || "",
                location_other: "", // Clear this
                remarks:
                    updatedData.remarks ||
                    updatedRows[modalRowIndex].remarks ||
                    "",
            };

            console.log("Updated row:", updatedRows[modalRowIndex]);

            setHostRows(updatedRows);
            form.setFieldsValue({ hostnames: updatedRows });
        }

        // Close the modal and reset state
        setModalOpen(false);
        setModalRowIndex(null);
        setModalSearch(null);
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
                                border: "1px solid #424242",
                                borderRadius: 6,
                            }}
                        >
                            <h4>Item {i + 1}</h4>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Issued To">
                                        <Input
                                            value={item?.issued_to_name || "-"}
                                            readOnly
                                            style={{
                                                border: "1px solid #424242",
                                                cursor: "not-allowed",
                                                borderRadius: 6,
                                                height: 36,
                                            }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item label="Request Number">
                                        <Input
                                            value={
                                                request?.request_number || "-"
                                            }
                                            readOnly
                                            style={{
                                                border: "1px solid #424242",
                                                cursor: "not-allowed",
                                                borderRadius: 6,
                                                height: 36,
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>{" "}
                            <Row gutter={16}>
                                <Col span={12}>
                                    {/* Label row */}
                                    <Row
                                        justify="space-between"
                                        align="middle"
                                        style={{
                                            minHeight: 32,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text>Hostname</Text>

                                        {row.hostname &&
                                            row.hostname !== "Other" && (
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    color="primary"
                                                    variant="outlined"
                                                    onClick={() =>
                                                        openModalForRow(i)
                                                    }
                                                >
                                                    <EditOutlined /> Update
                                                </Button>
                                            )}
                                    </Row>

                                    <Select
                                        placeholder="Select Hostname"
                                        value={row.hostname || undefined}
                                        style={selectStyle}
                                        showSearch
                                        onChange={(val) =>
                                            updateRow(i, "hostname", val)
                                        }
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={hostnames.map((host) => ({
                                            label: `${host.hostname || host.serial_number} - ${host.serial_number}`,
                                            value:
                                                host.hostname ||
                                                host.serial_number,
                                        }))}
                                    />
                                </Col>

                                <Col span={12}>
                                    {/* Label row */}
                                    <Row
                                        justify="space-between"
                                        align="middle"
                                        style={{
                                            minHeight: 32,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text>Location</Text>
                                    </Row>

                                    {/* Field */}
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
                                    <Form.Item
                                        label="Remarks"
                                        style={{ marginTop: 8 }}
                                    >
                                        <TextArea
                                            rows={3}
                                            placeholder="Enter remarks (optional)"
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
                onClose={() => {
                    setModalOpen(false);
                    setModalRowIndex(null);
                    setModalSearch(null);
                }}
                onSave={handleModalSave}
            />
        </>
    );
};

export default IssueDrawer;
