import { FaRegFilePdf } from "react-icons/fa6";
import { FaRegFileWord, FaRegFileExcel  } from "react-icons/fa";
import { BsFiletypePng, BsFiletypePpt, BsFiletypeJpg   } from "react-icons/bs";
import { SiJpeg } from "react-icons/si";
import { GoFileZip } from "react-icons/go";

export const FileCard = ({ file }) => {
    // Định dạng icon theo file type
    const getFileIcon = (fileType) => {
        const icons = {
            pdf: <FaRegFilePdf />,
            doc: <FaRegFileWord />,
            docx: <FaRegFileWord />,
            xls: <FaRegFileExcel/>,
            xlsx: <FaRegFileExcel/>,
            ppt: <BsFiletypePpt/>,
            jpg: <BsFiletypeJpg/>,
            jpeg: <SiJpeg/>,
            png: <BsFiletypePng/>,
            zip: <GoFileZip/>,
            rar: "📦",
            default: "📁"
        };
        return icons[fileType] || icons.default;
    };

    // Lấy đuôi file
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const fileIcon = getFileIcon(fileExtension);

    return (
        <div className="w-full bg-white p-3 border rounded-xl shadow-lg flex flex-col items-center">
            {/* Hình file */}
            <div className="text-5xl">
               
                <a href={file.link}
                target="_blank"
                rel="noopener noreferrer" title={file.name}>
                 {fileIcon}
            </a>
            </div>

            {/* Tên file */}
            <a href={file.link}
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
