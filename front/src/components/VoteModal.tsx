import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useUIStore } from "../store/useUIStore";
import { useGovernanceData } from "../hooks/queries/useGovernanceData";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  MinusIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useVoteMutation } from "@/hooks/queries/useVoteMutation";

type VoteType = "POSITIVE" | "NEGATIVE" | "BLANK";

// Define a proper type for vote options
type VoteOption = {
  type: VoteType;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
};

const voteOptions: VoteOption[] = [
  {
    type: "POSITIVE",
    label: "Yes",
    icon: HandThumbUpIcon,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
    description: "Support this proposal",
  },
  {
    type: "NEGATIVE",
    label: "No",
    icon: HandThumbDownIcon,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
    borderColor: "border-rose-400/20",
    description: "Oppose this proposal",
  },
  {
    type: "BLANK",
    label: "Blank",
    icon: MinusIcon,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/20",
    description: "Neutral position",
  },
];

type VoteOptionProps = {
  option: VoteOption;
  isSelected: boolean;
  onSelect: (type: VoteType) => void;
};

const VoteOption = ({ option, isSelected, onSelect }: VoteOptionProps) => {
  const Icon = option.icon;
  return (
    <button
      onClick={() => onSelect(option.type)}
      className={`group relative p-4 rounded-xl border-2 transition-all duration-150 ease-out ${isSelected
        ? `${option.bgColor} ${option.borderColor} scale-105 shadow-lg shadow-brand/20`
        : "border-border dark:border-darkBorder hover:border-brand/50 dark:hover:border-darkAccent/50 hover:shadow-md hover:shadow-brand/10"
        }`}
    >
      <div className="flex flex-col items-center gap-2">
        <Icon
          className={`h-8 w-8 transition-colors duration-150 ease-out ${isSelected
            ? option.color
            : "text-f-tertiary dark:text-darkMuted group-hover:text-brand dark:group-hover:text-darkAccent"
            }`}
        />
        <span
          className={`font-medium ${isSelected
            ? option.color
            : "text-f-primary dark:text-white"
            }`}
        >
          {option.label}
        </span>
        <span className="text-xs text-f-tertiary dark:text-gray-300 text-center">
          {option.description}
        </span>
      </div>
    </button>
  );
};

type VoteOptionsGridProps = {
  selectedVote: VoteType | null;
  onSelectVote: (type: VoteType) => void;
};

const VoteOptionsGrid = ({ selectedVote, onSelectVote }: VoteOptionsGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {voteOptions.map((option) => (
        <VoteOption
          key={option.type}
          option={option}
          isSelected={selectedVote === option.type}
          onSelect={onSelectVote}
        />
      ))}
    </div>
  );
};

type VoteButtonProps = {
  selectedVote: VoteType | null;
  isPending: boolean;
  onVote: () => void;
  onCancel: () => void;
};

const VoteButton = ({ selectedVote, isPending, onVote, onCancel }: VoteButtonProps) => {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        className="px-4 py-2 text-sm font-medium text-f-primary dark:text-white bg-border dark:bg-darkTertiary rounded-lg hover:bg-border/80 dark:hover:bg-darkTertiary/80 transition-colors"
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        type="button"
        className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 ${selectedVote && !isPending
          ? "bg-brand dark:bg-darkAccent hover:bg-brand/90 dark:hover:bg-darkAccent/90 active:scale-95"
          : "bg-brand/50 dark:bg-darkAccent/50 cursor-not-allowed"
          }`}
        onClick={onVote}
        disabled={!selectedVote || isPending}
      >
        {isPending ? (
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
  );
};

type VoteModalHeaderProps = {
  onClose: () => void;
};

const VoteModalHeader = ({ onClose }: VoteModalHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <Dialog.Title
        as="h3"
        className="text-xl font-semibold leading-6 text-f-primary dark:text-white flex items-center gap-2"
      >
        <span className="text-brand dark:text-darkAccent">Cast Your Vote</span>
      </Dialog.Title>
      <button
        onClick={onClose}
        className="text-f-tertiary dark:text-gray-300 hover:text-f-primary dark:hover:text-white transition-colors"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

// NotEnoughMasog component
const NotEnoughMasog = () => {
  return (
    <div className="mt-4 p-4 bg-rose-400/10 border border-rose-400/20 rounded-lg">
      <div className="flex items-center gap-2 text-rose-400">
        <CheckCircleIcon className="h-5 w-5" />
        <p className="font-medium">
          You need at least 1 MASOG to vote on proposals
        </p>
      </div>
    </div>
  );
};

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-secondary dark:bg-darkCard p-6 text-left align-middle shadow-xl transition-all">
                <VoteModalHeader onClose={closeVoteModal} />

                {!hasEnoughMasog ? (
                  <NotEnoughMasog />
                ) : (
                  <>
                    <div className="mt-4 space-y-6">
                      <div className="space-y-3">
                        <VoteOptionsGrid
                          selectedVote={selectedVote}
                          onSelectVote={setSelectedVote}
                        />
                      </div>
                    </div>

                    <VoteButton
                      selectedVote={selectedVote}
                      isPending={voteMutation.isPending}
                      onVote={handleVote}
                      onCancel={closeVoteModal}
                    />
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
