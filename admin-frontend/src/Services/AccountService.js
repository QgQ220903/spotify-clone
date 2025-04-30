import axiosInstance from "./AxiosInstance";
import axios from "axios";

export const accountGetAPI = async () => {
    const res = await axiosInstance.get("/account/get_all_acount/");
    console.log("accountGetAPI", res.data);
    return res.data;
};

export const accountPostAPI = async (obj) => {
    try {
        const res = await axiosInstance.post("/account/", obj);
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const accountPutAPI = async (obj, id) => {
    try {
        const res = await axiosInstance.put(`/account/${id}/update_account/`, obj);
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const accountDeleteAPI = async (is_deleted, id) => {
    try {
        const res = await axiosInstance.patch(`/account/${id}/`, {
            "is_deleted": is_deleted
        });
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const logInAPI = async (obj) => {
    // return axiosInstance.post("/account/login/",obj);
    try {
        const response = await axios.post("http://127.0.0.1:8000/api/account/login/", obj);
        console.log("logInAPI", response);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const logOutAPI = async (obj) => {
    // return axiosInstance.post("/account/logout/",obj);
    try {
        const response = await axios.post("http://127.0.0.1:8000/api/account/logout/", obj);
        console.log(response);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};
