import React, { useState, useEffect } from 'react'
import PageHeader from "@/components/PageHeader";
import { Table, Drawer, Form, Input, Select, Space, Button, Popconfirm, Tag, Avatar, Tooltip } from "antd";
import { Link } from "react-router-dom";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EmptyTemplate from "@/components/emptyTemplate/EmptyTemplate";

import { projectPartArchivedGetAPIWithIdDepartment } from "@/services/ProjectPartService"
import { useAuth } from "@/hooks/use-auth";
import ButtonIcon from "@/components/ButtonIcon";
import { formatDate, getInitials, getRandomColor } from "@/utils/cn"


import { Plus } from "lucide-react"

import TitleTooltip from "@/components/tooltip/TitleTooltip";

// Đường dẫn
const itemsBreadcrumb = [
    {
        title: <Link to="/">Trang chủ</Link>,
    },

    {
        title: "Công việc lưu trữ",
    },
];

const TaskArchive = () => {

    const { auth, employeeContext } = useAuth();

    const [current, setCurrent] = useState(1);
    const [total, setTotal] = useState(0);

    const [projectPartData, setProjectPartData] = useState([]);


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
            end_time: formatDate(task.end_time),
            isCreateTask: task?.responsible_person ? employeeContext.position !== "NV" && task.responsible_person.id === auth.id : false,
            isDoers: task?.responsible_person ? task.doers.some((doer) => doer.id === auth.id) || task.responsible_person.id === auth.id : false,
            isRes: task?.responsible_person ? task.responsible_person.id === auth.id : false,
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

    //láy dự án với id được truyền qua url
    const { data: project_part, isLoading } = useQuery({
        queryKey: ["taskArchive"], // Thêm id vào queryKey để cache riêng biệt
        queryFn: () => projectPartArchivedGetAPIWithIdDepartment(employeeContext.department), // Để React Query tự gọi API khi cần
        enabled: !!employeeContext.department, // Chỉ chạy khi id có giá trị hợp lệ
    });

    const columns = [
        {
            title: "Tên công việc",
            dataIndex: "name",
            key: "name",

            render: (text) => (
                <>
                    <p>{text}</p>
                </>
            ),

            // filters: taskData.map((item) => ({
            //     text: item.name,
            //     value: item.name,
            // })),
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
            dataIndex: "startTime",
            key: "startTime",

            sorter: (a, b) => {
                const dateA = new Date(a.startTime.split("-").reverse().join("-"));
                const dateB = new Date(b.startTime.split("-").reverse().join("-"));
                return dateA - dateB; // Sắp xếp theo số (timestamp)
            },
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "endTime",
            key: "endTime",

            sorter: (a, b) => {
                const dateA = new Date(a.endTime.split("-").reverse().join("-"));
                const dateB = new Date(b.endTime.split("-").reverse().join("-"));
                return dateA - dateB; // Sắp xếp theo số (timestamp)
            },
            // showSorterTooltip: { title: "Sắp xếp theo ngày" }, // Custom tooltip
        },
        // { title: "Mô tả", dataIndex: "description", key: "description" },
        {
            title: "Ưu tiên",
            dataIndex: "priority",
            key: "priority",

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
        },
        // {
        //     title: "File",
        //     dataIndex: "upload",
        //     key: "upload",
        //     width: "10%",
        //     render: (_, record) => (

        //         <>
        //             <Button onClick={() => handleOpen(record)} icon={<UploadOutlined />}>Upload</Button>

        //             {/* <FileUpload></FileUpload>  */}
        //         </>

        //     ),
        // },
        // {
        //     title: "Chức năng",
        //     dataIndex: "action",
        //     key: "action",
        //     width: "17%",
        //     render: (_, record) => (
        //         <Space size="middle">
        //             <Button shape="circle" size="medium" color="gold" variant="solid" onClick={() => showDrawerCheckList(record)} ><File size={18} /></Button>

        //             {/* <ButtonIcon handleEvent={() => handleCreateSubTask(record)}><Plus size={18} /></ButtonIcon> */}

        //         </Space>
        //     ),
        // },
    ];

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

    ];

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

                    </Avatar.Group>
                </>
            ),
        },

    ];

    useEffect(() => {
        console.log("chạy 1 lần");
        console.log("project_part", project_part);
        console.log("employeeContext", employeeContext.department);
        if (project_part) {
            console.log("TaskDepartment", project_part);
            // setProjectdata(project_part)
            const dataFillter = setDataProjectPart(project_part);
            console.log("dataFillterv ", dataFillter);
            setProjectPartData(dataFillter);
        }
    }, [project_part]);



    const expandedRowRender = (part) => (
        <Table
            columns={taskColumns}
            dataSource={part.tasks}
            locale={{
                triggerDesc: "Sắp xếp giảm dần",
                triggerAsc: "Sắp xếp tăng dần",
                cancelSort: "Hủy sắp xếp",
            }}

            pagination={false}
            indentSize={20}
            childrenColumnName={"subtasks"}
        />
    );

    return (
        <>

            <PageHeader title={"Công Việc lưu trữ"} itemsBreadcrumb={itemsBreadcrumb}>

            </PageHeader>

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
                        emptyText: <EmptyTemplate title={"Bạn không có công việc lưu trữ !"} />,
                    }}
                    loading={isLoading}
                />
            </div>

        </>
    )
}

export default TaskArchive