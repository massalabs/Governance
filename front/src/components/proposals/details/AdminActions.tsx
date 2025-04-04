import { useAccountStore } from "@massalabs/react-ui-kit";
import { useWriteSmartContract } from "@massalabs/react-ui-kit";
import { useContractStore } from "../../../store/useContractStore";
import { Args } from "@massalabs/massa-web3";
import { PixelButton } from "@/components/ui/PixelButton";

const allowedAddresses = [
  "AU1xs4LUr2XsFhe4YB756bEB2aG59k2Dy2LzLYgYR8zH4o2ZWv5G",
  "AU12wiZMwocjfWZKZhzP2dR86PBXJfGCoKY5wi6q1cSQoquMekvfJ",
  "AU1bTSHvZG7cdUUu4ScKwQVFum3gB5TDpdi9yMRv2bnedYUyptsa",
  "AU1DjgRMPCfnSvDcY3TXkbSQNDpsLQ3NUfCMrisT7xzwWsSe9V4s",
  "AU1qTGByMtnFjzU47fQG6SjAj45o5icS3aonzhj1JD1PnKa1hQ5",
  "AU1wfDH3BNBiFF9Nwko6g8q5gMzHW8KUHUL2YysxkZKNZHq37AfX",
  "AU12FUbb8snr7qTEzSdTVH8tbmEouHydQTUAKDXY9LDwkdYMNBVGF",
];

interface AdminActionsProps {
  proposalId: bigint;
  status: string;
}

export function AdminActions({ proposalId, status }: AdminActionsProps) {
  const { connectedAccount } = useAccountStore();
  const { governancePrivate } = useContractStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);

  if (
    !connectedAccount ||
    !allowedAddresses.includes(connectedAccount.address)
  ) {
    console.log(connectedAccount);
    console.log(allowedAddresses);
    console.log("Not allowed");
    return null;
  }

  const canChangeStatus =
    status.toUpperCase() === "DISCUSSION" || status.toUpperCase() === "VOTING";

  const handleNextStatus = async () => {
    if (!governancePrivate) return;
    await callSmartContract(
      "nextStatus",
      governancePrivate.address,
      new Args().addU64(proposalId).serialize(),
      {
        success: "Status updated successfully!",
        pending: "Updating status...",
        error: "Failed to update status",
      }
    );
  };

  const handleDelete = async () => {
    if (!governancePrivate) return;
    await callSmartContract(
      "deleteProposal",
      governancePrivate.address,
      new Args().addU64(proposalId).serialize(),
      {
        success: "Proposal deleted successfully!",
        pending: "Deleting proposal...",
        error: "Failed to delete proposal",
      }
    );
  };

  return (
    <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-f-primary dark:text-darkText mb-4">
        Admin Actions
      </h3>
      <div className="flex flex-col gap-4">
        {canChangeStatus && (
          <PixelButton onClick={handleNextStatus} fullWidth variant="primary">
            Next Status
          </PixelButton>
        )}
        <PixelButton onClick={handleDelete} fullWidth variant="secondary">
          Delete Proposal
        </PixelButton>
      </div>
    </div>
  );
}
