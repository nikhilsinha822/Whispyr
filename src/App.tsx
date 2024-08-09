import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/authContext"
import AuthComponent from "./components/AuthComponent"
import SignInPage from "./pages/SignIn"
import SignUpPage from './pages/SignUp'
import Chat from "./pages/Chat"

const App = () => {
  return (
    <AuthProvider>
        <Routes>
          <Route index path="/" element={<AuthComponent children={<Chat />} />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
    </AuthProvider>
  )
}

export default App