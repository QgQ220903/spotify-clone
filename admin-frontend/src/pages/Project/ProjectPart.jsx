import React, { Children, useEffect, useState } from "react";
import { Table, Tooltip, Badge, Popconfirm, Space, Input, Form, Select, DatePicker, Tag, Progress, Button, Avatar, Drawer } from "antd";
import Search from "@/components/Search";
import PageHeader from "@/components/PageHeader";
import { Link, useParams } from "react-router-dom";

import { projectPartGetAPI } from "@/services/ProjectService";
import { projectPartPostAPI , projectPartPatchAPI, projectPartDeleteAPI} from "@/services/ProjectPartService";
// Employee API
import { employeeGetAPI } from "@/services/EmployeeService";

// Department API
import { departmentGetAPI } from "@/services/DepartmentService";
import { sendEmail } from "@/services/EmailService.";
// Task API
import { taskPost } from "@/services/TaskService";
import { taskAssignmentsPost } from "@/services/TaskAssignmentsService";
import { departmentTaskPost } from "@/services/DepartmentTaskService";

import { formatDate, getInitials, isArrayEmpty } from "@/utils/cn";
import { Pencil, Trash2, Plus, MessageCircleMore, Bell, History, RefreshCcw } from "lucide-react";
import ButtonIcon from "@/components/ButtonIcon";
// import { FaEye } from "react-icons/fa";
import ModalProjectPart from "@/components/modal/Modal";
import ModalProjectTask from "@/components/modal/Modal";

import ModalHandOver from "@/components/modal/Modal";

import FormProjectPart from "@/components/form/Form"; 
import FormHandOver from "@/components/form/Form"; 
import FormProjectTask from "@/components/form/Form";
import { Chat, HeaderChat } from "@/components/chatRoom/Chat";


import EmptyTemplate from "@/components/emptyTemplate/EmptyTemplate";

import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ShowHistory from "@/components/ShowHistory";

import TitleTooltip from "@/components/tooltip/TitleTooltip";

import { showToastMessage } from "@/utils/toast";

import { ToastContainer, toast } from "react-toastify";
import useWebSocket from "@/services/useWebSocket";

import { useAuth } from "@/hooks/use-auth"

const itemsBreadcrumb = [{ title: <Link to="/">Trang chủ</Link> }, { title: <Link to="/project">Dự án</Link> }, { title: "Phần dự án" }];



// tùy chỉnh form kích thước input
const formItemLayout = {
    labelCol: {
        span: 9,
    },
    wrapperCol: {
        span: 18,
    },
};

const { RangePicker } = DatePicker;

const { TextArea } = Input;

const ProjectDetail = () => {

    const { id } = useParams();

    const [count,setCount] = useState(0)

    const Project_parts_List = useWebSocket("ws://127.0.0.1:8000/ws/project-parts/");
    const task_List = useWebSocket("ws://127.0.0.1:8000/ws/task_assignments/");
    // Drawer
    const [open, setOpen] = useState(false);
    const [drawerData, setDrawerData] = useState("");

    const { features } = useAuth()

    const [isModalHandOverOpen, setIsModalHandOverOpen] = useState(false);

    const [roleProject, setRoleProject] = useState(null)

    useEffect(() => {
        console.log("features", features)
        if (features) {
            const featureEmployee = features.find((item) => item.feature.name === "Quản lý dự án");
            setRoleProject(featureEmployee);
            console.log("roleProject", roleProject);

        }
    }, [features]);

    const showDrawer = (record) => {
        console.log(record);
        setDrawerData(record);
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };

    const [isModalHistoryOpen, setIsModalHistoryOpen] = useState(false);

    const [isSubTaskForm, setIsSubTaskForm] = useState(false);

    const [projectPartData, setProjectPartData] = useState(null);

    const [projectdata, setProjectdata] = useState(null);

    // Chứa danh sách nhân viên
    const [employeesData, setEmployeesdata] = useState(null);

    // Chứa danh sách phòng ban
    const [departmentsData, setDepartmentsData] = useState(null);

    const [projectPartSelect, setProjectPartSelect] = useState(null);

    const [projectPartSelect2, setProjectPartSelect2] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [title, setTitle] = useState("");

    const [isModalTaskOpen, setIsModalTaskOpen] = useState(false);

    const [form] = Form.useForm();

    const [formTask] = Form.useForm();

    const [formHandOver] = Form.useForm();

    const [mode, setMode] = useState("");

    // check phân công cho cá nhân hay phòng ban
    const [isDepartmentTask, setIsDepartmentTask] = useState(true);

    const [isEmployeeTask, setIsEmployeeTask] = useState(true);

    const queryClient = useQueryClient();

    //láy dự án với id được truyền qua url
    const { data: project, isLoading } = useQuery({
        queryKey: ["project", id], // Thêm id vào queryKey để cache riêng biệt
        queryFn: () => projectPartGetAPI(id), // Để React Query tự gọi API khi cần
        enabled: !!id, // Chỉ chạy khi id có giá trị hợp lệ
    });

    // Thêm 1 phần dự án
    const { data: newProjectPart, mutate: mutateProjectPart } = useMutation({
        mutationFn: projectPartPostAPI,
        onSuccess: (data) => {
            console.log("Thêm phần dự án mới", data);
            queryClient.invalidateQueries({
                queryKey: ["project", id], // Chỉ refetch đúng project có id đó
            });
            showToastMessage("Thêm phần dự án thành công!", "success", "top-right");
            setIsModalOpen(false);
            if(data){
                if(data.department?.manager){
                  
                    setTimeout(()=>{
                        sendEmail({
                            subject: `Thông báo phần dự án dự án giao cho phòng ban ${data.department.name}!`,
                            message: `
                                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
                            <tr>
                                <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                    <td style="padding: 30px; text-align: center; background-color: #4a6fa5; border-radius: 8px 8px 0 0;">
                                        <h1 style="margin: 0; color: #ffffff;">THÔNG BÁO PHÂN CÔNG PHẦN DỰ ÁN</h1>
                                    </td>
                                    </tr>
                        
                                    <!-- Content -->
                                    <tr>
                                    <td style="padding: 30px;">
                                        <h2 style="margin-top: 0; color: #4a6fa5;">Gửi đến Anh/Chị: ${data.department.manager.name},</h2>
                                        <p style="line-height: 1.6;">
                                        Căn cứ vào nhu cầu dự án hiện tại, Ban quản lý đã phân công phân dự án sau cho phòng ban: ${data.department.name}
                                        </p>
                        
                                        <table width="100%" cellpadding="10" cellspacing="0" style="margin: 20px 0; border: 1px solid #ddd; border-collapse: collapse;">
                                        <tr style="background-color: #f0f0f0;">
                                            <td style="border: 1px solid #ddd; font-weight: bold;">Tên phần dự án</td>
                                            <td style="border: 1px solid #ddd;">${data.name}</td>
                                        </tr>
                                        <tr style="background-color: #f0f0f0;">
                                            <td style="border: 1px solid #ddd; font-weight: bold;">Vai trò</td>
                                            <td style="border: 1px solid #ddd;">Trường phòng ban</td>
                                        </tr>
    
                                    
                                        </table>
                        
                                        <p style="line-height: 1.6;">
                                        Anh/Chị vui lòng kiểm tra và xác nhận tiếp nhận công việc theo đường dẫn bên dưới:
                                        </p>
                        
                                        <p style="line-height: 1.6;">
                                        Mọi thắc mắc về công việc được phân công, vui lòng liên hệ trực tiếp với người giao việc hoặc qua email này.
                                        </p>
                                    </td>
                                    </tr>
                        
                                    <!-- Footer -->
                                    <tr>
                                    <td style="padding: 20px; text-align: center; background-color: #f0f0f0; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
                                        <p style="margin: 0;">© 2023 TQT. Mọi quyền được bảo lưu.</p>
                                        <p style="margin: 10px 0 0;">
                                        <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Trang chủ</a>
                                        <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Quy định</a>
                                        <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Liên hệ</a>
                                        </p>
                                    </td>
                                    </tr>
                                </table>
                                </td>
                            </tr>
                            </table>
                        </body>
                            `,
                            recipient: data.department?.manager,
                            send_at: null,
    
                        })
                    },5000)
                }
            }
        },
        onError: () => {
            showToastMessage("Thêm phần dự án thất bại!", "error", "top-right");
        },
    });

    // Thêm 1 công việc vào dự án
    const { mutateAsync: mutateTask } = useMutation({
        mutationFn: taskPost,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project", id],
            });
        },
    });

    // Thêm 1 nhân viên vào công việc
    const { data: newTaskAssignments, mutate: mutateTaskAssignment } = useMutation({
        mutationFn: taskAssignmentsPost,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project", id], // Chỉ refetch đúng project có id đó
            });
        },
    });

    //lấy ds nv
    const { data: employees } = useQuery({
        queryKey: ["employeesProjectPart"],
        queryFn: employeeGetAPI,
    });

    //lấy ds phòng ban
    const { data: departments } = useQuery({
        queryKey: ["departments"],
        queryFn: departmentGetAPI,
    });

    const setDataProjectPart = (data) => {
        const dataNew = data.map((part) => ({
            ...part,
            key: part.id,
            name: part.name,
            created_at: formatDate(part.created_at),
            updated_at: formatDate(part.updated_at),
            department_name: part.department.name,
            department_manager: part.department.manager ? part.department.manager : "",
            tasks: part.tasks ? part.tasks.map(setDataTask) : [],
        }));

        return dataNew;
    };
    const setDataTask = (task) => {
        const taskData = {
            ...task,
            priority: task.priority === 0 ? "Thấp" : task.priority === 1 ? "Trung Bình" : "Cao",
            key: "task" + task.id,
            created_at: formatDate(task.created_at),
            end_time: formatDate(task.end_time),
        };

        // Nếu task có subtasks, gọi đệ quy để xử lý tất cả các cấp
        if (task.subtasks && task.subtasks.length > 0) {
            taskData.subtasks = task.subtasks.map((sub) => ({
                ...setDataTask(sub), // Gọi đệ quy
                key: "sub" + sub.id,
            }));
        } else {
            delete taskData.subtasks; // Xóa thuộc tính `subtasks` nếu không có dữ liệu
        }

        return taskData;
    };



    useEffect(() => {
        if (Project_parts_List) {
            queryClient.invalidateQueries(["project", id]);
        }
    }, [Project_parts_List, queryClient, id]);

    useEffect(() => {
        console.log("chạy 1 lần");
        if (project) {
            setProjectdata(project);
            const dataFillter = setDataProjectPart(project.project_parts);
            console.log("dataFillterv ", dataFillter);
            setProjectPartData(dataFillter);
        }
    }, [id, project]);

    useEffect(() => {
        if (employees) {
            setEmployeesdata(employees?.results);
            setDepartmentsData(departments?.results);
        }
    }, [employees, departments]);

    // useEffect(() => {
    //     if (projectPartSelect) {
    //         console.log(projectPartSelect);
    //         formTask.setFieldsValue(projectPartSelect);
    //     }
    // }, [formTask, projectPartSelect]);

    useEffect(() => {
        if (projectPartSelect2) {
            
            formHandOver.setFieldsValue(projectPartSelect2);
        }
    }, [formHandOver, projectPartSelect2]);

    const priorityOrder = {
        "Thấp": 1,
        "Trung Bình": 2,
        "Cao": 3,
    };


    const handleOver = (record) => {
        
        record &&
        setProjectPartSelect2({
            ...record,
            id: record.id,
            name: record.name,
            department_id: record.department.id,
        });
        setIsModalHandOverOpen(true);
    }

    // Cấu hình cột PARTS
    const partColumns = [
        // { title: "Mã phần", dataIndex: "key", key: "key" },
        {
            title: "Tên phần",
            dataIndex: "name",
            key: "name",
            width: "25%",
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
            title: "Phòng ban",
            dataIndex: "department_name",
            key: "department_name",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    {/* Tùy chỉnh dropdown filter */}
                    <Input
                        autoFocus
                        placeholder="Tìm kiếm theo tên phòng ban"
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

            onFilter: (value, record) => record.department_name.toLowerCase().includes(value.toLowerCase()), // So sánh không phân biệt hoa/thường
            filterSearch: true,
        },
        {
            title: "Chịu trách nhiệm",
            dataIndex: "department_manager",
            key: "department_manager",
            render: (value) =>
                value && (
                    <Avatar.Group>
                        <Tooltip
                            key={value.id}
                            placement="topRight"
                            title={
                                <TitleTooltip
                                    name={value.name}
                                    position={value.position}
                                    email={value.email}
                                ></TitleTooltip>
                            }
                        >
                            <Avatar className="bg-blue-500"> {getInitials(value.name)}</Avatar>
                        </Tooltip>
                    </Avatar.Group>
                ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            key: "created_at",
            sorter: (a, b) => {
                const dateA = new Date(a.created_at.split("-").reverse().join("-"));
                const dateB = new Date(b.created_at.split("-").reverse().join("-"));
                return dateA - dateB; // Sắp xếp theo số (timestamp)
            },
        },
        // { title: "Cập nhật gần nhất", dataIndex: "updated_at", key: "updated_at" },
        {
            title: "Chức Năng",
            key: "action",
            width: "15%",
            render: (_, record) => (
                <Space size="middle">
                   {roleProject?.can_update &&( <Button
                        shape="circle"
                        size="medium"
                        color="green"
                        variant="solid"
                        disabled={!isArrayEmpty(record.tasks)}
                        onClick={() => handleOver(record)}
                    >
                        <RefreshCcw size={18} />
                    </Button>)}
                  {roleProject?.can_delete && (  <Popconfirm
                        title="Xóa dự án?"
                        // onConfirm={() => handleDeleteDepartment(record)}
                        onConfirm={() => handleDelete(record)}
                        okText="Có"
                        cancelText="Không"
                        description="Bạn đã chắc chắn muốn xóa ?"
                    >
                    <Button
                        shape="circle"
                        size="medium"
                        color="red"
                        variant="solid"
                        disabled={!isArrayEmpty(record.tasks)}
                       
                    >
                        <Trash2 size={18} />
                    </Button>
                    </Popconfirm>)}
                </Space>
            ),

        },
    ];

    const getRandomColor = () => {
        return "#" + Math.floor(Math.random() * 16777215).toString(16);
    };

    // Cấu hình cột TASKS
    const taskColumns = [
        {
            title: "Tên công việc",
            dataIndex: "name",
            key: "name",
            width: "25%",
            render: (text, record) => (
                <>
                    <p>{text}</p>
                    <Progress percent={0} />
                </>
            ),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    {/* Tùy chỉnh dropdown filter */}
                    <Input
                        autoFocus
                        placeholder="Tìm kiếm theo tên công việc"
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
            title: "Ngày bắt đầu",
            dataIndex: "created_at",
            key: "created_at",
            width: "11%",
            sorter: (a, b) => {
                const dateA = new Date(a.created_at.split("-").reverse().join("-"));
                const dateB = new Date(b.created_at.split("-").reverse().join("-"));
                return dateA - dateB; // Sắp xếp theo số (timestamp)
            },
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "end_time",
            key: "end_time",
            width: "11%",
            sorter: (a, b) => {
                const dateA = new Date(a.end_time.split("-").reverse().join("-"));
                const dateB = new Date(b.end_time.split("-").reverse().join("-"));
                return dateA - dateB; // Sắp xếp theo số (timestamp)
            },
        },
        // { title: "Mô tả", dataIndex: "description", key: "description" },
        {
            title: "Ưu tiên",
            dataIndex: "priority",
            key: "priority",
            // width: "10%",
            render: (text) =>
                text === "Thấp" ? (
                    <Tag color="green">{text}</Tag>
                ) : text === "Trung Bình" ? (
                    <Tag color="yellow">{text}</Tag>
                ) : (
                    <Tag color="red">{text}</Tag>
                ),
            sorter: (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority], // Sắp xếp theo số
        },
        {
            title: "Chịu trách nhiệm",
            dataIndex: "responsible_person",
            key: "responsible_person",
            render: (value) =>
                value && (
                    <Avatar.Group>
                        <Tooltip
                            placement="topRight"
                            title={
                                <TitleTooltip
                                    name={value.name}
                                    position={value.position}
                                    email={value.email}
                                ></TitleTooltip>
                            }
                        >
                            <Avatar style={{ backgroundColor: getRandomColor() }}> {value.name.split(" ").reverse().join(" ").charAt(0)}</Avatar>
                        </Tooltip>
                    </Avatar.Group>
                ),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    {/* Tùy chỉnh dropdown filter */}
                    <Input
                        autoFocus
                        placeholder="Tìm kiếm theo tên "
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

            onFilter: (value, record) => record.responsible_person.name.toLowerCase().includes(value.toLowerCase()), // So sánh không phân biệt hoa/thường
            filterSearch: true,
        },
        {
            title: "Nhóm thực hiện",
            dataIndex: "doers",
            key: "doers",
            width: "18%",
            render: (value) => (
                <>
                    {" "}
                    <Avatar.Group>
                        {value.map((item) => (
                            <Tooltip
                                key={item.id}
                                placement="topRight"
                                title={
                                    <TitleTooltip
                                        name={item.name}
                                        position={item.position}
                                        email={item.email}
                                    ></TitleTooltip>
                                }
                            >
                                <Avatar style={{ backgroundColor: getRandomColor() }}> {item.name.split(" ").reverse().join(" ").charAt(0)}</Avatar>
                            </Tooltip>
                        ))}
                    </Avatar.Group>
                </>
            ),
        },
        {
            title: "Chức năng",
            dataIndex: "action",
            key: "action",
            width: "17%",
            render: (_, record) => (
                <Space
                    size={[8, 16]}
                    wrap
                >
                    <Button
                        shape="circle"
                        size="medium"
                        type="primary"

                    >
                        <Plus size={18} />
                    </Button>

                    <Button
                        shape="circle"
                        size="medium"
                        color="cyan"
                        variant="solid"
                        onClick={() => showDrawer(record)}
                    >
                        <MessageCircleMore size={18} />
                    </Button>

                    <Button
                        shape="circle"
                        size="medium"
                        color="pink"
                        variant="solid"
                        onClick={() => console.log("bekk")}
                    >
                        <Bell size={18} />
                    </Button>

                    <Button
                        shape="circle"
                        size="medium"
                        color="volcano"
                        variant="solid"
                        onClick={() => setIsModalHistoryOpen(true)}
                    >
                        <History size={18} />
                    </Button>
                </Space>
            ),
            hidden: true,
        },
    ];

   

    // Form items
    const formItems = [
        {
            name: "project",
            label: "Mã Dự án:",
            component: <Input />,
            props: { readOnly: true },
            hidden: false,
        },
        {
            name: "name",
            label: "Tên phần dự án:",
            component: <Input placeholder="Please input Department" />,
            //   props: { readOnly: mode === "Info" && true },
            rules: [
                {
                    required: true,
                    message: "Làm ơn nhập tên phần dự án",
                },
            ],
        },
        {
            name: "department_id",
            label: "Nhóm thực hiện:",
            component: (
                <Select
                    // mode="multiple"
                    // allowClear
                    showSearch
                    placeholder="Vui lòng chọn phòng ban"
                    optionFilterProp="label"
                    // onChange={onChangeDepartmentTask}
                    // options={options}
                    options={departmentsData?.map((item) => ({
                        value: item.id,
                        label: item.name,
                    }))}
                />
            ),
            rules: [
                {
                    required: true,
                    message: "Làm ơn chọn nhóm thực hiện",
                },
            ],
        },
    ];

    const formItemsHandOver = [
        {
            name: "project",
            label: "Mã dự án:",
            component: <Input />,
            props: { readOnly: true },
           
        },
        {
            name: "id",
            label: "Mã Phần dự án:",
            component: <Input />,
            props: { readOnly: true },
           
        },
        {
            name: "name",
            label: "Tên phần dự án:",
            component: <Input placeholder="Please input Department" />,
            //   props: { readOnly: mode === "Info" && true },
            rules: [
                {
                    required: true,
                    message: "Làm ơn nhập tên phần dự án",
                },
            ],
        },
        {
            name: "department_id",
            label: "Nhóm thực hiện:",
            component: (
                <Select
                    // mode="multiple"
                    // allowClear
                    showSearch
                    placeholder="Vui lòng chọn phòng ban"
                    optionFilterProp="label"
                    // onChange={onChangeDepartmentTask}
                    // options={options}
                    options={departmentsData?.map((item) => ({
                        value: item.id,
                        label: item.name,
                    }))}
                />
            ),
            rules: [
                {
                    required: true,
                    message: "Làm ơn chọn nhóm thực hiện",
                },
            ],
        },
    ];



    // Form items task
    const formItemsTask = [
        {
            name: "projectPart",
            label: "Mã phần dự án:",
            component: <Input />,
            props: { readOnly: true },
            hidden: false,
        },
        {
            name: "task",
            label: "Mã công việc cha:",
            component: <Input />,
            props: { readOnly: true },
            hidden: !isSubTaskForm,
        },
        {
            name: "nameTask",
            label: "Tên công việc:",
            component: <Input placeholder="Vui lòng nhập tên công việc" />,
            //   props: { readOnly: mode === "Info" && true },
            rules: [
                {
                    required: true,
                    message: "Làm ơn nhập tên phần dự án",
                },
            ],
        },
        {
            name: "desTask",
            label: "Mô tả:",
            component: <TextArea placeholder="Vui lòng nhập mô tả"></TextArea>,
            //   props: { readOnly: mode === "Info" && true },
            rules: [
                {
                    required: true,
                    message: "Làm ơn nhập tên phần dự án",
                },
            ],
        },
        {
            name: "resEmployee",
            label: "Người chịu tránh nhiệm:",
            component: (
                <Select
                    showSearch
                    placeholder="Select a employee"
                    optionFilterProp="label"
                    // onChange={onChangeRes}
                    // onSearch={onSearch}
                    options={employeesData?.map((item) => ({
                        value: item.id,
                        label: item.name,
                    }))}
                />
            ),
            props: { disabled: !isEmployeeTask },
            rules: [
                {
                    required: true,
                    message: "Làm ơn chọn người chịu trách nhiệm",
                },
            ],
        },

        {
            name: "WorksEmployee",
            label: "Người thực hiện:",
            component: (
                <Select
                    mode="multiple"
                    allowClear
                    placeholder="Please select"
                    // onChange={onChangeEmployee}
                    // options={options}
                    options={employeesData?.map((item) => ({
                        value: item.id,
                        label: item.name,
                    }))}
                />
            ),
            props: { disabled: !isEmployeeTask },
            rules: [
                {
                    required: true,
                    message: "Làm ơn chọn người chịu trách nhiệm",
                },
            ],
        },

        {
            name: "date",
            label: "Chọn thời gian:",
            // getValueFromEvent: (_, dateString) => dateString,
            component: (
                <RangePicker
                    showTime
                    format={"DD/MM/YY : HH:mm"}
                    // onChange={(date, dateString) => console.log("onChange", date, dateString)}
                ></RangePicker>
            ),
            rules: [
                {
                    required: true,
                    message: "Làm ơn chọn ngày thực hiện và kết thức",
                },
            ],
        },

        {
            name: "Priority",
            label: "Mức độ ưu tiên:",
            // getValueFromEvent: (_, dateString) => dateString,
            component: (
                <Select
                    showSearch
                    placeholder="Select a priority"
                    optionFilterProp="label"
                    // onChange={onChange}
                    options={[
                        {
                            value: "0",
                            label: "Thấp",
                        },
                        {
                            value: "1",
                            label: "Trung Bình",
                        },
                        {
                            value: "2",
                            label: "Cao",
                        },
                    ]}
                />
            ),
            rules: [
                {
                    required: true,
                    message: "Làm ơn chọn ngày thực hiện và kết thức",
                },
            ],
        },
    ];

    // Hàm thêm phần công việc
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
          
            mutateProjectPart(values);
        
        } catch (error) {
            console.log("Failed:", error);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleCancelTask = () => {
        setIsModalTaskOpen(false);
    };

    const handleCreateProjectPart = () => {
        setTitle(projectdata && projectdata.name);
        form.resetFields();
        setMode("Add");
        showModal();
    };

    // const handleCreateProjectTask = (value) => {
    //     setIsDepartmentTask(true);
    //     setIsEmployeeTask(true);
    //     setIsSubTaskForm(false);
    //     formTask.resetFields();
    //     console.log("handleCreateProjectTask", value);
    //     value &&
    //         setProjectPartSelect({
    //             projectPart: value.key,
    //         });
    //     console.log("projectPartSelect", projectPartSelect);
    //     setMode("Add");
    //     showModalTask();
    // };

    // const handleCreateSubTask = (value) => {
    //     setIsSubTaskForm(true);
    //     setIsDepartmentTask(true);
    //     setIsEmployeeTask(true);
    //     formTask.resetFields();
    //     console.log("handleCreateSubTask", value);
    //     value &&
    //         setProjectPartSelect({
    //             projectPart: value.project_part,
    //             task: value.id,
    //         });
    //     console.log("projectPartSelect", projectPartSelect);
    //     setMode("Add");
    //     showModalTask();
    // };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const showModalTask = () => {
        setIsModalTaskOpen(true);
    };


    const { mutate: mutatePatchProjectPart } = useMutation({
        mutationFn: ({ id, data }) => projectPartPatchAPI(id, data),
        onSuccess: (data) => {
        
          queryClient.invalidateQueries({
            queryKey: ["project", id],
          });
          showToastMessage("Cập nhật phần dự án thành công!", "success", "top-right");
          setIsModalHandOverOpen(false)

          if(data.manager_id !== projectPartSelect2.manager_id) {
            if(data.department?.manager){        
                setTimeout(()=>{
                    sendEmail({
                        subject: `Thông báo chuyển phần dự án dự án giao cho phòng ban ${data.department.name}!`,
                        message: `
                            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
                        <tr>
                            <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <!-- Header -->
                                <tr>
                                <td style="padding: 30px; text-align: center; background-color: #4a6fa5; border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff;">THÔNG BÁO PHÂN CÔNG PHẦN DỰ ÁN</h1>
                                </td>
                                </tr>
                    
                                <!-- Content -->
                                <tr>
                                <td style="padding: 30px;">
                                    <h2 style="margin-top: 0; color: #4a6fa5;">Gửi đến Anh/Chị: ${data.department.manager.name},</h2>
                                    <p style="line-height: 1.6;">
                                    Căn cứ vào nhu cầu dự án hiện tại, Ban quản lý đã phân công phân dự án sau cho phòng ban: ${data.department.name}
                                    </p>
                    
                                    <table width="100%" cellpadding="10" cellspacing="0" style="margin: 20px 0; border: 1px solid #ddd; border-collapse: collapse;">
                                    <tr style="background-color: #f0f0f0;">
                                        <td style="border: 1px solid #ddd; font-weight: bold;">Tên phần dự án</td>
                                        <td style="border: 1px solid #ddd;">${data.name}</td>
                                    </tr>
                                    <tr style="background-color: #f0f0f0;">
                                        <td style="border: 1px solid #ddd; font-weight: bold;">Vai trò</td>
                                        <td style="border: 1px solid #ddd;">Trường phòng ban</td>
                                    </tr>

                                
                                    </table>
                    
                                    <p style="line-height: 1.6;">
                                    Anh/Chị vui lòng kiểm tra và xác nhận tiếp nhận công việc theo đường dẫn bên dưới:
                                    </p>
                    
                                    <p style="line-height: 1.6;">
                                    Mọi thắc mắc về công việc được phân công, vui lòng liên hệ trực tiếp với người giao việc hoặc qua email này.
                                    </p>
                                </td>
                                </tr>
                    
                                <!-- Footer -->
                                <tr>
                                <td style="padding: 20px; text-align: center; background-color: #f0f0f0; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
                                    <p style="margin: 0;">© 2023 TQT. Mọi quyền được bảo lưu.</p>
                                    <p style="margin: 10px 0 0;">
                                    <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Trang chủ</a>
                                    <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Quy định</a>
                                    <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Liên hệ</a>
                                    </p>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>
                        </table>
                    </body>
                        `,
                        recipient: data.department?.manager,
                        // recipient: "chantruong753@gmail.com",
                        send_at: null,

                    })
                },5000)
            }

            if(projectPartSelect2.department?.manager){
                  
                setTimeout(()=>{
                    sendEmail({
                        subject: `Thông báo phần dự án bị chuyển cho phòng ban ${data.department.name}!`,
                        message: `
                            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
                        <tr>
                            <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <!-- Header -->
                                <tr>
                                <td style="padding: 30px; text-align: center; background-color: #4a6fa5; border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff;">THÔNG BÁO BÀN GIAO PHẦN DỰ ÁN</h1>
                                </td>
                                </tr>
                    
                                <!-- Content -->
                                <tr>
                                <td style="padding: 30px;">
                                    <h2 style="margin-top: 0; color: #4a6fa5;">Gửi đến Anh/Chị: ${projectPartSelect2.department.manager.name},</h2>
                                    <p style="line-height: 1.6;">
                                    Căn cứ vào nhu cầu dự án hiện tại, Ban quản lý đã bàn giao phân dự án sau cho phòng ban khác: 
                                       
                                    </p>
                                    <p><strong> từ phòng ban ${projectPartSelect2.department.name} sang ${data.department.name} </strong> </p>
                    
                                    <table width="100%" cellpadding="10" cellspacing="0" style="margin: 20px 0; border: 1px solid #ddd; border-collapse: collapse;">
                                    <tr style="background-color: #f0f0f0;">
                                        <td style="border: 1px solid #ddd; font-weight: bold;">Tên phần dự án bị chuyển giao</td>
                                        <td style="border: 1px solid #ddd;">${data.name}</td>
                                    </tr>
                                

                                
                                    </table>
                    
                                    <p style="line-height: 1.6;">
                                    Anh/Chị vui lòng kiểm tra và xác nhận tiếp nhận công việc theo đường dẫn bên dưới:
                                    </p>
                    
                                    <p style="line-height: 1.6;">
                                    Mọi thắc mắc về công việc được phân công, vui lòng liên hệ trực tiếp với người giao việc hoặc qua email này.
                                    </p>
                                </td>
                                </tr>
                    
                                <!-- Footer -->
                                <tr>
                                <td style="padding: 20px; text-align: center; background-color: #f0f0f0; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
                                    <p style="margin: 0;">© 2023 TQT. Mọi quyền được bảo lưu.</p>
                                    <p style="margin: 10px 0 0;">
                                    <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Trang chủ</a>
                                    <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Quy định</a>
                                    <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Liên hệ</a>
                                    </p>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>
                        </table>
                    </body>
                        `,
                        recipient: projectPartSelect2.department?.manager,
                        // recipient: "chantruong753@gmail.com",
                        send_at: null,

                    })
                },5000)
            }
          }
        },
        onError: () => {
          showToastMessage("Cập nhật phần dự án thất bại!", "error", "top-right");
        },
      });

    const { mutate: mutateDeleteProjectPart } = useMutation({
        mutationFn: ({ id }) => projectPartDeleteAPI(id),
        onSuccess: (data) => {
        
          queryClient.invalidateQueries({
            queryKey: ["project", id],
          });
          showToastMessage("Xóa phần dự án thành công!", "success", "top-right");
          setIsModalHandOverOpen(false)

          
        },
        onError: () => {
          showToastMessage("Xóa phần dự án thất bại!", "error", "top-right");
        },
      });
      

    const handleOverTask =async() => {
        try {
            const values = await formHandOver.validateFields();
           
            //  projectPartPatchAPI(values.id,values);
             mutatePatchProjectPart({ id: values.id, data: values });
     
        } catch (error) {
            console.log("Failed:", error);
        }
    }

    const handleDelete = async(recode) => {
        console.log("handleDelete:", recode);
        mutateDeleteProjectPart({ id: recode.id});
        if(recode.manager_id) {
            if(recode.department?.manager){        
                setTimeout(()=>{
                    sendEmail({
                        subject: `Thông báo hủy phần dự án được giao cho phòng ban ${recode.department.name}!`,
                        message: `
                            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
                        <tr>
                            <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <!-- Header -->
                                <tr>
                                <td style="padding: 30px; text-align: center; background-color: #4a6fa5; border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff;">THÔNG BÁO PHÂN CÔNG PHẦN DỰ ÁN</h1>
                                </td>
                                </tr>
                    
                                <!-- Content -->
                                <tr>
                                <td style="padding: 30px;">
                                    <h2 style="margin-top: 0; color: #4a6fa5;">Gửi đến Anh/Chị: ${recode.department.manager.name},</h2>
                                    <p style="line-height: 1.6;">
                                    Căn cứ vào nhu cầu dự án hiện tại, Ban quản lý đã hủy phần dự án sau cho phòng ban: ${recode.department.name}
                                    </p>
                    
                                    <table width="100%" cellpadding="10" cellspacing="0" style="margin: 20px 0; border: 1px solid #ddd; border-collapse: collapse;">
                                    <tr style="background-color: #f0f0f0;">
                                        <td style="border: 1px solid #ddd; font-weight: bold;">Tên phần dự án</td>
                                        <td style="border: 1px solid #ddd;">${recode.name}</td>
                                    </tr>
                    
                                
                                    </table>
                    
                                    <p style="line-height: 1.6;">
                                    Anh/Chị vui lòng kiểm tra và xác nhận tiếp nhận công việc theo đường dẫn bên dưới:
                                    </p>
                    
                                    <p style="line-height: 1.6;">
                                    Mọi thắc mắc về công việc được phân công, vui lòng liên hệ trực tiếp với người giao việc hoặc qua email này.
                                    </p>
                                </td>
                                </tr>
                    
                                <!-- Footer -->
                                <tr>
                                <td style="padding: 20px; text-align: center; background-color: #f0f0f0; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
                                    <p style="margin: 0;">© 2023 TQT. Mọi quyền được bảo lưu.</p>
                                    <p style="margin: 10px 0 0;">
                                    <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Trang chủ</a>
                                    <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Quy định</a>
                                    <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Liên hệ</a>
                                    </p>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>
                        </table>
                    </body>
                        `,
                        recipient: recode.department?.manager,
                        // recipient: "chantruong753@gmail.com",
                        send_at: null,

                    })
                },5000)
            }

       
          }
    }

    // Thêm Công việc mới
    // const handleOkTask = async () => {
    //     try {
    //         const values = await formTask.validateFields();
    //         values.date = values.date?.map((d) => d.format("YYYY-MM-DDThh:mm"));
    //         console.log("Validated Values:", values);

    //         const valueNew = {
    //             name: values.nameTask,
    //             description: values.desTask,
    //             priority: values.Priority,
    //             start_time: values.date?.[0] || null,
    //             end_time: values.date?.[1] || null,
    //             task_status: "TO_DO",
    //             completion_percentage: "0",
    //             is_deleted: false,
    //             project_part: values.projectPart,
    //             parent_task: isSubTaskForm ? values.task : null,
    //         };

    //         // await createTask(values, valueNew, isSubTaskForm);
    //         const dataTask = await mutateTask(valueNew);
    //         console.log("dataTask", dataTask);
    //         if (values.resEmployee) {
    //             mutateTaskAssignment({
    //                 employee: values.resEmployee,
    //                 role: "RESPONSIBLE",
    //                 task: dataTask.id,
    //             });
    //         }
    //         if (values.WorksEmployee?.length > 0) {
    //             await Promise.all(
    //                 values.WorksEmployee.map((employee) =>
    //                     mutateTaskAssignment({
    //                         employee: employee,
    //                         role: "DOER",
    //                         task: dataTask.id,
    //                     }),
    //                 ),
    //             );
    //         }
    //         // Gửi API tạo DepartmentTask
    //         // else if (values.DepartmentTask?.length > 0) {
    //         //     await Promise.all(
    //         //         values.DepartmentTask.map(department =>
    //         //             mutateDepartmentTask(
    //         //                 { department: department,
    //         //                     task: dataTask.id
    //         //                 },
    //         //             )
    //         //         )
    //         //     );
    //         // }

    //         setIsModalTaskOpen(false);
    //     } catch (error) {
    //         console.error("Validation Failed:", error);
    //     }
    // };

     const handleCancelHandOver = () => {
        setIsModalHandOverOpen(false);
        setProjectPartSelect2(null)
    };

    const expandedRowRender = (part) => (
        <Table
            columns={taskColumns}
            dataSource={part.tasks}
            pagination={false}
            indentSize={20}
            childrenColumnName={"subtasks"}
            locale={{
                triggerDesc: "Sắp xếp giảm dần",
                triggerAsc: "Sắp xếp tăng dần",
                cancelSort: "Hủy sắp xếp",
            }}
        />
    );
    
    return (
        <>
            {/* <div>{projectPartData && JSON.stringify(projectPartData)}</div> */}
            <PageHeader
                title={projectdata && projectdata.name}
                itemsBreadcrumb={itemsBreadcrumb}
            >
                {roleProject?.can_create &&
                    (<ButtonIcon handleEvent={handleCreateProjectPart}>
                        <Plus /> Thêm Phần Dự Án Mới
                    </ButtonIcon>)}
            </PageHeader>

            <div className="mt-5">
                <Table
                    columns={partColumns}
                    dataSource={projectPartData}
                    // rowKey={(record) => getRowKey("part", record.id)}
                    loading={isLoading}
                    expandable={{
                        expandedRowRender: (part) => expandedRowRender(part),
                        rowExpandable: (record) => record.tasks.length > 0,
                    }}
                    pagination={
                        {
                            pageSize: 5,
                            total: projectPartData?.length,
                        }
                    }
                    locale={{
                        triggerDesc: "Sắp xếp giảm dần",
                        triggerAsc: "Sắp xếp tăng dần",
                        cancelSort: "Hủy sắp xếp",
                    }}
                />
            </div>

            <ModalProjectPart
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
                title={title}
                form={form}
            >
                <FormProjectPart
                    formName={"form" + mode}
                    form={form}
                    formItemLayout={formItemLayout}
                    formItems={formItems}
                    initialValues={{
                        project: project && project.id,
                    }}
                ></FormProjectPart>
            </ModalProjectPart>

            {/* <ModalProjectTask
                isModalOpen={isModalTaskOpen}
                setIsModalOpen={setIsModalTaskOpen}
                handleOk={handleOkTask}
                handleCancel={handleCancelTask}
                title={"Thêm Công Việc Mới"}
                form={formTask}
            >
                <FormProjectTask
                    formName={"formTask" + mode}
                    form={formTask}
                    formItemLayout={formItemLayout}
                    formItems={formItemsTask}
                ></FormProjectTask>
            </ModalProjectTask> */}

            <ModalHandOver
                isModalOpen={isModalHandOverOpen}
                setIsModalOpen={setIsModalHandOverOpen}
                handleOk={handleOverTask}
                handleCancel={handleCancelHandOver}
                title={"Cập nhật phần dự án"}
                form={formHandOver}
            >

                <FormHandOver
                    formName={"formChuyenGiao"}
                    form={formHandOver}
                    formItemLayout={formItemLayout}
                    formItems={formItemsHandOver}
                    initialValues={{
                        project: project && project.id,

                    }}
                ></FormHandOver>

            </ModalHandOver>

            {/* <Drawer
                title={
                    <HeaderChat
                        data={drawerData}
                        onClose={onClose}
                    ></HeaderChat>
                }
                onClose={onClose}
                open={open}
                width={"40%"}
                maskClosable={false}
                loading={false}
                closable={false}
            >
                <Chat></Chat>
            </Drawer> */}


        </>
    );
};

export default ProjectDetail;
