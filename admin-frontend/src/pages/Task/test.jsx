import React from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const FileUpload = () => {
  const handleChange = async (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const customRequest = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('link', file);
    formData.append('name', file.name);

    try {
      const response = await axios.post('http://localhost:8000/api/files/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onSuccess(response.data);
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Upload
      customRequest={customRequest}
      onChange={handleChange}
      showUploadList={false} // Không hiển thị danh sách file đã upload
    >
      <Button icon={<UploadOutlined />}>Upload File</Button>
    </Upload>
  );
};

export default FileUpload;
