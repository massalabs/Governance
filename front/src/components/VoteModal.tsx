import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useUIStore } from "../store/useUIStore";
import { useGovernanceData, useVoteMutation } from "../hooks/useGovernanceData";

type VoteType = "POSITIVE" | "NEGATIVE" | "BLANK";

export default function VoteModal() {
  const { isVoteModalOpen, selectedProposalId, closeVoteModal } = useUIStore();
  const { proposals, userMasogBalance } = useGovernanceData();
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(null);
  const [comment, setComment] = useState("");

  const voteMutation = useVoteMutation();

  const proposal = proposals.find((p) => p.id === selectedProposalId);
  const hasEnoughMasog = userMasogBalance >= 1n;

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
        comment,
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-f-primary"
                >
                  Cast Your Vote
                </Dialog.Title>

                {!hasEnoughMasog ? (
                  <div className="mt-4">
                    <p className="text-f-error">
                      You need at least 1 MASOG to vote on proposals
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-col space-y-2">
                        <label className="text-f-primary">Your Vote</label>
                        <div className="flex space-x-2">
                          {["POSITIVE", "NEGATIVE", "BLANK"].map((type) => (
                            <button
                              key={type}
                              onClick={() => setSelectedVote(type as VoteType)}
                              className={`px-4 py-2 rounded-lg ${
                                selectedVote === type
                                  ? "bg-brand text-white"
                                  : "bg-border text-f-primary hover:bg-border/80"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <label className="text-f-primary">
                          Comment (Optional)
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-background text-f-primary border border-border focus:outline-none focus:ring-2 focus:ring-brand"
                          rows={3}
                          placeholder="Add your comment here..."
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-f-primary bg-border rounded-md hover:bg-border/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                        onClick={closeVoteModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${
                          selectedVote && !voteMutation.isPending
                            ? "bg-brand hover:bg-brand/80"
                            : "bg-brand/50 cursor-not-allowed"
                        }`}
                        onClick={handleVote}
                        disabled={!selectedVote || voteMutation.isPending}
                      >
                        {voteMutation.isPending
                          ? "Submitting..."
                          : "Submit Vote"}
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
