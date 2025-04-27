import React, { useState, useEffect } from "react";
import { Space, Tag, Popconfirm, Form, Input, Select, Table, Drawer, Button } from "antd";
import { Pencil, Trash2, Plus } from "lucide-react";
import Search from "@/components/Search";
import ModalDepartment from "@/components/modal/Modal";
import FormDepartment from "@/components/form/Form";
import PageHeader from "@/components/PageHeader";
import ButtonIcon from "@/components/ButtonIcon";
import { employeeGetAPI, employeeGetAllAPIWithDepartment, employeePatchAPI } from "@/services/EmployeeService";
import { departmentGetAPI, departmentPostAPI, departmentPutAPI, departmentDeleteAPI} from "@/services/DepartmentService";
import useWebSocket from "@/services/useWebSocket";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { showToastMessage } from "@/utils/toast";

import EmptyTemplate from "@/components/emptyTemplate/EmptyTemplate";

// Đường dẫn
const itemsBreadcrumb = [
    {
        title: <Link to="/">Trang chủ</Link>,
    },

    {
        title: "Phòng ban",
    },
];



const Department = () => {
    const [data, setData] = useState([]);
    const [employeess, setemployeess] = useState([]);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [current, setCurrent] = useState(1);
    const [total, setTotal] = useState(0);
    const [form] = Form.useForm();
    const [title, setTitle] = useState("");
    const [mode, setMode] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    // manager đc chọn
    const [selectedManager, setSelectedManger] = useState(null);
    const departmentUpdate = useWebSocket("ws://127.0.0.1:8000/ws/departments/");

    // lấy ds tất cả tv
    // const { data: dataemployeess } = useQuery({
    //     queryKey: ["employeess"],
    //     queryFn: employeeGetAPI,
    // });

    //lấy ds tất cả tv theo id pb
    const { mutateAsync: fetchEmployees, data: employees } = useMutation({
        mutationFn: (id) => employeeGetAllAPIWithDepartment(id),
        // onSuccess: (data) => {
        //     setTest(data.results);
        //     console.log("data", test);
        // },
    });

   

    // useEffect(() => {
    //     if(dataemployeess?.results){

    //         setemployeess(dataemployeess.results || []);
    //     }
    // }, [dataemployeess]);

    const queryClient = useQueryClient();
    const { data: dataDepartment, isLoading } = useQuery({
        queryKey: ["departmentDe"],
        queryFn: departmentGetAPI,
    });
    useEffect(() => {
        if (departmentUpdate) {
            queryClient.invalidateQueries(["departmentDe"]);
        }
    }, [departmentUpdate, queryClient]);

    const changePosition = async (dataOld,dataNew) => {
        console.log("changePosition dataOld :",dataOld);
        console.log("changePosition dataNew :",dataNew);
      
       
        if(dataOld === null){
            console.log("chưa có trưởng phòng")
            const dataNewfilter = {
                ...dataNew,
                position: "TP"
            }
            return await employeePatchAPI(dataNewfilter.id,dataNewfilter);
        }
        else if(dataOld.id === dataNew.id){
            return
        }else {
            const dataNewfilter = {
                ...dataNew,
                position: "TP"
            }
            const dataOldfilter = {
               ...dataOld,
                position: "NV"
            }
            // patchEmployees(idOld,"NV")
            // console.log(" patchEmployees(idOld,NV)");
            await employeePatchAPI(dataOldfilter.id,dataOldfilter);
            await employeePatchAPI(dataNewfilter.id,dataNewfilter);
         
        }
    }

    //sửa department
    const { data: dataDepartmentPut, mutate: mutatePut } = useMutation({
        mutationFn: departmentPutAPI,
        onSuccess: async (data) => {
            queryClient.invalidateQueries({
                queryKey: ["departmentDe"],
            });
            console.log("dataDepartmentPut",data)
            showToastMessage("Sửa phòng ban thành công !", "success", "top-right");
         
            if(data){
                changePosition(selectedManager,data.manager)
            }
            setIsModalOpen(false);

        },
        onError: (error) => {
            console.error("Lỗi khi sửa phòng ban:", error);
            showToastMessage("Sửa phòng ban thất bai !", "error", "top-right");
        },
    });

    //xóa department
    const { mutate: mutateDelete } = useMutation({
        mutationFn: departmentDeleteAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["departmentDe"],
            });
            showToastMessage("Xóa phòng ban thành công !", "success", "top-right");
        },
        onError: (error) => {
            console.error("Lỗi khi Xóa phòng ban:", error);
            showToastMessage("Xóa phòng ban thất bai !", "error", "top-right");
        },
    });

    //thêm pb
    const { data: newData, mutate: mutatePost } = useMutation({
        mutationFn: departmentPostAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["departmentDe"],
            });
            showToastMessage("Thêm phòng ban thành công !", "success", "top-right");
            setIsModalOpen(false);
        },
        onError: () => {
            showToastMessage("Thêm phòng ban thất bại !", "error", "top-right");
        }
    });

    function setDataDepartments(departments) {
        return departments?.map((dept) => ({
            ...dept,
            key: dept.id,
            name: dept.name,
            manager: dept.manager ? dept.manager.name : "Chưa có trưởng phòng",
            manager_detail: dept.manager? dept.manager : null,
            description: dept.description ? dept.description : "Không có mô tả phòng ban",

        }));
    }

    useEffect(() => {
        //console.log("fix de", dataDepartment);
        if (dataDepartment) {
            setData(setDataDepartments(dataDepartment.results));
            console.log("dataDepartment", data);
        }
    }, [dataDepartment]);

    useEffect(() => {
        if (selectedDepartment) form.setFieldsValue(selectedDepartment);
    }, [form, selectedDepartment]);

    const handleEditDepartment = async (record) => {
        setTitle("Sửa Phòng Ban");
        setSelectedDepartment(record);
        console.log("handleEditDepartment", record);
        //set manager đc chọn
        setSelectedManger(record.manager_detail);
        const dataEm = await fetchEmployees(record.key)
        setemployeess(dataEm);

        form.setFieldsValue(record);
        setIsModalOpen(true);
        setMode("Edit");
    };

    const handleDeleteDepartment = async (record) => {
        console.log("handleDeleteDepartment",record);
        if(record.employee_count === 0){
            mutateDelete(record.key)
            // setData((prevData) => prevData.filter((item) => item.key!== record.key));
        }else{
            showToastMessage("Phòng ban này đang có nhân viên, không thể xóa!", "error", "top-right");
        }
        // await departmentDeleteAPI(record);
        // mutateDelete({id: record.key})
        // setData((prevData) => prevData.filter((item) => item.key !== record.key));
    };

    // hàm thêm sửa pb
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                manager: !values.manager || values.manager === "Chưa có trưởng phòng" ? null : values.manager,
            };

            console.log("Payload gửi đi:", payload);

            if (mode === "Edit") {
                mutatePut({ id: selectedDepartment.key, obj: payload });
            } else {
                mutatePost(payload);
            }
        } catch (error) {
            console.error("Lỗi xác thực form:", error);
        }
    
       
    };

    const onChange = (page) => {
        // console.log(page);
        // setCurrent(page);
    };

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
            name: "name",
            label: "Tên Phòng Ban",
            component: <Input placeholder="Hãy nhập tên phòng ban" />,
            rules: [{ required: true, message: "Làm ơn nhập tên phòng ban" }],
        },
        {
            name: "manager",
            label: "Trưởng Phòng",
            component: (
                <Select
                    placeholder="Chọn trưởng phòng"
                    allowClear
                    notFoundContent={<Link to={"/employees"}>Vui lòng thêm nhân viên vào phòng ban</Link>}
                >
                    {employeess.map((emp) => (
                        <Select.Option
                            key={emp.id}
                            value={emp.id}
                        >
                            {emp.name}
                        </Select.Option>
                    ))}
                </Select>
            ),
            hidden: mode === "Add" ? true : false,
        },
        {
            name: "description",
            label: "Mô tả",
            component: <Input placeholder="Mô tả phòng ban" />,
            rules: [{ required: false, message: "Hãy mô tả phòng ban" }],
        },
    ];

    const columns = [
        {
            title: "ID",
            dataIndex: "key",
            key: "key",

        },
        {
            title: "Tên Phòng Ban",
            dataIndex: "name",
            key: "name",
            render: (text) => <span>{text}</span>,
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
            onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()), // So sánh không phân biệt hoa/thường
            filterSearch: true,
        },
        {
            title: "Trưởng Phòng",
            dataIndex: "manager",
            key: "manager",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    {/* Tùy chỉnh dropdown filter */}
                    <Input
                        autoFocus
                        placeholder="Tìm kiếm theo tên"
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
            onFilter: (value, record) => record.manager.toLowerCase().includes(value.toLowerCase()), // So sánh không phân biệt hoa/thường
            filterSearch: true,

        },
        { title: "Mô tả", dataIndex: "description", key: "description" },
        // { title: 'Trạng Thái', dataIndex: 'is_deleted', key: 'is_deleted', render: (text) => <Tag color={text === "Ngừng hoạt động" ? "volcano" : "green"}>{text}</Tag> },
        {
            title: "Hành Động",
            key: "action",
            render: (_, record) => (
                <Space>
                    {/* <a onClick={() => handleEditDepartment(record)}>
                        <Pencil size={20} />
                    </a> */}
                    <Button
                        shape="circle"
                        size="medium"
                        color="gold"
                        variant="solid"
                        onClick={() => handleEditDepartment(record)}

                    >
                        <Pencil size={18} />
                    </Button>
                    <Popconfirm
                        title="Xóa phòng ban?"
                        onConfirm={() => handleDeleteDepartment(record)}
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
                </Space>
            ),
        },
    ];

    return (
        <>
            <PageHeader title={"Quản lý Phòng Ban"} itemsBreadcrumb={itemsBreadcrumb}>
                <ButtonIcon
                    handleEvent={() => {
                        form.resetFields();
                        setTitle("Thêm Phòng Ban");
                        setMode("Add");
                        setIsModalOpen(true);
                    }}
                >
                    <Plus /> Thêm Phòng Ban Mới
                </ButtonIcon>
            </PageHeader>

            <div className="mt-5">
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={{
                        total: total,
                        defaultCurrent: current,
                        pageSize: 5, // Mặc định 10 dòng mỗi trang
                        onChange: onChange,
                    }}
                    isLoading={isLoading}
                />
            </div>
            <ModalDepartment
                isModalOpen={isModalOpen}
                handleOk={handleOk}
                handleCancel={() => {setSelectedManger(null),setIsModalOpen(false)}}
                title={title}
                form={form}
            >
                <FormDepartment
                    form={form}
                    formItems={formItems}
                    formItemLayout={formItemLayout}
                />
            </ModalDepartment>
        </>
    );
};

export default Department;
