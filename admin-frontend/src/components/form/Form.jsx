import React from 'react'
import { Form } from 'antd';



const FormDepartment = ({ form, formItemLayout, formItems, formName,initialValues  }) => {
    return (
        <>
            <Form
                form={form}
                name={formName}
                style={{
                    maxWidth: 600,
                }}
                initialValues={initialValues}

            >
               {formItems?.map((item, index) =>
                !item.hidden && ( // Kiểm tra nếu `hidden = true` thì không render
                    <Form.Item key={index} {...formItemLayout} {...item}>
                        {React.cloneElement(item.component, {
                            readOnly: item.props?.readOnly,
                            disabled: item.props?.disabled,
                        })}
                    </Form.Item>
                )
            )}

            </Form>
        </>
    )
}

export default FormDepartment