import { useEffect, useContext, useState } from 'react'
import { AuthContext } from '../../context/authContext'
import axios from 'axios'
import ChatList from './ChatList'
import Conversation from './Conversation'

const Chat = () => {
    const { token } = useContext(AuthContext);
    const [convList, setConvList] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchChatList = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/chat/chatList`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setConvList(response.data.data)
            } catch (error) {
                console.log(error)
                setIsError(true);
            } finally {
                setIsLoading(false);
            }

        }
        fetchChatList();
    }, [token])

    if (isLoading)
        return <div>Loading...</div>

    if (isError || !convList)
        return <div>There was some problem is loading the chats.</div>

    return <div className='flex'>
        <ChatList
            convList={convList}
        />
        <Conversation/>
    </div>;
}

export default Chat