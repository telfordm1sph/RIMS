import { useState } from "react";
import axios from "axios";

export const useHardwareSoftware = (form) => {
    const [softwareOptions, setSoftwareOptions] = useState({
        names: [],
        types: {},
        versions: {},
        licenses: {},
    });

    /** Load all software names */
    const loadSoftwareNames = async () => {
        try {
            const { data } = await axios.get(
                route("hardware.software.options"),
            );

            const names = Array.isArray(data.names) ? data.names : [];
            setSoftwareOptions((prev) => ({
                ...prev,
                names: names.map((n) => ({ label: n, value: n })),
            }));
        } catch (error) {
            console.error("Error loading software names:", error);
        }
    };

    /** Load software types by name */
    const loadSoftwareTypes = async (softwareName, fieldName) => {
        if (!softwareName) return;

        try {
            const filters = btoa(JSON.stringify({ name: softwareName }));

            const { data } = await axios.get(
                route("hardware.software.options") + `?f=${filters}`,
            );

            const types = Array.isArray(data.types) ? data.types : [];
            setSoftwareOptions((prev) => ({
                ...prev,
                types: {
                    ...prev.types,
                    [fieldName]: types.map((t) => ({
                        label: t,
                        value: t,
                    })),
                },
                // reset downstream
                versions: { ...prev.versions, [fieldName]: [] },
                licenses: { ...prev.licenses, [fieldName]: [] },
            }));
        } catch (error) {
            console.error("Error loading software types:", error);
        }
    };

    /** Load versions by name + type */
    const loadSoftwareVersions = async (
        softwareName,
        softwareType,
        fieldName,
    ) => {
        if (!softwareName || !softwareType) return;

        try {
            const filters = btoa(
                JSON.stringify({ name: softwareName, type: softwareType }),
            );

            const { data } = await axios.get(
                route("hardware.software.options") + `?f=${filters}`,
            );

            const versions = Array.isArray(data.versions) ? data.versions : [];

            setSoftwareOptions((prev) => ({
                ...prev,
                versions: {
                    ...prev.versions,
                    [fieldName]: versions.map((v) => ({
                        label: v,
                        value: v,
                    })),
                },
                // reset downstream
                licenses: { ...prev.licenses, [fieldName]: [] },
            }));
        } catch (error) {
            console.error("Error loading software versions:", error);
        }
    };

    /** Load licenses by name + type + version */
    const loadSoftwareLicenses = async (
        softwareName,
        softwareType,
        version,
        fieldName,
        currentRowIndex,
    ) => {
        if (!softwareName || !softwareType || !version) return;

        try {
            const filters = btoa(
                JSON.stringify({
                    name: softwareName,
                    type: softwareType,
                    version,
                }),
            );

            const { data } = await axios.get(
                route("hardware.software.licenses") + `?f=${filters}`,
            );

            const licenseMap = {};
            (data || []).forEach((lic) => {
                const key = lic.identifier;
                licenseMap[key] = lic;
            });

            // filter out already-used licenses in other rows
            const currentSoftware = form.getFieldValue("software") || [];
            const usedLicenses = currentSoftware
                .map((sw, idx) => {
                    if (
                        idx !== currentRowIndex &&
                        sw?.software_name === softwareName &&
                        sw?.software_type === softwareType &&
                        sw?.version === version
                    ) {
                        return (
                            sw._license_identifier ||
                            sw.license_key ||
                            sw.account_user
                        );
                    }
                    return null;
                })
                .filter(Boolean);

            const licenseCounts = {};
            usedLicenses.forEach(
                (key) => (licenseCounts[key] = (licenseCounts[key] || 0) + 1),
            );

            const availableLicenses = Object.keys(licenseMap).filter((key) => {
                const lic = licenseMap[key];
                return lic.available_activations > (licenseCounts[key] || 0);
            });

            setSoftwareOptions((prev) => ({
                ...prev,
                licenses: {
                    ...prev.licenses,
                    [fieldName]: availableLicenses.map((key) => {
                        const lic = licenseMap[key];
                        const remaining =
                            lic.available_activations -
                            (licenseCounts[key] || 0);

                        const displayKey =
                            lic.display_type === "Account"
                                ? `Account: ${key}`
                                : key;

                        return {
                            label: `${displayKey} (${remaining} of ${lic.max_activations} available)`,
                            value: key,
                            license_data: lic,
                        };
                    }),
                },
            }));
        } catch (error) {
            console.error("Error loading software licenses:", error);
        }
    };

    /** Safe getter for selects */
    const getSoftwareOptions = (fieldName, dataIndex) => {
        if (dataIndex === "software_name") return softwareOptions.names || [];
        if (dataIndex === "software_type")
            return softwareOptions.types[fieldName] || [];
        if (dataIndex === "version")
            return softwareOptions.versions[fieldName] || [];
        if (dataIndex === "license_key")
            return softwareOptions.licenses[fieldName] || [];
        return [];
    };

    return {
        softwareOptions,
        loadSoftwareNames,
        loadSoftwareTypes,
        loadSoftwareVersions,
        loadSoftwareLicenses,
        getSoftwareOptions,
    };
};
