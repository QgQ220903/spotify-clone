import React from 'react';

import { Modal } from "antd";


const ModalCreateDepartment = (props) => {
  const { isModalOpen, handleOk, handleCancel, title, setIsModalOpen, form, children } = props;
  
  // const reset = () => {
  //   form.resetFields()
  //   setIsModalOpen(false)
  // }


  const onCheckboxChange = (e) => {
    setCheckNick(e.target.checked);
  };

  // const onCheck = async () => {
  //   try {
  //     const values = await form.validateFields();
  //     console.log('Success:', values);
  //   } catch (errorInfo) {``
  //     console.log('Failed:', errorInfo);
  //   }
  // };
  return (


    <Modal
      title={title}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      // destroyOnClose={true}
      addText="Lưu và thêm"
      okText="Lưu"
      cancelText="Thoát"
      maskClosable={false}
    >
      {children}
     
    </Modal>





  )
}

export default ModalCreateDepartment

