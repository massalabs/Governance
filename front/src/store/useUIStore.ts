import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isWalletModalOpen: boolean;
  isCreateProposalModalOpen: boolean;
  isVoteModalOpen: boolean;
  selectedProposalId: bigint | null;
  theme: "light" | "dark";

  // Actions
  toggleWalletModal: () => void;
  toggleCreateProposalModal: () => void;
  openVoteModal: (proposalId: bigint) => void;
  closeVoteModal: () => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isWalletModalOpen: false,
      isCreateProposalModalOpen: false,
      isVoteModalOpen: false,
      selectedProposalId: null,
      theme: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",

      toggleWalletModal: () =>
        set((state) => ({ isWalletModalOpen: !state.isWalletModalOpen })),

      toggleCreateProposalModal: () =>
        set((state) => ({
          isCreateProposalModalOpen: !state.isCreateProposalModalOpen,
        })),

      openVoteModal: (proposalId: bigint) =>
        set({ isVoteModalOpen: true, selectedProposalId: proposalId }),

      closeVoteModal: () =>
        set({ isVoteModalOpen: false, selectedProposalId: null }),

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
