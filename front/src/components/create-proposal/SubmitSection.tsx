import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { PixelButton } from "../ui/PixelButton";
import { REQUIRED_MASOG } from "@/hooks/useCreateProposalMutation";

interface SubmitSectionProps {
  loading: boolean;
  hasEnoughMasog: boolean;
}

export function SubmitSection({ loading, hasEnoughMasog }: SubmitSectionProps) {
  return (
    <div className="pt-6 flex items-center justify-between">
      <div className="flex items-center space-x-2 text-f-tertiary dark:text-darkMuted">
        <InformationCircleIcon className="h-5 w-5" />
        <div className="mas-body2">
          <p>Cost: 1000 MAS</p>
          <p>Required MASOG Balance: {REQUIRED_MASOG.toString()}</p>
        </div>
      </div>
      <PixelButton
        type="submit"
        disabled={loading || !hasEnoughMasog}
        variant="primary"
      >
        {loading ? "Creating..." : "Create Proposal"}
      </PixelButton>
    </div>
  );
}
