import { usePage } from "@inertiajs/react";
import SidebarLink from "@/Components/sidebar/SidebarLink";

import { ClipboardList, FileText, Table2, Box, Layers } from "lucide-react"; // Updated imports
import Dropdown from "./DropDown";

export default function NavLinks({ isSidebarOpen }) {
    const { emp_data } = usePage().props;

    const requestLinks = [
        {
            href: route("request.form"),
            label: "Requests Slip",
            icon: <FileText className="text-base" />, // Form/document icon
        },
        {
            href: route("requestType.form"),
            label: "Request Types",
            icon: <ClipboardList className="text-base" />, // List icon for types
        },
        {
            href: route("request.table"),
            label: "Request Table",
            icon: <Table2 className="text-base" />, // Table icon
        },
    ];

    const issuanceLinks = [
        {
            href: route("issuance.table"),
            label: "Unit Issuance",
            icon: <Box className="text-base" />, // Box icon for units
        },
        {
            href: route("issuance.items.table"),
            label: "Item Issuance",
            icon: <Layers className="text-base" />, // Layers icon for items
        },
    ];

    return (
        <nav
            className="flex flex-col flex-grow space-y-1 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
        >
            <Dropdown
                label="Requests"
                icon={<ClipboardList className="text-base" />}
                links={requestLinks}
                isSidebarOpen={isSidebarOpen}
            />
            <Dropdown
                label="Issuance"
                icon={<Box className="text-base" />}
                links={issuanceLinks}
                isSidebarOpen={isSidebarOpen}
            />
        </nav>
    );
}
