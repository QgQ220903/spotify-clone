
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Typography, Flex, Tag, Input, Avatar, Card, Button, Tooltip, Upload } from 'antd';
import { SquareX, SendHorizontal, Paperclip, Trash2 } from 'lucide-react';
import { UploadOutlined } from '@ant-design/icons';
import { cn } from "@/utils/cn";

import { FaRegFilePdf } from "react-icons/fa6";
import { FaRegFileWord, FaRegFileExcel } from "react-icons/fa";
import { BsFiletypePng, BsFiletypePpt, BsFiletypeJpg } from "react-icons/bs";
import { SiJpeg } from "react-icons/si";
import { GoFileZip } from "react-icons/go";
import { use } from 'react';

const { Title } = Typography;

const { TextArea } = Input;

const props = {
    name: 'file',
    onChange({ file, fileList }) {
        if (file.status !== 'uploading') {
            console.log(file, fileList);
        }
    },
    showUploadList: false,
    showPreviewIcon: false,
    directory: false,

};

export const Chat = ({ user, roomName, }) => {
    const [socket, setSocket] = useState(null);
    const [chats, setChats] = useState([]);
    const [chat, setChat] = useState("");
    const [file, setFile] = useState(null);

    useEffect(() => {
        if(roomName){
            const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/`);
            setSocket(ws);
    
            axios
                .get(`http://127.0.0.1:8000/chat-history/${roomName}/`)
                .then((response) => setChats(response.data))
                .catch((error) => console.error("Error fetching chat history:", error));
    
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("onmessage", JSON.parse(event.data));
                setChats((prev) => [
                    ...prev,
                    { sender: data.sender, chat: data.message, file: data.file, name: data.name },
                ]);
            };
    
            return () => {
                ws.close();
            };
        }
      
    }, [roomName]);

    const sendChat = () => {
        if (!socket) return;

        const messageData = { message: chat, sender: user.id, file: null };
        console.log("sendChat");
        if (file) {
            console.log("file", file);
            const formData = new FormData();
            formData.append("link", file);
            formData.append("name", file.name);

            axios
                .post("http://127.0.0.1:8000/api/files/", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                .then((response) => {
                    messageData.file = response.data.id;
                    console.log("file", response.data.id);
                    socket.send(JSON.stringify(messageData));
                })
                .catch((error) => console.error("File upload error:", error));
        } else if(chat){
            socket.send(JSON.stringify(messageData));
        }

        setChat("");
        setFile(null);
    };


    const handleSendFile = (e) => {
        const selectedFile = e.target.files[0];  // Lấy tệp ngay lập tức
        setFile(selectedFile);  // Cập nhật state file

    }
    return (
        <>
            <Flex vertical className='h-full border bg-gray-50 ' justify={'flex-end'} >
                {/* Khu vực tin nhắn */}
                <Flex vertical
                    className='p-4 overflow-y-auto flex-1 '
                >

                    {
                        chats.map((msg, index) => (
                            <div key={index}>
                                <ChatItem name={msg.name}
                                    email={msg.sender}
                                    chat={msg.chat}
                                    isSender={msg.sender === user.email}
                                    file={msg.file}
                                />
                            </div>
                        ))
                    }

                    {/* 
                    <ChatItem />
                    <ChatItem />

                    <ChatItem isSender={true} /> */}

                </Flex>

                <input type="file" id='uploadFile' hidden onChange={(e) => handleSendFile(e)} />
                {/* Khu vực nhập tin nhắn */}
                <div className='p-4 border-t border-x-gray-400 border-solid bg-blue-500'>
                    <Flex gap={'small'} className='px-4' align='center'>
                        {/* <Upload {...props}>
                            <Button  size='large' icon={<UploadOutlined />}></Button>
                        </Upload> */}
                        <label htmlFor="uploadFile" className='cursor-pointer text-white'>
                            <Paperclip size={20} />
                        </label>

                        <Input className='border-0 rounded-xl' placeholder="Nhập tin nhắn..." size="large" value={chat}
                            onChange={(e) => setChat(e.target.value)} />
                        <Button size='large' onClick={sendChat} className='text-white bg-inherit rounded-none p-2'>
                            <SendHorizontal />
                        </Button>
                    </Flex>

                    {file && (
                        // <div className='text-white flex justify-center p-2 w-full border mt-2'>
                        //     {file.name}
                        // </div>
                        <FilePrivew file={file} setFile={setFile}></FilePrivew>
                    )}
                </div>
            </Flex>
        </>
    )
}

const FileChat = (file) => {
    return (
        <>

            <a
                href={`http://127.0.0.1:8000${file.url}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                📁{file.name}
            </a>

        </>
    )
}

// Định dạng icon theo file type
const getFileIcon = (fileType) => {
    const icons = {
        pdf: <FaRegFilePdf />,
        doc: <FaRegFileWord />,
        docx: <FaRegFileWord />,
        xls: <FaRegFileExcel />,
        xlsx: <FaRegFileExcel />,
        ppt: <BsFiletypePpt />,
        jpg: <BsFiletypeJpg />,
        jpeg: <SiJpeg />,
        png: <BsFiletypePng />,
        zip: <GoFileZip />,
        rar: "📦",
        default: "📁"
    };
    return icons[fileType] || icons.default;
};

const FileCard = ({ file }) => {


    // Lấy đuôi file
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const fileIcon = getFileIcon(fileExtension);

    return (
        <div className="w-full bg-gray-100 p-3 border rounded-xl shadow-lg flex flex-col items-center">
            {/* Hình file */}
            <div className="text-5xl">

                <a href={`http://127.0.0.1:8000${file.url}`}
                    target="_blank"
                    rel="noopener noreferrer" title={file.name} className='text-blue-500'>
                    {fileIcon}
                </a>
            </div>

            {/* Tên file */}
            <a href={`http://127.0.0.1:8000${file.url}`}
                target="_blank"
                rel="noopener noreferrer" className="text-center mt-2 text-sm font-medium text-gray-700 truncate w-full" title={file.name}>
                {file.name}
            </a>

            {/* Nút tải xuống */}
            {/* <a
                href={file.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 bg-blue-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-700 transition"
            >
                Tải xuống
            </a> */}
        </div>
    );
};


const FilePrivew = ({ file, setFile }) => {


    // Lấy đuôi file
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const fileIcon = getFileIcon(fileExtension);

    return (
        <div className="w-full bg-white p-1 border rounded-md flex mt-3 items-center justify-between">

            <div className=' flex items-center'>
                <div className="text-5xl">

                    <a href={`http://127.0.0.1:8000${file.url}`}
                        target="_blank"
                        rel="noopener noreferrer" title={file.name} className='text-blue-500'>
                        {fileIcon}
                    </a>
                </div>

                {/* Tên file */}
                <a href={`http://127.0.0.1:8000${file.url}`}
                    target="_blank"
                    rel="noopener noreferrer" className=" text-sm font-medium text-gray-700 truncate w-full" title={file.name}>
                    {file.name}
                </a>
            </div>

            <a className='p-2 hover:text-red-500' onClick={() => setFile(null)}>
                <Trash2 />
            </a>

        </div>
    );
};


export const ChatItem = ({ isSender, name, chat, file, email }) => {

    return (
        <>
            <Flex gap="small" className={cn("mb-3", isSender && "flex-row-reverse")}  >


                <div
                    className={`flex gap-3  border border-1 p-2    ${isSender ? "flex-row-reverse bg-blue-500 text-white border-blue-500 rounded-bl-xl rounded-tl-xl rounded-br-3xl" : "bg-gray-200 rounded-br-xl rounded-bl-3xl rounded-tr-xl"} `}>
                    <Tooltip
                        placement="topRight"



                        title={<TitleTooltip name={name} email={email}></TitleTooltip>}
                    >
                        <Avatar className={`shrink-0 cursor-pointer font-bold shadow ${isSender ? " bg-white text-blue-500" : ""}`}
                        >
                            {name?.split(" ")
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()}
                        </Avatar>
                    </Tooltip>
                    <div className='flex flex-col justify-center gap-2'>
                        <span className='font-normal '>
                            {chat}
                        </span>
                        <span>
                            {
                                file &&
                                <FileCard file={file} />
                            }
                        </span>
                    </div>
                </div>
            </Flex>
        </>
    )
}

const TitleTooltip = ({ name, email }) => {
    return (
        <>
            <div className=" p-2 rounded-lg w-full">



                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{name}</h3>
                <a className=" text-blue-500 text-sm">{email}</a>

            </div>
        </>
    )
}


export const HeaderChat = ({ data, onClose }) => {
    return (
        <>
            <div className='mb-2'>
                <a onClick={onClose}><SquareX /></a>
            </div>
            {data &&
                (
                    <>
                        <div className='ml-5'>
                            <div>
                                <Title level={4}>{data?.name}</Title>

                                <Flex justify={"space-between"} >
                                    <span className='ml-3 font-light'>Người chịu trách nhiệm :
                                        {
                                            <Tag color="green" className='ml-2'>
                                                <p className='font-medium'>{data?.responsible_person?.name}</p>
                                            </Tag>
                                        }

                                    </span>
                                    <div>
                                        <Tag color='red'>End Task: {data?.end_time}</Tag>
                                    </div>
                                </Flex>
                            </div>

                        </div>

                        <div className='ml-5 mt-5'>
                            <Title level={5}>Mô tả:</Title>
                            <TextArea rows={3} value={data?.description} readOnly />
                        </div>

                        <div className='ml-5 mt-5'>
                            <Title level={5}>Thành viên:</Title>
                            {data?.doers?.map((item, index) => (
                                <Tag key={item.id} color={`${item.files.length !== 0 ? "green" : "red"}`} className=''>
                                    <p className='font-medium'>{item.name}</p>
                                </Tag>))
                            }
                        </div>

                    </>
                )
            }


        </>
    )
}