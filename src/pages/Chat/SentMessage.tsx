import { MessageType } from "../../types/chat";
import { IoCheckmarkDone } from "react-icons/io5";
import { IoCheckmark } from "react-icons/io5";

type MessagePropsType = {
    message: MessageType;
}

const SentMessage: React.FC<MessagePropsType> = ({ message }) => {
    const time = new Date(message.createdAt);
    const messageTime = (time.getHours() % 13).toString().padStart(2, '0') + ":" + (time.getMinutes().toString().padStart(2, '0')) + `${time.getHours() >= 12 ? " PM " : " AM "}`;
    const messageStatus = Math.min(...message.readBy.map((read) => read.status))

    return <div className="bg-blue-500 text-white p-2 max-w-md rounded-md my-1 mx-2 ml-auto flex flex-wrap">
        {message.text}
        <div className="w-full flex">
            <div className="text-xs font-extralight w-full text-right">{messageTime}</div>
            <div className="px-0.5">
                {
                    messageStatus === 0 ?
                        <IoCheckmark /> :
                        messageStatus === 1 ?
                            <IoCheckmarkDone /> :
                            <IoCheckmarkDone className="text-blue-900" />
                }
            </div>
        </div>
    </div>
}

export default SentMessage