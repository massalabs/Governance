import { useQuery } from "@tanstack/react-query";
import { useContractStore } from "@/store/useContractStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { governanceKeys } from "./governanceKeys";
import { Vote } from "@/serializable/Vote";
import { FormattedProposal } from "@/types/governance";


export const useUserVotes = (proposals: FormattedProposal[]) => {
  const { governancePublic } = useContractStore();
  const { connectedAccount } = useAccountStore();

  return useQuery({
    queryKey: governanceKeys.userVotes(),
    queryFn: async () => {
      if (!governancePublic || !connectedAccount || !proposals.length) {
        throw new Error("Missing dependencies for fetching votes");
      }

      const proposalIds = proposals.map((p) => p.id);
      const votes = await governancePublic.getUserVotes(
        connectedAccount.address,
        proposalIds
      );

      const votesMap: Record<string, Vote> = {};
      votes.forEach((vote) => {
        votesMap[vote.id.toString()] = new Vote(
          vote.id,
          vote.value
        );
      });

      return votesMap;
    },
    refetchInterval: 5000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!governancePublic && !!connectedAccount && proposals.length > 0,
    staleTime: 15000,
  });
};
