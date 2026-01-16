import React, { useState } from "react";
import { Card, Empty, Divider, Button, Tag, message, Modal } from "antd";
import axios from "axios";
import { router } from "@inertiajs/react";

const Summary = ({ cart }) => {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmitClick = () => {
        // Validate cart has items
        if (cart.length === 0) {
            message.warning("Please add items to your request");
            return;
        }

        // Check if all items have required data
        const hasEmptyItems = cart.some((item) => {
            if (item.mode === "per-item") {
                return (
                    !item.items ||
                    item.items.length === 0 ||
                    item.items.some(
                        (i) => !i.issued_to || !i.location || !i.qty
                    )
                );
            } else {
                return (
                    !item.bulkData?.items ||
                    item.bulkData.items.length === 0 ||
                    !item.bulkData.issued_to ||
                    !item.bulkData.location
                );
            }
        });

        if (hasEmptyItems) {
            message.error(
                "Please complete all request details before submitting"
            );
            return;
        }

        setShowConfirm(true);
    };

    const handleConfirmSubmit = async () => {
        setLoading(true);
        setShowConfirm(false);

        try {
            const response = await axios.post(route("request.store"), {
                cart: cart,
            });

            if (response.data.success) {
                message.success(
                    `Request submitted successfully! Request Number: ${response.data.request_number}`
                );
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                message.error(
                    response.data.message || "Failed to submit request"
                );
            }
        } catch (error) {
            console.error("Submit error:", error);
            message.error(
                error.response?.data?.message ||
                    "An error occurred while submitting the request"
            );
        } finally {
            setLoading(false);
        }
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => {
            if (item.mode === "bulk") {
                console.log("BULKDATA", item.bulkData);

                return total + (item.bulkData?.items?.length || 0);
            } else {
                return total + (item.items?.length || 0);
            }
        }, 0);
    };

    const getTotalQuantity = () => {
        return cart.reduce((total, item) => {
            if (item.mode === "bulk") {
                return (
                    total +
                    (item.bulkData?.items?.reduce(
                        (sum, i) => sum + Number(i.qty || 0),
                        0
                    ) || 0)
                );
            } else {
                return (
                    total +
                    (item.items?.reduce(
                        (sum, i) => sum + Number(i.qty || 0),
                        0
                    ) || 0)
                );
            }
        }, 0);
    };

    return (
        <>
            <Card title="Summary" style={{ height: "100%" }}>
                {cart.length === 0 ? (
                    <Empty description="No items in cart" />
                ) : (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 8,
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>
                                    Total Requests:
                                </span>
                                <span>{cart.length}</span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 8,
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>
                                    Total Items:
                                </span>
                                <span>{getTotalItems()}</span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>
                                    Total Quantity:
                                </span>
                                <span>{getTotalQuantity()}</span>
                            </div>
                        </div>

                        <Divider />

                        {cart.map((c, i) => (
                            <div key={i} style={{ marginBottom: 12 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        marginBottom: 4,
                                    }}
                                >
                                    <b>{c.name}</b>
                                    {c.mode === "bulk" && (
                                        <Tag
                                            color="green"
                                            style={{ margin: 0 }}
                                        >
                                            BULK
                                        </Tag>
                                    )}
                                </div>

                                {c.mode === "bulk" ? (
                                    <>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#666",
                                            }}
                                        >
                                            Items:{" "}
                                            {c.bulkData?.items?.length || 0}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#666",
                                            }}
                                        >
                                            Total Qty:{" "}
                                            {c.bulkData?.items?.reduce(
                                                (sum, item) =>
                                                    sum + Number(item.qty || 0),
                                                0
                                            ) || 0}
                                        </div>
                                        {c.bulkData?.issued_to && (
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "#666",
                                                }}
                                            >
                                                Issued to:{" "}
                                                {c.bulkData.issued_to_name}
                                            </div>
                                        )}
                                        {c.bulkData?.location && (
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "#666",
                                                }}
                                            >
                                                Location:{" "}
                                                {c.bulkData.location_name}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#666",
                                            }}
                                        >
                                            Total Qty:{" "}
                                            {c.items?.reduce(
                                                (sum, r) =>
                                                    sum + Number(r.qty || 0),
                                                0
                                            ) || 0}
                                        </div>
                                        {c.purpose && (
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "#666",
                                                }}
                                            >
                                                Purpose: {c.purpose}
                                            </div>
                                        )}
                                    </>
                                )}
                                <Divider />
                            </div>
                        ))}
                    </>
                )}

                <Button
                    type="primary"
                    block
                    size="large"
                    disabled={cart.length === 0}
                    loading={loading}
                    onClick={handleSubmitClick}
                >
                    Submit Request
                </Button>
            </Card>

            <Modal
                title="Confirm Submission"
                open={showConfirm}
                onOk={handleConfirmSubmit}
                onCancel={() => setShowConfirm(false)}
                okText="Yes, Submit"
                cancelText="Cancel"
                confirmLoading={loading}
            >
                <p>
                    Are you sure you want to submit this request with{" "}
                    <strong>{getTotalItems()}</strong> item(s) and total
                    quantity of <strong>{getTotalQuantity()}</strong>?
                </p>
                <p style={{ color: "#888", fontSize: 12 }}>
                    Once submitted, you cannot edit the request.
                </p>
            </Modal>
        </>
    );
};

export default Summary;
