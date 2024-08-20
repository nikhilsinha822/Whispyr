import { MessageType } from "../../types/chat";

type MessagePropsType = {
    message: MessageType;
}

const SentMessage: React.FC<MessagePropsType> = ({ message }) => {
    const time = new Date(message.createdAt);
    const messageTime = (time.getHours() % 12) + ":" + (time.getMinutes()) + `${time.getHours() >= 12 ? " PM " : " AM "}`;
    return <div className="bg-blue-500 text-white p-2 max-w-md rounded-md my-1 mx-2 ml-auto flex flex-wrap">
        {message.text}
        <div className="text-xs font-extralight w-full text-right">{messageTime}</div>
    </div>
}

export default SentMessage