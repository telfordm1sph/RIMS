import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Divider, Row, Col } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;

const HardwareModal = ({ open, onClose, searchValue, onSave }) => {
    const [form] = Form.useForm();
    const [hardware, setHardware] = useState(null);
    const [loading, setLoading] = useState(false);
    const [removedItems, setRemovedItems] = useState({
        parts: [],
        software: [],
    });

    /* ================= FETCH DATA ================= */
    useEffect(() => {
        if (!open || !searchValue) return;

        const fetchHardware = async () => {
            try {
                const res = await axios.get(route("hardware.details"), {
                    params: { search: searchValue },
                });

                if (res.data?.success) {
                    const item = res.data.item;

                    const partsArray = item.parts_data
                        ? Object.values(item.parts_data).flat()
                        : [];

                    const softwareArray = item.software_data
                        ? Object.values(item.software_data).flat()
                        : [];

                    setHardware(item);

                    form.setFieldsValue({
                        hostname: item.hostname,
                        serial: item.serial,
                        model: item.model,
                        brand: item.brand,
                        processor: item.processor,
                        motherboard: item.motherboard,
                        ip_address: item.ip_address,
                        wifi_mac: item.wifi_mac,
                        lan_mac: item.lan_mac,
                        location: item.location,
                        remarks: item.remarks,
                        parts: partsArray,
                        software: softwareArray,
                    });
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchHardware();
    }, [open, searchValue, form]);

    /* ================= SUBMIT ================= */
    const handleFinish = (values) => {
        ["parts", "software"].forEach((key) => {
            removedItems[key].forEach((id) => {
                values[key] = values[key] || [];
                values[key].push({ id, _delete: true });
            });
        });

        onSave?.(values);
        setRemovedItems({ parts: [], software: [] });
        onClose();
    };

    if (!hardware) return null;

    /* ================= UI ================= */
    return (
        <Modal
            title="Hardware Details"
            open={open}
            onCancel={onClose}
            width={1200}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    loading={loading}
                    onClick={() => form.submit()}
                >
                    Save
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                {/* ================= BASIC INFO ================= */}
                <Row gutter={16}>
                    {[
                        { label: "Hostname", name: "hostname" },
                        { label: "Location", name: "location" },
                        { label: "Model", name: "model" },
                        { label: "Brand", name: "brand" },
                        { label: "Serial", name: "serial" },
                        { label: "Processor", name: "processor" },
                        { label: "Motherboard", name: "motherboard" },
                        { label: "IP Address", name: "ip_address" },
                        { label: "WiFi Mac Address", name: "wifi_mac" },
                        { label: "LAN Mac", name: "lan_mac" },
                    ].map((f) => (
                        <Col span={6} key={f.name}>
                            <Form.Item label={f.label} name={f.name}>
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                    ))}
                </Row>

                <Form.Item label="Remarks" name="remarks">
                    <TextArea rows={3} />
                </Form.Item>

                {/* ================= PARTS ================= */}
                <Divider orientation="left">Parts</Divider>
                <Form.List name="parts">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...rest }, index) => (
                                <Row key={key} gutter={12} align="middle">
                                    {[
                                        "part_type",
                                        "brand",
                                        "model",
                                        "serial",
                                    ].map((field) => (
                                        <Col span={5} key={field}>
                                            <Form.Item
                                                {...rest}
                                                name={[name, field]}
                                                label={
                                                    index === 0
                                                        ? field
                                                              .replace("_", " ")
                                                              .replace(
                                                                  /\b\w/g,
                                                                  (l) =>
                                                                      l.toUpperCase(),
                                                              )
                                                        : ""
                                                }
                                            >
                                                <Input allowClear />
                                            </Form.Item>
                                        </Col>
                                    ))}

                                    {/* REMOVE COLUMN */}
                                    <Col
                                        span={2}
                                        style={{ textAlign: "center" }}
                                    >
                                        {index === 0 && (
                                            <div style={{ height: 22 }} />
                                        )}
                                        <MinusCircleOutlined
                                            style={{
                                                fontSize: 20,
                                                color: "red",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => {
                                                const row =
                                                    form.getFieldValue(
                                                        "parts",
                                                    )?.[name];
                                                if (row?.id) {
                                                    setRemovedItems((p) => ({
                                                        ...p,
                                                        parts: [
                                                            ...p.parts,
                                                            row.id,
                                                        ],
                                                    }));
                                                }
                                                remove(name);
                                            }}
                                        />
                                    </Col>
                                </Row>
                            ))}

                            <Button
                                type="dashed"
                                block
                                icon={<PlusOutlined />}
                                onClick={() => add()}
                            >
                                Add Part
                            </Button>
                        </>
                    )}
                </Form.List>

                {/* ================= SOFTWARE ================= */}
                <Divider orientation="left">Software</Divider>
                <Form.List name="software">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...rest }, index) => (
                                <Row key={key} gutter={12} align="middle">
                                    {[
                                        "name",
                                        "type",
                                        "license_key",
                                        "expiration_date",
                                        "qty",
                                    ].map((field) => (
                                        <Col span={4} key={field}>
                                            <Form.Item
                                                {...rest}
                                                name={[name, field]}
                                                label={
                                                    index === 0
                                                        ? field
                                                              .replace("_", " ")
                                                              .replace(
                                                                  /\b\w/g,
                                                                  (l) =>
                                                                      l.toUpperCase(),
                                                              )
                                                        : ""
                                                }
                                            >
                                                <Input allowClear />
                                            </Form.Item>
                                        </Col>
                                    ))}

                                    {/* REMOVE COLUMN */}
                                    <Col
                                        span={2}
                                        style={{ textAlign: "center" }}
                                    >
                                        {index === 0 && (
                                            <div style={{ height: 22 }} />
                                        )}
                                        <MinusCircleOutlined
                                            style={{
                                                fontSize: 20,
                                                color: "red",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => {
                                                const row =
                                                    form.getFieldValue(
                                                        "software",
                                                    )?.[name];
                                                if (row?.id) {
                                                    setRemovedItems((p) => ({
                                                        ...p,
                                                        software: [
                                                            ...p.software,
                                                            row.id,
                                                        ],
                                                    }));
                                                }
                                                remove(name);
                                            }}
                                        />
                                    </Col>
                                </Row>
                            ))}

                            <Button
                                type="dashed"
                                block
                                icon={<PlusOutlined />}
                                onClick={() => add()}
                            >
                                Add Software
                            </Button>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};

export default HardwareModal;
