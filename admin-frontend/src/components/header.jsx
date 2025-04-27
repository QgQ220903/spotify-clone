import { useTheme } from "@/hooks/use-theme";

import { useEffect, useState } from "react";

import { Bell, ChevronsLeft, Moon, Search, Sun } from "lucide-react";

import profileImg from "@/assets/profile-image.jpg";

import PropTypes from "prop-types";

import { Link } from "react-router-dom";

import { Dropdown, Space, Avatar, Typography } from 'antd';

import { logOutAPI } from "@/services/AccountService";

import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/use-auth";

import { getInitials } from "@/utils/cn"

import { removeLocalStorageWhenLogout } from "@/utils/cn";

import { checkAndRefreshToken } from "@/utils/token";

export const Header = ({ collapsed, setCollapsed }) => {

    const { theme, setTheme } = useTheme();

    const { features, setFeatures, setAuth, auth, employeeContext } = useAuth();

    console.log("employeeContext", employeeContext)

    const [isChecking, setIsChecking] = useState(true);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            const valid = await checkAndRefreshToken();
            setIsValid(valid);
            setIsChecking(false);
        };
        console.log("isValid", isValid)
        verifyToken();
    }, []);


    const navigate = useNavigate();
    const getRefreshToken = () => localStorage.getItem("refresh");
    const queryClient = useQueryClient();

    const { data: newData, mutate: mutatePost } = useMutation({
        mutationFn: logOutAPI,
        onSuccess: () => {

            removeLocalStorageWhenLogout()
            setFeatures([])
            setAuth({})
            navigate('/login');
        },
        onError: (error) => {
            console.log(error)
        },
    });

    const handleLogout = () => {
        mutatePost({
            refresh: getRefreshToken(),
        });
    };

    const items = [
        {
            key: '0',
            label: (
                <Typography.Title level={5} >
                    {employeeContext?.name || auth?.role.name }
                </Typography.Title >
            ),
            disabled: true,

        },
        {
            type: 'divider',
        },
        {
            key: '1',
            label: (
                !isValid ? <Link to="login" rel="noopener noreferrer">
                    Login
                </Link> : <Link rel="noopener noreferrer" onClick={handleLogout}>
                    Logout
                </Link>
            ),
        },
        // {
        //     key: '2',
        //     label: (
        //         <Link rel="noopener noreferrer" onClick={handleLogout}>
        //             Logout
        //         </Link>
        //     ),
        // },


    ];

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed && "rotate-180"} />
                </button>
                {/* <div className="input">
                    <Search
                        size={20}
                        className="text-slate-300"
                    />
                    <input
                        type="text"
                        name="search"
                        id="search"
                        placeholder="Search..."
                        className="w-full bg-transparent text-slate-900 outline-0 placeholder:text-slate-300 dark:text-slate-50"
                    />
                </div> */}
            </div>
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    <Sun
                        size={20}
                        className="dark:hidden"
                    />
                    <Moon
                        size={20}
                        className="hidden dark:block"
                    />
                </button>
                <button className="btn-ghost size-10">
                    <Bell size={20} />
                </button>
                <Dropdown
                    menu={{
                        items,
                    }}
                    trigger={['click']}
                    arrow
                    overlayStyle={{ marginTop: '15px', width: '10%' }}
                >
                    <button className="size-10 overflow-hidden rounded-full">
                        {/* <img
                            src={profileImg}
                            alt="profile image"
                            className="size-full object-cover"
                        /> */}
                        {
                   
                           
                        }
                       { <Avatar className="bg-blue-500" size="large" >
                            {getInitials(employeeContext?.name)
                                || (auth?.role.name === "Admin" ? "Admin" : getInitials(auth?.role.name))
                            }
                        </Avatar>}
                    </button>
                </Dropdown>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
