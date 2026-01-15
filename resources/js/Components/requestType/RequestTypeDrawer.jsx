import React, { useState, useEffect } from "react";
import {
    Drawer,
    Form,
    Input,
    Switch,
    Button,
    Space,
    message,
    Row,
    Col,
} from "antd";

const RequestTypeDrawer = ({
    visible,
    mode,
    requestType,
    onClose,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            if (mode === "edit" && requestType) {
                form.setFieldsValue({
                    request_category: requestType.request_category,
                    request_name: requestType.request_name,
                    request_description: requestType.request_description,
                    is_active: requestType.is_active,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    is_active: true,
                });
            }
        }
    }, [visible, mode, requestType, form]);

    const handleFormSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            await onSubmit({
                ...values,
                id: mode === "edit" ? requestType.id : undefined,
            });

            message.success(
                `Request type ${
                    mode === "create" ? "created" : "updated"
                } successfully`
            );

            form.resetFields();
        } catch (error) {
            console.error("Form validation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Drawer
            title={
                mode === "create" ? "Create Request Type" : "Edit Request Type"
            }
            open={visible}
            onClose={handleClose}
            width={700}
            footer={
                <div style={{ textAlign: "right" }}>
                    <Space>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button
                            type="primary"
                            onClick={handleFormSubmit}
                            loading={loading}
                        >
                            {mode === "create" ? "Create" : "Update"}
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form form={form} layout="vertical">
                {/* 2-column layout */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="request_category"
                            label="Name"
                            extra="(ex. Hardware, Software)"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter request type name",
                                },
                                {
                                    min: 2,
                                    message:
                                        "Name must be at least 2 characters",
                                },
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder="Enter request type name"
                                style={{ borderRadius: 6 }}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="request_name"
                            label="Option"
                            extra="(ex. Desktop, MS Office)"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter request option",
                                },
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder="Enter request option"
                                style={{ borderRadius: 6 }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Full width */}
                <Form.Item
                    name="request_description"
                    label="Description"
                    extra="(Short description of the request type)"
                    rules={[
                        {
                            required: true,
                            message: "Please enter request type description",
                        },
                    ]}
                >
                    <Input
                        size="large"
                        placeholder="Enter request type description"
                        style={{ borderRadius: 6 }}
                    />
                </Form.Item>

                <Form.Item
                    name="is_active"
                    label="Active Status"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default RequestTypeDrawer;
