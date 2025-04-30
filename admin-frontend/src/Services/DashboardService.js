//http://127.0.0.1:8000/api/tasks/task-report/report/

import axiosInstance from "./AxiosInstance";


const controller  = '/tasks/task-report/report/';

export const dashboardGetAPI = async (obj) => {
    const res =  await axiosInstance.post(controller,obj);
    return res;
}