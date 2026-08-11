import { create } from 'zustand';

interface UIStoreState {
  sidebarOpen: boolean;
  activeModal: string | null;
  mobileNavTab: 'discover' | 'plan' | 'decide' | 'more';
  
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setMobileNavTab: (tab: 'discover' | 'plan' | 'decide' | 'more') => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  sidebarOpen: false,
  activeModal: null,
  mobileNavTab: 'discover',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  setMobileNavTab: (tab) => set({ mobileNavTab: tab }),
}));
