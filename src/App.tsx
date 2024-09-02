import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/authContext"
import AuthComponent from "./components/AuthComponent"
import SignInPage from "./pages/SignIn"
import SignUpPage from './pages/SignUp'
import Chat from "./pages/Chat"
import ForgetPasswordPage from "./pages/forgetPassword"
import EmailSentPage from "./pages/EmailSent"
import ResetPasswordPage from "./pages/ResetPassword"
import RegisterEmailSentPage from "./pages/RegisterEmail"

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route index path="/" element={<AuthComponent children={<Chat />} />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="forgot-password" element={<ForgetPasswordPage />} />
        <Route path="reset-email" element={<EmailSentPage />} />
        <Route path="resetPassword" element={<ResetPasswordPage />} />
        <Route path="verifyEmail" element={<RegisterEmailSentPage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App