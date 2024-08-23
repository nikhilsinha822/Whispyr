import { ChatAction } from '../reducers/chatReducers'
import { ActiveConvType, MessageType, statusType } from '../types/chat'
import { ChatListType } from "../types/chat";

export const setActiveConv = (payload: { convId: string, activeConv: ActiveConvType | null }): ChatAction => ({
    type: 'SET_ACTIVE_CONV',
    payload: payload
})

export const setMessages = (payload: MessageType[]): ChatAction => ({
    type: 'SET_MESSAGES',
    payload: payload
})

export const addMessageActive = (payload: { message: MessageType, conversation: ChatListType }): ChatAction => ({
    type: 'ADD_MESSAGE_ACTIVE',
    payload: payload
})

export const updateMessageStatus = (payload: { messageId: string, readBy: statusType[] }): ChatAction => ({
    type: 'UPDATE_MESSAGE_STATUS',
    payload: payload
})

export const setConvList = (payload: ChatListType[]): ChatAction => ({
    type: "SET_CONVLIST",
    payload: payload
})

export const updateUnreadZero = (payload: string): ChatAction => ({
    type: "UPDATE_UNREAD_ZERO",
    payload: payload
})

export const appendNewMessage = (payload: ChatListType): ChatAction => ({
    type: "APPEND_NEW_MESSAGE",
    payload: payload
})

export const updateConvSeen = (payload: { userId: string, conversation: string }): ChatAction => ({
    type: "UPDATE_CONV_SEEN",
    payload: payload
})


