import { useState } from "react";
import { toast } from "sonner";

export const useRequestCart = (REQUEST_CATALOG) => {
    const [cart, setCart] = useState([]);

    const addToCart = (selectedRequest, mode = "per-item") => {
        if (!selectedRequest) {
            toast.warning("Please select a request type");
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
            if (
                cart.find((c) => c.category === category && c.mode === "bulk")
            ) {
                toast.info("Bulk request for this category already added");
                return;
            }

            const categoryData = REQUEST_CATALOG.find(
                (cat) => cat.category === category,
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
                        items: [],
                    },
                },
            ]);
        } else {
            if (
                cart.find((c) => c.name === selected && c.mode === "per-item")
            ) {
                toast.info("Request already added");
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

        return true;
    };

    const removeItem = (index) => setCart(cart.filter((_, i) => i !== index));

    const updateItem = (index, data) => {
        const updated = [...cart];

        if (updated[index].mode === "bulk") {
            updated[index].bulkData = data;
        } else {
            updated[index].items = data.items;
            updated[index].purpose = data.purpose;
        }

        setCart(updated);
    };

    return { cart, setCart, addToCart, removeItem, updateItem };
};
