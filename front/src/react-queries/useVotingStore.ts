import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useContractStore } from "@/store/useContractStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { governanceKeys } from "./governanceKeys";
import { Vote } from "@/serializable/Vote";
import { VoteDetails, FormattedProposal, VoteMutationParams } from "@/types/governance";
import { useWriteSmartContract } from "@massalabs/react-ui-kit";
import { Args, Mas } from "@massalabs/massa-web3";
import { useMasogTotalSupply } from "@/react-queries/useMasogData";
import { ProposalStatus, TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE } from "@/config";
import Big from 'big.js';

export function useVotingStore(proposals: FormattedProposal[]) {
    const { governancePublic, governancePrivate } = useContractStore();
    const { connectedAccount } = useAccountStore();
    const { callSmartContract } = useWriteSmartContract(connectedAccount!);
    const queryClient = useQueryClient();
    const { data: totalSupply, isLoading: loadingTotalSupply } = useMasogTotalSupply();

    const proposalIds = proposals.map(p => p.id.toString());

    // Get all proposal votes
    const { data: allProposalVotes = {}, isLoading: loadingAllVotes } = useQuery({
        queryKey: governanceKeys.allProposalVotes(proposalIds),
        queryFn: async () => {
            if (!governancePublic || !proposals.length) {
                throw new Error("Missing dependencies for fetching proposal votes");
            }

            const votesMap: Record<string, VoteDetails[]> = {};
            // Only fetch votes for the specific proposals we need
            for (const proposal of proposals) {
                const votes = await governancePublic.getVotesPower(proposal.id);
                votesMap[proposal.id.toString()] = votes;
            }
            return votesMap;
        },
        refetchInterval: 10000,
        retry: 3,
        retryDelay: 1000,
        enabled: !!governancePublic && proposals.length > 0,
        // Don't refetch if we already have the data
        staleTime: 30000,
        // Only fetch data for the specific proposals we need
        select: (data) => {
            const filteredData: Record<string, VoteDetails[]> = {};
            proposalIds.forEach(id => {
                if (data[id]) {
                    filteredData[id] = data[id];
                }
            });
            return filteredData;
        },
    });

    // Get user's votes
    const { data: userVotes = {}, isLoading: loadingUserVotes } = useQuery({
        queryKey: governanceKeys.userVotes(proposalIds),
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
                votesMap[vote.id.toString()] = new Vote(vote.id, vote.value);
            });

            return votesMap;
        },
        refetchInterval: 10000,
        retry: 3,
        retryDelay: 1000,
        enabled: !!governancePublic && !!connectedAccount && proposals.length > 0,
        staleTime: 15000,
        // Only fetch data for the specific proposals we need
        select: (data) => {
            const filteredData: Record<string, Vote> = {};
            proposalIds.forEach(id => {
                if (data[id]) {
                    filteredData[id] = data[id];
                }
            });
            return filteredData;
        },
    });

    // Get total votes
    const { data: totalVotes = 0n, isLoading: loadingTotalVotes } = useQuery({
        queryKey: governanceKeys.totalVotes(),
        queryFn: async () => {
            if (!governancePublic) {
                throw new Error("Governance contract not initialized");
            }
            return await governancePublic.getTotalNbVotes();
        },
        refetchInterval: 10000,
        retry: 3,
        retryDelay: 1000,
        enabled: !!governancePublic,
        staleTime: 15000,
    });

    // Vote mutation
    const voteMutation = useMutation({
        mutationFn: async ({ proposalId, voteValue }: VoteMutationParams) => {
            if (!governancePrivate || !connectedAccount) {
                throw new Error("Governance contract not initialized or no account");
            }

            const vote = new Vote(proposalId, voteValue);

            await callSmartContract(
                "vote",
                governancePrivate.address,
                new Args().addSerializable(vote).serialize(),
                {
                    success: "Vote submitted successfully!",
                    pending: "Submitting vote...",
                    error: "Failed to submit vote",
                },
                Mas.fromString("1")
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: governanceKeys.all });
        },
    });

    // Helper functions
    const getProposalVotes = (proposalId: bigint) => {
        return allProposalVotes[proposalId.toString()] || [];
    };

    const hasUserVoted = (proposalId: bigint) => {
        return !!userVotes[proposalId.toString()];
    };

    const getUserVote = (proposalId: bigint) => {
        return userVotes[proposalId.toString()];
    };

    const submitVote = async (params: VoteMutationParams) => {
        await voteMutation.mutateAsync(params);
    };

    // Calculate vote progress data
    const getVoteProgressData = (proposal: FormattedProposal) => {
        const proposalVotes = getProposalVotes(proposal.id);
        const isVotingEnded = proposal.status === ProposalStatus.ACCEPTED || proposal.status === ProposalStatus.REJECTED;

        // Calculate vote volumes from individual votes
        let positive = 0n;
        let negative = 0n;
        let blank = 0n;

        proposalVotes.forEach(vote => {
            if (vote.value === 1n) {
                positive += vote.balance;
            } else if (vote.value === -1n) {
                negative += vote.balance;
            } else {
                blank += vote.balance;
            }
        });

        // Use proposal's vote volumes when voting has ended, otherwise use calculated volumes
        const positiveVoteVolume = isVotingEnded ? proposal.positiveVoteVolume : positive;
        const negativeVoteVolume = isVotingEnded ? proposal.negativeVoteVolume : negative;
        const blankVoteVolume = isVotingEnded ? proposal.blankVoteVolume : blank;

        // Calculate total votes
        const totalVotes = positiveVoteVolume + negativeVoteVolume + blankVoteVolume;

        // Use endMasogTotalSupply for ended proposals, otherwise use current total supply
        const effectiveTotalSupply = isVotingEnded ? proposal.endMasogTotalSupply : totalSupply;

        // Calculate abstain votes (total supply - total votes)
        const abstainVotes = effectiveTotalSupply ? effectiveTotalSupply - totalVotes : 0n;

        // Calculate percentages relative to total supply with proper decimal handling
        const calculateSupplyPercentage = (votes: bigint) => {
            if (!effectiveTotalSupply) return 0;

            // Convert BigInt to string to avoid precision loss
            const votesStr = votes.toString();
            const totalSupplyStr = effectiveTotalSupply.toString();

            // Use big.js for precise decimal arithmetic
            const votesBig = new Big(votesStr);
            const totalSupplyBig = new Big(totalSupplyStr);

            // Calculate percentage with high precision
            return votesBig.div(totalSupplyBig).times(100).toNumber();
        };

        const yesPercentage = calculateSupplyPercentage(positiveVoteVolume);
        const noPercentage = calculateSupplyPercentage(negativeVoteVolume);
        const blankPercentage = calculateSupplyPercentage(blankVoteVolume);
        const abstainPercentage = calculateSupplyPercentage(abstainVotes);

        // Calculate current progress towards threshold
        const currentProgress = effectiveTotalSupply
            ? (Number(positiveVoteVolume) / Number(effectiveTotalSupply)) * 100
            : 0;

        return {
            positiveVoteVolume,
            negativeVoteVolume,
            blankVoteVolume,
            abstainVotes,
            effectiveTotalSupply,
            yesPercentage,
            noPercentage,
            blankPercentage,
            abstainPercentage,
            currentProgress,
            thresholdPercentage: TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE,
            isVotingEnded,
        };
    };

    // Check if all required data is loaded for vote progress
    const isVoteProgressDataReady = !loadingAllVotes && !loadingTotalSupply && !!totalSupply;

    return {
        // Data
        allProposalVotes,
        userVotes,
        totalVotes,
        totalSupply,

        // Loading states
        loading: loadingAllVotes || loadingUserVotes || loadingTotalVotes,
        loadingVoteProgress: !isVoteProgressDataReady,

        // Helper functions
        getProposalVotes,
        hasUserVoted,
        getUserVote,
        submitVote,
        getVoteProgressData,

        // Mutation state
        isSubmitting: voteMutation.isPending,
        submitError: voteMutation.error,

        // Raw mutation
        voteMutation,
    };
} 