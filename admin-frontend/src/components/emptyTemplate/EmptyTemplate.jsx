import { Empty,Typography } from "antd";


const EmptyTemplate = ({title}) => {
    return (
        <Empty

            // styles={{ image: { height: 60 } }}
            description={
                <Typography.Text>
                   {title}
                </Typography.Text>
            }
        >

        </Empty>
    )
}

export default EmptyTemplate