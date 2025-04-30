import React, { useState, useEffect } from "react";

import { Space, Popconfirm, Form, Input, message, Button } from "antd";

import { Pencil, Trash2, Plus } from "lucide-react";

import { Link } from "react-router-dom";

import { FaEye } from "react-icons/fa";

import Search from "@/components/Search";

import { Table, Drawer } from "antd";

import ModalProject from "@/components/modal/Modal";

import FormProject from "@/components/form/Form";

import PageHeader from "@/components/PageHeader";

import ButtonIcon from "@/components/ButtonIcon";

import { projectGetAPI, projectPostAPI, projectDeleteAPI, projectUpdateAPI } from "@/services/ProjectService";

import { formatDate } from "@/utils/cn";

import { showToastMessage } from "@/utils/toast";

import {useAuth} from "@/hooks/use-auth"

import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useWebSocket from "@/services/useWebSocket";
// import "react-toastify/dist/ReactToastify.css";

const Project = () => {
    const [current, setCurrent] = useState(1);

    const [total, setTotal] = useState(0);

    const [useData, setUseData] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [open, setOpen] = useState(false);

    const [title, setTitle] = useState("");

    const [mode, setMode] = useState("");

    const [form] = Form.useForm();

    const [data, setData] = useState(null);

    const ProjectList = useWebSocket("ws://127.0.0.1:8000/ws/projects/");

    const {features} = useAuth()

    const [roleProject, setRoleProject] = useState(null)

    useEffect(() => {
        console.log("features",features)
        if (features) {
            const featureEmployee = features.find((item) => item.feature.name === "Quản lý dự án");
            setRoleProject(featureEmployee);
            console.log("roleProject", roleProject);

        }
    }, [features]);

    // const [isLoading, setIsloading] = useState(true)

    const queryClient = useQueryClient();

    const { data: projects, isLoading } = useQuery({
        queryKey: ["projects", current], // Thêm `current` vào queryKey để refetch khi current thay đổi
        queryFn: () => projectGetAPI(current),
        enabled: !!current, // Chỉ chạy khi `current` có giá trị hợp lệ
    });
    useEffect(() => {
        if (ProjectList) {
            queryClient.invalidateQueries(["projects"]);
        }
    }, [ProjectList, queryClient]);

    const { mutate: addProject, isLoading: isAdding } = useMutation({
        mutationFn: projectPostAPI,
        onSuccess: () => {
            queryClient.invalidateQueries(["projects"]); // Fetch lại danh sách mà không cần current
            showToastMessage("Thêm dự án thành công !", "success", "top-right");
        },
        onError: (error) => {
            showToastMessage("Thêm dự án thất bại !", "error", "top-right");
            console.log(error);
        },
    });

    const { mutate: updateProject, isLoading: isUpdating } = useMutation({
        mutationFn: ({ id, updatedProject }) => projectUpdateAPI(id, updatedProject), // Nhận tham số
        onSuccess: () => {
            queryClient.invalidateQueries(["projects"]); // Fetch lại danh sách
            showToastMessage("Cập nhật dự án thành công!", "success", "top-right");
        },
        onError: (error) => {
            showToastMessage("Cập nhật dự án thất bại!", "error", "top-right");
            console.log(error);
        },
    });

    const { mutate: deleteProject, isLoading: isDeleted } = useMutation({
        mutationFn: projectDeleteAPI,
        onSuccess: () => {
            // If there are no projects left on this page, decrement the page number
            if (data.length === 1 && current > 1) {
                setCurrent(current - 1); // Go to the previous page
            } else {
                // After successful deletion, invalidate the query
                queryClient.invalidateQueries(["projects", current]);
            }

            showToastMessage("Xóa dự án thành công!", "success", "top-right");
        },
        onError: (error) => {
            showToastMessage("Xóa dự án thất bại!", "error", "top-right");
            console.log(error);
        },
    });

    useEffect(() => {
        if (projects) {
            const results = projects.results.map((item) => ({
                key: item.id,
                name: item.name,
                createdAt: formatDate(item.created_at),
                updatedAt: formatDate(item.updated_at),
            }));

            setTotal(projects.count);
            setData(results);
        }
    }, [projects]); // Chạy lại khi `projects` thay đổi

    useEffect(() => {
        if (useData) {
            console.log(useData);
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

    // Form items

    const formItems = [
        {
            name: "key",
            label: "Mã dự án: ",
            component: <Input />,
            props: { readOnly: true },
            hidden: mode === "Add" ? true : false,
        },
        {
            name: "name",
            label: "Tên dự án",
            component: <Input placeholder="Làm ơn nhập tên dự án" />,
            props: { readOnly: mode === "Info" && true },
            rules: [
                {
                    required: true,
                    message: "Làm ơn nhập tên dự án",
                },
            ],
        },
    ];

    // Đường dẫn
    const itemsBreadcrumb = [
        {
            title: <Link to="/">Trang chủ</Link>,
        },
        {
            title: "Dự án",
        },
    ];

    const handleDeleteProject = async (record) => {
        console.log("confirm", record);
        deleteProject(record.key); // Truyền đúng tham số
       
    };

    //  Tùy chỉnh cột của table
    const columns = [
        {
            title: "ID",
            dataIndex: "key",
            key: "key",
        },
        {
            title: "Tên Công Việc",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (

                <Link to={"/project/" + record.key} className="text-blue-600">
                    {text}
                </Link>
            ),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    {/* Tùy chỉnh dropdown filter */}
                    <Input
                        autoFocus
                        placeholder="Tìm kiếm theo tên phần"
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
            title: "Ngày Tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => <p className="capitalize">{text}</p>,
            sorter: (a, b) => {
                const dateA = new Date(a.createdAt.split("-").reverse().join("-"));
                const dateB = new Date(b.createdAt.split("-").reverse().join("-"));
                return dateA - dateB; // Sắp xếp theo số (timestamp)
            },
        },

        // {
        //   title: 'Ngày Kết Thúc',
        //   dataIndex: 'updatedAt',
        //   key: 'updatedAt',
        //   render: (text) => <p className='capitalize'>{text}</p>,
        // },

        {
            title: "Chức năng",
            key: "action",
            render: (_, record) => (
                <Space >
                    {/* <a
                        className="font-medium"
                        onClick={() => handleEditProject(record)}
                    >
                        <Pencil size={20} />
                    </a> */}

                    {
                     roleProject?.can_update &&  (<Button
                        shape="circle"
                        size="medium"
                        color="gold"
                        variant="solid"
                        onClick={() => handleEditProject(record)}

                    >
                        <Pencil size={18} />
                    </Button>)
                    }
                    {/* <Popconfirm
                        placement="bottomRight"
                        title="Xóa một dự án"
                        description="Bạn đã chắc chắn muốn xóa ?"
                        okText="Có"
                        cancelText="Không"
                        onConfirm={() => handleDeleteProject(record)} // Sửa lại chỗ này
                    >
                     
                        <Button
                            shape="circle"
                            size="medium"
                            color="red"
                            variant="solid"
                        >
                            <Trash2 size={20} />
                        </Button>
                    </Popconfirm> */}

                    <Link to={"/project/" + record.key}>
                        <Button
                            shape="circle"
                            size="medium"
                            color="blue"
                            variant="solid"
                        >
                            <FaEye className="text-lg" />
                        </Button>

                    </Link>
                </Space>
            ),
        },
    ];

    const showModal = () => {
        setIsModalOpen(true);
    };

    const createProject = async (values) => {
        const response = await projectPostAPI(values);

        if (response.status === 201) {
            const dataNew = response.data;
            if (dataNew) {
                const dataItem = {
                    key: dataNew.id,
                    name: dataNew.name,
                    createdAt: formatDate(dataNew.created_at),
                    updatedAt: formatDate(dataNew.updated_at),
                };
                // setIsloading(true)
                setData([...data, dataItem]);
                // setIsloading(false)
            } else {
                console.log("lỗi");
            }
            showToastMessage("Thêm dự án thành công !", "success", "top-right");
        } else {
            showToastMessage("Thêm dự án thất bại !", "error", "top-right");
        }
    };

    // const updateProject = async (values) => {
    //   const response = await projectUpdateAPI(values.key, values);

    //   if (response.status === 200) {
    //     const dataNew = response.data;
    //     if (dataNew) {
    //       const dataItem = {
    //         key: dataNew.id,
    //         name: dataNew.name,
    //         createdAt: formatDate(dataNew.created_at),
    //         updatedAt: formatDate(dataNew.updated_at)
    //       }
    //       // Tìm index của phần tử có key (id) tương ứng
    //       const index = data.findIndex(item => item.key === dataNew.id);

    //       if (index !== -1) {
    //         // Tạo bản sao của data, cập nhật phần tử tại index
    //         const updatedData = [...data];
    //         updatedData[index] = dataItem;
    //         //  setIsloading(true)
    //         setData(updatedData);
    //         //  setIsloading(false)
    //       } else {
    //         console.log('Không tìm thấy dự án trong danh sách, thêm mới...');
    //       }
    //     } else {
    //       console.log('lỗi')
    //     }
    //     showToastMessage('Sửa tên dự án thành công !', 'success', 'top-right')
    //   } else {
    //     showToastMessage('Sửa tên dự án thất bại !', 'error', 'top-right')
    //   }
    // }

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            console.log("Success:", values);
            if (mode === "Add") {
                // createProject(values)
                addProject(values);
            } else if (mode === "Edit") {
                console.log("EDIT");
                updateProject({ id: values.key, updatedProject: values }); // Truyền đúng tham số
            }

            setIsModalOpen(false);
        } catch (errorInfo) {
            ``;
            console.log("Failed:", errorInfo);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setUseData(null);
    };

    const handleEditProject = (value) => {
        console.log("recode edit", value);

        setTitle("Sửa Công Việc");
        setUseData(value);

        showModal();
        setMode("Edit");
    };

    const handleCreateProject = () => {
        form.resetFields();
        setTitle("Thêm dự án mới");
        setMode("Add");
        showModal();
    };

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const handleShowData = (value) => {
        showDrawer();
        setMode("Info");
        console.log(value, "value");
        setUseData(value);
    };

    const onChange = (page) => {
        console.log(page);
        setCurrent(page);
    };

    return (
        <>
            <PageHeader
                title={"Dự Án"}
                itemsBreadcrumb={itemsBreadcrumb}
            >
                {roleProject?.can_create && <ButtonIcon handleEvent={handleCreateProject}>
                    <Plus /> Thêm Dự Án Mới
                </ButtonIcon>}
            </PageHeader>

            <div className="mt-5">
                <Table
                    className="select-none"
                    columns={columns}
                    dataSource={data}
                    loading={isLoading}
                    pagination={{
                        total: total,
                        defaultCurrent: current,
                        pageSize: 5, // Mặc định 10 dòng mỗi trang
                        onChange: onChange,
                        // showSizeChanger: true, // Cho phép chọn số dòng mỗi trang
                    }}
                    locale={{
                        triggerDesc: "Sắp xếp giảm dần",
                        triggerAsc: "Sắp xếp tăng dần",
                        cancelSort: "Hủy sắp xếp",
                    }}
                />
            </div>

            <Drawer
                title="Thông tin Phòng Ban"
                onClose={onClose}
                open={open}
                width={"30%"}
            >
                <FormProject
                    form={form}
                    formItemLayout={formItemLayout}
                    formItems={formItems}
                ></FormProject>
            </Drawer>

            <ModalProject
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
                title={title}
                form={form}
            >
                <FormProject
                    formName={"form" + mode}
                    form={form}
                    formItemLayout={formItemLayout}
                    formItems={formItems}
                ></FormProject>
            </ModalProject>

            {/* <ToastContainer /> */}

        </>
    )
}

export default Project;
