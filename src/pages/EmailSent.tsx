import { useContext } from 'react';
import { HiCheckCircle } from 'react-icons/hi';
import { AuthContext } from '../context/authContext';
import { Navigate, useNavigate } from 'react-router-dom';

const EmailSentPage = () => {
    const { isAuthenticated } = useContext(AuthContext)
    const navigate = useNavigate();

    if (isAuthenticated)
        <Navigate to="/" replace={true} />

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Email Sent!
                    </h2>
                </div>
                <div className="bg-white py-8 px-6 shadow-md rounded-lg">
                    <div className="flex items-center justify-center mb-4">
                        <HiCheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <p className="text-center text-gray-600">
                        We've sent a password reset email to your registered email address.
                    </p>
                    <p className="text-center text-gray-600">
                        Please check your inbox and follow the instructions to reset your password.
                    </p>
                    <div className="flex items-center justify-center mt-6">
                        <button
                            onClick={() => navigate('/signin')}
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

export default EmailSentPage;