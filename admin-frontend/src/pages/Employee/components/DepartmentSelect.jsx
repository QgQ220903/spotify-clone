import { Select, Form } from "antd";

const DepartmentSelect = ({ departmentDataFilter, value, onChange }) => {
    const position = Form.useWatch("position"); // Theo dõi giá trị "position"

    return (
        <Select
            placeholder={
                position ? "Chọn phòng ban" : "Vui lòng chọn chức vụ trước"
            }
            disabled={!position}
            value={value}         // ✅ bắt buộc
            onChange={onChange}   // ✅ bắt buộc
            options={departmentDataFilter?.map((item) => ({
                value: item.id,
                label: item.name,
            }))}
        />
    );
};

export default DepartmentSelect;
