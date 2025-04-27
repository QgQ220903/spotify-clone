import axios from "axios";
import axiosInstance from "./AxiosInstance";

export const fileAssignmentPostAPI = async(obj) => {
    try {
        const response = await axiosInstance.post("/file-details/",obj);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// const api = "http://127.0.0.1:8000/api/departments/";