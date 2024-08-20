import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { v4 as uuid } from 'uuid'
import { IoMdSend } from "react-icons/io";
import SentMessage from './SentMessage';
import ReceivedMessage from './ReceivedMessage';
import useChatContext from "../../hooks/useChatContext";
import useSocketContext from "../../hooks/useSocketContext";
import { MessageType } from "../../types/chat";
import { useSearchParams } from "react-router-dom";

type SentMessageResponseType = {
    success: boolean,
    message: MessageType
}

const ActiveConversation = () => {
    const { user, logoutState } = useContext(AuthContext);
    const { socket } = useSocketContext()
    const [searchParams,] = useSearchParams()
    const { activeConv, setActiveConv } = useChatContext();
    const [newMessage, setNewMessage] = useState("");
    const [assets,] = useState([]);
    const convId = searchParams.get('activeConv');
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
    }

    useEffect(() => {
        const messageUpdateEvent = (payload: SentMessageResponseType) => {
            const sentMessageResponse: MessageType = payload.message;
            if (!activeConv || sentMessageResponse.conversation !== convId) return;
            const updatedConvList = activeConv?.messages.length ?
                [sentMessageResponse, ...activeConv.messages] :
                [sentMessageResponse]
            setActiveConv({ ...activeConv, messages: updatedConvList })
            console.log("message update evnt is updating active conv")
            setNewMessage("");
        }

        socket.on("messageSent", messageUpdateEvent)
        return () => {
            socket.off('messageSent', messageUpdateEvent)
        }
    }, [activeConv, convId, setActiveConv, socket])

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