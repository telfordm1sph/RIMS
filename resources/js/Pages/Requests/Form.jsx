import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";

import { Row, Col, Layout, Radio } from "antd";
const { Content } = Layout;

import { useRequestCart } from "@/Hooks/useRequestCart";
import RequestPicker from "@/Components/request/RequestPicker";
import Cart from "@/Components/request/Cart";
import Summary from "@/Components/request/Summary";
import RequestDrawer from "@/Components/request/RequestDrawer";
import BulkRequestDrawer from "@/Components/request/BulkRequestDrawer";
import { usePage } from "@inertiajs/react";
import { Layers, Package } from "lucide-react";

const Form = () => {
    const { emp_data } = usePage().props;
    const [requestMode, setRequestMode] = useState("per-item");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requestTypes, setRequestTypes] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [locationLists, setLocationLists] = useState([]);

    useEffect(() => {
        const fetchRequestTypes = async () => {
            try {
                const res = await axios.get(route("request-types.list"));
                setRequestTypes(res.data);
                console.log(res.data);
            } catch (err) {
                console.error("Error fetching request types:", err);
            }
        };
        fetchRequestTypes();

        const fetchEmployees = async (emp_id) => {
            try {
                const res = await axios.get(route("staff.list", emp_id));
                console.log("Staff", res.data);
                setEmployees(res.data.employees || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchEmployees(emp_data.emp_id);

        const fetchLocationLists = async () => {
            try {
                const res = await axios.get(route("locations.list"));
                console.log("Location", res.data);
                setLocationLists(
                    res.data.map((loc) => ({
                        label: loc.location_name,
                        value: loc.id,
                    }))
                );
            } catch (err) {
                console.error(err);
            }
        };
        fetchLocationLists();
    }, []);

    const { cart, addToCart, removeItem, updateItem } =
        useRequestCart(requestTypes);

    const handleAdd = () => {
        const added = addToCart(selectedRequest, requestMode);
        if (added) setSelectedRequest(null);
    };

    const openDrawer = (index) => {
        setActiveIndex(index);
        setDrawerOpen(true);
    };

    const closeDrawer = () => setDrawerOpen(false);

    return (
        <AuthenticatedLayout>
            <Content>
                <div style={{ marginBottom: 16 }}>
                    <Radio.Group
                        value={requestMode}
                        onChange={(e) => setRequestMode(e.target.value)}
                        buttonStyle="solid"
                    >
                        <Radio.Button value="per-item">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <Package size={16} />
                                <span>Per Item</span>
                            </div>
                        </Radio.Button>

                        <Radio.Button value="bulk">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <Layers size={16} />
                                <span>Bulk</span>
                            </div>
                        </Radio.Button>
                    </Radio.Group>
                </div>

                <Row gutter={24}>
                    <Col span={14}>
                        <RequestPicker
                            catalog={requestTypes}
                            selectedRequest={selectedRequest}
                            setSelectedRequest={setSelectedRequest}
                            onAdd={handleAdd}
                            mode={requestMode}
                        />
                        <Cart
                            cart={cart}
                            onEdit={openDrawer}
                            onRemove={removeItem}
                        />
                    </Col>
                    <Col span={10}>
                        <Summary cart={cart} />
                    </Col>
                </Row>

                {activeIndex !== null && (
                    <>
                        {cart[activeIndex]?.mode === "bulk" ? (
                            <BulkRequestDrawer
                                open={drawerOpen}
                                onClose={closeDrawer}
                                item={cart[activeIndex]}
                                onSave={(data) => updateItem(activeIndex, data)}
                                employees={employees}
                                locations={locationLists}
                            />
                        ) : (
                            <RequestDrawer
                                open={drawerOpen}
                                onClose={closeDrawer}
                                item={cart[activeIndex]}
                                onSave={(data) => updateItem(activeIndex, data)}
                                employees={employees}
                                locations={locationLists}
                            />
                        )}
                    </>
                )}
            </Content>
        </AuthenticatedLayout>
    );
};

export default Form;
