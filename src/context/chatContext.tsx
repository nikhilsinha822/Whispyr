import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { MessageType, ChatListType } from "../types/chat"
import axios from "axios"
import { AuthContext } from "./authContext";
import { useSearchParams } from "react-router-dom";

type ChatContextType = {
    convList: ChatListType[] | null;
    isErrorConv: boolean;
    isLoadingConv: boolean;
    activeConv: MessageType[] | null;
    isErrorActiveConv: boolean;
    isLoadingActiveConv: boolean;
    fetchConversation: () => void;
    fetchMessage: (convId: string) => void;
}


export const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useContext(AuthContext);
    const [searchParams,] = useSearchParams();
    const convId = searchParams.get('activeConv');
    const [convList, setConvList] = useState<ChatListType[] | null>(null);
    const [isErrorConv, setIsErrorConv] = useState(false);
    const [isLoadingConv, setIsLoadingConv] = useState(false);
    const [activeConv, setActiveConv] = useState<MessageType[] | null>(null);
    const [isErrorActiveConv, setIsErrorActiveConv] = useState(false);
    const [isLoadingActiveConv, setIsLoadingActiveConv] = useState(false);

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
            console.log(error)
            setIsErrorConv(true);
        } finally {
            setIsLoadingConv(false);
        }
    }, [token])

    const fetchMessage = useCallback(async () => {
        try {
            setIsErrorActiveConv(false);
            setIsLoadingActiveConv(true);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/chat/chatMessage/${convId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setActiveConv(response.data.data);
        } catch (error) {
            console.log(true);
            setIsErrorActiveConv(true)
        } finally {
            setIsLoadingActiveConv(false);
        }
    }, [token, convId])

    const markConversationAsRead = useCallback(() => {
        setConvList((prevList) =>
            prevList?.map((conv) =>
                conv._id === convId ? { ...conv, unreadMessageCount: 0 } : conv
            ) || null
        );
    }, [convId]);

    useEffect(() => {
        fetchConversation();
    }, [fetchConversation])

    useEffect(() => {
        (async () => {
            if (convId) {
                await fetchMessage()
                markConversationAsRead();
            }
        })()
    }, [convId, fetchMessage, markConversationAsRead])

    return <ChatContext.Provider value={{
        convList, isErrorConv, isLoadingConv,
        activeConv, isErrorActiveConv, isLoadingActiveConv,
        fetchMessage,
        fetchConversation
    }}>
        {children}
    </ChatContext.Provider>
}