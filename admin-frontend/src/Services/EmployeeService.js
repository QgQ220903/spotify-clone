import axios from "axios";
import axiosInstance from "@/services/AxiosInstance";

// http://localhost:8000/api/departments/1/employees/
const api = "http://127.0.0.1:8000/api/employees/";

export const employeeGetAPI = async () => {
    try {
        const response = await axiosInstance.get("/employees/get_all_employees/");
        console.log("employeeGetAPI", response);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const employeeGetAllAPI = async () => {
    try {
        const response = await axiosInstance.get("/employees/get_all_employees/");
        console.log("employeeGetAllAPI", response);
        return response.data.results;
    } catch (error) {
        console.log(error);
    }
};

export const employeeGetAllAPIWithDepartment = async (idDepartment) => {
    try {
        const response = await axiosInstance.get(`/employees/get_by_department/${idDepartment}/`);
        console.log("employeeGetAllAPIWithDepartment", response);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const employeePostAPI = async (obj) => {
    try {
        const response = await axiosInstance.post("/employees/", obj);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const employeePutAPI = async (employe) => {
    try {
        console.log("api", employe.obj);
        const response = await axiosInstance.put(`/employees/${employe.id}/`, employe.obj);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// sửa chức vụ
export const employeePatchAPI = async (id,obj) => {
    try {
        console.log("obj", obj);
        const response = await axiosInstance.patch(`/employees/${id}/`,obj);
        console.log("employeePatchAPI", response);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};


export const employeeDeleteAPI = async (id) => {
    try {
        await axios.delete(`${api}${id}/`);
    } catch (error) {
        console.log(error);
        throw error;
    }
};
