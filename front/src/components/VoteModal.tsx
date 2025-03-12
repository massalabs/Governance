import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useUIStore } from "../store/useUIStore";
import { useGovernanceStore } from "../store/useGovernanceStore";
import { useContractStore } from "../store/useContractStore";
import {
  useAccountStore,
  useWriteSmartContract,
} from "@massalabs/react-ui-kit";
import { Vote } from "../serializable/Vote";
import { Args, Mas, strToBytes } from "@massalabs/massa-web3";

type VoteType = "POSITIVE" | "NEGATIVE" | "BLANK";

export default function VoteModal() {
  const { isVoteModalOpen, selectedProposalId, closeVoteModal } = useUIStore();
  const { proposals, userMasogBalance, refresh } = useGovernanceStore();
  const { governance } = useContractStore();
  const { connectedAccount } = useAccountStore();
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);

  useEffect(() => {
    if (isVoteModalOpen) {
      // Force refresh when modal opens
      refresh();
    }
  }, [isVoteModalOpen, refresh]);

  const proposal = proposals.find((p) => p.id === selectedProposalId);
  const hasEnoughMasog = userMasogBalance >= 1n;

  const handleVote = async () => {
    if (!selectedVote || !proposal || !governance || !connectedAccount) return;

    try {
      setIsSubmitting(true);

      const voteValue = {
        POSITIVE: 1n,
        NEGATIVE: -1n,
        BLANK: 0n,
      }[selectedVote];

      const vote = new Vote(proposal.id, voteValue, strToBytes(comment));

      // await governance.private.vote(vote);

      await callSmartContract(
        "vote",
        governance!.private.address,
        new Args().addSerializable(vote).serialize(),
        {
          success: "Vote submitted successfully!",
          pending: "Submitting vote...",
          error: "Failed to submit vote",
        },
        Mas.fromString("1")
      );

      await refresh();
      closeVoteModal();
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Failed to submit vote"
      );
    } finally {
      setIsSubmitting(false);
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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-secondary p-6 shadow-xl transition-all space-y-6">
                <div>
                  <Dialog.Title className="text-lg font-medium text-f-primary mas-h2">
                    Vote on Proposal
                  </Dialog.Title>
                  {proposal && (
                    <Dialog.Description className="mt-2 text-sm text-f-tertiary mas-body">
                      {proposal.title}
                    </Dialog.Description>
                  )}
                </div>

                {!hasEnoughMasog ? (
                  <div className="text-s-error mas-body text-center py-4">
                    You need at least 1 MASOG to vote on proposals
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          className={`p-4 rounded-lg border ${
                            selectedVote === "POSITIVE"
                              ? "border-s-success bg-s-success/10 text-s-success"
                              : "border-border hover:border-s-success/50"
                          } transition-colors`}
                          onClick={() => setSelectedVote("POSITIVE")}
                        >
                          <div className="text-2xl mb-2">👍</div>
                          <div className="text-sm font-medium">For</div>
                        </button>
                        <button
                          className={`p-4 rounded-lg border ${
                            selectedVote === "NEGATIVE"
                              ? "border-s-error bg-s-error/10 text-s-error"
                              : "border-border hover:border-s-error/50"
                          } transition-colors`}
                          onClick={() => setSelectedVote("NEGATIVE")}
                        >
                          <div className="text-2xl mb-2">👎</div>
                          <div className="text-sm font-medium">Against</div>
                        </button>
                        <button
                          className={`p-4 rounded-lg border ${
                            selectedVote === "BLANK"
                              ? "border-brand bg-brand/10 text-brand"
                              : "border-border hover:border-brand/50"
                          } transition-colors`}
                          onClick={() => setSelectedVote("BLANK")}
                        >
                          <div className="text-2xl mb-2">🤔</div>
                          <div className="text-sm font-medium">Abstain</div>
                        </button>
                      </div>

                      <div>
                        <label
                          htmlFor="comment"
                          className="block text-sm font-medium text-f-primary mb-2"
                        >
                          Comment (optional)
                        </label>
                        <textarea
                          id="comment"
                          rows={3}
                          className="w-full rounded-lg bg-tertiary border-border text-f-primary p-3 focus:outline-none focus:ring-2 focus:ring-brand"
                          placeholder="Add a comment to explain your vote..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-f-primary bg-tertiary rounded-lg hover:bg-tertiary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        onClick={closeVoteModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleVote}
                        disabled={!selectedVote || isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Vote"}
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
