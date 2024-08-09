import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { ChatProvider } from "../context/chatContext"

const AuthComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated !== null) {
            setLoading(false);
        }
    }, [isAuthenticated]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated === false) {
        return <Navigate to='/signin' />;
    }

    return (
        <div>
            <ChatProvider>
                {children}
            </ChatProvider>
        </div>);
};

export default AuthComponent;