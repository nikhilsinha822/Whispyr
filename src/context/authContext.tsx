import { ReactNode, createContext, useEffect, useReducer, useCallback } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

type AuthState = {
    isAuthenticated: boolean | null;
    token: string | null;
}

type AuthContextType = {
    isAuthenticated: boolean | null;
    token: string | null;
    loginState: (token: string) => void;
    logoutState: () => void;
}

const initialState = {
    isAuthenticated: null,
    token: null
}

export const AuthContext = createContext<AuthContextType>({
    ...initialState,
    loginState: () => { },
    logoutState: () => { },
});

const reducer = (state: AuthState, action: { type: string, payload: string | null }) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                isAuthenticated: true,
                token: action.payload,
            }
        case 'LOGOUT':
            return {
                isAuthenticated: false,
                token: null,
            }
        default:
            return state;
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setToken, clearToken] = useLocalStorage('accessToken', ' ');
    const [state, dispatch] = useReducer(reducer, initialState);

    const loginState = useCallback((token: string) => {
        setToken(token);
        dispatch({
            type: 'LOGIN',
            payload: token,
        })
    }, [setToken])

    const logoutState = useCallback(() => {
        clearToken();
        dispatch({
            type: 'LOGOUT',
            payload: null,
        })
    }, [clearToken])

    useEffect(() => {
        if (accessToken) {
            dispatch({
                type: 'LOGIN',
                payload: accessToken,
            })
        } else {
            dispatch({
                type: 'LOGOUT',
                payload: null,
            })
        }
    }, [accessToken])

    return (
        <AuthContext.Provider value={{ ...state, loginState, logoutState }}>
            {children}
        </AuthContext.Provider>
    )
}
