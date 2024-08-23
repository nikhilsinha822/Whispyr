import { createContext, ReactNode, useCallback, useContext, useEffect, useState, useReducer } from "react"
import { ChatListType } from "../types/chat"
import axios from "axios"
import { AuthContext } from "./authContext";
import { useSearchParams } from "react-router-dom";
import useSocketContext from "../hooks/useSocketContext";
import { MessageType } from "../types/chat";
import { ChatAction, chatStateType } from "../reducers/chatReducers";
import { addMessageActive, setActiveConv, updateMessageStatus, setConvList, appendNewMessage, updateConvSeen } from "../actions/chatActions";
import { chatReducer } from "../reducers/chatReducers";

type ChatContextType = {
    isErrorConv: boolean;
    isLoadingConv: boolean;
    chatState: chatStateType
    dispatchChat: React.Dispatch<ChatAction>
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
    const { user, token } = useContext(AuthContext);
    const [searchParams,] = useSearchParams();
    const convId = searchParams.get('activeConv') || null;
    const [isErrorConv, setIsErrorConv] = useState(false);
    const [isLoadingConv, setIsLoadingConv] = useState(false);
    const [isErrorActiveConv, setIsErrorActiveConv] = useState(false);
    const [isLoadingActiveConv, setIsLoadingActiveConv] = useState(false);
    const { socket } = useSocketContext()
    const [chatState, dispatchChat] = useReducer(chatReducer, null)

    const fetchConversation = useCallback(async () => {
        try {
            setIsErrorConv(false)
            setIsLoadingConv(true)
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/chat/chatList`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const convListResponse = response.data.data
            dispatchChat(setConvList(convListResponse))
        } catch (error) {
            setIsErrorConv(true);
        } finally {
            setIsLoadingConv(false);
        }
    }, [token])

    const fetchMessage = useCallback(async () => {
        try {
            if (!chatState) return;
            const { convList, activeConv } = chatState;

            const convToFetch = convList?.find((conv) => conv._id === convId);
            if (!convToFetch || !convId || convToFetch._id === activeConv?._id) return;

            setIsErrorActiveConv(false);
            setIsLoadingActiveConv(true);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/chat/chatMessage/${convId}`,
                { headers: { Authorization: `Bearer ${token}` } })

            const newActiveConv = { ...convToFetch, messages: response.data.data };
            dispatchChat(setActiveConv({ convId, activeConv: newActiveConv }))
        } catch (error) {
            setIsErrorActiveConv(true)
        } finally {
            setIsLoadingActiveConv(false);
        }
    }, [chatState, convId, token])

    useEffect(() => {
        fetchConversation();
    }, [fetchConversation])

    useEffect(() => {
        if (!convId || convId === chatState?.activeConv?._id) return;
        fetchMessage()
            .then(() => socket.emit('send:seenConversation', { userId: user?._id, conversation: convId }))
            .catch(err => console.log(err))
        
    }, [fetchMessage, convId, chatState?.activeConv?._id, socket, user?._id]);

    useEffect(() => {
        const handleReceiveNewMessage = (payload: ReceivedMessagePayloadType) => {
            if (!chatState?.convList) return;

            if (!chatState?.activeConv || chatState?.activeConv._id !== payload.conversation._id) {
                dispatchChat(appendNewMessage(payload.conversation))
                socket.emit("send:receivedMessage", { messageID: payload._id })
            } else {
                const newMessagePayload = { ...payload, conversation: payload.conversation._id }
                dispatchChat(addMessageActive({ conversation: payload.conversation, message: newMessagePayload }));
                socket.emit("send:seenMessage", { messageID: payload._id })
            }
        }

        socket.on("receive:newMessage", handleReceiveNewMessage)

        return () => {
            socket.off("receive:newMessage", handleReceiveNewMessage)
        }
    }, [chatState?.activeConv, chatState?.convList, socket])

    useEffect(() => {
        const handleMessageStatus = (payload: MessageType) => {
            if (!chatState?.activeConv || payload.conversation !== chatState?.activeConv?._id) return;

            const updatedStatus = payload.readBy;
            const messageToUpdate = chatState?.activeConv.messages.find((message) => message._id === payload._id)
            if (!messageToUpdate) return;

            const status = messageToUpdate.readBy.map((oldStat) => {
                const newStatus = updatedStatus.find((stat) => stat._id === oldStat._id)
                if (!newStatus) return oldStat;
                return { ...oldStat, status: Math.max(Number(oldStat.status), Number(newStatus.status)) }
            })

            dispatchChat(updateMessageStatus({ messageId: payload._id, readBy: status }))
        }

        const handleMessageSeen = (payload: MessageType) => {
            if (!chatState?.activeConv || payload.conversation !== chatState?.activeConv?._id) return;

            const updatedStatus = payload.readBy;
            const messageToUpdate = chatState?.activeConv.messages.find((message) => message._id === payload._id)
            if (!messageToUpdate) return;

            const status = messageToUpdate.readBy.map((oldStat) => {
                const newStatus = updatedStatus.find((stat) => stat._id === oldStat._id)
                if (!newStatus) return oldStat;
                return { ...oldStat, status: Math.max(Number(oldStat.status), Number(newStatus.status)) }
            })

            dispatchChat(updateMessageStatus({ messageId: payload._id, readBy: status }))
        }

        socket.on("receive:receivedMessage", handleMessageStatus)
        socket.on("receive:seenMessage", handleMessageSeen)

        return () => {
            socket.off("receive:receivedMessage", handleMessageStatus)
            socket.off("receive:seenMessage", handleMessageStatus)
            // socket.off("receive:seenConversation", handleConversationSeen)
        }
    }, [chatState?.activeConv, socket])

    useEffect(() => {
        const handleConversationSeen = (payload: { userId: string, conversation: string }) => {
            console.log("handle see conversation", payload.userId, payload.conversation);
            dispatchChat(updateConvSeen(payload));
        }

        socket.on("receive:seenConversation", handleConversationSeen)

        return () => {
            socket.off("receive:seenConversation", handleConversationSeen)
        }
    }, [socket])

    return <ChatContext.Provider value={{
        isErrorConv, isLoadingConv,
        isErrorActiveConv, isLoadingActiveConv,
        chatState, dispatchChat,
        fetchMessage, fetchConversation
    }}>
        {children}
    </ChatContext.Provider>
}