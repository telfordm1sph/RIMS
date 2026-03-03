import { useState } from "react";

export const useRemovalModal = (form, setRemovedItems) => {
    const [removalModalVisible, setRemovalModalVisible] = useState(false);
    const [pendingRemoval, setPendingRemoval] = useState(null);

    // Open modal if item has ID (existing record)
    const handleRemoveWithReason = (fieldDataIndex, fieldIndex, row) => {
        if (row?.id) {
            setPendingRemoval({ fieldDataIndex, fieldIndex, row });
            setRemovalModalVisible(true);
        } else {
            // If new row (no ID), just remove directly
            const fields = form.getFieldValue(fieldDataIndex) || [];
            form.setFieldsValue({
                [fieldDataIndex]: fields.filter((_, idx) => idx !== fieldIndex),
            });
        }
    };

    // Called by modal onConfirm({ reason, condition, remarks })
    const confirmRemoval = ({ reason, condition, remarks }) => {
        if (!pendingRemoval) return;

        const { fieldDataIndex, fieldIndex, row } = pendingRemoval;

        // Save removed item with reason
        setRemovedItems((prev) => ({
            ...prev,
            [fieldDataIndex]: [
                ...(prev[fieldDataIndex] || []),
                {
                    id: row.id,
                    reason,
                    condition,
                    remarks: remarks || null,
                },
            ],
        }));

        // Remove from form fields
        const fields = form.getFieldValue(fieldDataIndex) || [];
        form.setFieldsValue({
            [fieldDataIndex]: fields.filter((_, idx) => idx !== fieldIndex),
        });

        // Close modal
        setRemovalModalVisible(false);
        setPendingRemoval(null);
    };

    const cancelRemoval = () => {
        setRemovalModalVisible(false);
        setPendingRemoval(null);
    };

    return {
        removalModalVisible,
        pendingRemoval,
        handleRemoveWithReason,
        confirmRemoval,
        cancelRemoval,
    };
};
