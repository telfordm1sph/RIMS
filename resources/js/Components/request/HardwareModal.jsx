import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    Row,
    Col,
    Tabs,
    Skeleton,
    message,
    Select,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import {
    convertDatesToDayjs,
    convertDayjsToStrings,
} from "../utils/dateHelper";
import { useRemovalModal } from "@/Hooks/useRemovalModal";
import RemovalReasonModal from "../modal/RemovalReasonModal";
import { useHardwareParts } from "@/Hooks/useHardwareParts";
import { useHardwareSoftware } from "@/Hooks/useHardwareSoftware";
import { usePage } from "@inertiajs/react";

const { TextArea } = Input;

const HardwareModal = ({ open, onClose, searchValue, onSave, item }) => {
    const [form] = Form.useForm();
    const [hardware, setHardware] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("specs");
    const [removedItems, setRemovedItems] = useState({
        parts: [],
        software: [],
    });

    const { emp_data } = usePage().props;

    // Parts & software hooks
    const {
        partsOptions,
        loadPartTypes,
        loadBrands,
        loadModels,
        loadSpecifications,
    } = useHardwareParts(form);

    const {
        softwareOptions,
        loadSoftwareNames,
        loadSoftwareTypes,
        loadSoftwareVersions,
        loadSoftwareLicenses,
    } = useHardwareSoftware(form);

    const {
        removalModalVisible,
        pendingRemoval,
        removalForm,
        handleRemoveWithReason,
        confirmRemoval,
        cancelRemoval,
    } = useRemovalModal(form, setRemovedItems);

    // ======================================
    // Fetch hardware details only
    // ======================================
    useEffect(() => {
        if (!open || !searchValue) return;

        const parseSpecs = (specsValue) => {
            if (!specsValue) return { specifications: "", condition: "" };
            try {
                if (specsValue.startsWith("{")) {
                    const parsed = JSON.parse(specsValue);
                    return {
                        specifications: parsed.specifications || "",
                        condition: parsed.condition || "",
                    };
                }
            } catch (e) {
                console.log("Failed to parse specifications JSON:", e);
            }
            return { specifications: specsValue, condition: "" };
        };

        const fetchHardware = async () => {
            setLoading(true);
            try {
                form.resetFields();

                const { data: res } = await axios.get(
                    route("hardware.full.details", searchValue),
                );
                if (!res?.success) return;

                const hw = res.data;
                setHardware(hw);
                console.log("Hardware fetched:", hw);

                // Transform parts & software for form display
                const partsArray = (hw.parts || []).map((part) => {
                    const { specifications, condition } = parseSpecs(
                        part.specifications,
                    );
                    return {
                        id: part.id,
                        part_type: part.part_type || "",
                        brand: part.brand || "",
                        model: part.model || "",
                        serial_number: part.serial_number || "",
                        specifications,
                        condition,
                        status: part.status || "",
                    };
                });

                const softwareArray = (hw.software || []).map((sw) => {
                    const licenseKey =
                        sw.software_license?.license_key ??
                        sw.software_license?.account_user ??
                        "";
                    return {
                        id: sw.id,
                        name: sw.software_inventory?.software_name || "",
                        type: sw.software_inventory?.software_type || "",
                        version: sw.software_inventory?.version || "",
                        publisher: sw.software_inventory?.publisher || "",
                        license_key: licenseKey,
                        _license_identifier: licenseKey,
                        _original_license_key: sw.software_license?.license_key,
                        _original_account_user:
                            sw.software_license?.account_user,
                        account_user: sw.software_license?.account_user || null,
                        account_password:
                            sw.software_license?.account_password || null,
                        license_type: sw.software_inventory?.license_type || "",
                        expiration_date:
                            sw.software_license?.expiration_date || "",
                        installation_date: sw.installation_date || "",
                        status: sw.status || "",
                        qty: sw.software_license?.max_activations || "",
                    };
                });

                form.setFieldsValue({
                    hostname: hw.hostname,
                    serial: hw.serial_number,
                    model: hw.model,
                    brand: hw.brand,
                    processor: hw.processor,
                    motherboard: hw.motherboard,
                    ip_address: hw.ip_address,
                    wifi_mac: hw.wifi_mac,
                    lan_mac: hw.lan_mac,
                    remarks: hw.remarks,
                    parts: partsArray,
                    software: softwareArray,
                });
            } catch (err) {
                console.error("Fetch hardware error:", err);
                message.error("Failed to fetch hardware details");
            } finally {
                setLoading(false);
            }
        };

        fetchHardware();
    }, [open, searchValue]);

    // ======================================
    // Tab change handler - lazy load dropdowns
    // ======================================
    const handleTabChange = async (key) => {
        setActiveTab(key);

        if (!hardware) return;

        if (key === "parts") {
            await loadPartTypes();
        } else if (key === "software") {
            await loadSoftwareNames();
        }
    };

    // ======================================
    // Form submission
    // ======================================

    const handleFinish = async (values) => {
        const formattedValues = convertDayjsToStrings(values);

        // Clean up parts specifications
        if (formattedValues.parts) {
            formattedValues.parts = formattedValues.parts.map((part) => {
                if (part.specifications?.startsWith("{")) {
                    try {
                        const parsed = JSON.parse(part.specifications);
                        part.specifications = parsed.specifications || parsed;
                    } catch {}
                }
                return part;
            });
        }

        // Clean up software license/account_user
        if (formattedValues.software) {
            formattedValues.software = formattedValues.software.map(
                (sw, index) => {
                    const fieldName = `software_${index}`;
                    const licenseOptions =
                        softwareOptions?.licenses?.[fieldName] || [];
                    const selectedOption = licenseOptions.find(
                        (opt) => opt.value === sw._license_identifier,
                    );
                    const licenseData = selectedOption?.license_data;

                    const result = {
                        ...sw,
                        _license_identifier: undefined,
                        _original_license_key: undefined,
                        _original_account_user: undefined,
                    };

                    if (licenseData) {
                        if (licenseData.license_key) {
                            result.license_key = sw._license_identifier;
                            result.account_user = null;
                            result.account_password = null;
                        } else {
                            result.license_key = null;
                            result.account_user = sw._license_identifier;
                            result.account_password =
                                licenseData.account_password || null;
                        }
                    }

                    return result;
                },
            );
        }

        // Handle removed items
        Object.entries(removedItems).forEach(([key, items]) => {
            if (items.length > 0) {
                formattedValues[key] = formattedValues[key] || [];
                items.forEach((removedItem) => {
                    formattedValues[key].push({
                        id: removedItem.id,
                        _delete: true,
                        removal_reason: removedItem.reason,
                        removal_condition: removedItem.condition,
                        removal_remarks: removedItem.remarks,
                    });
                });
            }
        });

        try {
            setLoading(true);

            const response = await axios.put(
                route("hardware.update", hardware.id || hardware.hostname),
                { ...formattedValues, employee_id: emp_data?.emp_id },
            );

            if (response.data?.success) {
                message.success(
                    response.data.message || "Hardware updated successfully",
                );

                // UPDATED: Return the complete updated hardware data including the new hostname
                if (onSave) {
                    const updatedHardwareData = {
                        hostname: formattedValues.hostname,
                        location: formattedValues.location || hardware.location,
                        remarks: formattedValues.remarks,
                        // Include any other fields you need
                        ...formattedValues,
                    };
                    onSave(updatedHardwareData);
                }

                setRemovedItems({ parts: [], software: [] });
                handleClose();
            } else {
                message.error(
                    response.data?.message || "Failed to update hardware",
                );
            }
        } catch (err) {
            console.error(err);
            message.error("An error occurred while updating hardware");
        } finally {
            setLoading(false);
        }
    };

    // ======================================
    // Close handler
    // ======================================
    const handleClose = () => {
        form.resetFields();
        setHardware(null);
        setRemovedItems({ parts: [], software: [] });
        onClose();
    };

    // ======================================
    // Loading skeleton
    // ======================================
    if (loading || !hardware) {
        return (
            <Modal
                title="Hardware Details"
                open={open}
                onCancel={handleClose}
                width={1200}
                footer={[
                    <Button key="cancel" onClick={handleClose}>
                        Cancel
                    </Button>,
                    <Button key="save" type="primary" loading>
                        Save
                    </Button>,
                ]}
            >
                <div style={{ padding: "20px 0" }}>
                    {[0, 1, 2].map((row) => (
                        <Row key={row} gutter={16} style={{ marginBottom: 16 }}>
                            {[0, 1, 2].map((col) => (
                                <Col xs={24} sm={12} md={8} key={col}>
                                    <Skeleton active paragraph={{ rows: 1 }} />
                                </Col>
                            ))}
                        </Row>
                    ))}
                </div>
            </Modal>
        );
    }

    // ======================================
    // Tab items
    // ======================================
    const tabItems = [
        {
            key: "specs",
            label: "Hardware Specs",
            children: (
                <>
                    <Row gutter={16}>
                        {[
                            { label: "Hostname", name: "hostname" },
                            { label: "Model", name: "model" },
                            { label: "Brand", name: "brand" },
                            { label: "Serial", name: "serial" },
                            { label: "Processor", name: "processor" },
                            { label: "Motherboard", name: "motherboard" },
                            { label: "IP Address", name: "ip_address" },
                            { label: "WiFi Mac Address", name: "wifi_mac" },
                            { label: "LAN Mac", name: "lan_mac" },
                        ].map((f) => (
                            <Col xs={24} sm={12} md={8} key={f.name}>
                                <Form.Item
                                    label={f.label}
                                    name={f.name}
                                    style={{ marginBottom: 8 }}
                                >
                                    <Input allowClear />
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                </>
            ),
        },

        /* ================ Parts ================ */
        {
            key: "parts",
            label: "Parts",
            children: (
                <Form.List name="parts">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name }, index) => {
                                const fieldName = `parts_${name}`;
                                const currentValues =
                                    form.getFieldValue("parts")?.[name] || {};

                                return (
                                    <Row
                                        key={key}
                                        gutter={12}
                                        align="middle"
                                        style={{ marginBottom: 8 }}
                                    >
                                        <Form.Item name={[name, "id"]} hidden>
                                            <Input type="hidden" />
                                        </Form.Item>

                                        {/* Hidden condition field */}
                                        <Form.Item
                                            name={[name, "condition"]}
                                            hidden
                                        >
                                            <Input type="hidden" />
                                        </Form.Item>

                                        {/* Part Type Select */}
                                        <Col xs={24} sm={12} md={4}>
                                            <Form.Item
                                                name={[name, "part_type"]}
                                                label={
                                                    index === 0
                                                        ? "Part Type"
                                                        : ""
                                                }
                                                style={{ marginBottom: 0 }}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Please select part type",
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder="Select Part Type"
                                                    options={
                                                        partsOptions.types || []
                                                    }
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    onChange={(val) => {
                                                        const parts =
                                                            form.getFieldValue(
                                                                "parts",
                                                            ) || [];
                                                        parts[name] = {
                                                            ...parts[name],
                                                            part_type: val,
                                                            brand: undefined,
                                                            model: undefined,
                                                            specifications:
                                                                undefined,
                                                            condition:
                                                                undefined,
                                                        };
                                                        form.setFieldsValue({
                                                            parts,
                                                        });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* Brand Select */}
                                        <Col xs={24} sm={12} md={4}>
                                            <Form.Item
                                                name={[name, "brand"]}
                                                label={
                                                    index === 0 ? "Brand" : ""
                                                }
                                                style={{ marginBottom: 0 }}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Please select brand",
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder="Select Brand"
                                                    options={
                                                        partsOptions.brands[
                                                            fieldName
                                                        ] || []
                                                    }
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    onFocus={async () => {
                                                        if (
                                                            currentValues.part_type
                                                        ) {
                                                            await loadBrands(
                                                                currentValues.part_type,
                                                                fieldName,
                                                            );
                                                        }
                                                    }}
                                                    onChange={(val) => {
                                                        const parts =
                                                            form.getFieldValue(
                                                                "parts",
                                                            ) || [];
                                                        parts[name] = {
                                                            ...parts[name],
                                                            brand: val,
                                                            model: undefined,
                                                            specifications:
                                                                undefined,
                                                            condition:
                                                                undefined,
                                                        };
                                                        form.setFieldsValue({
                                                            parts,
                                                        });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* Model Select */}
                                        <Col xs={24} sm={12} md={4}>
                                            <Form.Item
                                                name={[name, "model"]}
                                                label={
                                                    index === 0 ? "Model" : ""
                                                }
                                                style={{ marginBottom: 0 }}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Please select model",
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder="Select Model"
                                                    options={
                                                        partsOptions.models[
                                                            fieldName
                                                        ] || []
                                                    }
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    onFocus={async () => {
                                                        if (
                                                            currentValues.part_type &&
                                                            currentValues.brand
                                                        ) {
                                                            await loadModels(
                                                                currentValues.part_type,
                                                                currentValues.brand,
                                                                fieldName,
                                                            );
                                                        }
                                                    }}
                                                    onChange={(val) => {
                                                        const parts =
                                                            form.getFieldValue(
                                                                "parts",
                                                            ) || [];
                                                        parts[name] = {
                                                            ...parts[name],
                                                            model: val,
                                                            specifications:
                                                                undefined,
                                                            condition:
                                                                undefined,
                                                        };
                                                        form.setFieldsValue({
                                                            parts,
                                                        });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* Specifications Select */}
                                        <Col xs={24} sm={12} md={4}>
                                            <Form.Item
                                                name={[name, "specifications"]}
                                                label={
                                                    index === 0
                                                        ? "Specifications"
                                                        : ""
                                                }
                                                style={{ marginBottom: 0 }}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Please select specifications",
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder="Select Specifications"
                                                    options={
                                                        partsOptions
                                                            .specifications?.[
                                                            fieldName
                                                        ] || []
                                                    }
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    onFocus={async () => {
                                                        if (
                                                            currentValues.part_type &&
                                                            currentValues.brand &&
                                                            currentValues.model
                                                        ) {
                                                            await loadSpecifications(
                                                                currentValues.part_type,
                                                                currentValues.brand,
                                                                currentValues.model,
                                                                fieldName,
                                                                name,
                                                            );
                                                        }
                                                    }}
                                                    onChange={(value) => {
                                                        // Parse the JSON value to extract condition
                                                        let specsText = "";
                                                        let conditionValue = "";

                                                        if (value) {
                                                            try {
                                                                const parsed =
                                                                    JSON.parse(
                                                                        value,
                                                                    );
                                                                specsText =
                                                                    parsed.specifications ||
                                                                    "";
                                                                conditionValue =
                                                                    parsed.condition ||
                                                                    "";
                                                            } catch (e) {
                                                                // If not JSON, use as plain text
                                                                specsText =
                                                                    value;
                                                            }
                                                        }

                                                        const parts =
                                                            form.getFieldValue(
                                                                "parts",
                                                            ) || [];
                                                        parts[name] = {
                                                            ...parts[name],
                                                            specifications:
                                                                value,
                                                            condition:
                                                                conditionValue,
                                                        };
                                                        form.setFieldsValue({
                                                            parts,
                                                        });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* Serial Input */}
                                        <Col xs={24} sm={12} md={4}>
                                            <Form.Item
                                                name={[name, "serial_number"]}
                                                label={
                                                    index === 0 ? "Serial" : ""
                                                }
                                                style={{ marginBottom: 0 }}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Please enter serial number",
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    allowClear
                                                    placeholder="Enter serial number"
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* Remove Icon */}
                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={4}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginTop: index === 0 ? 24 : 0,
                                            }}
                                        >
                                            <MinusCircleOutlined
                                                style={{
                                                    fontSize: 20,
                                                    color: "#ff4d4f",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => {
                                                    const row =
                                                        form.getFieldValue(
                                                            "parts",
                                                        )?.[name];
                                                    handleRemoveWithReason(
                                                        "parts",
                                                        name,
                                                        row,
                                                    );
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                );
                            })}

                            <Button
                                type="dashed"
                                block
                                icon={<PlusOutlined />}
                                onClick={() =>
                                    add({
                                        part_type: "",
                                        brand: "",
                                        model: "",
                                        specifications: "",
                                        condition: "",
                                        serial_number: "",
                                    })
                                }
                                style={{ marginTop: 16 }}
                            >
                                Add Part
                            </Button>
                        </>
                    )}
                </Form.List>
            ),
        },
        /* ================ Software ================ */
        {
            key: "software",
            label: "Software",
            children: (
                <Form.List name="software">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name }, index) => {
                                const fieldName = `software_${name}`;
                                const currentValues =
                                    form.getFieldValue("software")?.[name] ||
                                    {};

                                return (
                                    <Row
                                        key={key}
                                        gutter={12}
                                        align="middle"
                                        style={{ marginBottom: 8 }}
                                    >
                                        <Form.Item name={[name, "id"]} hidden>
                                            <Input type="hidden" />
                                        </Form.Item>
                                        {/* Software Name Select */}
                                        <Col xs={24} sm={12} md={4}>
                                            <Form.Item
                                                name={[name, "name"]}
                                                label={
                                                    index === 0 ? "Name" : ""
                                                }
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select
                                                    placeholder="Select Name"
                                                    options={
                                                        softwareOptions.names ||
                                                        []
                                                    }
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    onChange={(val) => {
                                                        const software =
                                                            form.getFieldValue(
                                                                "software",
                                                            ) || [];
                                                        software[name] = {
                                                            ...software[name],
                                                            name: val,
                                                            type: undefined,
                                                            version: undefined,
                                                            license_key:
                                                                undefined,
                                                            _license_identifier:
                                                                undefined,
                                                        };
                                                        form.setFieldsValue({
                                                            software,
                                                        });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* Software Type Select */}
                                        <Col xs={24} sm={12} md={4}>
                                            <Form.Item
                                                name={[name, "type"]}
                                                label={
                                                    index === 0 ? "Type" : ""
                                                }
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select
                                                    placeholder="Select Type"
                                                    options={
                                                        softwareOptions.types[
                                                            fieldName
                                                        ] || []
                                                    }
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    onFocus={async () => {
                                                        if (
                                                            currentValues.name
                                                        ) {
                                                            await loadSoftwareTypes(
                                                                currentValues.name,
                                                                fieldName,
                                                            );
                                                        }
                                                    }}
                                                    onChange={(val) => {
                                                        const software =
                                                            form.getFieldValue(
                                                                "software",
                                                            ) || [];
                                                        software[name] = {
                                                            ...software[name],
                                                            type: val,
                                                            version: undefined,
                                                            license_key:
                                                                undefined,
                                                            _license_identifier:
                                                                undefined,
                                                        };
                                                        form.setFieldsValue({
                                                            software,
                                                        });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* Version Select */}
                                        <Col xs={24} sm={12} md={4}>
                                            <Form.Item
                                                name={[name, "version"]}
                                                label={
                                                    index === 0 ? "Version" : ""
                                                }
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select
                                                    placeholder="Select Version"
                                                    options={
                                                        softwareOptions
                                                            .versions[
                                                            fieldName
                                                        ] || []
                                                    }
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    onFocus={async () => {
                                                        if (
                                                            currentValues.name &&
                                                            currentValues.type
                                                        ) {
                                                            await loadSoftwareVersions(
                                                                currentValues.name,
                                                                currentValues.type,
                                                                fieldName,
                                                            );
                                                        }
                                                    }}
                                                    onChange={(val) => {
                                                        const software =
                                                            form.getFieldValue(
                                                                "software",
                                                            ) || [];
                                                        software[name] = {
                                                            ...software[name],
                                                            version: val,
                                                            license_key:
                                                                undefined,
                                                            _license_identifier:
                                                                undefined,
                                                        };
                                                        form.setFieldsValue({
                                                            software,
                                                        });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* License/Account Select */}
                                        <Col xs={24} sm={12} md={4}>
                                            <Form.Item
                                                name={[name, "license_key"]}
                                                label={
                                                    index === 0
                                                        ? "License/Account"
                                                        : ""
                                                }
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select
                                                    placeholder="Select License"
                                                    options={
                                                        softwareOptions
                                                            .licenses?.[
                                                            fieldName
                                                        ] || []
                                                    }
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    onFocus={async () => {
                                                        if (
                                                            currentValues.name &&
                                                            currentValues.type &&
                                                            currentValues.version
                                                        ) {
                                                            await loadSoftwareLicenses(
                                                                currentValues.name,
                                                                currentValues.type,
                                                                currentValues.version,
                                                                fieldName,
                                                                name,
                                                            );
                                                        }
                                                    }}
                                                    onChange={(val) => {
                                                        const licenseOptions =
                                                            softwareOptions
                                                                .licenses?.[
                                                                fieldName
                                                            ] || [];
                                                        const selectedOption =
                                                            licenseOptions.find(
                                                                (opt) =>
                                                                    opt.value ===
                                                                    val,
                                                            );
                                                        const licenseData =
                                                            selectedOption?.license_data;

                                                        if (licenseData) {
                                                            form.setFieldValue(
                                                                [
                                                                    "software",
                                                                    name,
                                                                    "_license_identifier",
                                                                ],
                                                                val,
                                                            );
                                                            form.setFieldValue(
                                                                [
                                                                    "software",
                                                                    name,
                                                                    "account_user",
                                                                ],
                                                                licenseData.account_user ||
                                                                    null,
                                                            );
                                                            form.setFieldValue(
                                                                [
                                                                    "software",
                                                                    name,
                                                                    "account_password",
                                                                ],
                                                                licenseData.account_password ||
                                                                    null,
                                                            );
                                                            form.setFieldValue(
                                                                [
                                                                    "software",
                                                                    name,
                                                                    "license_key",
                                                                ],
                                                                val,
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Form.Item>
                                            {/* Hidden fields for license data */}
                                            <Form.Item
                                                name={[
                                                    name,
                                                    "_license_identifier",
                                                ]}
                                                hidden
                                            >
                                                <Input type="hidden" />
                                            </Form.Item>
                                            <Form.Item
                                                name={[name, "account_user"]}
                                                hidden
                                            >
                                                <Input type="hidden" />
                                            </Form.Item>
                                            <Form.Item
                                                name={[
                                                    name,
                                                    "account_password",
                                                ]}
                                                hidden
                                            >
                                                <Input type="hidden" />
                                            </Form.Item>
                                        </Col>

                                        {/* Expiration Date Input */}
                                        <Col xs={24} sm={12} md={4}>
                                            <Form.Item
                                                name={[name, "expiration_date"]}
                                                label={
                                                    index === 0
                                                        ? "Expiration Date"
                                                        : ""
                                                }
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Input
                                                    allowClear
                                                    placeholder="Expiration Date"
                                                    disabled
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* Qty Input */}
                                        <Col xs={24} sm={12} md={2}>
                                            <Form.Item
                                                name={[name, "qty"]}
                                                label={index === 0 ? "Qty" : ""}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Input
                                                    allowClear
                                                    placeholder="Qty"
                                                    disabled
                                                />
                                            </Form.Item>
                                        </Col>

                                        {/* Remove Icon */}
                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={2}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginTop: index === 0 ? 24 : 0,
                                            }}
                                        >
                                            <MinusCircleOutlined
                                                style={{
                                                    fontSize: 20,
                                                    color: "#ff4d4f",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => {
                                                    const row =
                                                        form.getFieldValue(
                                                            "software",
                                                        )?.[name];
                                                    handleRemoveWithReason(
                                                        "software",
                                                        name,
                                                        row,
                                                    );
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                );
                            })}

                            <Button
                                type="dashed"
                                block
                                icon={<PlusOutlined />}
                                onClick={() => add()}
                                style={{ marginTop: 16 }}
                            >
                                Add Software
                            </Button>
                        </>
                    )}
                </Form.List>
            ),
        },
    ];

    return (
        <Modal
            title="Hardware Details"
            open={open}
            onCancel={handleClose}
            width={1200}
            footer={[
                <Button key="cancel" onClick={handleClose}>
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
                <Tabs
                    defaultActiveKey="specs"
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    items={tabItems}
                />
            </Form>
            <RemovalReasonModal
                visible={removalModalVisible}
                onConfirm={confirmRemoval}
                onCancel={cancelRemoval}
                form={removalForm}
                itemType={pendingRemoval?.fieldDataIndex}
            />
        </Modal>
    );
};

export default HardwareModal;
