import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { REQUIRED_MASOG } from "../../hooks/useCreateProposal";

interface SubmitSectionProps {
  loading: boolean;
  hasEnoughMasog: boolean;
}

export function SubmitSection({ loading, hasEnoughMasog }: SubmitSectionProps) {
  return (
    <div className="pt-6 flex items-center justify-between">
      <div className="flex items-center space-x-2 text-f-tertiary">
        <InformationCircleIcon className="h-5 w-5" />
        <div className="mas-body2">
          <p>Cost: 1000 MAS</p>
          <p>Required MASOG Balance: {REQUIRED_MASOG.toString()}</p>
        </div>
      </div>
      <button
        type="submit"
        className={`px-6 py-2 rounded-lg mas-buttons transition-all duration-200 ${
          loading || !hasEnoughMasog
            ? "bg-tertiary text-f-tertiary cursor-not-allowed"
            : "bg-brand text-neutral hover:opacity-90 active-button"
        }`}
        disabled={loading || !hasEnoughMasog}
      >
        {loading ? "Creating..." : "Create Proposal"}
      </button>
    </div>
  );
}
