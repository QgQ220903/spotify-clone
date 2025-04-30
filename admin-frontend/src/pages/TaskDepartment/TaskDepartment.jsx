import React, { Children, useEffect, useState } from "react";

import {
    Table,
    Tooltip,
    Badge,
    Popconfirm,
    Space,
    Input,
    Form,
    Select,
    DatePicker,
    Tag,
    Progress,
    Button,
    Avatar,
} from "antd";

import { showToastMessage } from '@/utils/toast'

import PageHeader from "@/components/PageHeader";

import { Link } from "react-router-dom";

import { projectPartGetAPI } from "@/services/ProjectService";

import { projectPartPostAPI, projectPartGetAPIForIdUser, projectPartGetAPIWithIdDepartment } from "@/services/ProjectPartService";

// Employee API
import { employeeGetAllAPI, employeeGetAllAPIWithDepartment } from "@/services/EmployeeService";

import EmptyTemplate from "@/components/emptyTemplate/EmptyTemplate";

import { workHistoriesPostAPI, workHistoriesGetAPI } from "@/services/WorkHistoryService";

// Task API
import { taskPost, taskDelete } from "@/services/TaskService";

import { taskAssignmentsPost, taskAssignmentsPatch } from "@/services/TaskAssignmentsService";

import { departmentTaskPost } from "@/services/DepartmentTaskService";

import { sendEmail } from "@/services/EmailService.";

import { formatDate, getRandomColor, getInitials } from "@/utils/cn";

import { Pencil, Trash2, Plus, MessageCircleMore, Bell, History, File, Pen, ArrowLeftRight, FileCheck2, ArchiveRestore } from "lucide-react";
import ButtonIcon from "@/components/ButtonIcon";

import ModalProjectTask from "@/components/modal/Modal";
// import ModalSendEmail from "@/components/modal/Modal";

import FormProjectTask from "@/components/form/Form";


import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ShowHistory from "@/components/ShowHistory";

import { useAuth } from "@/hooks/use-auth";

import TitleTooltip from "@/components/tooltip/TitleTooltip";

import useWebSocket from "@/services/useWebSocket";

import DrawerFile from "@/pages/TaskDepartment/components/DrawerFile";

import DrawerChatRom from "@/pages/TaskDepartment/components/DrawerChatRom";

import { searchSubtasks, searchSubtasksResponsible_person } from "@/utils/tasks"

import ModalSendEmailForm from "./components/ModalSendEmail";


const itemsBreadcrumb = [{ title: <Link to="/">Trang chủ</Link> }, { title: "Công việc phòng ban" }];

// tùy chỉnh form kích thước input
const formItemLayout = {
    labelCol: {
        span: 9,
    },
    wrapperCol: {
        span: 18,
    },
};



const priorityOrder = {
    "Thấp": 1,
    "Trung Bình": 2,
    "Cao": 3,
};



const { RangePicker } = DatePicker;

const { TextArea } = Input;

const TaskDepartment = () => {


    const taskSocket = useWebSocket("ws://127.0.0.1:8000/ws/tasks/");
    const task_List = useWebSocket("ws://127.0.0.1:8000/ws/task_assignments/");
    const file_list = useWebSocket("ws://127.0.0.1:8000/ws/file-detail/");

    // const { id } = useParams();
    const { auth, employeeContext, features } = useAuth();

    const [isModalHistoryOpen, setIsModalHistoryOpen] = useState(false);

    const [isSubTaskForm, setIsSubTaskForm] = useState(false);

    const [projectPartData, setProjectPartData] = useState([]);

    // const [projectdata, setProjectdata] = useState(null);

    const [historiesData, setHistoriesData] = useState([]);

    // Chứa danh sách nhân viên
    const [employeesData, setEmployeesdata] = useState(null);

    const [projectPartSelect, setProjectPartSelect] = useState(null);

    // const [isModalOpen, setIsModalOpen] = useState(false);

    // const [title, setTitle] = useState("");

    // mở modal thêm task
    const [isModalTaskOpen, setIsModalTaskOpen] = useState(false);

    const [formTask] = Form.useForm();

    const [formSendEmail] = Form.useForm();

    const [roleTaskDepartment,setRoleTaskDepartment] = useState(null);

    const [mode, setMode] = useState("");

    // const [isEmployeeTask, setIsEmployeeTask] = useState(true);

    const queryClient = useQueryClient();


    // Drawer
    const [open, setOpen] = useState(false);

    // Drawer state true fale bật tắt check task
    const [openDrawerCheckList, setOpenDrawerCheckList] = useState(false);


    // set data vào modal check file
    const [taskDataSelectFormTable, setTaskDataSelectFormTable] = useState([]);

    // set data vào modal check file
    const [doersData, setDoersData] = useState([]);

    // set data vào modal con check file
    const [doerSelected, setDoerSelected] = useState([]);

    const [childrenDrawer, setChildrenDrawer] = useState(false);

    const showDrawer = (record) => {
        console.log(record);

        setTaskDataSelectFormTable(record);

        setOpen(true);
    };

    useEffect(() => {
        if (file_list) {
            //    sửa lý sau
        }
    }, [file_list])

    //  open modal file
    const showDrawerCheckList = (record) => {
        console.log("record.subtasks", record);
        setTaskDataSelectFormTable(record);

        if (record?.subtasks !== undefined) {
            setDoersData(record.subtasks);
        } else {
            setDoersData(
                record.doers.map((doer) => ({
                    key: doer.id,
                    isDone: doer.status === "DONE",
                    ...doer,
                }))
            );
        }

        console.log("show file check list", doersData);
        setOpenDrawerCheckList(true);
    };


    //láy dự án với id được truyền qua url
    const { data: project_part, isLoading } = useQuery({
        queryKey: ["taskDepartment"], // Thêm id vào queryKey để cache riêng biệt
        queryFn: () => projectPartGetAPIWithIdDepartment(employeeContext.department), // Để React Query tự gọi API khi cần
        enabled: !!employeeContext.department, // Chỉ chạy khi id có giá trị hợp lệ
    });

    const { data: workHistories, isLoading: historyLoading } = useQuery({
        queryKey: ["workHistories"], // Thêm id vào queryKey để cache riêng biệt
        queryFn: workHistoriesGetAPI, // Để React Query tự gọi API khi cần

    });


    console.log("project part soc ket", project_part);
    // Thêm 1 công việc vào dự án
    const { mutateAsync: mutateTask, isLoading: addLoading } = useMutation({
        mutationFn: taskPost,
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["taskDepartment"],
            });
            console.log("mutateTask", data);
            showToastMessage('Thêm công việc vào dự án thành công !', 'success', 'top-right')

            mutateHistory({
                task: data.id,
                updated_date: data.created_at,
                content: "Tạo công việc mới",
            });
        }, onError: (error) => {
            console.log("mutateTask", error);
            showToastMessage('Thêm công việc vào dự án thất bại !', 'error', 'top-right')
        },
    });

    const { mutateAsync: mutateDeleteTask, isLoading: deleteLoading } = useMutation({
        mutationFn: ({ isDelete, id }) => taskDelete(isDelete, id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["taskDepartment"],
            });
            showToastMessage('Lưu trữ công việc thành công !', 'success', 'top-right')
        }, onError: (error) => {
            console.log("mutateTask", error);
            showToastMessage('Lưu trữ công việc thất bại !', 'error', 'top-right')
        },
    });

    // thêm lịch sử
    const { mutateAsync: mutateHistory, isLoading: historyPostLoading } = useMutation({
        mutationFn: workHistoriesPostAPI,
        onSuccess: () => {
            console.log("mutateHistory thành công");
        },
    });

    // Thêm 1 nhân viên vào công việc
    const {
        data: newTaskAssignments,
        mutate: mutateTaskAssignment,
        isLoading: addTaskAssLoading,
    } = useMutation({
        mutationFn: taskAssignmentsPost,
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["taskDepartment"], // Chỉ refetch đúng project có id đó
            });
            console.log("newTaskAssignments", data);
            mutateHistory({
                task: data.task_details.id,
                updated_date: data.task_details.created_at,
                content: `Thêm ${data.employee_details.name} vào ${data.task_details.name} với vai trò ${data.role === "DOER" ? "thực hiện" : "chịu trách nghiệm"}`,
            });

            setTimeout(() => {
                // Code bạn muốn chạy sau 5s
                sendEmail({
                    recipient: data.employee_details.email,
                    subject: "Thông báo công việc mới",
                    // message: `Thêm ${data.employee_details.name} vào ${data.task_details.name} với vai trò ${data.role === "DOER" ? "thực hiện" : "chịu trách nghiệm"}`,
                    message: `
                            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
                        <tr>
                            <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <!-- Header -->
                                <tr>
                                <td style="padding: 30px; text-align: center; background-color: #4a6fa5; border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff;">THÔNG BÁO PHÂN CÔNG CÔNG VIỆC</h1>
                                </td>
                                </tr>
                    
                                <!-- Content -->
                                <tr>
                                <td style="padding: 30px;">
                                    <h2 style="margin-top: 0; color: #4a6fa5;">Gửi đến Anh/Chị: ${data.employee_details.name},</h2>
                                    <p style="line-height: 1.6;">
                                    Căn cứ vào nhu cầu công việc hiện tại, Ban quản lý đã phân công công việc sau cho Anh/Chị:
                                    </p>
                    
                                    <table width="100%" cellpadding="10" cellspacing="0" style="margin: 20px 0; border: 1px solid #ddd; border-collapse: collapse;">
                                    <tr style="background-color: #f0f0f0;">
                                        <td style="border: 1px solid #ddd; font-weight: bold;">Tên công việc</td>
                                        <td style="border: 1px solid #ddd;">${data.task_details.name}</td>
                                    </tr>
                                    <tr style="background-color: #f0f0f0;">
                                        <td style="border: 1px solid #ddd; font-weight: bold;">Vai trò</td>
                                        <td style="border: 1px solid #ddd;">${data.role === "DOER" ? "thực hiện" : "chịu trách nghiệm"}</td>
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #ddd; font-weight: bold;">Mô tả</td>
                                        <td style="border: 1px solid #ddd;">${data.task_details.description}</td>
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #ddd; font-weight: bold;">Ngày bắt đầu</td>
                                        <td style="border: 1px solid #ddd;">${formatDate(data.task_details.start_time)}</td>
                                    </tr>
                                    <tr style="background-color: #f0f0f0;">
                                        <td style="border: 1px solid #ddd; font-weight: bold;">Hạn hoàn thành</td>
                                        <td style="border: 1px solid #ddd;">${formatDate(data.task_details.end_time)}</td>
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
                    send_at: null,
                });
            }, 5000); // 5000ms = 5s

            setTimeout(() => {
                sendEmail({
                    recipient: data.employee_details.email,
                    subject: "Nhắc nhỡ công việc",
                    message: `
                        <div style={{
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '600px',
                margin: '20px auto',
                border: '1px solid #ffeeba',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{ color: '#856404' }}>Nhắc nhỡ: Công việc sắp đến hạn !, Bạn đã hoàn thành chưa ?</h2>
                <p>Kính gửi Anh/Chị <strong>${data.employee_details.name}</strong>,</p>
                <p>
                Công việc sau đây đang sắp đến hạn hoàn thành 
                </p>
        
                <table width="100%" cellPadding="10" style={{ borderCollapse: 'collapse', marginTop: '15px' }}>
                <tbody>
                    <tr style={{ backgroundColor: '#ffeeba' }}>
                    <td style={{ border: '1px solid #dee2e6', fontWeight: 'bold' }}>Tên công việc</td>
                    <td style={{ border: '1px solid #dee2e6' }}>${data.task_details.name}</td>
                    </tr>
                    <tr>
                    <td style={{ border: '1px solid #dee2e6', fontWeight: 'bold' }}>Ngày bắt đầu</td>
                    <td style={{ border: '1px solid #dee2e6' }}>${formatDate(data.task_details.start_time)}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#ffeeba' }}>
                    <td style={{ border: '1px solid #dee2e6', fontWeight: 'bold' }}>Hạn hoàn thành</td>
                    <td style={{ border: '1px solid #dee2e6', color: '#dc3545', fontWeight: 'bold' }}>${formatDate(data.task_details.end_time)}</td>
                    </tr>
                </tbody>
                </table>
        
                <p style={{ marginTop: '20px' }}>
                Bạn đã hoàn thành công việc chưa ? Nếu chưa hãy bắt tay vào làm hoặc liên hệ với người quản lý để được hỗ trợ.
                </p>
        
        
                <p style={{ fontSize: '12px', marginTop: '30px', textAlign: 'center', color: '#6c757d' }}>
                © 2025 TQT - Mọi quyền được bảo lưu.
                </p>
            </div>
                        
                        `,
                    send_at: new Date(new Date(data.task_details.end_time).getTime() - 24 * 60 * 60 * 1000).toISOString(),
                });
                console.log("Chạy sau 10 giây");
            }, 10000); // 5000ms = 5s
        },
    });

    // // sửa 1 thông tin
    // const { mutate: mutatePatchTaskAssignment, isLoading: addPatchtaskAssLoading } = useMutation({
    //     mutationFn: ({ id, obj, status }) => taskAssignmentsPatch(id, obj, status),
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({
    //             queryKey: ["taskDepartment"], // Chỉ refetch đúng project có id đó
    //         });
    //         console.log("mutatePatchTaskAssignment thành công");
    //     },
    //     onError: (error) => {
    //         console.log("mutatePatchTaskAssignment thất bại", error);
    //     },
    // });

    //lấy ds nv
    const { data: employees } = useQuery({
        queryKey: ["employees"],
        queryFn: () => employeeGetAllAPIWithDepartment(auth?.employee?.department),
        enabled: !!auth?.employee?.department,
    });

    const setDataProjectPart = (data) => {
        const dataNew = data.map((part) => ({
            key: part.id,
            name: part.name,
            created_at: formatDate(part.created_at),
            updated_at: formatDate(part.updated_at),
            department_name: part.department.name,
            department_manager: part.department.manager ? part.department.manager : "",
            tasks: part.tasks ? part.tasks.map((item) => setDataTask(item)) : [],
            // isCreateProjectPart: employeeContext.position === "TP"
        }));

        return dataNew;
    };

    const setDataTask = (task) => {
        const taskData = {
            ...task,

            priority: task.priority === 0 ? "Thấp" : task.priority === 1 ? "Trung Bình" : "Cao",
            key: "task" + task.id,
            created_at: formatDate(task.created_at),
            start_time: formatDate(task.start_time),
            end_time: formatDate(task.end_time),
            // isCreateTask: task?.responsible_person ? employeeContext.position !== "NV" && task.responsible_person.id === employeeContext.id : false,
            isDoers: task.doers.some((doer) => doer.id === employeeContext.id) || task.responsible_person.id === employeeContext.id,
            isRes: task?.responsible_person ? task.responsible_person.id === employeeContext.id : false,
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
        console.log("features",features)
        if (features) {
            const featureTaskDeparment = features.find((item) => item.feature.name === "Quản lý công việc phòng ban");
            setRoleTaskDepartment(featureTaskDeparment);
            console.log("roleTaskDepartment", roleTaskDepartment);

        }
    }, [features]);

    // Lấy dự liệu vào bảng cha
    useEffect(() => {
        console.log("chạy 1 lần");
        console.log("chạy 1 lần features",features);
        
        console.log("project_part", project_part);
        console.log("employeeContext", employeeContext.department);
        if (project_part) {
            console.log("TaskDepartment", project_part);
            // setProjectdata(project_part)
            const dataFillter = setDataProjectPart(project_part?.results);
            console.log("dataFillterv ", dataFillter);
            setProjectPartData(dataFillter);
        }
    }, [project_part]);

    useEffect(() => {
        if (employees) {
            setEmployeesdata(employees);
        }
    }, [employees]);

    useEffect(() => {
        if (workHistories) {
            setHistoriesData(workHistories);
        }
    }, [workHistories]);

    useEffect(() => {
        if (projectPartSelect) {
            console.log(projectPartSelect);
            formTask.setFieldsValue(projectPartSelect);
        }
    }, [formTask, projectPartSelect]);

    useEffect(() => {
        console.log("socket");
        (task_List !== null || taskSocket !== null) && queryClient.invalidateQueries(["taskDepartment"]);

        // console.log("project_part socket", project_part)
    }, [task_List, taskSocket, queryClient]);



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
                            <Avatar
                                // style={{ backgroundColor: getRandomColor() }}
                                className="bg-blue-500"
                            >
                                {getInitials(value.name)}
                            </Avatar>
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
                    <ButtonIcon handleEvent={() => handleCreateProjectTask(record)}>
                        <Plus></Plus> Công việc
                    </ButtonIcon>
                </Space>
            ),
            hidden: (!roleTaskDepartment?.can_create || employeeContext.position !== "TP") 
        },
    ];

    // hàm show modal hisotry
    const showHistoryModal = (record) => {
        console.log("showHistoryModal", record);
        setTaskDataSelectFormTable(record);
        setIsModalHistoryOpen(true);
    };

    // // Hàm tìm kiếm theo key theo valuee
    // const searchSubtasks = (subtasks, value, key) => {
    //     return subtasks.some((subtask) => {
    //         // Kiểm tra trường key có trong subtask và có chứa giá trị tìm kiếm
    //         if (subtask[key] && subtask[key].toLowerCase().includes(value.toLowerCase())) {
    //             return true;
    //         }

    //         // Nếu có các subtasks con, tiếp tục tìm kiếm đệ quy
    //         if (subtask.subtasks && Array.isArray(subtask.subtasks)) {
    //             return searchSubtasks(subtask.subtasks, value, key); // Đệ quy vào subtasks con
    //         }

    //         return false;
    //     });
    // };

    // // Hàm tìm kiếm respone theo valuee
    // const searchSubtasksResponsible_person = (subtasks, value) => {
    //     return subtasks.some((subtask) => {
    //         // Kiểm tra trường key có trong subtask và có chứa giá trị tìm kiếm
    //         if (subtask.responsible_person && subtask.responsible_person.name.toLowerCase().includes(value.toLowerCase())) {
    //             return true;
    //         }

    //         // Nếu có các subtasks con, tiếp tục tìm kiếm đệ quy
    //         if (subtask.subtasks && Array.isArray(subtask.subtasks)) {
    //             return searchSubtasksResponsible_person(subtask.subtasks, value); // Đệ quy vào subtasks con
    //         }

    //         return false;
    //     });
    // };
    const [isModalSendEmailOpen, setIsModalSendEmailOpen] = useState(false);

    const handleShowSendEmail = (record) => {
        setTaskDataSelectFormTable(record);
        console.log("handleShowSendEmail record", record);
        setIsModalSendEmailOpen(true);
    }

    // const handleCancelSendEmail = () => {
    //     setIsModalSendEmailOpen(false);
    // }

    const handleArchiveTask = (record) => {
        console.log("handleArchiveTask", record)
        mutateDeleteTask({ isDelete: true, id: record.id })
    }
    // Cấu hình cột TASKS
    const taskColumns = [
        {
            title: "Tên công việc",
            dataIndex: "name",
            key: "name",
            width: "20%",
            render: (text, record) => (
                <>
                    <a>{text}</a>
                    <Progress percent={record.completion_percentage} />
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

            onFilter: (value, record) => {
                // Tìm kiếm theo name và các thuộc tính khác trong subtasks (ví dụ: created_at, description)
                return record.name.toLowerCase().includes(value.toLowerCase()) || (record.subtasks && searchSubtasks(record.subtasks, value, "name"));
            },
            filterSearch: true,
        },
        {
            title: "Ngày bắt đầu",
            dataIndex: "start_time",
            key: "start_time",
            width: "11%",
            sorter: (a, b) => {
                const dateA = new Date(a.start_time.split("-").reverse().join("-"));
                const dateB = new Date(b.start_time.split("-").reverse().join("-"));
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
            width: "10%",
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
                            <Avatar
                                // style={{ backgroundColor: getRandomColor() }} 
                                className="bg-blue-500"
                            >
                                {getInitials(value.name)}
                            </Avatar>
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

            // onFilter: (value, record) => record.responsible_person.name.toLowerCase().includes(value.toLowerCase()), // So sánh không phân biệt hoa/thường
            onFilter: (value, record) => {
                // Kiểm tra nếu responsible_person tồn tại và tìm kiếm trong các thuộc tính (name, position, email)
                const responsiblePerson = record.responsible_person;
                return (
                    (responsiblePerson && responsiblePerson.name.toLowerCase().includes(value.toLowerCase())) ||
                    (record.subtasks && searchSubtasksResponsible_person(record.subtasks, value, "responsible_person"))
                ); // Tìm kiếm trong subtasks nếu có
            },
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
                        <Link>
                            <Avatar icon={<Plus></Plus>} ></Avatar>
                        </Link>
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
                    {(record.isRes && roleTaskDepartment.can_create) && (
                        <>
                            <Button
                                shape="circle"
                                size="medium"
                                type="primary"
                                onClick={() => handleCreateSubTask(record)}
                            >
                                <Plus size={18} />
                            </Button>
                        </>
                    )}

                    {record.isRes && (
                        <>
                            <Button
                                shape="circle"
                                size="medium"
                                color="pink"
                                variant="solid"
                                onClick={() => handleShowSendEmail(record)}
                            >
                                <Bell size={18} />
                            </Button>

                            <Button
                                shape="circle"
                                size="medium"
                                color="gold"
                                variant="solid"
                                onClick={() => showDrawerCheckList(record)}
                            >
                                <File size={18} />
                            </Button>

                            {/* <Button
                                shape="circle"
                                size="medium"
                                color="purple"
                                variant="solid"
                            >
                                <Pen size={18} />
                            </Button> */}

                            {/* <Button
                                shape="circle"
                                size="medium"
                                color="lime"
                                variant="solid"
                            >
                                <ArrowLeftRight size={18} />
                            </Button> */}
                        </>
                    )}

                    {(record.isDoers || roleTaskDepartment.can_create) && (
                        <>
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
                                color="volcano"
                                variant="solid"
                                onClick={() => showHistoryModal(record)}
                            >
                                <History size={18} />
                            </Button>
                        </>
                    )}

                    {(record.completion_percentage === 100 && roleTaskDepartment.can_delete) && (
                        <>
                            <Popconfirm
                                title="Lưu trữ dự án?"
                                onConfirm={() => handleArchiveTask(record)}
                                okText="Có"
                                cancelText="Không"
                                description="Bạn đã chắc chắn lưu trữ dự án này ?"
                            >
                                <Button
                                    shape="circle"
                                    size="medium"
                                    color="green"
                                    variant="solid"
                                // onClick={()=>handleArchiveTask(record)}


                                >
                                    <ArchiveRestore size={18} />
                                </Button>
                            </Popconfirm>


                        </>)

                    }
                </Space>
            ),
        },
    ];

    // Form items thêm task
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
                    placeholder="Chọn người chịu trách nhiệm"
                    optionFilterProp="label"

                    options={employeesData?.map((item) => ({
                        value: item.id,
                        label: `${item.name} - ${item.position === "TP" ? "Trưởng phòng" : item.position === "TN" ? "Trưởng nhóm" : "Nhân viên"}`,
                    }))}
                />
            ),
            // props: { disabled: !isEmployeeTask },
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
                    placeholder="Chọn người thực hiện"

                    options={employeesData
                        ?.filter((item) => item.position !== "TP") // Lọc bỏ Trưởng phòng
                        .map((item) => ({
                            value: item.id,
                            label: `${item.name} - ${item.position === "TN" ? "Trưởng nhóm" : "Nhân viên"}`,
                        }))}
                />
            ),
            // props: { disabled: !isEmployeeTask },
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
                    onChange={(date, dateString) => console.log("onChange", date, dateString)}
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

    const formItemsSendEmail = [
        {
            name: "content",
            label: "",
            component: <TextArea rows={10} placeholder="nhập tin nhắn!" />,
            // props: { readOnly: true },

        },

    ]




    const handleCancelTask = () => {
        setIsModalTaskOpen(false);
    };

    // hàm mở modal tạo tạo task mới
    const handleCreateProjectTask = (value) => {
        setIsSubTaskForm(false);
        setEmployeesdata(employees);
        formTask.resetFields();
        console.log("handleCreateProjectTask", value);
        value &&
            setProjectPartSelect({
                projectPart: value.key,
            });
        console.log("projectPartSelect", projectPartSelect);
        setMode("Add");
        showModalTask();
    };

    // hàm  mở modal tạo task con
    const handleCreateSubTask = (value) => {
        setIsSubTaskForm(true);
        setEmployeesdata(value.doers);
        formTask.resetFields();
        console.log("handleCreateSubTask", value);
        value &&
            setProjectPartSelect({
                projectPart: value.project_part,
                task: value.id,
            });
        console.log("projectPartSelect", projectPartSelect);
        setMode("Add");
        showModalTask();
    };


    const showModalTask = () => {
        setIsModalTaskOpen(true);
    };

    // Thêm Công việc mới
    const handleOkTask = async () => {
        try {

            const values = await formTask.validateFields();
            values.date = values.date?.map((d) => d.format("YYYY-MM-DDThh:mm"));
            console.log("Validated Values:", values);

            const valueNew = {
                name: values.nameTask,
                description: values.desTask,
                priority: values.Priority,
                start_time: values.date?.[0] || null,
                end_time: values.date?.[1] || null,
                task_status: "IN_PROGRESS",
                completion_percentage: "0",
                is_deleted: false,
                project_part: values.projectPart,
                parent_task: isSubTaskForm ? values.task : null,
            };

            // await createTask(values, valueNew, isSubTaskForm);
            const dataTask = await mutateTask(valueNew);
            console.log("dataTask", dataTask);
            if (values.resEmployee) {
                mutateTaskAssignment({
                    employee: values.resEmployee,
                    role: "RESPONSIBLE",
                    task: dataTask.id,
                });
            }
            if (values.WorksEmployee?.length > 0) {
                await Promise.all(
                    values.WorksEmployee.map((employee) =>
                        mutateTaskAssignment({
                            employee: employee,
                            role: "DOER",
                            task: dataTask.id,
                        }),
                    ),
                );
            }

            setIsModalTaskOpen(false);
        } catch (error) {
            console.error("Validation Failed:", error);
        }
    };


    function hasAssignmentInTask(task, assignmentId) {
        // 1. Kiểm tra ngay trong doers của task hiện tại
        if (task.doers?.some(doer => doer.id_assignment === assignmentId)) {
            return true;
        }

        // 2. Nếu có subtasks, lặp đệ quy xuống từng subtask
        if (task.subtasks) {
            for (const sub of task.subtasks) {
                if (hasAssignmentInTask(sub, assignmentId)) {
                    return true;
                }
            }
        }

        // 3. Nếu không tìm thấy ở đâu, trả về false
        return false;
    }

    // hàm đóng modal history
    const handleCancelSelctTask = () => {
        setIsModalHistoryOpen(false);
        setTaskDataSelectFormTable([]);
    };


    const expandedRowRender = (part) => (
        <Table
            columns={taskColumns}
            dataSource={part.tasks}
            locale={{
                triggerDesc: "Sắp xếp giảm dần",
                triggerAsc: "Sắp xếp tăng dần",
                cancelSort: "Hủy sắp xếp",
            }}
            loading={addLoading && addTaskAssLoading}
            pagination={false}
            indentSize={20}
            childrenColumnName={"subtasks"}
        />
    );

    return (
        <>
            {/* <div>{projectPartData && JSON.stringify(projectPartData)}</div> */}
            <PageHeader
                title={"Công Việc Phòng Ban"}
                itemsBreadcrumb={itemsBreadcrumb}
            ></PageHeader>

            <div className="mt-5">
                {/* TABLE SHOW DATA */}
                <Table
                    columns={partColumns}
                    dataSource={projectPartData}
                    // rowKey={(record) => getRowKey("part", record.id)}
                    expandable={{
                        expandedRowRender: (part) => expandedRowRender(part),
                        rowExpandable: (record) => record.tasks.length > 0,
                    }}
                    pagination={false}
                    locale={{
                        triggerDesc: "Sắp xếp giảm dần",
                        triggerAsc: "Sắp xếp tăng dần",
                        cancelSort: "Hủy sắp xếp",
                        emptyText: <EmptyTemplate title={"Bạn không có phần dự án nào được giao !"} />,
                    }}
                    loading={isLoading}
                />
            </div>

            {/* ModalProjectTask  */}
            <ModalProjectTask
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
            </ModalProjectTask>

            {/* Modal show send email */}
            {/* <ModalSendEmail
                isModalOpen={isModalSendEmailOpen}
                setIsModalOpen={setIsModalSendEmailOpen}
                // handleOk={handleOkTask}
                handleCancel={handleCancelSendEmail}
                title={"Gửi Email"}
                form={formSendEmail}
            >
                <FormSendEmail
                    formName={"formSendEmail" + mode}
                    form={formSendEmail}

                    formItems={formItemsSendEmail}
                ></FormSendEmail>
            </ModalSendEmail> */}
            <ModalSendEmailForm
                 isModalSendEmailOpen = {isModalSendEmailOpen}
                 setIsModalSendEmailOpen = {setIsModalSendEmailOpen}
                 formSendEmail = {formSendEmail}
                 mode = {mode}
                 record={taskDataSelectFormTable}
                 setTaskDataSelectFormTable = {setTaskDataSelectFormTable}
            
            />

            {/* Drawer chatroom */}
            <DrawerChatRom
                taskDataSelectFormTable={taskDataSelectFormTable}
                setTaskDataSelectFormTable={setTaskDataSelectFormTable}
                open={open}
                setOpen={setOpen}
                employeeContext={employeeContext}
            />


            {/* Drawr check list File */}
            {<DrawerFile
                taskDataSelectFormTable={taskDataSelectFormTable}
                setTaskDataSelectFormTable={setTaskDataSelectFormTable}
                queryClient={queryClient}
                doersData={doersData}
                file_list={file_list}
                setDoersData={setDoersData}
                doerSelected={doerSelected}
                setDoerSelected={setDoerSelected}
                childrenDrawer={childrenDrawer}
                openDrawerCheckList={openDrawerCheckList}
                setChildrenDrawer={setChildrenDrawer}
                setOpenDrawerCheckList={setOpenDrawerCheckList}
            />}


            {/* Modal lịch sử */}
            {<ShowHistory
                handleCancel={handleCancelSelctTask}
                isModalOpen={isModalHistoryOpen}
                setIsModalOpen={setIsModalHistoryOpen}
                items={historiesData?.filter((item) => item.task.id === taskDataSelectFormTable.id)}
            ></ShowHistory>}
        </>
    );
};

export default TaskDepartment;
