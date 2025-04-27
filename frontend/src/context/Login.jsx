import { createContext, useState } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [checklogin, setCheckLogin] = useState(true);

    return (
        <LoginContext.Provider value={{ checklogin, setCheckLogin }}>
            {children}
        </LoginContext.Provider>
    );
};
export default LoginProvider;