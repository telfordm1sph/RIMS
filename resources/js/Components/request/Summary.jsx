import React from "react";
import { Card, Empty, Divider, Button } from "antd";

const Summary = ({ cart }) => {
    const handleSubmit = () => {
        console.log("Submitted Cart:", cart);
    };

    return (
        <Card title="Summary" style={{ height: "100%" }}>
            {cart.length === 0 ? (
                <Empty />
            ) : (
                cart.map((c, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                        <b>{c.name}</b>
                        <div>
                            Total Qty:{" "}
                            {c.items.reduce(
                                (sum, r) => sum + Number(r.qty || 0),
                                0
                            )}
                        </div>
                        <Divider />
                    </div>
                ))
            )}
            <Button
                type="primary"
                block
                disabled={cart.length === 0}
                onClick={handleSubmit} // ✅ log cart here
            >
                Submit Request
            </Button>
        </Card>
    );
};

export default Summary;
