import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { PixelButton } from "../ui/PixelButton";
import { MIN_PROPOSAL_MAS_AMOUNT, MIN_PROPOSAL_MASOG_AMOUNT } from "@/config";
import { Mas } from "@massalabs/massa-web3";

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
          <p>Cost: {Mas.toString(MIN_PROPOSAL_MAS_AMOUNT + Mas.fromMas(1n))} MAS</p>
          <p>Required MASOG Balance: {Mas.fromNanoMas(MIN_PROPOSAL_MASOG_AMOUNT).toString()}</p>
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
