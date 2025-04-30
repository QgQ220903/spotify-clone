import React, { useState, useEffect } from 'react'

import { Drawer, Table, Flex, Switch, Space, Button, Tag, Input } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { HeaderChat } from '@/components/chatRoom/Chat'
import { FileCheck2 } from 'lucide-react'
import { FileCard } from "@/components/FileCard";
import { taskAssignmentsPost, taskAssignmentsPatch } from "@/services/TaskAssignmentsService";

import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const DrawerFile = ({ taskDataSelectFormTable, setTaskDataSelectFormTable, setDoersData, setDoerSelected, setChildrenDrawer, queryClient,
    doersData, doerSelected, childrenDrawer, openDrawerCheckList, setOpenDrawerCheckList, file_list }) => {

    const [recordData, setRecordData] = useState(null);

    useEffect(() => {



        // Cập nhật doerSelected nếu có file mới
        if (file_list) {
            console.log("file_list", file_list)
            const isFile = hasAssignmentId(recordData, file_list.file_detail.task_assignment.id)
            console.log("file_list hasAssignmentId", isFile)
            if (!recordData.subtasks || recordData.subtasks.length === 0) {
                if (recordData.id_assignment === file_list.file_detail.task_assignment.id) {
                    setDoerSelected(prevData => {
                        return {
                            ...prevData, // Giữ nguyên dữ liệu cũ
                            files: [
                                ...prevData.files,
                                {
                                    ...file_list.file_detail.file,
                                    link: `http://127.0.0.1:8000${file_list.file_detail.file.link}` // Thêm "http" vào link
                                }
                            ] // Thêm file vào mảng files
                        };
                    });
                }
            } else if (isFile) {
                setDoerSelected(prevData => {
                    return {
                        ...prevData, // Giữ nguyên dữ liệu cũ
                        files: [
                            ...prevData.files,
                            {
                                ...file_list.file_detail.file,
                                link: `http://127.0.0.1:8000${file_list.file_detail.file.link}` // Thêm "http" vào link
                            }
                        ] // Thêm file vào mảng files
                    };
                });
            }


        }


        ;
    }, [file_list]);

    // sửa 1 thông tin
    const { mutate: mutatePatchTaskAssignment, isLoading: addPatchtaskAssLoading } = useMutation({
        mutationFn: ({ id, obj, status }) => taskAssignmentsPatch(id, obj, status),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["taskDepartment"], // Chỉ refetch đúng project có id đó
            });
        },
        onError: (error) => {
            console.log("mutatePatchTaskAssignment thất bại", error);
        },
    });

    //Hàm thay đổi trạng thái
    const onChangeCheckBox = (checked, record) => {
        console.log(`switch to ${checked}`);
        console.log(record);
        try {
            const data = {
                employee: record.id,
                task: taskDataSelectFormTable.id,
            };
            console.log("data", data);
            if (checked) {
                mutatePatchTaskAssignment({ id: record.id_assignment, obj: data, status: "DONE" });
            } else {
                // mutatePatchTaskAssignment(record.id_assignment, data, "IN_PROGRESS")
                mutatePatchTaskAssignment({ id: record.id_assignment, obj: data, status: "IN_PROGRESS" });
            }
        } catch (error) {
            console.log("onChangeCheckBox error", error);
        }
    };

    const onCloseDrawerCheckList = () => {
        console.log("onCloseDrawerCheckList");
        // set
        setOpenDrawerCheckList(false);
        setTaskDataSelectFormTable([])
        setDoersData([]);
    };

    const findFilesInDoers = (task) => {
        // Nếu task không có subtasks, lấy file từ doers của task hiện tại
        if (!task.subtasks || task.subtasks.length === 0) {
            return task.doers?.flatMap((doer) => doer.files || []) || [];
        }

        // Nếu có subtasks, lấy file từ doers của subtasks (đệ quy)
        return task.subtasks.flatMap((subtask) => findFilesInDoers(subtask));
    }

    const hasAssignmentId = (task, idToFind) => {
        // Hàm đệ quy kiểm tra tất cả task và subtasks
        const checkDoers = (currentTask) => {
            if (currentTask.doers?.some(doer => doer.id_assignment === idToFind)) {
                return true;
            }

            // Kiểm tra tiếp trong subtasks
            if (currentTask.subtasks && currentTask.subtasks.length > 0) {
                return currentTask.subtasks.some(subtask => checkDoers(subtask));
            }

            return false;
        };

        return checkDoers(task);
    };

    //Hiển thị drawer con
    const showChildrenDrawer = (record) => {
        setRecordData(record);
        const allFiles = findFilesInDoers(record);
        // console.log(" doersData.filter((doer) => doer.id === record.id);", tmpDoerData);
        if (allFiles.length > 0) {
            setDoerSelected({
                name: record.name,
                files: allFiles,
            });
        } else {
            setDoerSelected(record);
        }
        console.log("showChildrenDrawer record", record);
        console.log("  findFilesInDoers(record)", findFilesInDoers(record));



        setChildrenDrawer(true);
    };

    // tắt drawer con
    const onChildrenDrawerClose = () => {
        setChildrenDrawer(false);
    };


    // columns modalfile con
    const checkListFileColumns = [
        {
            title: "Tên nhân viên",
            dataIndex: "name",
            key: "name",
            width: "18%",
            render: (text) => (
                <>
                    <p>{text}</p>
                </>
            ),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone_number",
            key: "phone_number",
            width: "12%",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: "15%",
            render: (text) => (
                <>
                    <p>{text}</p>
                </>
            ),
        },
        {
            title: "Chức vụ",
            dataIndex: "position",
            key: "position",
            render: (text) => (text === "TP" ? "Trưởng Phòng" : text === "TN" ? "Trưởng nhóm" : "Nhân viên"),
            width: "12%",
        },
        {
            title: "File",
            dataIndex: "upload",
            key: "upload",
            width: "15%",
            render: (_, record) => (
                <Button
                    shape="circle"
                    size="medium"
                    color="gold"
                    variant="solid"
                    onClick={() => showChildrenDrawer(record)}
                >
                    <FileCheck2 size={18} />
                </Button>
            ),
        },
        {
            title: "Chức năng",
            dataIndex: "action",
            key: "action",
            width: "17%",
            render: (_, record) => (
                <Space size="middle">
                    <Switch
                        onChange={(checked) => onChangeCheckBox(checked, record)}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        loading={addPatchtaskAssLoading}
                        // checked={record.isDone}
                        // checked={record.isDone}
                        defaultValue={record.isDone}
                    />
                </Space>
            ),
        },
    ];

    // columns modalfile cha
    const checkListTaskColumns = [
        {
            title: "Tên công việc",
            dataIndex: "name",
            key: "name",
            width: "20%",
            render: (text, record) => (
                <>
                    <a onClick={() => showDrawer(record)}>{text}</a>
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
            dataIndex: "start_time",
            key: "start_time",
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
            title: "File",
            dataIndex: "upload",
            key: "upload",
            width: "15%",
            render: (_, record) => (
                <Button
                    shape="circle"
                    size="medium"
                    color="gold"
                    variant="solid"
                    onClick={() => showChildrenDrawer(record)}
                >
                    <FileCheck2 size={18} />
                </Button>
            ),
        },
    ];

    return (
        <>

            {/* Drawr check list File */}
            <Drawer
                // title={''}
                title={
                    <HeaderChat
                        data={taskDataSelectFormTable}
                        onClose={onCloseDrawerCheckList}
                    ></HeaderChat>
                }
                onClose={onCloseDrawerCheckList}
                open={openDrawerCheckList}
                width={"50%"}
                maskClosable={false}
                loading={false}
                closable={false}
                destroyOnClose={true}
            >
                <Table
                    columns={taskDataSelectFormTable?.subtasks === undefined ? checkListFileColumns : checkListTaskColumns}
                    // dataSource={taskSelectData?.subtasks === undefined ? doersData : taskSelectData.subtasks}
                    dataSource={doersData}
                    pagination={false}
                ></Table>

                <Drawer
                    title={`File của ${doerSelected ? doerSelected.name : ""}`}
                    width={"30%"}
                    destroyOnClose={true}
                    // closable={false}
                    onClose={onChildrenDrawerClose}
                    open={childrenDrawer}
                >


                    <Flex
                        gap={"middle"}
                        wrap
                    >
                        {doerSelected.files &&
                            doerSelected.files.map((file, index) => (
                                <div
                                    key={index}
                                    className={"w-32"}
                                >
                                    <FileCard file={file} />
                                </div>
                            ))}
                    </Flex>
                </Drawer>
            </Drawer>

        </>
    )
}

export default DrawerFile