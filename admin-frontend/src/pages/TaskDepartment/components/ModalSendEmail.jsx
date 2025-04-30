import React, {useState, useEffect} from 'react'
import ModalSendEmail from "@/components/modal/Modal";
import {Input, Select} from "antd";
import FormSendEmail from "@/components/form/Form";
import { sendEmail } from "@/services/EmailService.";
import { Content } from 'antd/es/layout/layout';
import {showToastMessage} from "@/utils/Toast";

const { TextArea } = Input;
const ModalSendEmailForm = (
{
  isModalSendEmailOpen,
  setIsModalSendEmailOpen,
  formSendEmail,
  mode,
  record,
  setTaskDataSelectFormTable
}

) => {

  const [data,setData] = useState([])

  // useEffect(()=>{
  //   setData(record.doers)
  //   console.log("data",data);
  // },[record])

  const handleCancelSendEmail = () => {
    setIsModalSendEmailOpen(false);
    setTaskDataSelectFormTable([])
    formSendEmail.resetFields()
}

const sendContentEmail = async (recipient,nameReceive, namTask,content) => {
  sendEmail({
    recipient: recipient, // địa chỉ người nhận
    subject: "Cập nhật liên quan đến công việc",
    message: `
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 30px; text-align: center; background-color: #4a6fa5; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff;">THÔNG BÁO CÔNG VIỆC</h1>
                  </td>
                </tr>
  
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="margin-top: 0; color: #4a6fa5;">Dear Mr/Ms: ${nameReceive},</h2>
                    <p style="line-height: 1.6;">
                      Đây là thông báo liên quan đến công việc <strong>"${namTask}"</strong> mà Anh/Chị đang tham gia.
                    </p>
  
                    <p style="line-height: 1.6;">
                      Nội dung thông báo liên quan đến công việc như sau:
                    </p>
                    <h3>
                     <strong>" ${content} "</strong>
                    </h3>
  
                    <p style="line-height: 1.6;">
                      Vui lòng kiểm tra lại chi tiết công việc trên hệ thống để đảm bảo nắm rõ các thay đổi nếu có. Nếu có bất kỳ thắc mắc nào, vui lòng phản hồi qua email này.
                    </p>
                  </td>
                </tr>
  
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px; text-align: center; background-color: #f0f0f0; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
                    <p style="margin: 0;">© 2023 TQT. Mọi quyền được bảo lưu.</p>
                    <p style="margin: 10px 0 0;">
                      <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Trang chủ</a>
                      <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Quy định</a>
                      <a href="#" style="color: #4a6fa5; text-decoration: none; margin: 0 10px;">Liên hệ</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    `,
    send_at: null,
  });
}

  const formItemsSendEmail = [
    {
      name: "employees",
      label: "Người nhận:",
      component: (
          <Select
              mode="multiple"
              allowClear
              placeholder="Chọn người nhận"
              options={
                record && record.doers?.map((item) => ({
                  value: item.email,
                  label: `${item.name} - ${item.position === "TN"? "Trưởng nhóm" : "Nhân viên"}`,
                  name: item.name,
                  position: item.position
                }))
              }
          
          />
      ),
      // props: { disabled: !isEmployeeTask },
      rules: [
          {
              required: true,
              message: "Làm ơn chọn người chịu trách nhiệm",
          },
      ],
  },
    {
        name: "content",
        label: "",
        component: <TextArea rows={10} placeholder="nhập tin nhắn!" />,
        // props: { readOnly: true },

    }
]

const handleOkSendEmail = async () => {
  try {
    console.log("handleOkSendEmail",record);
    const values = await formSendEmail.validateFields();
    const contents = values.content ;
    const dores = values.employees;
    console.log("handleOkSendEmail",contents,dores);

    if (dores) {
      dores.forEach((email) => {
        const person = record.doers.find((p) => p.email === email);
        const nameLabel = `${person.name}`;
        console.log("dores sendEmail", {
          recipient: person.email,
          nameReceive: nameLabel,
          taskName: record.name,
          content: contents
        });
    
        sendContentEmail(
          person.email,
          nameLabel, // Gửi label này vào làm nameReceive
          record.name,
          contents
        );
      });
    }
    showToastMessage('Đang gửi email tới !', 'success', 'top-right')
    setIsModalSendEmailOpen(false);
    formItemsSendEmail.resetFields();
  } catch (error) {
    console.log(error);
  }
}

  return (
    <>
      <ModalSendEmail
        isModalOpen={isModalSendEmailOpen}
        setIsModalOpen={setIsModalSendEmailOpen}
        handleOk={handleOkSendEmail}
        handleCancel={handleCancelSendEmail}
        title={"Gửi Email"}
        form={formSendEmail}
      >
        <FormSendEmail
          formName={"formSendEmail" + mode}
          form={formSendEmail}

          formItems={formItemsSendEmail}
        ></FormSendEmail>
      </ModalSendEmail>
    </>
  )
}

export default ModalSendEmailForm