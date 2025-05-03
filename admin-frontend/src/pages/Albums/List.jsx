import React, { useState, useRef } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  message,
  InputNumber,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const initialAlbums = [
  { id: 1, title: 'After Hours', artist: 'The Weeknd', releaseYear: 2020 },
  { id: 2, title: 'Future Nostalgia', artist: 'Dua Lipa', releaseYear: 2020 },
  { id: 3, title: 'Fine Line', artist: 'Harry Styles', releaseYear: 2019 },
  { id: 4, title: 'When We All Fall Asleep, Where Do We Go?', artist: 'Billie Eilish', releaseYear: 2019 },
  { id: 5, title: 'folklore', artist: 'Taylor Swift', releaseYear: 2020 },
];

let nextId = initialAlbums.length + 1;

const Albums = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [albums, setAlbums] = useState(initialAlbums);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
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
    setEditingAlbum(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingAlbum(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setAlbums(albums.filter((album) => album.id !== id));
    message.success('Album deleted successfully');
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingAlbum) {
          setAlbums(
            albums.map((album) =>
              album.id === editingAlbum.id ? { ...editingAlbum, ...values } : album
            )
          );
          message.success('Album updated successfully');
        } else {
          const newAlbum = { id: nextId++, ...values };
          setAlbums([...albums, newAlbum]);
          message.success('Album added successfully');
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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
      sorter: (a, b) => a.title.localeCompare(b.title),
      className: 'bg-gray-50',
    },
    {
      title: 'Artist',
      dataIndex: 'artist',
      key: 'artist',
      ...getColumnSearchProps('artist'),
      sorter: (a, b) => a.artist.localeCompare(b.artist),
      className: 'bg-gray-50',
    },
    {
      title: 'Release Year',
      dataIndex: 'releaseYear',
      key: 'releaseYear',
      sorter: (a, b) => a.releaseYear - b.releaseYear,
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
            Album Management
          </Title>
          <Text className="text-gray-600">Manage your collection of music albums.</Text>
        </div>
        <Button
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full normal-case shadow-md"
        >
          Add Album
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <Table
          columns={columns}
          dataSource={albums}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          className="ant-table-wrapper"
        />
      </div>

      {/* Modal for Add/Edit Album */}
      <Modal
        title={editingAlbum ? 'Edit Album' : 'Add New Album'}
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
            {editingAlbum ? 'Update' : 'Add'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label={<Text className="font-semibold text-gray-700">Title</Text>}
            rules={[{ required: true, message: 'Please enter the album title!' }]}
          >
            <Input placeholder="Album Title" className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500" />
          </Form.Item>
          <Form.Item
            name="artist"
            label={<Text className="font-semibold text-gray-700">Artist</Text>}
            rules={[{ required: true, message: 'Please enter the artist name!' }]}
          >
            <Input placeholder="Artist Name" className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500" />
          </Form.Item>
          <Form.Item
            name="releaseYear"
            label={<Text className="font-semibold text-gray-700">Release Year</Text>}
            rules={[{ required: true, message: 'Please enter the release year!' }]}
          >
            <InputNumber
              min={1900}
              max={new Date().getFullYear()}
              placeholder="Release Year"
              style={{ width: '100%' }}
              className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Albums;