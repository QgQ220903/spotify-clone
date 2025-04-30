import axios from "axios";
import axiosInstance from "@/services/AxiosInstance";

const api = "http://127.0.0.1:8000/api/departments/";

// departments/get_all_departments/

export const departmentGetAllAPI = async () => {
    try {
        const response = await axiosInstance.get("/departments/get_all_departments/");
        console.log("employeeGetAllAPI", response);
        return response.data;
    } catch (error) {
        throw error;
        console.log(error);
    }
};

export const departmentGetAPI = async () => {
    try {
        const response = await axiosInstance.get("/departments/get_all_departments/");
        console.log(response);
        return response.data;
    } catch (error) {
        throw error;
        console.log(error);
    }
};

export const departmentPostAPI = async (obj) => {
    try {
        console.log("posy", obj);
        const response = await axiosInstance.post("/departments/", obj);
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw error;
        console.log(error);
    }
};

export const updateManagerForDepartmentAPI = async (obj) => {
    try {
        console.log("API put", obj);
        const response = await axiosInstance.put("/departments/" + obj.id + "/", obj);
        console.log("updateManagerForDepartmentAPI", response.data);
        return response;
    } catch (error) {
        console.log(error);
    }
};

// hàm này ko còn dùng ở department page nhớ kiểm tra xem còn dùng ở đâu không
export const employeeGetAPI = async () => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/api/employees/");
        return response.data.results;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nhân viên:", error);
    }
};

export const departmentPutAPI = async (data) => {
    try {
        // console.log("id,payload", id, obj);
        const response = await axiosInstance.put("/departments/" + data.id + "/", data.obj);
        console.log("Updated Department:", response.data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const departmentDeleteAPI = async (id) => {
    try {
        const response = await axiosInstance.delete("/departments/" + id + "/");
        console.log("Deleted Department:", response.data);
        return response.data;
    } catch (error) {
        throw error;
        console.log(error);
    }
};
