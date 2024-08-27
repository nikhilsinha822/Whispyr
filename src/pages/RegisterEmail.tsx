import axios, { isAxiosError } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { HiExclamationCircle, HiMail } from 'react-icons/hi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { IoHourglassOutline } from "react-icons/io5";

const RegisterEmailSentPage = () => {
    const navigate = useNavigate();
    const [searchParams,] = useSearchParams();
    const token = searchParams.get('token')
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { loginState } = useContext(AuthContext)

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                setIsLoading(true);
                const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/verifyEmail?token=${token}`)
                const { accessToken, email, _id } = response.data.data;
                const user = { email, _id };
                if (response.status == 200)
                    loginState(accessToken, user)
                navigate('/')
            } catch (error) {
                if (isAxiosError(error))
                    setError(error.message)
                setError("Something went Wrong");
            } finally {
                setIsLoading(false)
            }
        }

        if (token) verifyEmail();
    }, [loginState, navigate, token])

    if (isLoading)
        return <VerifyingComponent />

    if (error)
        return <VerificationFailedComponent />

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Register Email Sent!
                    </h2>
                </div>
                <div className="bg-white py-8 px-6 shadow-md rounded-lg">
                    <div className="flex items-center justify-center mb-4">
                        <HiMail className="h-12 w-12 text-gray-600" />
                    </div>
                    <p className="text-center text-gray-600">
                        We've sent a verification email to your registered email address.
                    </p>
                    <p className="text-center text-gray-600">
                        Please check your inbox and click the verification link to activate your account.
                    </p>
                    <div className="flex items-center justify-center mt-6">
                        <button
                            onClick={() => navigate('/signin', { replace: true })}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VerifyingComponent = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verifying...
                    </h2>
                </div>
                <div className="bg-white py-8 px-6 shadow-md rounded-lg">
                    <div className="flex items-center justify-center mb-4">
                        <IoHourglassOutline className="h-12 w-12 text-gray-600 animate-spin" />
                    </div>
                    <p className="text-center text-gray-600">
                        Please wait while we verify your email address...
                    </p>
                </div>
            </div>
        </div>
    );
};

const VerificationFailedComponent = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verification Failed
                    </h2>
                </div>
                <div className="bg-white py-8 px-6 shadow-md rounded-lg">
                    <div className="flex items-center justify-center mb-4">
                        <HiExclamationCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <p className="text-center text-gray-600">
                        Sorry, we were unable to verify your email address.
                    </p>
                    <p className="text-center text-gray-600">
                        Please try again or contact support for assistance.
                    </p>
                </div>
            </div>
        </div>
    );
};


export default RegisterEmailSentPage;