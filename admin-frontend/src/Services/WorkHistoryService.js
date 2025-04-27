import axiosInstance from "./AxiosInstance";
import axios from "axios";

export const workHistoriesGetAPI = async () => {
    const res =  await axiosInstance.get("/work-histories/");
    console.log("accountGetAPI",res.data);
    return res.data;
}

export const workHistoriesPostAPI = async (obj) => {
    const res =  await axiosInstance.post("/work-histories/", obj);
    console.log("accountGetAPI",res.data);
    return res.data;
}