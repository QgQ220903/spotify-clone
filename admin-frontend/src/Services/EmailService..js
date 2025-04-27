import axiosInstance from "./AxiosInstance";
import axios from "axios";

// {
//     subject:"",
//     message:"",
//     recipient:"",
//      send_at
// }

export const sendEmail = async(obj) =>{
    try{
        const response = await axiosInstance.post("/email/send/",{
            subject: obj.subject,
            message: obj.message,
            recipient: obj.recipient,
            send_at: obj.send_at,
        });
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}