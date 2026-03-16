import { create } from "zustand";
import { apiFetch } from "./useApi";

const useAuthStore = create((set, get) => ({
  user: null,
  token:
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem("ap_admin_token") || "",
  ready: false,
  async login(email, password) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ap_admin_token", data.token);
    }
    set({ token: data.token, user: data.user, ready: true });
    return data.user;
  },
  async logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("ap_admin_token");
      }
      set({ token: "", user: null, ready: true });
    }
  },
  async fetchMe() {
    if (!get().token) {
      set({ user: null, ready: true });
      return null;
    }
    try {
      const data = await apiFetch("/api/auth/me");
      set({ user: data.user, ready: true });
      return data.user;
    } catch (error) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("ap_admin_token");
      }
      set({ token: "", user: null, ready: true });
      return null;
    }
  }
}));

export function useAuth() {
  return useAuthStore();
}
