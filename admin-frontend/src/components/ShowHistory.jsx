
import React, { Children } from 'react'
import { Button, Modal, Timeline } from 'antd';
import {formatDate} from '@/utils/cn'

const ShowHistory = ({ isModalOpen, setIsModalOpen, items, handleCancel }) => {

   
   

    
    return (
        
        <Modal title="Lịch sử" open={isModalOpen}  onCancel={handleCancel}  maskClosable={false} onClose={handleCancel} footer={false} >
          <div    className='mt-4 p-4 overflow-y-auto  font-normal flex justify-start ' style={{
            height: '200px'
        }}>
         
                <Timeline className=''
                
                mode='alternate'
                    items={items.map((item, index) => ({
                        ...item,
                        is_deleted: item.is_deleted+"",
                        label:  formatDate(item.created_at),
                        children: `${item.content} `,
                    }))}
                />
          </div>
        </Modal>
    )
}

export default ShowHistory