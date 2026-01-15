import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState, useEffect } from "react";
import axios from "axios"; // <-- import axios

import { Row, Col, Layout } from "antd";
const { Content } = Layout;

import { useRequestCart } from "@/Hooks/useRequestCart";
import RequestPicker from "@/Components/request/RequestPicker";
import Cart from "@/Components/request/Cart";
import Summary from "@/Components/request/Summary";
import RequestDrawer from "@/Components/request/RequestDrawer";
import { usePage } from "@inertiajs/react";

const Form = () => {
    const { emp_data } = usePage().props;
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
        const added = addToCart(selectedRequest);
        if (added) setSelectedRequest(null);
    };

    const openDrawer = (index) => {
        setActiveIndex(index);
        setDrawerOpen(true);
    };

    const closeDrawer = () => setDrawerOpen(false);

    return (
        <AuthenticatedLayout>
            <Content style={{ padding: 24 }}>
                <Row gutter={24}>
                    <Col span={14}>
                        <RequestPicker
                            catalog={requestTypes}
                            selectedRequest={selectedRequest}
                            setSelectedRequest={setSelectedRequest}
                            onAdd={handleAdd}
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
                    <RequestDrawer
                        open={drawerOpen}
                        onClose={closeDrawer}
                        item={cart[activeIndex]}
                        onSave={(items) => updateItem(activeIndex, items)}
                        employees={employees}
                        locations={locationLists}
                    />
                )}
            </Content>
        </AuthenticatedLayout>
    );
};

export default Form;
