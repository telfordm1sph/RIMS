import { usePage } from "@inertiajs/react";

import SidebarLink from "@/Components/sidebar/SidebarLink";

import { ClipboardList, FileText, SheetIcon } from "lucide-react";

export default function NavLinks({ isSidebarOpen }) {
    const { emp_data } = usePage().props;
    console.log("Nav", emp_data);

    return (
        <nav
            className="flex flex-col flex-grow space-y-1 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
        >
            <SidebarLink
                href={route("request.form")}
                icon={<FileText className="w-5 h-5" />}
                label="Requests Slip"
                isSidebarOpen={isSidebarOpen}
            />
            <SidebarLink
                href={route("requestType.form")}
                icon={<ClipboardList className="w-5 h-5" />}
                label="Request Types"
                isSidebarOpen={isSidebarOpen}
            />
        </nav>
    );
}
