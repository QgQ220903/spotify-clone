import axios from "axios";

const api = 'http://localhost:8000/api/department-tasks/'

export const departmentTaskPost = async (obj) => {
    try {
        const response = await axios.post(api, obj);
        // console.log("departmentTaskPost",response.data)
        return response.data;
    } catch (error) {
        console.log(error);
    }
};