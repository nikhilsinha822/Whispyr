import logo from '../../assets/logo.svg'
import useChatContext from "../../hooks/useChatContext";
import ActiveConversation from './ActiveConversation';

const Conversation = () => {
    const { chatState, isErrorActiveConv, isLoadingActiveConv} = useChatContext()

    if (isLoadingActiveConv)
        return <div>Loading Conversation...</div>

    if (!chatState?.activeConv || isErrorActiveConv)
        return (
            <div className="w-2/3 h-screen flex flex-col items-center justify-center bg-dotted-pattern">
                <img src={logo} alt="Whispyr" />
                <h1 className="text-3xl font-semibold">Whispyr</h1>
                <p className="text-sm">Effortless Conversations. Seamless Connections.</p>
            </div>
        )

    return (
        <ActiveConversation />
    )
}

export default Conversation