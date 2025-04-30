import axios from "axios";
import axiosInstance from "@/services/AxiosInstance";

const api = "http://127.0.0.1:8000/api/project-parts/";

// export const projectPartPostAPI = async (obj) => {
//     try {
//         const response = await axios.post(api, obj);
//         console.log(response)
//         return response.data;
//     } catch (error) {
//         console.log(error);
//     }
// }

export const projectPartPostAPI = async (obj) => {
    try {
        const response = await axiosInstance.post('/project-parts/', obj);
        console.log("projectPartGetAPI", response);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const projectPartPatchAPI = async (id,obj) => {
    try {
        const response = await axiosInstance.patch('/project-parts/'+id+"/", obj);
        console.log("projectPartPatchAPI", response);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const projectPartDeleteAPI = async (id) => {
    try {
        const response = await axiosInstance.delete('/project-parts/'+id+"/");
        console.log("projectPartPatchAPI", response);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


// lấy ds phần công việc của 1 dự án theo id manager
export const projectPartGetAPIForIdUser = async (id) => {
    try {
        const response = await axiosInstance.get(`/project-parts/by_manager/?manager_id=${id}`);
        console.log("projectPartGetAPIForIdUser", response);
        return response.data.results;
    } catch (error) {
        console.log(error);
    }
}

export const projectPartGetAPIWithIdDepartment = async (idDepartment) => {
    try {
        const response = await axiosInstance.get(`/project-parts/by_department/${idDepartment}/`);
        console.log("projectPartGetAPIWithIdDepartment", response);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const projectPartArchivedGetAPIWithIdDepartment = async (idDepartment) => {
    try {
        const response = await axiosInstance.get(`/project-parts/with-archived-tasks/${idDepartment}/`);
        console.log("projectPartArchivedGetAPIWithIdDepartment", response);
        return response.data.results;
    } catch (error) {
        console.log(error);
    }
}



