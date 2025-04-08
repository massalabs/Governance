import { useAccountStore } from "@massalabs/react-ui-kit";
import { useWriteSmartContract } from "@massalabs/react-ui-kit";
import { useContractStore } from "../../../store/useContractStore";
import { Args } from "@massalabs/massa-web3";
import { PixelButton } from "@/components/ui/PixelButton";
import { ADMIN_ADDRESSES } from "@/config";

interface AdminActionsProps {
  proposalId: bigint;
}

export function AdminActions({ proposalId }: AdminActionsProps) {
  const { connectedAccount } = useAccountStore();
  const { governancePrivate } = useContractStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);

  if (
    !connectedAccount ||
    !ADMIN_ADDRESSES.includes(connectedAccount.address)
  ) {

    return null;
  }



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
        <PixelButton onClick={handleDelete} fullWidth variant="secondary">
          Delete Proposal
        </PixelButton>
      </div>
    </div>
  );
}
