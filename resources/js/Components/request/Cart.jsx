import React from "react";
import { Card, Button, Empty, Space, Tag, Divider } from "antd";
import {
    ShoppingCartOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

const Cart = ({ cart, onEdit, onRemove }) => (
    <Card
        title={
            <>
                <ShoppingCartOutlined /> Request Cart
            </>
        }
    >
        {cart.length === 0 ? (
            <Empty description="No items added" />
        ) : (
            <Space
                orientation="vertical"
                style={{ width: "100%" }}
                size="middle"
            >
                {cart.map((item, index) => (
                    <div key={index}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            {/* Left */}
                            <div>
                                <Space>
                                    <b>{item.name}</b>
                                    <Tag color="blue">{item.category}</Tag>
                                </Space>
                                <div style={{ color: "#888", marginTop: 4 }}>
                                    {item.items.length} location(s)
                                </div>
                            </div>

                            {/* Right */}
                            <Space>
                                <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => onEdit(index)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => onRemove(index)}
                                >
                                    Remove
                                </Button>
                            </Space>
                        </div>

                        {index < cart.length - 1 && <Divider />}
                    </div>
                ))}
            </Space>
        )}
    </Card>
);

export default Cart;
