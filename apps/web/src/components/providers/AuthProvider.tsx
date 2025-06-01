import {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useEffect,
} from "react";
import { Web3Provider } from "./Web3Provider";
import { SIWEProvider } from "./SIWEProvider";
import { getSession } from "@/lib/auth/session";

// Create a centralized AuthContext with proper typing
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    address: string | null;
    did: string | null;
    roles: string[];
  } | null;
}

export type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: AuthState["user"] } }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" };

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  error: null,
  user: null,
};

const AuthContext = createContext<
  | {
      state: AuthState;
      dispatch: React.Dispatch<AuthAction>;
    }
  | undefined
>(undefined);

// Auth reducer for better state management
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        dispatch({ type: "AUTH_START" });
        const session = getSession();

        if (session?.user) {
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user: session.user },
          });
        } else {
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } catch (error) {
        dispatch({
          type: "AUTH_ERROR",
          payload: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      <Web3Provider>
        <SIWEProvider>{children}</SIWEProvider>
      </Web3Provider>
    </AuthContext.Provider>
  );
}

// Custom hook for accessing auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
