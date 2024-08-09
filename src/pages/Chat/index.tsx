import { useContext } from 'react'
import { ChatListType } from "../../types/chat";
import Conversation from './Conversation'
import { useSearchParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import useChatContext from '../../hooks/useChatContext'
import { AuthContext } from "../../context/authContext";

type ConversationPropsType = {
    conv: ChatListType
}

const Chat = () => {
    const { convList, isErrorConv, isLoadingConv } = useChatContext();
    const [, setSearchParams] = useSearchParams();

    if (isLoadingConv)
        return <div>Loading...</div>

    if (isErrorConv || !convList)
        return <div>There was some problem is loading the chats.</div>

    return <div className='flex'>
        <div className="bg-white w-1/3 shadow-lg overflow-hidden max-h-screen overflow-y-scroll custom-scrollbar">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Conversations</h2>
            </div>
            <div className="divide-y divide-gray-200">
                {convList.map((conv) => (
                    <div key={uuid()}
                        className="hover:cursor-pointer"
                        onClick={() => setSearchParams({ activeConv: conv._id }, { replace: true })}
                    >
                        {conv.type === 0 ? <IndvConv conv={conv} /> : <GroupConv conv={conv} />}
                    </div>
                ))}
            </div>
        </div>
        <Conversation />
    </div>;
}

const IndvConv: React.FC<ConversationPropsType> = ({ conv }) => {
    const { user, logoutState } = useContext(AuthContext);
    if (!user) logoutState();
    const sender = conv.participants.find((participant) => participant.email !== user?.email);
    const displayName = conv.name || sender?.name || sender?.email || "Unknown";

    return (
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-100 transition-colors">
            {sender?.avatar?.publicUrl ? (
                <img className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" src={sender.avatar.publicUrl} alt={`${displayName}'s avatar`} />
            ) : (
                <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-2xl font-bold bg-blue-100 text-blue-600 rounded-full">
                    {displayName[0].toUpperCase()}
                </span>
            )}
            <div className={`flex-grow min-w-0 ${conv.unreadMessageCount ? "font-semibold" : ""}`}>
                <div className="text-sm sm:text-base truncate">{displayName}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">
                    {conv.lastMessage?.text || conv.lastMessage.assets?.slice(-1)[0].publicId || "No message"}
                </div>
            </div>
            {conv.unreadMessageCount > 0 && (
                <div className="flex-shrink-0 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                    {conv.unreadMessageCount}
                </div>
            )}
        </div>
    );
};

const GroupConv: React.FC<ConversationPropsType> = ({ conv }) => {
    const sender = conv.participants.find((participant) => participant._id !== conv.lastMessage.sender);
    const senderName = sender?.name || sender?.email || "Unknown";

    return (
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-100 transition-colors">
            <span className="min-w-10 h-10 sm:min-w-12 sm:min-h-12 flex items-center justify-center text-lg sm:text-2xl font-bold bg-purple-100 text-purple-600 rounded-full">
                {conv.name[0].toUpperCase()}
            </span>
            <div className={`flex-grow min-w-0 ${conv.unreadMessageCount ? "font-semibold" : ""}`}>
                <div className="text-sm sm:text-base truncate">{conv.name}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">
                    <span className="font-medium">{senderName}: </span>
                    {conv.lastMessage?.text || conv.lastMessage.assets?.slice(-1)[0].publicId}
                </div>
            </div>
            {conv.unreadMessageCount > 0 && (
                <div className="flex-shrink-0 bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                    {conv.unreadMessageCount}
                </div>
            )}
        </div>
    );
};

export default Chat