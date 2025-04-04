import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isWalletModalOpen: boolean;
  isCreateProposalModalOpen: boolean;
  isVoteModalOpen: boolean;
  selectedProposalId: bigint | null;
  theme: "light" | "dark";

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
