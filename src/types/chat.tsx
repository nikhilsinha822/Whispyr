export type AssetType = {
    publicId: string,
    publicUrl: string
}

export type UserType = {
    _id: string,
    email: string,
    name?: string,
    avatar?: AssetType
}


export type statusType = {
    user: string,
    status: number,
    timestamp: string,
    _id: string
}

export type MessageType = {
    _id: string,
    text?: string,
    sender: string,
    conversation: string,
    readBy: statusType[],
    assets?: AssetType[],
    createdAt: string,
    updatedAt: string
}

export type ChatListType = {
    _id: string,
    name: string
    participants: UserType[],
    type: number,
    lastMessage: MessageType,
    createdAt: string,
    updatedAt: string,
    unreadMessageCount: number
}

export type ActiveConvType = ChatListType & {
    messages: MessageType[];
}