import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DetailsDrawer from "@/Components/drawer/DetailsDrawer";
import { useDrawer } from "@/Hooks/useDrawer";
import { useApiTableConfig } from "@/Hooks/useApiTableConfig";
import { Table, Card, Dropdown, Button, Tag, message } from "antd";
import { EyeOutlined, LikeOutlined } from "@ant-design/icons";
import { EllipsisVertical } from "lucide-react";
import dayjs from "dayjs";
import axios from "axios";
import SkeletonTable from "@/Components/skeleton/SkeletonTable";
import { useState } from "react";
import { usePage } from "@inertiajs/react";

const IssuanceTable = () => {
    const { drawerOpen, selectedItem, openDrawer, closeDrawer } = useDrawer();
    const [ackLoading, setAckLoading] = useState(false);
    const { emp_data } = usePage().props;

    // ==============================
    // Acknowledge Handler
    // ==============================
    const handleAcknowledge = async (record) => {
        if (!record) return;
        try {
            setAckLoading(true);
            const response = await axios.put(
                route("issuance.acknowledge", record.id),
                {
                    employee_id: emp_data?.emp_id,
                },
            );

            console.log(response);
            message.success("Acknowledged successfully");

            closeDrawer();
            await fetchData();
        } catch (error) {
            console.error("Acknowledge failed:", error);
            message.error(
                error?.response?.data?.message || "Failed to acknowledge",
            );
        } finally {
            setAckLoading(false);
        }
    };

    // ==============================
    // Fetch Full Details
    // ==============================
    const fetchDetails = async (record) => {
        try {
            const { data: res } = await axios.get(
                route("hardware.full.details", { hardwareId: record.hostname }),
            );
            console.log(res.data);

            if (!res?.success) return { fieldGroups: [] };

            const hw = res.data;

            const partsArray = (hw.parts || []).map((part) => ({
                id: part.id,
                title: part.part_type || "Part",
                fields: [
                    { label: "Part Type", value: part.part_type || "-" },
                    { label: "Brand", value: part.brand || "-" },
                    { label: "Model", value: part.model || "-" },
                    {
                        label: "Serial Number",
                        value: part.serial_number || "-",
                    },
                    { label: "Status", value: part.status || "-" },
                ],
            }));

            const softwareArray = (hw.software || []).map((s) => ({
                id: s.id,
                title: s.software_inventory?.software_name || "Software",
                fields: [
                    {
                        label: "Version",
                        value: s.software_inventory?.version || "-",
                    },
                    {
                        label: "Type",
                        value: s.software_inventory?.software_type || "-",
                    },
                    {
                        label: "Installed On",
                        value: s.installation_date || "-",
                    },
                ],
            }));

            const fieldGroups = [
                {
                    title: "Hardware Specifications",
                    fields: [
                        { label: "Hostname", value: hw.hostname },
                        { label: "Brand", value: hw.brand },
                        { label: "Model", value: hw.model },
                        { label: "Category", value: hw.category },
                        { label: "Serial Number", value: hw.serial_number },
                        { label: "Processor", value: hw.processor },
                        { label: "Motherboard", value: hw.motherboard },
                        { label: "IP Address", value: hw.ip_address || "-" },
                        { label: "Wifi MAC", value: hw.wifi_mac || "-" },
                        { label: "LAN MAC", value: hw.lan_mac || "-" },
                    ],
                },
                { title: "Parts", subGroups: partsArray },
                { title: "Software", subGroups: softwareArray },
            ];

            return { fieldGroups };
        } catch (error) {
            console.error("Failed to fetch details:", error);
            return { fieldGroups: [] };
        }
    };

    const handleView = async (record) => {
        const details = await fetchDetails(record);
        openDrawer({ ...record, ...details });
    };

    // ==============================
    // Column Definitions
    // ==============================
    const columnDefinitions = [
        {
            title: "Request No.",
            dataIndex: "request_number",
            sorter: true,
            key: "request_number",
        },
        {
            title: "Hostname",
            dataIndex: "hostname",
            sorter: true,
            key: "hostname",
        },
        {
            title: "Location",
            dataIndex: "location",
            sorter: true,
            key: "location",
        },
        {
            title: "Recipient Name",
            dataIndex: "recipient_name",
            sorter: true,
            key: "recipient_name",
        },
        {
            title: "Remarks",
            dataIndex: "remarks",
            sorter: true,
            key: "remarks",
        },
        {
            title: "Issued At",
            dataIndex: "created_at",
            key: "created_at",
            sorter: true,
            render: (value) =>
                value ? dayjs(value).format("MMM D, YYYY hh:mm A") : "-",
        },
        {
            title: "Issued By",
            dataIndex: "creator_name",
            sorter: true,
            key: "creator_name",
        },
        {
            title: "Acknowledgement Status",
            key: "acknowledgement_status",
            render: (_, record) => (
                <Tag color={record.acknowledgement?.status_color || "gold"}>
                    {record.acknowledgement?.status_label || "Pending"}
                </Tag>
            ),
        },
        {
            title: "Acknowledged At",
            key: "acknowledged_at",
            dataIndex: ["acknowledgement", "acknowledged_at"], // access nested field
            render: (value, record) =>
                record.acknowledgement?.status === 1 && value
                    ? dayjs(value).format("MMM D, YYYY hh:mm A")
                    : "-", // show dash if not acknowledged
            sorter: true, // optional if you want to sort by date
        },

        {
            title: "Actions",
            key: "actions",
            width: 100,
            fixed: "right",
            render: (_, record) => {
                const isAcknowledgable =
                    record.acknowledgement?.status === 0 &&
                    record.acknowledgement?.acknowledged_by ===
                        emp_data?.emp_id;

                return (
                    <Button
                        color={isAcknowledgable ? "primary" : "default"} // blue for Acknowledge, grey for View
                        variant="filled" // solid style
                        icon={
                            isAcknowledgable ? (
                                <LikeOutlined />
                            ) : (
                                <EyeOutlined />
                            )
                        }
                        onClick={() => handleView(record)}
                    >
                        {isAcknowledgable ? "Acknowledge" : "View"}
                    </Button>
                );
            },
        },
    ];

    // ==============================
    // API Table Hook
    // ==============================
    const {
        data,
        loading,
        paginationConfig,
        columns,
        handleTableChange,
        fetchData,
    } = useApiTableConfig(route("issuance.list"), columnDefinitions);

    // Determine if acknowledge button should be shown in drawer
    const showAcknowledgeButton =
        selectedItem?.acknowledgement?.status == 0 &&
        selectedItem?.acknowledgement?.acknowledged_by == emp_data?.emp_id;

    // ==============================
    // Render
    // ==============================
    return (
        <AuthenticatedLayout>
            <Card title="Issuance Table" style={{ margin: "24px" }}>
                {loading ? (
                    <SkeletonTable columns={5} rows={5} />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
                        pagination={paginationConfig}
                        onChange={handleTableChange}
                        scroll={{ x: true }}
                    />
                )}
            </Card>

            <DetailsDrawer
                visible={drawerOpen}
                fieldGroups={selectedItem?.fieldGroups || []}
                loading={false}
                onClose={closeDrawer}
                showAcknowledge={showAcknowledgeButton}
                onAcknowledge={() => handleAcknowledge(selectedItem)}
                acknowledgeLoading={ackLoading}
            />
        </AuthenticatedLayout>
    );
};

export default IssuanceTable;
