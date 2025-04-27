import axios from "axios";

const api = "http://127.0.0.1:8000/api/projects/";

export const projectGetAPI = async (page) => {
    try {
        const response = await axios.get(`${api}?page=${page}`);
        console.log("projectGetAPI",response)
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const projectPartGetAPI = async (id) => {
    try {
        const response = await axios.get(api+id);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.log(error);
    }
};


export const projectPostAPI = async (obj) => {
    try {
        const response = await axios.post(api, obj);
        console.log("projectPostAPI",response)
        return response;
    } catch (error) {
        console.log(error);
    }
}

export const projectDeleteAPI = async (id) => {
    try {
        const response = await axios.patch(`${api}${id}/`, {
            is_deleted: true
        });
        console.log("projectDeleteAPI",response)
        return response;
    } catch (error) {
        console.log(error);
    }
}

export const projectUpdateAPI = async (id, obj) => {
    try {
        const response = await axios.patch(`${api}${id}/`, obj);
        console.log("projectUpdateAPI",response)
        return response;
    } catch (error) {
        console.log(error);
    }
}