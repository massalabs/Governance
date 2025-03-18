import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { REQUIRED_MAS, REQUIRED_MASOG } from "../../hooks/useCreateProposal";
import { formatAmount } from "@massalabs/react-ui-kit";

interface MasogBalanceAlertProps {
  hasEnoughMasog: boolean;
  userMasogBalance: bigint | null;
  hasEnoughMas: boolean;
  userMasBalance: bigint | undefined;
}

export function MasogBalanceAlert({
  hasEnoughMasog,
  userMasogBalance,
  hasEnoughMas,
  userMasBalance,
}: MasogBalanceAlertProps) {
  const hasEnough = hasEnoughMasog && hasEnoughMas;
  const alertColor = hasEnough ? "text-s-success" : "text-red-500";
  const alertBgColor = hasEnough ? "bg-s-success/10" : "bg-red-100";
  const alertBorderColor = hasEnough ? "border-s-success/20" : "border-red-300";

  return (
    <div
      className={`p-4 rounded-lg border ${alertBgColor} ${alertBorderColor}`}
    >
      <div className="flex items-start gap-3">
        <InformationCircleIcon className={`h-5 w-5 mt-0.5 ${alertColor}`} />
        <div>
          <h2 className={`text-sm font-medium mb-2 ${alertColor}`}>
            {hasEnough
              ? "You have enough balance to create a proposal"
              : !hasEnoughMasog && !hasEnoughMas
              ? "Insufficient MASOG and MAS balance"
              : !hasEnoughMasog
              ? "Insufficient MASOG balance"
              : "Insufficient MAS balance"}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-f-tertiary mas-body2">MASOG:</span>
              <span
                className={!hasEnoughMasog ? "text-red-500 font-medium" : ""}
              >
                {userMasogBalance?.toString() ?? "0"}
              </span>
              <span className="text-f-tertiary">/</span>
              <span className="text-f-tertiary">
                {REQUIRED_MASOG.toString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-f-tertiary mas-body2">MAS:</span>
              <span className={!hasEnoughMas ? "text-red-500 font-medium" : ""}>
                {formatAmount(userMasBalance ?? 0n).preview ?? "0"}
              </span>
              <span className="text-f-tertiary">/</span>
              <span className="text-f-tertiary">
                {formatAmount(REQUIRED_MAS, 9).preview}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
