import { useState, useRef } from 'react';
import { Table, Modal, Form, Input, Button, Popconfirm, InputNumber, Select, notification, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

const initialUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', age: 30, status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', age: 25, status: 'Inactive' },
  { id: 3, name: 'Peter Jones', email: 'peter@example.com', role: 'Editor', age: 35, status: 'Active' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', age: 28, status: 'Pending' },
  { id: 5, name: 'Bob Williams', email: 'bob@example.com', role: 'Admin', age: 40, status: 'Active' },
  { id: 6, name: 'Eva Davis', email: 'eva@example.com', role: 'User', age: 22, status: 'Inactive' },
  { id: 7, name: 'Michael Garcia', email: 'michael@example.com', role: 'Editor', age: 31, status: 'Active' },
  { id: 8, name: 'Sophia Rodriguez', email: 'sophia@example.com', role: 'User', age: 27, status: 'Pending' },
];

const UserList = () => {
  const [users, setUsers] = useState(initialUsers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div className="p-4 rounded-md shadow-md bg-white">
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          className="mb-2 block rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
        />
        <div className="flex space-x-2">
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            className="bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold shadow-sm"
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" className="rounded-md border border-gray-300 shadow-sm hover:bg-gray-100">
            Reset
          </Button>
          <Button type="link" size="small" onClick={close} className="text-green-500 hover:text-green-600">
            Close
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#52c41a' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
    notification.success({
      message: 'Success',
      description: 'User deleted successfully',
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingUser) {
        setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...values } : u)));
        notification.success({
          message: 'Success',
          description: 'User updated successfully',
        });
      } else {
        const newUser = {
          id: Math.max(...users.map((u) => u.id)) + 1,
          ...values,
        };
        setUsers([...users, newUser]);
        notification.success({
          message: 'Success',
          description: 'User added successfully',
        });
      }
      setIsModalVisible(false);
    }).catch((errorInfo) => {
      console.log('Validation Failed:', errorInfo);
      notification.error({
        message: 'Error',
        description: 'Please fill all required fields correctly.',
      });
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
      className: 'bg-gray-50',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      sorter: (a, b) => a.name.localeCompare(b.name),
      className: 'bg-gray-50',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ...getColumnSearchProps('email'),
      sorter: (a, b) => a.email.localeCompare(b.email),
      className: 'bg-gray-50',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'User', value: 'User' },
        { text: 'Editor', value: 'Editor' },
      ],
      onFilter: (value, record) => record.role === value,
      sorter: (a, b) => a.role.localeCompare(b.role),
      className: 'bg-gray-50',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      sorter: (a, b) => a.age - b.age,
      className: 'bg-gray-50',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
        { text: 'Pending', value: 'Pending' },
      ],
      onFilter: (value, record) => record.status === value,
      sorter: (a, b) => a.status.localeCompare(b.status),
      className: 'bg-gray-50',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            className="border-green-500 hover:bg-green-100 text-green-500 rounded-md font-semibold shadow-sm"
          />
          <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              className="text-red-500 hover:bg-red-100 border-red-500 rounded-md font-semibold shadow-sm"
            />
          </Popconfirm>
        </div>
      ),
      className: 'bg-gray-50',
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Title level={2} className="text-gray-800 font-semibold mb-1">
            User Management
          </Title>
          <Text className="text-gray-600">Manage user accounts and their permissions.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full normal-case shadow-md"
        >
          Add User
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          className="ant-table-wrapper"
        />
      </div>

      {/* Modal for Add/Edit User */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)} className="rounded-md border border-gray-300 shadow-sm hover:bg-gray-100">
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow-md"
          >
            Save
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={<Text className="font-semibold text-gray-700">Name</Text>}
            rules={[{ required: true, message: 'Please enter the user name!' }]}
          >
            <Input placeholder="Enter name" className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500" />
          </Form.Item>
          <Form.Item
            name="email"
            label={<Text className="font-semibold text-gray-700">Email</Text>}
            rules={[
              { required: true, message: 'Please enter the user email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Enter email" className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500" />
          </Form.Item>
          <Form.Item
            name="role"
            label={<Text className="font-semibold text-gray-700">Role</Text>}
            rules={[{ required: true, message: 'Please select the user role!' }]}
          >
            <Select placeholder="Select a role" className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500">
              <Option value="Admin">Admin</Option>
              <Option value="User">User</Option>
              <Option value="Editor">Editor</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="age"
            label={<Text className="font-semibold text-gray-700">Age</Text>}
            rules={[{ type: 'number', min: 18, max: 100, message: 'Age must be between 18 and 100!' }]}
          >
            <InputNumber placeholder="Enter age" style={{ width: '100%' }} className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500" />
          </Form.Item>
          <Form.Item
            name="status"
            label={<Text className="font-semibold text-gray-700">Status</Text>}
            rules={[{ required: true, message: 'Please select the user status!' }]}
          >
            <Select placeholder="Select status" className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500">
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Pending">Pending</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;