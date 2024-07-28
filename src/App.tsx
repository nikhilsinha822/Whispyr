import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/authContext"
import SignInPage from "./pages/SignIn"
import SignUpPage from './pages/SignUp'

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App