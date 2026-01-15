import { useState } from "react";
import { message } from "antd";

export const useRequestCart = (REQUEST_CATALOG) => {
    const [cart, setCart] = useState([]);

    const addToCart = (selectedRequest) => {
        if (!selectedRequest) {
            message.warning("Please select a request type");
            return;
        }

        let selected = null;
        REQUEST_CATALOG.forEach((cat) => {
            if (cat.items.includes(selectedRequest)) {
                selected = { category: cat.category, name: selectedRequest };
            }
        });

        if (!selected) return;

        if (cart.find((c) => c.name === selected.name)) {
            message.info("Request already added");
            return;
        }

        setCart([...cart, { ...selected, items: [] }]);
        return true; // to reset select
    };

    const removeItem = (index) => setCart(cart.filter((_, i) => i !== index));

    const updateItem = (index, items) => {
        const updated = [...cart];
        updated[index].items = items;
        setCart(updated);
    };

    return { cart, setCart, addToCart, removeItem, updateItem };
};
