import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useUIStore } from "../store/useUIStore";
import { useGovernanceData } from "../hooks/useGovernanceData";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  MinusIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useVoteMutation } from "@/hooks/useVoteMutation";

type VoteType = "POSITIVE" | "NEGATIVE" | "BLANK";

const voteOptions = [
  {
    type: "POSITIVE" as const,
    label: "Yes",
    icon: HandThumbUpIcon,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
    description: "Support this proposal",
  },
  {
    type: "NEGATIVE" as const,
    label: "No",
    icon: HandThumbDownIcon,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
    borderColor: "border-rose-400/20",
    description: "Oppose this proposal",
  },
  {
    type: "BLANK" as const,
    label: "Abstain",
    icon: MinusIcon,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/20",
    description: "Neutral position",
  },
];

export default function VoteModal() {
  const { isVoteModalOpen, selectedProposalId, closeVoteModal } = useUIStore();
  const { proposals, userMasogBalance } = useGovernanceData();
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(null);

  const voteMutation = useVoteMutation();

  const proposal = proposals.find((p) => p.id === selectedProposalId);
  const hasEnoughMasog = userMasogBalance && userMasogBalance >= 1n;

  const handleVote = async () => {
    if (!selectedVote || !proposal) return;

    const voteValue = {
      POSITIVE: 1n,
      NEGATIVE: -1n,
      BLANK: 0n,
    }[selectedVote];

    try {
      await voteMutation.mutateAsync({
        proposalId: proposal.id,
        voteValue,
      });
      closeVoteModal();
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Failed to submit vote"
      );
    }
  };

  return (
    <Transition appear show={isVoteModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeVoteModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-secondary p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-f-primary flex items-center gap-2"
                  >
                    <span className="text-brand">Cast Your Vote</span>
                  </Dialog.Title>
                  <button
                    onClick={closeVoteModal}
                    className="text-f-tertiary hover:text-f-primary transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {!hasEnoughMasog ? (
                  <div className="mt-4 p-4 bg-rose-400/10 border border-rose-400/20 rounded-lg">
                    <div className="flex items-center gap-2 text-rose-400">
                      <CheckCircleIcon className="h-5 w-5" />
                      <p className="font-medium">
                        You need at least 1 MASOG to vote on proposals
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 space-y-6">
                      <div className="space-y-3">

                        <div className="grid grid-cols-3 gap-3">
                          {voteOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.type}
                                onClick={() => setSelectedVote(option.type)}
                                className={`group relative p-4 rounded-xl border-2 transition-all duration-150 ease-out ${selectedVote === option.type
                                    ? `${option.bgColor} ${option.borderColor} scale-105 shadow-lg shadow-brand/20`
                                    : "border-border hover:border-brand/50 hover:shadow-md hover:shadow-brand/10"
                                  }`}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <Icon
                                    className={`h-8 w-8 transition-colors duration-150 ease-out ${selectedVote === option.type
                                        ? option.color
                                        : "text-f-tertiary group-hover:text-brand"
                                      }`}
                                  />
                                  <span
                                    className={`font-medium ${selectedVote === option.type
                                        ? option.color
                                        : "text-f-primary"
                                      }`}
                                  >
                                    {option.label}
                                  </span>
                                  <span className="text-xs text-f-tertiary text-center">
                                    {option.description}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-f-primary bg-border rounded-lg hover:bg-border/80 transition-colors"
                        onClick={closeVoteModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 ${selectedVote && !voteMutation.isPending
                            ? "bg-brand hover:bg-brand/90 active:scale-95"
                            : "bg-brand/50 cursor-not-allowed"
                          }`}
                        onClick={handleVote}
                        disabled={!selectedVote || voteMutation.isPending}
                      >
                        {voteMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Submitting...
                          </span>
                        ) : (
                          "Submit Vote"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
