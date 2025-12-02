import { create } from "zustand";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const API_BASE_URL = "http://10.0.2.2:3000";

const useAuthStore = create(
  (set) => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,

    initializeAuth: async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          set({ token, isAuthenticated: true });
          await useAuthStore.getState().fetchUser();
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      }
    },

    register: async (email, password, username, gender, profileImage) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
          email,
          password,
          username,
          gender,
          profileImage,
        });
        
        const token = response.data.token;
        // await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        await AsyncStorage.setItem("token", token);
        set({
          token,
          isAuthenticated: true,
          loading: false,
        });
        await useAuthStore.getState().fetchUser();
      } catch (error) {
        console.error("Registration failed:", error);
        set({
          error: error.response?.data?.message || error.message,
          loading: false,
        });
      }
    },

    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email,
          password,
        });
        const token = response.data.token;
        // await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        await AsyncStorage.setItem("token", token);
        set({
          token,
          isAuthenticated: true,
          loading: false,
        });
        await useAuthStore.getState().fetchUser();
      } catch (error) {
        console.error("Login failed:", error);
        set({
          error: error.response?.data?.message || error.message,
          loading: false,
        });
      }
    },

    logout: async () => {
      await AsyncStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false });
    },

    fetchUser: async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        console.log("Fetching user with token:", token);

        if (!token) {
          set({ user: null, isAuthenticated: false, error: "No token found" });
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // backend `/me` sometimes returns the user directly, other endpoints return { user: { ... } }
        const fetchedUser = response.data?.user ?? response.data;
        set({ user: fetchedUser, error: null });
      } catch (error) {
        console.error("Fetching user failed:", error);
        set({
          user: null,
          error: error.response?.data?.message || error.message,
        });
      }
    },
  })
);

export default useAuthStore;
