import { createContext, useReducer, useEffect } from "react";
import { authService } from "@/features/Auth/services/authService";
import api from "@/services/api";

// ─── Decoder de JWT ────────────────────────────────────────────────────────────
function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

// ─── Reducer ───────────────────────────────────────────────────────────────────
const initialState = { user: null, loading: true };

function authReducer(state, action) {
  switch (action.type) {
    case "RESTORE_SESSION":
      return { ...state, user: action.payload, loading: false };
    case "SIGN_IN":
      return { ...state, user: action.payload };
    case "SIGN_OUT":
      return { ...state, user: null };
    default:
      return state;
  }
}

// ─── Helpers de storage ────────────────────────────────────────────────────────
const storage = {
  save(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getToken() {
    return localStorage.getItem("token");
  },
  getUser() {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined") return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};

// ─── Contexto ──────────────────────────────────────────────────────────────────
export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = storage.getToken();
    const user = storage.getUser();

    if (token && user && !isTokenExpired(token)) {
      dispatch({ type: "RESTORE_SESSION", payload: user });
    } else {
      storage.clear();
      dispatch({ type: "RESTORE_SESSION", payload: null });
    }
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      storage.clear();
      dispatch({ type: "SIGN_OUT" });
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  async function signIn(username, password) {
    const data = await authService.login(username, password);
    const token = data.access;
    const decoded = decodeJWT(token);

    const userData = {
      id: decoded?.user_id ?? decoded?.id ?? null,
      username: decoded?.username ?? username,
    };

    storage.save(token, userData);
    dispatch({ type: "SIGN_IN", payload: userData });
  }

  function signOut() {
    storage.clear();
    dispatch({ type: "SIGN_OUT" });
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        signed: !!state.user,
        loading: state.loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
