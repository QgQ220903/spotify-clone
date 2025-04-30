import React, { useEffect, useState } from "react";
import ModalAccount from "@/components/modal/Modal";
import FormAccount from "@/components/form/Form";
import PageHeader from "@/components/PageHeader";
import ButtonIcon from "@/components/ButtonIcon";
import { Table, Form, Input, Space, Checkbox, Button, Popconfirm } from "antd";
import { Pencil, Trash2, Plus } from "lucide-react";
import Search from "@/components/Search";
import { getRolesDetailById, rolePutAPI, rolesDeleteAPI, rolesGetAPI, rolesPostAPI } from "@/services/RolesService";
import { featuresGetAPI } from "@/services/FeaturesService";
import { rolesDetailPostAPI } from "@/services/RolesdetailService";
import { check } from "prettier";
import {Link} from "react-router-dom";
import { showToastMessage, showToastMessagePlus } from "../../utils/toast";

// Đường dẫn
const itemsBreadcrumb = [
    {
        title: <Link to="/">Trang chủ</Link>,
    },

    {
        title: "Nhóm quyền",
    },
];


const Role = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [isEditRole, setIsEditRole] = useState(false);
    const [form] = Form.useForm();

    const [roles, setRoles] = useState([]);
    const [features, setFeatures] = useState([]);
    const [data2, setData2] = useState([]);
    const [columns2, setColumns2] = useState([]);
    const [idEdit, setIdEdit] = useState(0);

    // Load Roles & Features
    useEffect(() => {
        rolesGetAPI().then((res) => setRoles(res));
        featuresGetAPI().then((res) => {
            if (res.data) setFeatures(res.data);
        });
    }, []);

    // Set up data2 từ features
    useEffect(() => {
        if (features.length > 0) {
            const mapped = features.map((item) => ({
                key: item.id,
                role: item.name,
                can_view: false,
                can_create: false,
                can_update: false,
                can_delete: false,
            }));
            setData2(mapped);
        }
    }, [features]);

    // Setup cột cho bảng phân quyền
    useEffect(() => {
        const tmp = [
            { title: "Chức năng", dataIndex: "role", key: "role" },
            ...["view", "create", "update", "delete"].map((type) => ({
                title: type === "view" ? "Xem" : type === "create" ? "Thêm" : type === "update" ? "Sửa" : "Xóa",
                dataIndex: type,
                key: type,
                render: (_, record) => (
                    <Checkbox
                        checked={record[`can_${type}`]}
                        onChange={() => handleCheckBox(record.key, type)}
                    />
                ),
            })),
        ];
        setColumns2(tmp);
    }, [data2]);

    const handleDetailRole = (id) => {
        getRolesDetailById(id).then((res) => {
            if (res.data) {
                setIdEdit(res.data.id);
                form.setFieldsValue({
                    name: res.data.name,
                });

                const mapped1 = features.map((f) => {
                    var tmp =null;
                    for (const r of res.data.role_details) {
                        if (f.id === r.feature.id) {
                            tmp = {
                                key: r.feature.id,
                                role: r.feature.name,
                                can_view: r.can_view,
                                can_create: r.can_create,
                                can_update: r.can_update,
                                can_delete: r.can_delete,
                            };
                            break;
                        }
                    }



                    if(tmp == null)
                        tmp = {
                            key: f.id,
                            role: f.name,
                            can_view: false,
                            can_create: false,
                            can_update: false,
                            can_delete: false,
                        };

                    return tmp;
                });

                // const mapped = res.data.role_details.map((item) => ({
                //     key: item.feature.id,
                //     role: item.feature.name,
                //     can_view: item.can_view,
                //     can_create: item.can_create,
                //     can_update: item.can_update,
                //     can_delete: item.can_delete,
                // }));
                setData2(mapped1);
            }

            console.log("res:", res);
        });
        setIsEditRole(true);
        setTitle("Phân Quyền");
        setIsModalOpen(true);
    };

    const handleDetele = (id) => {
        rolesDeleteAPI(id).then((res) => {
            if (res?.status === 204) {
                setRoles((prev) => prev.filter((item) => item.id !== id));
                showToastMessage("Xóa nhóm quyền thành công!", "success", "top-right");
                
            }
        });
    };

    const handleCheckBox = (feature_id, column) => {
        const updated = data2.map((item) => (item.key == feature_id ? { ...item, [`can_${column}`]: !item[`can_${column}`] } : item));
        setData2(updated);
    };
    console.log("data2:", data2);

    const handleOk = async () => {
        try {
            var checkedSave = true;
            var checkedEdit = true;
            if (!isEditRole) {
                const values = await form.validateFields();
                const datasave = {
                    name: values.name,
                    is_deleted: false,
                };
                rolesPostAPI(datasave).then((res) => {
                    if (res.status === 201) {
                        var objectRoles = data2.map((item) => {
                            return {
                                can_view: item.can_view,
                                can_create: item.can_create,
                                can_update: item.can_update,
                                can_delete: item.can_delete,
                                feature: item.key,
                                role: res.data.id,
                            };
                        });

                        objectRoles.forEach((item) => {
                            rolesDetailPostAPI(item).then((r) => {
                                if (r.status != 201) {
                                    checkedSave = false;
                                }
                            });
                        });

                        if (checkedSave) {
                             showToastMessage("Thêm tài khoản thành công!", "success", "top-right");
                            setIsEditRole(false);
                        }

                        setRoles((prev) => [...prev, res.data]);
                        setIsModalOpen(false);
                    }
                   
                });
            } else {
                const values = await form.validateFields();
                const datasave = {
                    name: values.name,
                    is_deleted: false,
                };
                rolePutAPI(datasave, idEdit).then((r1) => {
                    if (r1.data) {
                        var r = r1.data;

                        if (r1.status == 200) {
                            var objectRoles = data2.map((item) => {
                                return {
                                    can_view: item.can_view,
                                    can_create: item.can_create,
                                    can_update: item.can_update,
                                    can_delete: item.can_delete,
                                    feature: item.key,
                                    role: r.id,
                                };
                            });

                            objectRoles.forEach((item) => {
                                rolesDetailPostAPI(item).then((r2) => {
                                    if (r2.status != 201) {
                                        checkedEdit = false;
                                    }
                                });
                            });

                            if (checkedEdit) {
                                showToastMessage("Cập nhật nhóm quyền thành công!", "success", "top-right");
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.log('aaaaaaaaaaaaaaaaaaaa');
           
        }
    };

    const formItemLayout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };

    const formItems = [
        {
            name: "name",
            label: "Tên nhóm quyền",
            component: <Input placeholder="Nhập tên nhóm quyền" />,
            rules: [{ required: true, message: "Vui lòng nhập tên nhóm quyền" }],
        },
        {
            name: "table",
            wrapperCol: { span: 24 },
            component: (
                <Table
                    pagination={false}
                    columns={columns2}
                    dataSource={data2}
                    rowKey="key"
                />
            ),
        },
    ];

    const columns = [
        { title: "ID", dataIndex: "key", key: "key" },
        { title: "Nhóm quyền", dataIndex: "role", key: "role" },
        {
            title: "Chức năng",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button 
                     shape="circle"
                     size="medium"
                     color="gold"
                     variant="solid"
                    onClick={() => handleDetailRole(record.key)}
                    >
                        <Pencil size={20} />
                    </Button>
                    <Popconfirm
                        title="Xóa nhóm quyền này?"
                        
                        onConfirm={() => handleDetele(record.key)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                         shape="circle"
                         size="medium"
                         color="red"
                         variant="solid"
                        >
                            <Trash2 size={20} />
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const tableData = roles.map((item) => ({
        key: item.id,
        role: item.name,
    }));

    return (
        <>
            <PageHeader title="Quản Lý Nhóm Quyền" itemsBreadcrumb={itemsBreadcrumb}>
                <ButtonIcon
                    handleEvent={() => {
                        setIsEditRole(false);
                        form.resetFields();
                        setTitle("Thêm Nhóm Quyền");
                        setIsModalOpen(true);
                        if (features.length > 0) {
                            const mapped = features.map((item) => ({
                                key: item.id,
                                role: item.name,
                                can_view: false,
                                can_create: false,
                                can_update: false,
                                can_delete: false,
                            }));
                            setData2(mapped);
                        }
                    }}
                >
                    <Plus /> Thêm Nhóm Quyền Mới
                </ButtonIcon>
            </PageHeader>

            <div className="mt-5">
            
                <Table
                    columns={columns}
                    dataSource={tableData}
                         pagination={{
                                            pageSize: 5, // Mặc định 10 dòng mỗi trang
                                        }}
                                     
                />
            </div>

            <ModalAccount
                isModalOpen={isModalOpen}
                handleOk={handleOk}
                handleCancel={() => setIsModalOpen(false)}
                title={title}
                form={form}
            >
                {/* {isEditRole ? (
                    <Table
                        pagination={false}
                        columns={columns2}
                        dataSource={data2}
                        rowKey="key"
                    />
                ) : ( */}
                <FormAccount
                    form={form}
                    formItems={formItems}
                    formItemLayout={formItemLayout}
                />
                {/* )} */}
            </ModalAccount>
        </>
    );
};

export default Role;
