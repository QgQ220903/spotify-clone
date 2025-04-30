import React, { useEffect, useState, useRef } from 'react'
// import ModalAccount from "@/components/modal/Modal";
import ModalUpload from "@/components/modal/Modal";


import PageHeader from "@/components/PageHeader";
import ButtonIcon from "@/components/ButtonIcon";
import { Flex, Table, Tooltip, Badge, Popconfirm, Space, Input, Select, DatePicker, Tag, Progress, Avatar, Drawer, Col, Row, Switch, Modal } from "antd";

import EmptyTemplate from "@/components/emptyTemplate/EmptyTemplate";

import { Link } from 'react-router-dom'
import { showToastMessage } from '@/utils/toast'
import { Pencil, Trash2, Plus, File } from "lucide-react";



import { CalendarSchedule } from "@/components/CalendarSchedule";

import { UploadOutlined, SearchOutlined, InboxOutlined } from "@ant-design/icons";

import { Button, message, Upload } from "antd";
import { taskGetWithId } from "@/services/TaskService";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, getRandomColor, getInitials } from "@/utils/cn";
import TitleTooltip from "@/components/tooltip/TitleTooltip";

import { fileAssignmentPostAPI } from '@/services/FileService';

import { FileCard } from "@/components/FileCard"

import useWebSocket from "@/services/useWebSocket";




const { Dragger } = Upload;

const getAccessToken = () => localStorage.getItem("access");

const itemsBreadcrumb = [{ title: <Link to="/">Trang chủ</Link> }, { title: "Công việc" }];

const Task = () => {
    const taskSocket = useWebSocket("ws://127.0.0.1:8000/ws/tasks/");
    const [fileList, setFileList] = useState([]);

    const calendarRef = useRef(null);

    const { auth, employeeContext } = useAuth();

    const queryClient = useQueryClient();

    const [current, setCurrent] = useState(1)

    const [total, setTotal] = useState(0)

    const [taskData, setTaskData] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isModalCalendarOpen, setIsModalCalendarOpen] = useState(false);


    const [taskSelectData, setTaskSelectData] = useState([]);

    const [openDrawerCheckList, setOpenDrawerCheckList] = useState(false);

    const props = {
        name: 'link',
        action: 'http://localhost:8000/api/files/',
        data: (file) => ({
            name: file.name,  // Gửi tên file
        }),
        fileList: fileList,
        multiple: true,
        onChange(info) {
            let newFileList = [...info.fileList];

            if (info.file.status === 'done') {
                message.success(`${info.file.name} tải file lên thành công!.`);
                // newFileList = newFileList.filter(file => file.status !== 'done'); // Xóa file đã upload xong

            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }

            setFileList(newFileList);

        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },



    };

    //láy dự án với id được truyền qua url
    const { data: tasks, isLoading } = useQuery({
        queryKey: ["tasks"], // Thêm id vào queryKey để cache riêng biệt
        queryFn: () => taskGetWithId(employeeContext?.id), // Để React Query tự gọi API khi cần
        enabled: !!employeeContext?.id, // Chỉ chạy khi id có giá trị hợp lệ
    });
    useEffect(() => {
        if (taskSocket) {
            console.log("test1");
            queryClient.invalidateQueries(["tasks"]);
        }
    }, [taskSocket, queryClient]);

    const { mutate: addFileAssignment, isLoading: isAdding } = useMutation({
        mutationFn: fileAssignmentPostAPI,
        onSuccess: () => {
            queryClient.invalidateQueries(["tasks"]); // Fetch lại danh sách mà không cần current
            showToastMessage('Lưu file thành công !', 'success', 'top-right')
            setFileList([]);
            setIsModalOpen(false);
        },
        onError: (error) => {
            showToastMessage('Lưu file thất bại !', 'error', 'top-right')
            console.log(error)
        },
    });





    useEffect(() => {
        if (isModalCalendarOpen && calendarRef.current) {
            setTimeout(() => {
                calendarRef.current.getApi().updateSize();
            }, 1); // Chờ modal render xong rồi mới resize lịch
        }
    }, [isModalCalendarOpen]);


    useEffect(() => {
        console.log("employeeContext", employeeContext);
        console.log("Task", tasks);
        if (tasks && tasks.data) {
            const results = tasks.data.map((item) => ({
                ...item,
                priority: item.priority === 0 ? "Thấp" : item.priority === 1 ? "Trung Bình" : "Cao",
                key: item.id,
                startTime: formatDate(item.start_time),
                endTime: formatDate(item.end_time),
            }));
            setTaskData(results);
            setTotal(tasks.count);
            console.log("taskData", taskData);
        }
    }, [tasks]);

    const priorityOrder = {
        Thấp: 1,
        "Trung Bình": 2,
        "Cao": 3
    };

    const showDrawerCheckList = (record) => {
        console.log("record.subtasks", record)
        setTaskSelectData(record);
        setOpenDrawerCheckList(true);
    }

    const onCloseDrawerCheckList = () => {
        setOpenDrawerCheckList(false);
    }


    const columns = [
        {
            title: "Tên công việc",
            dataIndex: "name",
            key: "name",
            width: "20%",
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
            width: "11%",
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
            width: "11%",
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
                    // <Avatar.Group>
                    //     <Tooltip
                    //         placement="topRight"
                    //         title={
                    //             <TitleTooltip
                    //                 name={value.name}
                    //                 position={value.position}
                    //                 email={value.email}
                    //             ></TitleTooltip>
                    //         }
                    //     >
                    //         <Avatar className="bg-blue-500">{getInitials(value.name)}</Avatar>
                    //     </Tooltip>
                    // </Avatar.Group>
                    <Tag color='blue'>{value.name}</Tag>
                ),
        },
        {
            title: "File",
            dataIndex: "upload",
            key: "upload",
            width: "10%",
            render: (_, record) => (

                <>
                    <Button onClick={() => handleOpen(record)} icon={<UploadOutlined />}>Upload</Button>

                    {/* <FileUpload></FileUpload>  */}
                </>

            ),
        },
        {
            title: "Chức năng",
            dataIndex: "action",
            key: "action",
            width: "17%",
            render: (_, record) => (
                <Space size="middle">
                    <Button shape="circle" size="medium" color="gold" variant="solid" onClick={() => showDrawerCheckList(record)} ><File size={18} /></Button>

                    {/* <ButtonIcon handleEvent={() => handleCreateSubTask(record)}><Plus size={18} /></ButtonIcon> */}

                </Space>
            ),
        },
    ];



    const onChange = page => {
        console.log(page);
        setCurrent(page);
    };

    const handleOpen = (record) => {
        setTaskSelectData(record);
        console.log("record", record);
        setIsModalOpen(true);
    };

    const handleUpload = () => {

        if (taskSelectData) {
            const task_assignment_id = taskSelectData.assignment_id;

            if (fileList) {
                fileList.map((file) => {
                    addFileAssignment({
                        task_assignment_id: task_assignment_id,
                        file_id: file.response.id,
                    });
                });
            }
        }
        console.log("upload", fileList)
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    }

    const handleCalendarCancel = () => {
        setIsModalCalendarOpen(false)
    }

    return (
        <>
            <PageHeader title={"Công Việc"} itemsBreadcrumb={itemsBreadcrumb}>
                <ButtonIcon handleEvent={() => setIsModalCalendarOpen(true)}>
                    <Plus /> Xem lịch biểu
                </ButtonIcon>
            </PageHeader>




            <Modal
                title={"Lịch biểu công việc"}
                open={isModalCalendarOpen}
                footer={null} // hoặc true nếu bạn có custom footer
                onCancel={handleCalendarCancel}
                width={'50%'}

            >
                <CalendarSchedule
                    calendarRef={calendarRef}
                    // thêm dòng này để tránh bị thu nhỏ
                    events={taskData.map((task) => ({
                        title: task.name,
                        start: task.start_time,
                        end: task.end_time,
                    }))}
                />
            </Modal>

            <div className="mt-5">

                <Table
                    columns={columns}
                    dataSource={taskData}
                    loading={isLoading}
                    // pagination={{ total, defaultCurrent: current, pageSize: 10 }}
                    pagination={{
                        total: total,
                        defaultCurrent: current,
                        pageSize: 5, // Mặc định 10 dòng mỗi trang
                        onChange: onChange,
                    }}
                    locale={{
                        triggerDesc: "Sắp xếp giảm dần",
                        triggerAsc: "Sắp xếp tăng dần",
                        cancelSort: "Hủy sắp xếp",
                        emptyText:
                            <EmptyTemplate title={'Bạn không có công việc nào được giao!'} />
                    }}
                />
            </div>

            <ModalUpload
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                handleOk={handleUpload}
                handleCancel={handleCancel}
                title={"Tải file"}
            >
                <Dragger
                    {...props}


                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
                    </p>
                </Dragger>
                {/* <FileUpload></FileUpload> */}
            </ModalUpload>

            <Drawer
                // title={''}
                title={`File của ${taskSelectData ? taskSelectData.name : ''}`}
                onClose={onCloseDrawerCheckList}
                open={openDrawerCheckList}
                width={'40%'}
                maskClosable={false}
                loading={false}
                closable={true}
            >
                <Flex gap={'middle'} wrap>
                    {taskSelectData.files && taskSelectData.files.map((file, index) => (
                        <div key={index} className={'w-32'}><FileCard file={file} /></div>
                    ))}
                </Flex>
            </Drawer>


        </>
    );
};

export default Task;
