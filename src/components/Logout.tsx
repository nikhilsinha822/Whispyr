import axios from "axios"
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

const Logout = () => {
    const { logoutState } = useContext(AuthContext)
    const handleLogout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/logout`);
            logoutState();
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <button onClick={handleLogout}>Logout</button>
    )
}

export default Logout