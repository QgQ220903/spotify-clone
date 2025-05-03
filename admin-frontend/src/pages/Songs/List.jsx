import React, { useState, useRef } from 'react';
import { Table, Input, Button, Space, Typography, Modal, Form, message, InputNumber } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const initialSongs = [
  { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', plays: 2456789123 },
  { id: 2, title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35', plays: 1789456123 },
  { id: 3, title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', duration: '2:21', plays: 1567891234 },
  { id: 4, title: 'good 4 u', artist: 'Olivia Rodrigo', duration: '2:58', plays: 1345678912 },
  { id: 5, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', plays: 1234567890 },
];

let nextId = initialSongs.length + 1;

const Songs = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [songs, setSongs] = useState(initialSongs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
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
    setEditingSong(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingSong(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setSongs(songs.filter((song) => song.id !== id));
    message.success('Song deleted successfully');
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingSong) {
          setSongs(
            songs.map((song) =>
              song.id === editingSong.id ? { ...editingSong, ...values } : song
            )
          );
          message.success('Song updated successfully');
        } else {
          const newSong = {
            id: nextId++,
            ...values,
          };
          setSongs([...songs, newSong]);
          message.success('Song added successfully');
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
      render: (text) => (
        <div className="flex items-center">
          <span className="mr-2 text-green-500">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path d="M8 3a5 5 0 0 0-5 5v5h1v-5a4 4 0 0 1 4-4 4 4 0 0 1 4 4v5h1v-5a5 5 0 0 0-5-5z" />
              <path d="M13 10v3h-1v-3a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3h-1v-3a3 3 0 0 1 3-3 3 3 0 0 1 3 3z" />
            </svg>
          </span>
          {text}
        </div>
      ),
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
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a, b) => {
        const timeA = a.duration.split(':').reduce((acc, curr) => acc * 60 + parseInt(curr), 0);
        const timeB = b.duration.split(':').reduce((acc, curr) => acc * 60 + parseInt(curr), 0);
        return timeA - timeB;
      },
      className: 'bg-gray-50',
    },
    {
      title: 'Plays',
      dataIndex: 'plays',
      key: 'plays',
      sorter: (a, b) => a.plays - b.plays,
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
            Song Management
          </Title>
          <Text className="text-gray-600">Manage the songs in your music library.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full normal-case shadow-md"
        >
          Add New Song
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <Table
          columns={columns}
          dataSource={songs}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="ant-table-wrapper"
        />
      </div>

      {/* Modal for Add/Edit Song */}
      <Modal
        title={editingSong ? 'Edit Song' : 'Add New Song'}
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
            {editingSong ? 'Update' : 'Add'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label={<Text className="font-semibold text-gray-700">Title</Text>}
            rules={[{ required: true, message: 'Please enter the song title!' }]}
          >
            <Input placeholder="Song Title" className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500" />
          </Form.Item>
          <Form.Item
            name="artist"
            label={<Text className="font-semibold text-gray-700">Artist</Text>}
            rules={[{ required: true, message: 'Please enter the artist name!' }]}
          >
            <Input placeholder="Artist Name" className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500" />
          </Form.Item>
          <Form.Item
            name="duration"
            label={<Text className="font-semibold text-gray-700">Duration (mm:ss)</Text>}
            rules={[
              { required: true, message: 'Please enter the duration!' },
              {
                pattern: /^\d{2}:\d{2}$/,
                message: 'Please enter a valid duration in mm:ss format!',
              },
            ]}
          >
            <Input placeholder="e.g., 03:30" className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500" />
          </Form.Item>
          <Form.Item
            name="plays"
            label={<Text className="font-semibold text-gray-700">Plays</Text>}
            rules={[{ required: true, message: 'Please enter the number of plays!' }]}
          >
            <InputNumber min={0} placeholder="Number of Plays" style={{ width: '100%' }} className="rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Songs;