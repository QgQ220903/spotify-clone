import { Drawer, Table, Flex, Switch, Space, Button, Tag, Input } from 'antd';
import { Chat, HeaderChat } from "@/components/chatRoom/Chat";

const DrawerChatRom = (
    {
        taskDataSelectFormTable, setTaskDataSelectFormTable,
        open, employeeContext, setOpen


    }
) => {
    
    //hàm tắt chat
    const onClose = () => {
        setOpen(false);
        setTaskDataSelectFormTable([]);
    };

  return (
    <>
           {/* Drawer chatroom */}
           <Drawer
                title={
                    <HeaderChat
                        data={taskDataSelectFormTable}
                        onClose={onClose}
                    ></HeaderChat>
                }
                onClose={onClose}
                open={open}
                width={"40%"}
                maskClosable={false}
                loading={false}
                closable={false}
            >
               { taskDataSelectFormTable && <Chat
                    roomName={taskDataSelectFormTable.id}
                    user={employeeContext}
                ></Chat>}
            </Drawer>
    </>
  )
}

export default DrawerChatRom