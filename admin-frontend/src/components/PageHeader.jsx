import React from 'react'
import ButtonIcon from '@/components/ButtonIcon'
import { Breadcrumb, Typography } from 'antd';

import { Plus } from 'lucide-react';


const { Title } = Typography;

const PageHeader = ({ title, itemsBreadcrumb, children }) => {

    
    return (
        <>
            <div className='flex justify-between items-center '>
                <div>
                    <Title level={2} className='title'>{title}</Title>
                    <Breadcrumb items={itemsBreadcrumb}></Breadcrumb>
                </div>

                {/* <ButtonIcon handleEvent={handleNewDepartment}>
                    <Plus />{titleButton}
                </ButtonIcon> */}
                {children}
            </div>


           

        </>
    )
}

export default PageHeader