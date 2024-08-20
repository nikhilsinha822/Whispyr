import { MessageType } from "../../types/chat";

type MessagePropsType = {
    message: MessageType;
}

const ReceivedMessage: React.FC<MessagePropsType> = ({ message }) => {
    const time = new Date(message.createdAt);
    const messageTime = (time.getHours() % 12) + ":" + (time.getMinutes()) + `${time.getHours() >= 12 ? " PM " : " AM "}`;
    return <div className="bg-gray-300 text-black p-2 max-w-md rounded-md my-1 mx-2 mr-auto flex flex-wrap">
        {message.text}
        <div className="text-xs font-light w-full text-right">{messageTime}</div>
    </div>
}

export default ReceivedMessage