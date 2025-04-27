import React, { useState, useEffect } from "react";
import { Space, Popconfirm, Form, Input, Select, Descriptions, Button } from "antd";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import Search from "@/components/Search";
import { Table, Drawer } from "antd";
import ModalProject from "@/components/modal/Modal";
import FormProject from "@/components/form/Form";
import PageHeader from "@/components/PageHeader";
import ButtonIcon from "@/components/ButtonIcon";
import { employeeGetAPI, employeePostAPI, employeePutAPI, employeeDeleteAPI } from "@/services/EmployeeService";
import { departmentGetAPI, departmentPostAPI, updateManagerForDepartmentAPI } from "@/services/DepartmentService";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import useWebSocket from "@/services/useWebSocket";
import DepartmentSelect from "./components/DepartmentSelect";
import { showToastMessage } from "@/utils/toast";

import EmptyTemplate from "@/components/emptyTemplate/EmptyTemplate";

// Đường dẫn
const itemsBreadcrumb = [
    {
        title: <Link to="/">Trang chủ</Link>,
    },

    {
        title: "Nhân viên",
    },
];


const Employee = () => {
    const [current, setCurrent] = useState(1);
    const [total, setTotal] = useState(0);
    const [useData, setUseData] = useState(null);

    const [departmentData, setDepartmentData] = useState(null);
    const [departmentDataFilter, setDepartmentDataFilter] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [mode, setMode] = useState("");

    const [form] = Form.useForm();

    const [data, setData] = useState(null);

    const [roleEmployee, setRoleEmployee] = useState(null);

    //test socket
    const previousManagerRef = useRef({});

    const navigate = useNavigate();

    const { features } = useAuth();

    const employeeUpdate = useWebSocket("ws://127.0.0.1:8000/ws/employees/");

    useEffect(() => {
        console.log("features",features)
        if (features) {
            const featureEmployee = features.find((item) => item.feature.name === "Quản lý nhân viên");
            setRoleEmployee(featureEmployee);
            console.log("roleEmployee", roleEmployee);

        }
    }, [features]);

    const handleChange = (value) => {
        console.log(`selected ${value}`);
        // console.log("component",form.component("department"))
        if (value === "TP") {
            setDepartmentDataFilter(departmentData?.filter((item) => item.manager === null));
        } else {
            setDepartmentDataFilter(departmentData);
        }

        // Xoá phòng ban đã chọn nếu đổi chức vụ
        form.resetFields(["department"]);

    };

    function setDataEmployees(employees) {
        return employees?.map((item) => ({
            key: item.id,
            name: item.name,
            position: item.position === "TP" ? "Trưởng Phòng" : item.position === "TN" ? "Trưởng Nhóm" : "Nhân Viên",
            phone_number: item.phone_number,
            email: item.email,
            department: item.department,
            is_deleted: item.is_deleted,
        }));
    }
    //xu lý khi nv là trưởng phòng
    function updateDepartmentManager(newData, departmentData, mutatePutDepartment) {
        if (newData?.position === "TP") {
            const department = departmentData.find((item) => item.id === newData.department);

            if (department) {
                // Nếu manager không thay đổi, không cập nhật
                if (previousManagerRef.current[department.id] === newData.id) return;

                const updatedDepartment = { ...department, manager: newData.id };
                console.log("departmentPUT", updatedDepartment);

                // Cập nhật reference
                previousManagerRef.current[department.id] = newData.id;
                mutatePutDepartment(updatedDepartment);
            }
        }
    }
    const queryClient = useQueryClient();
    //lấy ds nv
    const { data: employees, isLoading } = useQuery({
        queryKey: ["employeeEm"],
        queryFn: employeeGetAPI,
    });
    useEffect(() => {
        if (employeeUpdate) {
            console.log("test12");
            queryClient.invalidateQueries(["employees"]);
        }
    }, [employeeUpdate, queryClient]);

    console.log("fix employee", employees);
    //lấy ds phòng ban
    const { data: departments } = useQuery({
        queryKey: ["departments"],
        queryFn: departmentGetAPI,
    });
    // sửa,xóa nv
    const { data: employeData, mutate: mutatePut } = useMutation({
        mutationFn: employeePutAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["employeeEm"],
            });
            setIsModalOpen(false);
            showToastMessage("Sửa nhân viên thành công !", "success", "top-right");
        },
            onError: (err) => {
                console.log("mutatePost error",err)
               
                const fieldsError = [];

                if (err.response?.data?.email?.[0]) {
                    console.log("mutatePost error email", err.response.data.email[0]);
                    fieldsError.push({
                        name: "email",
                        errors: [err.response.data.email[0]],
                    });
                }
            
                if (err.response?.data?.phone_number?.[0]) {
                    console.log("mutatePost error phone_number", err.response.data.phone_number[0]);
                    fieldsError.push({
                        name: "phone_number",
                        errors: [err.response.data.phone_number[0]],
                    });
                }
            
                if (fieldsError.length > 0) {
                    form.setFields(fieldsError);
                }

            }
        
    });

    const { mutate: mutateDelete } = useMutation({
        mutationFn: employeePutAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["employeeEm"],
            });
            showToastMessage("Xóa nhân viên thành công !", "success", "top-right");
        },
            onError: (err) => {
                console.log("mutatePost error",err)
               
                showToastMessage("Xóa nhân viên thất bại !", "error", "top-right");
            }
        
    });

    //thêm nv
    const { data: newData, mutate: mutatePost } = useMutation({
        mutationFn: employeePostAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["employeeEm"],
            });
            setIsModalOpen(false);
            showToastMessage("Thêm nhân viên thành công !", "success", "top-right");
        },
        onError:(err) => {
            console.log("mutatePost error",err)
           
            const fieldsError = [];

            if (err.response?.data?.email?.[0]) {
                console.log("mutatePost error email", err.response.data.email[0]);
                fieldsError.push({
                    name: "email",
                    errors: [err.response.data.email[0]],
                });
            }
        
            if (err.response?.data?.phone_number?.[0]) {
                console.log("mutatePost error phone_number", err.response.data.phone_number[0]);
                fieldsError.push({
                    name: "phone_number",
                    errors: [err.response.data.phone_number[0]],
                });
            }
        
            if (fieldsError.length > 0) {
                form.setFields(fieldsError);
            }

        }
    });
    //cap nhat lại trưởng phòng trong phòng ban
    const { mutate: mutatePutDepartment } = useMutation({
        mutationFn: updateManagerForDepartmentAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["departments"],
            });
        },
    });
    // Cập nhật state chỉ khi `employees` thay đổi
    useEffect(() => {
        if (employees) {
            const employeData = employees.results.filter((item) => {
                return item.is_deleted !== true;
            });
            console.log("employ", employeData);
            setData(setDataEmployees(employeData));
        }
        console.log("dataDepartment", departments);
        departments ? setDepartmentData(departments.results) : "";
    }, [employees, departments]);

    useEffect(() => {
        updateDepartmentManager(newData, departmentData, mutatePutDepartment);
    }, [newData, departmentData, mutatePutDepartment]);

    useEffect(() => {
        updateDepartmentManager(employeData, departmentData, mutatePutDepartment);
    }, [employeData, departmentData, mutatePutDepartment]);

    useEffect(() => {
        if (useData) {
            form.setFieldsValue(useData);
        }
    }, [form, useData]);

    // tùy chỉnh form kích thước input
    const formItemLayout = {
        labelCol: {
            span: 8,
        },
        wrapperCol: {
            span: 16,
        },
    };
    
    const formItems = [
        {
            name: "key",
            label: "Mã nhân viên",
            component: <Input readOnly />,
            hidden: mode === "Add" ? true : false,
        },
        {
            name: "name",
            label: "Tên nhân viên",
            component: <Input placeholder="Nhập tên nhân viên" />,
            rules: [{ required: true, message: "Vui lòng nhập tên nhân viên" }],
        },
        {
            name: "position",
            label: "Chức vụ",
            component: (
                <Select
                    // defaultValue={'NV'}
                    placeholder="Chọn chức vụ"
                    onChange={handleChange}
                    options={[
                        { value: "NV", label: "Nhân Viên" },
                        { value: "TN", label: "Nhóm Trưởng" },
                        { value: "TP", label: "Trường Phòng" },
                    ]}
                ></Select>
            ),
            rules: [{ required: true, message: "Vui lòng chọn chức vụ" }],
        },
        {
            name: "phone_number",
            label: "Số điện thoại",
            component: <Input placeholder="Nhập số điện thoại" />,
            rules: [{ required: true, message: "Vui lòng nhập số điện thoại" }],
        },
        {
            name: "email",
            label: "Email",
            component: <Input placeholder="Nhập email" />,
            rules: [{ required: true, message: "Vui lòng nhập email" }],
        },
        {
            name: "department",
            label: "Phòng ban",
            // component: (
            //     <Select
            //         placeholder="Chọn phòng ban"
            //         options={departmentDataFilter?.map((item) => ({
            //             value: item.id,
            //             label: item.name,
            //         }))}
            //     ></Select>
            // ),
            component: 
            (
                <DepartmentSelect departmentDataFilter={departmentDataFilter} />
            ),
            rules: [{ required: true, message: "Vui lòng chọn phòng ban" }],
        },
        
    ];

    const columns = [
        { title: "ID", dataIndex: "key", key: "key" },
        {
            title: "Tên Nhân Viên",
            dataIndex: "name",
            key: "name",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    {/* Tùy chỉnh dropdown filter */}
                    <Input
                        autoFocus
                        placeholder="Tìm kiếm theo tên nhân viên"
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ marginBottom: 8, display: "block" }}
                    />
                    <Space>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => clearFilters && clearFilters()}
                        >
                            Reset
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => confirm()}
                        >
                            Tìm
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()), // So sánh không phân biệt hoa/thường
            filterSearch: true,

        },
        {
            title: "Chức Vụ",
            dataIndex: "position",
            key: "position"
        },
        {
            title: "Số Điện Thoại",
            dataIndex: "phone_number",
            key: "phone_number",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    {/* Tùy chỉnh dropdown filter */}
                    <Input
                        autoFocus
                        placeholder="Tìm kiếm theo số điện thoại"
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ marginBottom: 8, display: "block" }}
                    />
                    <Space>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => clearFilters && clearFilters()}
                        >
                            Reset
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => confirm()}
                        >
                            Tìm
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => record.phone_number.toLowerCase().includes(value.toLowerCase()), // So sánh không phân biệt hoa/thường
            filterSearch: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    {/* Tùy chỉnh dropdown filter */}
                    <Input
                        autoFocus
                        placeholder="Tìm kiếm theo email"
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ marginBottom: 8, display: "block" }}
                    />
                    <Space>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => clearFilters && clearFilters()}
                        >
                            Reset
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => confirm()}
                        >
                            Tìm
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => record.email.toLowerCase().includes(value.toLowerCase()), // So sánh không phân biệt hoa/thường
            filterSearch: true,
        },

        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space >
                    {roleEmployee?.can_update && (
                
                        <Button
                            shape="circle"
                            size="medium"
                            color="gold"
                            variant="solid"
                            onClick={() =>
                                handleEditEmployee(record.position === "Trưởng Phòng" ? { ...record, position: "TP" } : { ...record, position: "NV" })
                            }

                        >
                            <Pencil size={18} />
                        </Button>
                    )}

                    {roleEmployee?.can_delete && (
                        // <Popconfirm
                        //     title="Xóa nhân viên?"
                        //     onConfirm={() => handleDeleteEmployee(record.key)}
                        //     okText="Có"
                        //     cancelText="Không"
                        // >
                        //     <a>
                        //         <Trash2 size={20} />
                        //     </a>
                        // </Popconfirm>
                        <Popconfirm
                            title="Xóa nhân viên?"
                            onConfirm={() => handleDeleteEmployee(record.key)}
                            okText="Có"
                            cancelText="Không"
                            description="Bạn đã chắc chắn muốn xóa ?"
                        >
                            <Button
                                shape="circle"
                                size="medium"
                                color="red"
                                variant="solid"

                            >
                                <Trash2 size={18} />
                            </Button>
                        </Popconfirm>
                    )}






                </Space>
            ),
        },
    ];

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields(); // Kiểm tra dữ liệu nhập vào form

            if (mode === "Edit") {
                mutatePut({ id: useData.key, obj: values });
            } else {
                // Thêm nhân viên mới
                mutatePost(values);
            }
         
        } catch (error) {
            console.log(error);
        }
    };

    const handleEditEmployee = (record) => {
        console.log("Editing record:", record); // Kiểm tra dữ liệu được truyền vào
        setTitle("Sửa Nhân Viên");
        //setUseData(record.position === "Trưởng phòng" ? { ...record, position: "TP" } : { ...record, position: "NV" });
        setUseData(record);
        setDepartmentDataFilter(departmentData)
        form.setFieldsValue(record); // Đổ dữ liệu vào form
        setMode("Edit");
        setIsModalOpen(true);
    };

    const handleDeleteEmployee = async (id) => {
        try {
            const deleteEmploye = employees.results.find((item) => item.id === id);
            if (deleteEmploye) {
                const updatedEmploye = { ...deleteEmploye, is_deleted: true };
                mutateDelete({ id: updatedEmploye.id, obj: updatedEmploye });
            }
        } catch (error) {
            console.log(error);
        }
    };
    const onChange = (page) => {
        // console.log(page);
        // setCurrent(page);
    };
    return (
        <>
            {/* {roleEmployee && JSON.stringify(roleEmployee)} */}
            <PageHeader title={"Quản Lý Nhân Viên"} itemsBreadcrumb={itemsBreadcrumb}>
                {roleEmployee?.can_create && (
                    <ButtonIcon
                        handleEvent={() => {
                            setDepartmentDataFilter(departmentData), form.resetFields();
                            setTitle("Thêm Nhân Viên");
                            setMode("Add");
                            showModal();
                        }}
                    >
                        <Plus /> Thêm Nhân Viên
                    </ButtonIcon>
                )}
            </PageHeader>

            <div className="mt-5">

                <Table
                    columns={columns}
                    dataSource={data || []}
                    pagination={{
                        total: total,
                        defaultCurrent: current,
                        pageSize: 5, // Mặc định 10 dòng mỗi trang
                        onChange: onChange,
                    }}
                    isLoading={isLoading}
                />
            </div>

            <Drawer
                title="Thông tin Nhân Viên"
                onClose={() => setOpen(false)}
                open={open}
                width={"30%"}
            >
                <FormProject
                    form={form}
                    formItems={formItems}
                />
            </Drawer>

            <ModalProject
                isModalOpen={isModalOpen}
                handleOk={handleOk}
                handleCancel={() => setIsModalOpen(false)}
                title={title}
                form={form}
            >
                <FormProject
                    form={form}
                    formItems={formItems}
                    formItemLayout={formItemLayout}
                    initialValues={{
                        positionName: "NV",
                    }}
                />
            </ModalProject>
        </>
    );
};

export default Employee;
