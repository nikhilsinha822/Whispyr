import { ReactNode, createContext, useEffect, useReducer, useCallback } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

type userType = {
    email: string,
    _id: string
}

type AuthState = {
    isAuthenticated: boolean | null;
    token: string | null;
    user: userType | null;
}

type AuthContextType = {
    isAuthenticated: boolean | null;
    user: userType | null;
    token: string | null;
    loginState: (token: string, user: userType) => void;
    logoutState: () => void;
}

type LoginStateType = {
    user : userType,
    token : string
}

const initialState = {
    isAuthenticated: null,
    token: null,
    user: null
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
                user: action.payload.user
            }
        case 'LOGOUT':
            return {
                isAuthenticated: false,
                user: null,
                token: null,
            }
        default:
            return state;
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setToken, clearToken] = useLocalStorage<string | null>('accessToken', null);
    const [user, setUser, clearUser] = useLocalStorage<userType | null>('user', null)
    const [state, dispatch] = useReducer(reducer, initialState);

    const loginState = useCallback((token: string, user: userType) => {
        setToken(token);
        setUser(user)
        dispatch({
            type: 'LOGIN',
            payload: {token, user}
        })
    }, [setToken, setUser])

    const logoutState = useCallback(() => {
        clearToken();
        clearUser();
        dispatch({
            type: 'LOGOUT',
        })
    }, [clearToken, clearUser])

    useEffect(() => {
        if (accessToken && user) {
            dispatch({
                type: 'LOGIN',
                payload: { token: accessToken, user },
            });
        } else {
            dispatch({
                type: 'LOGOUT',
            });
        }
    }, [accessToken, user])

    return (
        <AuthContext.Provider value={{ ...state, loginState, logoutState }}>
            {children}
        </AuthContext.Provider>
    )
}
