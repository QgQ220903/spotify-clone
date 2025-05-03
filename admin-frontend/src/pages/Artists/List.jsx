import React, { useState, useRef } from 'react';
import { Table, Input, Button, Space, Typography, Modal, Form, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const initialArtists = [
  { id: 1, name: 'The Weeknd', genre: 'R&B' },
  { id: 2, name: 'Dua Lipa', genre: 'Pop' },
  { id: 3, name: 'Harry Styles', genre: 'Pop' },
  { id: 4, name: 'Billie Eilish', genre: 'Pop' },
  { id: 5, name: 'Taylor Swift', genre: 'Pop, Alternative' },
];

let nextId = initialArtists.length + 1;

const Artists = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [artists, setArtists] = useState(initialArtists);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [form] = Form.useForm();
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
        <Space>
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
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#52c41a' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  });

  const handleAdd = () => {
    setEditingArtist(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingArtist(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setArtists(artists.filter((artist) => artist.id !== id));
    message.success('Artist deleted successfully');
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingArtist) {
          setArtists(
            artists.map((artist) =>
              artist.id === editingArtist.id ? { ...editingArtist, ...values } : artist
            )
          );
          message.success('Artist updated successfully');
        } else {
          const newArtist = {
            id: nextId++,
            ...values,
          };
          setArtists([...artists, newArtist]);
          message.success('Artist added successfully');
        }
        setIsModalOpen(false);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: '#',
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
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
      ...getColumnSearchProps('genre'),
      sorter: (a, b) => a.genre.localeCompare(b.genre),
      className: 'bg-gray-50',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            className="border-green-500 hover:bg-green-100 text-green-500 rounded-md font-semibold shadow-sm"
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
            className="text-red-500 hover:bg-red-100 border-red-500 rounded-md font-semibold shadow-sm"
          />
        </Space>
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
            Artist Management
          </Title>
          <Text className="text-gray-600">Manage the artists in your music library.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full normal-case shadow-md"
        >
          Add New Artist
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <Table
          columns={columns}
          dataSource={artists}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="ant-table-wrapper" // For potential Ant Design customization
        />
      </div>

      {/* Modal for Add/Edit Artist */}
      <Modal
        title={editingArtist ? 'Edit Artist' : 'Add New Artist'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} className="rounded-md border border-gray-300 shadow-sm hover:bg-gray-100">
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow-md"
          >
            {editingArtist ? 'Update' : 'Add'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={<Text className="font-semibold text-gray-700">Name</Text>}
            rules={[{ required: true, message: 'Please enter the artist name!' }]}
          >
            <Input placeholder="Artist Name" className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500" />
          </Form.Item>
          <Form.Item
            name="genre"
            label={<Text className="font-semibold text-gray-700">Genre</Text>}
            rules={[{ required: true, message: 'Please enter the artist genre!' }]}
          >
            <Input placeholder="Genre (e.g., Pop, R&B, Alternative)" className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Artists;