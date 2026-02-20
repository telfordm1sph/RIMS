import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DetailsDrawer from "@/Components/drawer/DetailsDrawer";
import { useDrawer } from "@/Hooks/useDrawer";
import { useApiTableConfig } from "@/Hooks/useApiTableConfig";
import { Table, Card, Button, Tag, message } from "antd";
import { EyeOutlined, LikeOutlined } from "@ant-design/icons";
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
    // Auth Helpers
    // ==============================
    const isHardwareUser = (record) =>
        (record?.hardware_users || []).some(
            (hu) => hu.user_id === emp_data?.emp_id,
        );

    const canAcknowledge = (record) =>
        record?.acknowledgement?.status === 0 && isHardwareUser(record);

    // ==============================
    // Acknowledge Handler
    // ==============================
    const handleAcknowledge = async (record) => {
        if (!record) return;

        if (!isHardwareUser(record)) {
            message.error(
                "You are not authorized to acknowledge this issuance.",
            );
            return;
        }

        try {
            setAckLoading(true);
            await axios.put(route("issuance.acknowledge", record.id), {
                employee_id: emp_data?.emp_id,
            });

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
                route("hardware.full.details", {
                    hardwareId: record.hostname,
                }),
            );

            if (!res?.success) return { fieldGroups: [] };

            const hw = res.data;
            console.log(hw);

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
                        {
                            label: "Department",
                            value: hw.department_name || "-",
                        },
                        {
                            label: "Location",
                            value: hw.location_name || "-",
                        },
                        {
                            label: "Product Line",
                            value: hw.pl_name || "-",
                        },
                        {
                            label: "Station",
                            value: hw.station_name || "-",
                        },
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
            title: "Issuance No.",
            dataIndex: "issuance_number",
            key: "issuance_number",
            sorter: true,
        },
        {
            title: "Request No.",
            dataIndex: "request_number",
            key: "request_number",
            sorter: true,
        },
        {
            title: "Hostname",
            dataIndex: "hostname",
            key: "hostname",
            sorter: true,
        },
        {
            title: "Location",
            dataIndex: "location_name",
            key: "location_name",
            sorter: true,
        },
        {
            title: "Assigned Users",
            key: "hardware_users",
            render: (_, record) => {
                const users = record.hardware_users || [];
                if (!users.length)
                    return <span className="text-gray-400">-</span>;
                return (
                    <div className="flex flex-col gap-1">
                        {users.map((hu) => (
                            <Tag key={hu.user_id} color="blue">
                                {hu.user_name}
                            </Tag>
                        ))}
                    </div>
                );
            },
        },
        {
            title: "Remarks",
            dataIndex: "remarks",
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
            key: "creator_name",
            sorter: true,
        },
        {
            title: "Status",
            key: "acknowledgement_status",
            render: (_, record) => (
                <Tag color={record.acknowledgement?.status_color || "gold"}>
                    {record.acknowledgement?.status_label || "Pending"}
                </Tag>
            ),
        },
        {
            title: "Acknowledged By",
            key: "acknowledged_by_name",
            render: (_, record) =>
                record.acknowledgement?.status === 1
                    ? record.acknowledgement?.acknowledged_by_name || "-"
                    : "-",
        },
        {
            title: "Acknowledged At",
            key: "acknowledged_at",
            dataIndex: ["acknowledgement", "acknowledged_at"],
            sorter: true,
            render: (value, record) =>
                record.acknowledgement?.status === 1 && value
                    ? dayjs(value).format("MMM D, YYYY hh:mm A")
                    : "-",
        },
        {
            title: "Actions",
            key: "actions",
            width: 120,
            fixed: "right",
            render: (_, record) => {
                const acknowledgeAllowed = canAcknowledge(record);
                return (
                    <Button
                        color={acknowledgeAllowed ? "primary" : "default"}
                        variant="filled"
                        icon={
                            acknowledgeAllowed ? (
                                <LikeOutlined />
                            ) : (
                                <EyeOutlined />
                            )
                        }
                        onClick={() => handleView(record)}
                    >
                        {acknowledgeAllowed ? "Acknowledge" : "View"}
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
    console.log(data);

    const showAcknowledgeButton =
        selectedItem?.acknowledgement?.status === 0 &&
        isHardwareUser(selectedItem);

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
                issuanceData={selectedItem} // pass full record
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
