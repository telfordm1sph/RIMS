import { useState } from "react";
import { message } from "antd";

export const useRequestCart = (REQUEST_CATALOG) => {
    const [cart, setCart] = useState([]);

    const addToCart = (selectedRequest, mode = "per-item") => {
        if (!selectedRequest) {
            message.warning("Please select a request type");
            return;
        }

        let selected = null;
        let category = null;

        REQUEST_CATALOG.forEach((cat) => {
            if (cat.items.includes(selectedRequest)) {
                selected = selectedRequest;
                category = cat.category;
            }
        });

        if (!selected) return;

        if (mode === "bulk") {
            // For bulk mode, check if category already exists
            if (
                cart.find((c) => c.category === category && c.mode === "bulk")
            ) {
                message.info("Bulk request for this category already added");
                return;
            }

            // Get all items in this category
            const categoryData = REQUEST_CATALOG.find(
                (cat) => cat.category === category
            );

            setCart([
                ...cart,
                {
                    category,
                    name: `${category} (Bulk)`,
                    mode: "bulk",
                    allItems: categoryData?.items || [],
                    bulkData: {
                        issued_to: "",
                        issued_to_other: "",
                        location: "",
                        location_other: "",
                        purpose: "",
                        items: [], // Array of { name, qty }
                    },
                },
            ]);
        } else {
            // Per-item mode (original behavior)
            if (
                cart.find((c) => c.name === selected && c.mode === "per-item")
            ) {
                message.info("Request already added");
                return;
            }

            setCart([
                ...cart,
                {
                    category,
                    name: selected,
                    mode: "per-item",
                    items: [],
                    purpose: "",
                },
            ]);
        }

        return true; // to reset select
    };

    const removeItem = (index) => setCart(cart.filter((_, i) => i !== index));

    const updateItem = (index, data) => {
        const updated = [...cart];

        if (updated[index].mode === "bulk") {
            updated[index].bulkData = data;
        } else {
            // For per-item mode, data contains { items, purpose }
            updated[index].items = data.items;
            updated[index].purpose = data.purpose;
        }

        setCart(updated);
    };

    return { cart, setCart, addToCart, removeItem, updateItem };
};
