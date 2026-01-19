import React from "react";
import { Modal, Input } from "antd";

const ActionRemarksModal = ({
    visible,
    action,
    remarks,
    setRemarks,
    onOk,
    onCancel,
}) => {
    return (
        <Modal
            title={`${action} Request`}
            open={visible}
            onOk={() => onOk({ action, remarks })}
            onCancel={onCancel}
            okText={action === "APPROVE" ? "Approve" : "Disapprove"}
        >
            <Input.TextArea
                rows={4}
                placeholder="Enter remarks (optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
            />
        </Modal>
    );
};

export default ActionRemarksModal;
