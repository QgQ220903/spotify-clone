import axiosInstance from "./AxiosInstance";


export const getRolesAPI = (roleId) => {
    return axiosInstance.get(`/roles/${roleId}`);
}

export const rolesGetAPI = async() => {
    const res = await axiosInstance.get(`/roles/`);
    return res.data;    
}

