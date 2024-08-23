import { ActiveConvType, MessageType, statusType, ChatListType } from "../types/chat";

export type ChatAction =
    | { type: 'SET_ACTIVE_CONV', payload: { convId: string, activeConv: ActiveConvType | null } }
    | { type: 'SET_MESSAGES', payload: MessageType[] }
    | { type: 'ADD_MESSAGE_ACTIVE', payload: { message: MessageType, conversation: ChatListType } }
    | { type: 'UPDATE_MESSAGE_STATUS', payload: { messageId: string, readBy: statusType[] } }
    | { type: "SET_CONVLIST", payload: ChatListType[] }
    | { type: "UPDATE_UNREAD_ZERO", payload: string }
    | { type: "APPEND_NEW_MESSAGE", payload: ChatListType }
    | { type: "UPDATE_CONV_SEEN", payload: { userId: string, conversation: string } }

export type chatStateType = {
    convList: ChatListType[];
    activeConv: ActiveConvType | null;
} | null;

export const chatReducer = (state: chatStateType, action: ChatAction): chatStateType => {
    switch (action.type) {
        case 'SET_ACTIVE_CONV': {
            if (!state || !state.convList) return null;
            return {
                convList: state.convList.map((conv) => conv._id === action.payload.convId ?
                    { ...conv, unreadMessageCount: 0 } : conv),
                activeConv: action.payload.activeConv
            };
        }
        case 'ADD_MESSAGE_ACTIVE': {
            if (!state?.activeConv) return null;
            const conversation = action.payload.conversation
            const message = action.payload.message
            const unreadMessageCount = 0;
            const newConversation = { ...action.payload.conversation, unreadMessageCount };
            return {
                convList: [newConversation, ...state.convList.filter((conv) => conv._id !== conversation._id)],
                activeConv: {
                    ...state.activeConv,
                    messages: [message, ...state.activeConv.messages]
                }
            };
        }
        case 'SET_MESSAGES': {
            if (!state?.activeConv) return null;
            return {
                ...state,
                activeConv: {
                    ...state.activeConv,
                    messages: action.payload
                }
            }
        }
        case 'UPDATE_MESSAGE_STATUS': {
            if (!state?.activeConv) return null;
            return {
                ...state,
                activeConv: {
                    ...state.activeConv,
                    messages: state?.activeConv.messages.map(message =>
                        message._id === action.payload.messageId
                            ? { ...message, readBy: action.payload.readBy }
                            : message
                    )
                }
            }
        }
        case "SET_CONVLIST": {
            console.log(typeof (action.payload));
            return {
                convList: action.payload,
                activeConv: null
            }
        }
        case "APPEND_NEW_MESSAGE": {
            if (!state) return null
            const unreadMessageCount = (state.convList.find((conv) => conv._id == action.payload._id)?.unreadMessageCount || 0) + 1;
            const newConversation = { ...action.payload, unreadMessageCount };
            const updatedConvList = state.convList.filter((conv) => conv._id !== action.payload._id)
            return {
                ...state,
                convList: [newConversation, ...updatedConvList]
            }
        }
        case "UPDATE_CONV_SEEN": {
            if (!state) return null;
            if (state.activeConv?._id !== action.payload.conversation) return state;
            return {
                ...state,
                activeConv: {
                    ...state.activeConv,
                    messages: state.activeConv.messages.map((message) => ({
                        ...message,
                        readBy: message.readBy.map((rb) => (
                            rb.user === action.payload.userId ?
                                { ...rb, status: 2 } : rb
                        ))
                    }))
                }
            }
        }
        default:
            return state;
    }
}