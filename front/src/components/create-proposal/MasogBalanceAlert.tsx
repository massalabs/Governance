import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { REQUIRED_MASOG } from "../../hooks/useCreateProposal";

interface MasogBalanceAlertProps {
  hasEnoughMasog: boolean;
  userMasogBalance: bigint;
}

export function MasogBalanceAlert({
  hasEnoughMasog,
  userMasogBalance,
}: MasogBalanceAlertProps) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        hasEnoughMasog
          ? "bg-s-success/10 border-s-success/20"
          : "bg-red-100 border-red-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <InformationCircleIcon
          className={`h-5 w-5 mt-0.5 ${
            hasEnoughMasog ? "text-s-success" : "text-red-500"
          }`}
        />
        <div>
          <h2
            className={`text-sm font-medium mb-1 ${
              hasEnoughMasog ? "text-s-success" : "text-red-600"
            }`}
          >
            {hasEnoughMasog
              ? "You have enough MASOG to create a proposal"
              : "Insufficient MASOG balance"}
          </h2>
          <p className="text-f-tertiary mas-body2">
            Your balance:{" "}
            <span className={!hasEnoughMasog ? "text-red-500 font-medium" : ""}>
              {userMasogBalance.toString()}
            </span>{" "}
            MASOG
            <br />
            Required balance: {REQUIRED_MASOG.toString()} MASOG
          </p>
        </div>
      </div>
    </div>
  );
}
