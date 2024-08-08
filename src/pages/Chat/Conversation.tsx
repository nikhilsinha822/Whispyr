import { useSearchParams } from "react-router-dom"
import logo from '../../assets/logo.svg'
import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import axios from 'axios'
import { MessageType } from "../../types/chat";
import { v4 as uuid } from 'uuid'
import { IoMdSend } from "react-icons/io";

type ActiveConversationPropsType = {
    activeConv: MessageType[]
}

type MessagePropsType = {
    message: MessageType;
}

const Conversation = () => {
    const [searchParams,] = useSearchParams();
    const activeConvId = searchParams.get('activeConv');
    const [activeConv, setActiveConv] = useState();
    const { token } = useContext(AuthContext)

    useEffect(() => {
        const fetchConversation = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/chat/chatMessage/${activeConvId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log(response.data.data);
                setActiveConv(response.data.data);
            } catch (error) {
                console.log(error)
            }
        }
        fetchConversation()
    }, [token, activeConvId])

    if (!activeConv)
        return <NoActiveConv />

    return (
        <ActiveConversation activeConv={activeConv} />
    )
}

const ActiveConversation: React.FC<ActiveConversationPropsType> = ({ activeConv }) => {
    const { user, logoutState } = useContext(AuthContext);
    if (!user) logoutState();

    return <div className="h-screen flex flex-col w-2/3">
        <div className="flex flex-col-reverse overflow-y-scroll custom-scrollbar h-full">
            {activeConv.map((msg) => (
                msg.sender === user?._id ?
                    <SentMessage key={uuid()} message={msg} /> :
                    <ReceivedMessage key={uuid()} message={msg} />
            ))}
        </div>
        <div className="flex w-full relative">
            <input
                className="p-2 border w-full shadow-black shadow-2xl"
                type="text"
                placeholder="Type a message"
            />
            <button className="absolute right-0 h-full px-2 text-2xl text-blue-800">
                <IoMdSend />
            </button>
        </div>
    </div>
}

const SentMessage: React.FC<MessagePropsType> = ({ message }) => {
    const time = new Date(message.createdAt);
    const messageTime = (time.getHours() % 12) + ":" + (time.getMinutes()) + `${time.getHours() >= 12 ? " PM " : " AM "}`;
    return <div className="bg-blue-500 text-white p-2 max-w-md rounded-md my-1 mx-2 ml-auto flex flex-wrap">
        {message.text}
        <div className="text-xs font-extralight w-full text-right">{messageTime}</div>
    </div>
}

const ReceivedMessage: React.FC<MessagePropsType> = ({ message }) => {
    const time = new Date(message.createdAt);
    const messageTime = (time.getHours() % 12) + ":" + (time.getMinutes()) + `${time.getHours() >= 12 ? " PM " : " AM "}`;
    return <div className="bg-gray-300 text-black p-2 max-w-md rounded-md my-1 mx-2 mr-auto flex flex-wrap">
        {message.text}
        <div className="text-xs font-light w-full text-right">{messageTime}</div>
    </div>
}

const NoActiveConv = () => {
    return <div className="w-2/3 h-screen flex flex-col items-center justify-center bg-dotted-pattern">
        <img src={logo} alt="Whispyr" />
        <h1 className="text-3xl font-semibold">Whispyr</h1>
        <p className="text-sm">Effortless Conversations. Seamless Connections.</p>
    </div>
}

export default Conversation