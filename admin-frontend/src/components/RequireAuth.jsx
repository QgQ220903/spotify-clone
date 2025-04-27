import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { checkAndRefreshToken } from "@/utils/token";

const RequireAuth = ({ children }) => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            const valid = await checkAndRefreshToken();
            setIsValid(valid);
            setIsChecking(false);
        };

        verifyToken();
    }, []);

    if (isChecking) {
        return <div>Checking authentication...</div>; // hoặc spinner
    }

    if (!isValid) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default RequireAuth;
