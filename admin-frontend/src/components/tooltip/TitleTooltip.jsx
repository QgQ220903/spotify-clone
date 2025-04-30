import {Avatar} from "antd";

const TitleTooltip = ({ name, position, email }) => {
    return (
        <>
            <div className="flex items-center space-x-2  p-2 rounded-lg w-full">
                {/* Avatar */}
                <div className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white font-bold text-lg rounded-full dark:bg-white dark:text-blue-600">
                    {name
                        ?.split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}
                </div>
                

             
                <div className="">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{name}</h3>
                    <p className=" text-gray-600 dark:text-gray-400">{position==="TP"? "Trường phòng" : position==="TN"? "Trưởng nhóm" : "Nhân viên"}</p>
                    <a className="text-blue-500 text-sm">{email}</a>
                </div>
            </div>
        </>
    )
}

export default TitleTooltip