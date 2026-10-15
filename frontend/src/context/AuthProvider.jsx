import { useReducer, useEffect } from "react";
import { authService } from "@/features/Auth/services/authService";
import { AuthContext } from "./AuthContext";

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

const storage = {
  save(accessToken, refreshToken, user) {
    localStorage.setItem("token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
  getToken() {
    return localStorage.getItem("token");
  },
  getRefreshToken() {
    return localStorage.getItem("refreshToken");
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

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = storage.getToken();
    const refreshToken = storage.getRefreshToken();
    const user = storage.getUser();

    if (token && user && !isTokenExpired(token)) {
      dispatch({ type: "RESTORE_SESSION", payload: user });
      return;
    }

    if (!refreshToken || !user) {
      storage.clear();
      dispatch({ type: "RESTORE_SESSION", payload: null });
      return;
    }

    let active = true;
    authService
      .refresh(refreshToken)
      .then((data) => {
        if (!active) return;
        storage.save(data.access, data.refresh ?? refreshToken, user);
        dispatch({ type: "RESTORE_SESSION", payload: user });
      })
      .catch(() => {
        if (!active) return;
        storage.clear();
        dispatch({ type: "RESTORE_SESSION", payload: null });
      });

    return () => {
      active = false;
    };
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

    storage.save(token, data.refresh, userData);
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
