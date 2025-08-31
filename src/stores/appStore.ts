/**
 * Global application state store using Zustand
 * Manages app-wide state including notifications, loading states, and UI state
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Notification types
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Loading state types
export interface LoadingState {
  [key: string]: boolean;
}

// UI state types
export interface UIState {
  sidebarOpen: boolean;
  theme: "dark" | "light" | "auto";
  compactMode: boolean;
}

// App store interface
interface AppStore {
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Loading states
  loading: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;

  // UI state
  ui: UIState;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: UIState["theme"]) => void;
  setCompactMode: (compact: boolean) => void;

  // Global actions
  reset: () => void;
}

// Initial state
const initialState = {
  notifications: [],
  loading: {},
  ui: {
    sidebarOpen: false,
    theme: "dark" as const,
    compactMode: false,
  },
};

// Create the store with proper SSR handling
export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Notification actions
      addNotification: (notification) => {
        const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          duration: notification.duration ?? 5000,
        };

        set(
          (state) => ({
            notifications: [...state.notifications, newNotification],
          }),
          false,
          "addNotification"
        );

        // Auto-remove notification after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          "removeNotification"
        ),

      clearNotifications: () =>
        set({ notifications: [] }, false, "clearNotifications"),

      // Loading state actions
      setLoading: (key, isLoading) =>
        set(
          (state) => ({
            loading: {
              ...state.loading,
              [key]: isLoading,
            },
          }),
          false,
          "setLoading"
        ),

      isLoading: (key) => get().loading[key] || false,

      // UI state actions
      setSidebarOpen: (open) =>
        set(
          (state) => ({
            ui: { ...state.ui, sidebarOpen: open },
          }),
          false,
          "setSidebarOpen"
        ),

      toggleSidebar: () =>
        set(
          (state) => ({
            ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
          }),
          false,
          "toggleSidebar"
        ),

      setTheme: (theme) =>
        set(
          (state) => ({
            ui: { ...state.ui, theme },
          }),
          false,
          "setTheme"
        ),

      setCompactMode: (compact) =>
        set(
          (state) => ({
            ui: { ...state.ui, compactMode: compact },
          }),
          false,
          "setCompactMode"
        ),

      // Global reset
      reset: () => set(initialState, false, "reset"),
    }),
    {
      name: "AppStore",
    }
  )
);

// Cached server snapshot for SSR compatibility
const cachedServerSnapshot = JSON.stringify(initialState);

// Stable selector functions to prevent infinite re-renders
const selectNotifications = (state: AppStore) => state.notifications;

// Memoized loading selector
let cachedLoadingResult: any = null;
let lastLoadingState: any = null;
const selectLoading = (state: AppStore) => {
  if (state.loading !== lastLoadingState) {
    lastLoadingState = state.loading;
    cachedLoadingResult = {
      loading: state.loading,
      setLoading: state.setLoading,
      isLoading: state.isLoading,
    };
  }
  return cachedLoadingResult;
};

// Memoized UI selector
let cachedUIResult: any = null;
let lastUIState: any = null;
const selectUI = (state: AppStore) => {
  if (state.ui !== lastUIState) {
    lastUIState = state.ui;
    cachedUIResult = {
      ui: state.ui,
      setSidebarOpen: state.setSidebarOpen,
      toggleSidebar: state.toggleSidebar,
      setTheme: state.setTheme,
      setCompactMode: state.setCompactMode,
    };
  }
  return cachedUIResult;
};

// Convenience hooks with stable selectors
export const useNotifications = () => useAppStore(selectNotifications);
export const useLoading = () => useAppStore(selectLoading);
export const useUI = () => useAppStore(selectUI);
