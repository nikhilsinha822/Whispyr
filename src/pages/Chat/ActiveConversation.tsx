import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { v4 as uuid } from 'uuid'
import { IoMdSend } from "react-icons/io";
import SentMessage from './SentMessage';
import ReceivedMessage from './ReceivedMessage';
import useChatContext from "../../hooks/useChatContext";
import useSocketContext from "../../hooks/useSocketContext";
import { MessageType, ChatListType } from "../../types/chat";
import { setMessages } from "../../actions/chatActions";
// import { appendNewMessage } from "../../actions/convListAction";

type SentMessageResponseType = {
    success: boolean,
    message: Omit<MessageType, 'conversation'> & {
        conversation: ChatListType;
    }
}

const ActiveConversation = () => {
    const { user, logoutState } = useContext(AuthContext);
    const { socket } = useSocketContext()
    const { chatState, dispatchChat } = useChatContext();
    const [newMessage, setNewMessage] = useState("");
    const [assets,] = useState([]);
    if (!user) logoutState();

    const handleNewMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newMessage === "") return;

        const receiverEmail = chatState?.activeConv?.participants.filter((partcipant) => partcipant._id != user?._id) || []
        const sentMessage = {
            assets,
            _id: uuid(),
            text: newMessage,
            sender: user?._id,
            type: chatState?.activeConv?.type,
            conversationId: chatState?.activeConv?._id,
            receiverEmail: receiverEmail[0].email,
        }
        socket.emit("send:newMessage", sentMessage);
        setNewMessage("");
    }

    useEffect(() => {
        const messageUpdateEvent = (payload: SentMessageResponseType) => {
            if(!chatState) return;
            const {convList} = chatState;
            const sentMessageResponse = payload.message;
            const updatedMessage = { ...sentMessageResponse, conversation: sentMessageResponse.conversation._id }
            if (!chatState?.activeConv || updatedMessage.conversation !== chatState?.activeConv._id || !convList) return;

            // const unreadMessageCount = 0;
            // const newConversation = { ...sentMessageResponse.conversation, unreadMessageCount };
            // let updatedConvList = convList.filter((conv) => conv._id !== sentMessageResponse.conversation._id)
            // updatedConvList = [newConversation, ...updatedConvList]
            // setConvList(updatedConvList);
            // dispatchConvList(appendNewMessage(sentMessageResponse.conversation))

            const newMessagePayload = chatState?.activeConv?.messages.length ?
                [updatedMessage, ...chatState.activeConv.messages] :
                [updatedMessage]
            dispatchChat(setMessages(newMessagePayload))
        }

        socket.on("messageSent", messageUpdateEvent)
        return () => {
            socket.off('messageSent', messageUpdateEvent)
        }
    }, [chatState, chatState?.activeConv, dispatchChat, socket])

    return <div className="h-screen flex flex-col w-2/3">
        <div className="flex flex-col-reverse overflow-y-scroll custom-scrollbar h-full">
            {chatState?.activeConv?.messages.map((msg) => (
                msg.sender === user?._id ?
                    <SentMessage key={uuid()} message={msg} /> :
                    <ReceivedMessage key={uuid()} message={msg} />
            ))}
        </div>
        <form className="flex w-full relative">
            <input
                id="messageField"
                name="messageField"
                className="p-2 border w-full shadow-black shadow-2xl"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
            />
            <button onClick={handleNewMessage} className="absolute right-0 h-full px-2 text-2xl text-blue-800">
                <IoMdSend />
            </button>
        </form>
    </div>
}

export default ActiveConversation