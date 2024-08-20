import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { v4 as uuid } from 'uuid'
import { IoMdSend } from "react-icons/io";
import SentMessage from './SentMessage';
import ReceivedMessage from './ReceivedMessage';
import useChatContext from "../../hooks/useChatContext";
import useSocketContext from "../../hooks/useSocketContext";
import { MessageType, ChatListType } from "../../types/chat";

type SentMessageResponseType = {
    success: boolean,
    message: Omit<MessageType, 'conversation'> & {
        conversation: ChatListType;
    }
}

const ActiveConversation = () => {
    const { user, logoutState } = useContext(AuthContext);
    const { socket } = useSocketContext()
    const { activeConv, setActiveConv } = useChatContext();
    const [newMessage, setNewMessage] = useState("");
    const [assets,] = useState([]);
    if (!user) logoutState();

    const handleNewMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newMessage === "") return;

        const receiverEmail = activeConv?.participants.filter((partcipant) => partcipant._id != user?._id) || []
        const sentMessage = {
            assets,
            _id: uuid(),
            text: newMessage,
            sender: user?._id,
            type: activeConv?.type,
            conversationId: activeConv?._id,
            receiverEmail: receiverEmail[0].email,
        }
        socket.emit("send:newMessage", sentMessage);
        setNewMessage("");
    }

    useEffect(() => {
        const messageUpdateEvent = (payload: SentMessageResponseType) => {
            console.log("messageUpdateEvent")
            const sentMessageResponse = payload.message;
            const updatedMessage = { ...sentMessageResponse, conversation: sentMessageResponse.conversation._id }
            if (!activeConv || updatedMessage.conversation !== activeConv._id) return;
            const updatedConvList = activeConv?.messages.length ?
                [updatedMessage, ...activeConv.messages] :
                [updatedMessage]

            setActiveConv({ ...activeConv, messages: updatedConvList })
            console.log("messageUpdateEvent")
        }

        socket.on("messageSent", messageUpdateEvent)
        return () => {
            socket.off('messageSent', messageUpdateEvent)
        }
    }, [activeConv, setActiveConv, socket])

    return <div className="h-screen flex flex-col w-2/3">
        <div className="flex flex-col-reverse overflow-y-scroll custom-scrollbar h-full">
            {activeConv?.messages.map((msg) => (
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