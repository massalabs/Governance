import { useQuery } from "@tanstack/react-query";
import { useContractStore } from "../store/useContractStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { governanceKeys } from "./queryKeys/governance";
import { Vote } from "../serializable/Vote";
import { FormattedProposal } from "../types/governance";

export const useUserVotes = (proposals: FormattedProposal[]) => {
  const { governance } = useContractStore();
  const { connectedAccount } = useAccountStore();

  return useQuery({
    queryKey: governanceKeys.userVotes(),
    queryFn: async () => {
      if (!governance?.public || !connectedAccount || !proposals.length) {
        throw new Error("Missing dependencies for fetching votes");
      }

      const proposalIds = proposals.map((p) => p.id);
      const votes = await governance.public.getUserVotes(
        connectedAccount.address,
        proposalIds
      );

      const votesMap: Record<string, Vote> = {};
      votes.forEach((vote) => {
        votesMap[vote.id.toString()] = new Vote(
          vote.id,
          vote.value,
          new Uint8Array()
        );
      });

      return votesMap;
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!governance?.public && !!connectedAccount && proposals.length > 0,
    staleTime: 15000,
  });
};
