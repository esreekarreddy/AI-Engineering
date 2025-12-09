import { create } from 'zustand';

export type ModalType = 'alert' | 'confirm' | 'prompt' | 'custom';

export interface ModalOptions {
  title: string;
  message?: string;
  defaultValue?: string; // For prompt
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
  content?: React.ReactNode; // For custom modals like ResourceMonitor
}

interface ModalStore {
  isOpen: boolean;
  type: ModalType;
  options: ModalOptions;
  
  openModal: (type: ModalType, options: ModalOptions) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  type: 'alert',
  options: { title: '' },

  openModal: (type, options) => set({ isOpen: true, type, options }),
  closeModal: () => set({ isOpen: false }),
}));
