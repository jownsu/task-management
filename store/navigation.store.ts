import { create } from "zustand";

interface NavigationStore {
	is_sidebar_open: boolean;
	setOpenSidebar: (is_sidebar_open: boolean) => void;
}

export const useNavigationStore = create<NavigationStore>()((set) => ({
	is_sidebar_open: true,
	setOpenSidebar: (is_sidebar_open) => set({ is_sidebar_open })
}));
