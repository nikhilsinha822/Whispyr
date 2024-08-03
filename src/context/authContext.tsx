import { ReactNode, createContext, useEffect, useReducer, useCallback } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

type AuthState = {
    isAuthenticated: boolean | null;
    token: string | null;
    email: string | null;
}

type AuthContextType = {
    isAuthenticated: boolean | null;
    email: string | null;
    token: string | null;
    loginState: (token: string, email: string) => void;
    logoutState: () => void;
}

type LoginStateType = {
    email : string,
    token : string
}

const initialState = {
    isAuthenticated: null,
    token: null,
    email: null
}

export const AuthContext = createContext<AuthContextType>({
    ...initialState,
    loginState: () => { },
    logoutState: () => { },
});

type ActionType = 
    | { type: 'LOGIN', payload: LoginStateType }
    | { type: 'LOGOUT' };

const reducer = (state: AuthState, action: ActionType) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                isAuthenticated: true,
                token: action.payload.token,
                email: action.payload.email
            }
        case 'LOGOUT':
            return {
                isAuthenticated: false,
                email: null,
                token: null,
            }
        default:
            return state;
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setToken, clearToken] = useLocalStorage<string | null>('accessToken', null);
    const [email, setEmail, clearEmail] = useLocalStorage<string | null>('email', null)
    const [state, dispatch] = useReducer(reducer, initialState);

    const loginState = useCallback((token: string, email: string) => {
        setToken(token);
        setEmail(email)
        dispatch({
            type: 'LOGIN',
            payload: {token, email}
        })
    }, [setToken, setEmail])

    const logoutState = useCallback(() => {
        clearToken();
        clearEmail();
        dispatch({
            type: 'LOGOUT',
        })
    }, [clearToken, clearEmail])

    useEffect(() => {
        if (accessToken && email) {
            dispatch({
                type: 'LOGIN',
                payload: { token: accessToken, email },
            });
        } else {
            dispatch({
                type: 'LOGOUT',
            });
        }
    }, [accessToken, email])

    return (
        <AuthContext.Provider value={{ ...state, loginState, logoutState }}>
            {children}
        </AuthContext.Provider>
    )
}
