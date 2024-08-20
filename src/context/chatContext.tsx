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

type ReceivedMessagePayloadType = Omit<MessageType, 'conversation'> & {
    conversation: ChatListType;
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
        const handleReceiveNewMessage = (payload: ReceivedMessagePayloadType) => {
            if (!convList) return;

            const unreadMessageCount = (convList.find((conv) => conv._id == payload.conversation._id)?.unreadMessageCount || 0) + 1;
            const newConversation = { ...payload.conversation, unreadMessageCount };
            let updatedConvList = convList.filter((conv) => conv._id !== payload.conversation._id)
            updatedConvList = [newConversation, ...updatedConvList]
            setConvList(updatedConvList);
            socket.emit("send:receivedMessage", { messageID: payload._id })

            if (!activeConv || activeConv._id !== payload.conversation._id) return;

            const newMessagePayload = { ...payload, conversation: payload.conversation._id }
            const updatedMessages = activeConv?.messages.length ?
                [newMessagePayload, ...activeConv.messages] : [newMessagePayload]
            setActiveConv({ ...activeConv, messages: updatedMessages })
            socket.emit("send:seenMessage", { messageID: payload._id })
        }

        socket.on("receive:newMessage", handleReceiveNewMessage)
        return () => {
            socket.off("receive:newMessage", handleReceiveNewMessage)
        }
    }, [activeConv, convList, socket])

    useEffect(() => {
        const handleMessageStatus = (payload: MessageType) => {
            if (!activeConv || payload.conversation !== activeConv?._id) return;

            const updatedStatus = payload.readBy;
            const messageToUpdate = activeConv.messages.find((message) => message._id === payload._id)
            if(!messageToUpdate) return;

            const status = messageToUpdate.readBy.map((oldStat) => {
                const newStatus = updatedStatus.find((stat) => stat._id === oldStat._id)
                if(!newStatus) return oldStat;
                return { ...oldStat, status: Math.max(Number(oldStat.status), Number(newStatus.status)) }
            })
            console.log("before=>", messageToUpdate.readBy, "update=>",updatedStatus, "after=>", status)

            const updatedMessage = activeConv.messages.map(
                (message) => message._id === payload._id ? { ...payload, readBy: status } : message)

            setActiveConv({ ...activeConv, messages: updatedMessage })
        }

        socket.on("receive:receivedMessage", handleMessageStatus)
        socket.on("receive:seenMessage", handleMessageStatus)

        return () => {
            socket.off("receive:receivedMessage", handleMessageStatus)
            socket.off("receive:seenMessage", handleMessageStatus)
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