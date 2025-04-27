import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from '@/services/AxiosInstance';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const [features, setFeatures] = useState([]);
    const [employeeContext, setEmployeeContext] = useState([]);
    // console.log("AuthProvider 1 lần", auth)
    const loadRoleUser = async (idRole) => {
        if (idRole) {

            const res = await axiosInstance.get(`/roles/${idRole}`);
            // console.log('loadRoleUser',res)
            setFeatures(res.data.role_details);
           
        }
    };

    useEffect(() => {
        // console.log("loadRoleUser useEffect")
        const authStorage = JSON.parse(localStorage.getItem("auth"));
        if (authStorage) {
            setAuth(authStorage);
            if (authStorage.employee) {
                setEmployeeContext(authStorage.employee);
                console.log('authStorage.employee', employeeContext)
            }
            loadRoleUser(authStorage.role.id); // Load khi app chạy
        }
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth, features, setFeatures, loadRoleUser, employeeContext, setEmployeeContext }}>
            {children}
        </AuthContext.Provider>
    );
};

// export const useAuth = () => useContext(AuthContext);
