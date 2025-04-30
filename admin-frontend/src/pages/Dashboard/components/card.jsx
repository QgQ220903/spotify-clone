import { Card } from 'antd';

export const CardDb = ({ children }) => {
    return (
        <Card className='flex-1 p-4 pt-2'>


            {children}

        </Card>
    )
}