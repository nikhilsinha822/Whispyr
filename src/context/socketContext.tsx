import { createContext, ReactNode, useContext } from 'react'
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './authContext';

type SocketContextType = {
    socket: Socket;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const {token} = useContext(AuthContext)
    const socket = io(import.meta.env.VITE_BASE_URL, {
        extraHeaders:{
            authorization: `Bearer ${token}`
        }
    })

    return (
        <SocketContext.Provider value={{
           socket
        }}>
            {children}
        </SocketContext.Provider>
    )
}