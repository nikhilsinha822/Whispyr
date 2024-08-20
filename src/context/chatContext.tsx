import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { ChatListType, ActiveConvType } from "../types/chat"
import axios from "axios"
import { AuthContext } from "./authContext";
import { useSearchParams } from "react-router-dom";
import useSocketContext from "../hooks/useSocketContext";
import { MessageType } from "../types/chat";

type ChatContextType = {
    convList: ChatListType[] | null;
    isErrorConv: boolean;
    isLoadingConv: boolean;
    activeConv: ActiveConvType | null;
    setActiveConv: React.Dispatch<React.SetStateAction<ActiveConvType | null>>;
    isErrorActiveConv: boolean;
    isLoadingActiveConv: boolean;
    fetchConversation: () => void;
    fetchMessage: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useContext(AuthContext);
    const [searchParams,] = useSearchParams();
    const convId = searchParams.get('activeConv') || null;
    const [convList, setConvList] = useState<ChatListType[] | null>(null);
    const [isErrorConv, setIsErrorConv] = useState(false);
    const [isLoadingConv, setIsLoadingConv] = useState(false);
    const [activeConv, setActiveConv] = useState<ActiveConvType | null>(null);
    const [isErrorActiveConv, setIsErrorActiveConv] = useState(false);
    const [isLoadingActiveConv, setIsLoadingActiveConv] = useState(false);
    const { socket } = useSocketContext()

    const fetchConversation = useCallback(async () => {
        try {
            setIsErrorConv(false)
            setIsLoadingConv(true)
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/chat/chatList`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setConvList(response.data.data)
        } catch (error) {
            setIsErrorConv(true);
        } finally {
            setIsLoadingConv(false);
        }
    }, [token])

    const fetchMessage = useCallback(async () => {
        try {
            const convToFetch = convList?.find((conv) => conv._id === convId);
            if (!convToFetch || !convId || convToFetch._id === activeConv?._id) return;

            setIsErrorActiveConv(false);
            setIsLoadingActiveConv(true);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/chat/chatMessage/${convId}`,
                { headers: { Authorization: `Bearer ${token}` } })

            const newActiveConv = { ...convToFetch, messages: response.data.data };
            setActiveConv(newActiveConv);

            const updatedConvList = convList?.map((conv) => conv._id === convId ? { ...conv, unreadMessageCount: 0 } : conv)
            if (!updatedConvList) return;

            setConvList(updatedConvList);
        } catch (error) {
            setIsErrorActiveConv(true)
        } finally {
            setIsLoadingActiveConv(false);
        }
    }, [convList, convId, activeConv?._id, token])

    useEffect(() => {
        fetchConversation();
    }, [fetchConversation])

    useEffect(() => {
        if (!convId || convId === activeConv?._id) return;
        fetchMessage();
    }, [fetchMessage, convId, activeConv]);

    useEffect(() => {
        const handleReceiveNewMessage = (payload: MessageType) => {
            if (!activeConv || activeConv._id !== payload.conversation) return;

            const updatedConvList = activeConv?.messages.length ?
                [payload, ...activeConv.messages] : [payload]
            setActiveConv({ ...activeConv, messages: updatedConvList })
        }

        socket.on("receive:newMessage", handleReceiveNewMessage)
        return () => {
            socket.off("receive:newMessage", handleReceiveNewMessage)
        }
    }, [activeConv, socket])

    return <ChatContext.Provider value={{
        convList, isErrorConv, isLoadingConv,
        activeConv, isErrorActiveConv, isLoadingActiveConv,
        fetchMessage, setActiveConv,
        fetchConversation
    }}>
        {children}
    </ChatContext.Provider>
}