import React from 'react'
import { Checkbox } from 'antd';
import { Table } from 'lucide-react';
const TableRole = () => {
    const columns = [

        { title: "Chức năng", dataIndex: "role", key: "role" },

        {
            title: "Thêm", dataIndex: "add", key: "add", render: (_, record) => (
                <>
                  <Checkbox></Checkbox>
                </>
            )
        },
        {
            title: "Sửa", dataIndex: "edit", key: "edit", render: (_, record) => (
                <>
                  <Checkbox></Checkbox>
                </>
            )
        },
        {
            title: "Xóa", dataIndex: "delete", key: "delete", render: (_, record) => (
                <>
                  <Checkbox></Checkbox>
                </>
            )
        },

    ];

    const data = [
        {
            key: '1',
            role: 'Quản lý thành viên',

        },
        {
            key: '2',

            role: 'Quản lý công việc',

        },
        {
            key: '3',

            role: 'Quản lý phòng ban',

        },
        {
            key: '4',

            role: 'Quản lý tài khoản',

        },
    ];
    return (
        <>
            <Table  columns={columns} dataSource={data} />
        </>
    )
}

export default TableRole