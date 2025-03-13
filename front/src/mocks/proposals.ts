import { ProposalStatus } from "../types/governance";

const DISCUSSION_PERIOD = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
const VOTING_PERIOD = 21 * 24 * 60 * 60 * 1000; // 21 days in milliseconds

export const mockProposals = [
  {
    id: 1n,
    title: "Increase Block Reward",
    forumPostLink: "https://forum.massa.net/t/proposal-1",
    summary:
      "Proposal to increase the block reward from 100 MAS to 150 MAS to incentivize more validators to join the network. This change will help improve network decentralization and security.",
    parameterChange: JSON.stringify({
      parameter: "block_reward",
      value: "150",
    }),
    status: ProposalStatus.DISCUSSION,
    owner: "P1q2w3e4r5t6y7u8i9o0p1q2w3e4r5t6y7u8i9o0",
    creationTimestamp: BigInt(Date.now() - 3600000), // 1 hour ago
    endTimestamp: BigInt(Date.now() + DISCUSSION_PERIOD), // 14 days from now
    requiredScore: 564969254n, // 50% of total supply
    positiveVoteVolume: 0n,
    negativeVoteVolume: 0n,
    blankVoteVolume: 0n,
  },
  {
    id: 2n,
    title: "Adjust Finality Period",
    forumPostLink: "https://forum.massa.net/t/proposal-2",
    summary:
      "Modify the finality period from 32 blocks to 48 blocks to provide more time for network consensus and improve security. This change will help prevent potential chain reorganizations.",
    parameterChange: JSON.stringify({
      parameter: "finality_period",
      value: "48",
    }),
    status: ProposalStatus.VOTING,
    owner: "P2q3w4e5r6t7y8u9i0p1q2w3e4r5t6y7u8i9o0p1",
    creationTimestamp: BigInt(Date.now() - 7200000), // 2 hours ago
    endTimestamp: BigInt(Date.now() + VOTING_PERIOD), // 21 days from now
    requiredScore: 564969254n, // 50% of total supply
    positiveVoteVolume: 5000n,
    negativeVoteVolume: 2000n,
    blankVoteVolume: 100n,
  },
  {
    id: 3n,
    title: "Update Network Fees",
    forumPostLink: "https://forum.massa.net/t/proposal-3",
    summary:
      "Adjust network transaction fees to better reflect current network conditions and ensure sustainable network operation. This includes updating both storage and computation fees.",
    parameterChange: JSON.stringify({
      parameter: "network_fees",
      value: '{"storage": 0.001, "computation": 0.002}',
    }),
    status: ProposalStatus.ACCEPTED,
    owner: "P3q4w5e6r7t8y9u0i1p2q3w4e5r6t7y8u9i0p1q2",
    creationTimestamp: BigInt(Date.now() - 10800000), // 3 hours ago
    endTimestamp: BigInt(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    requiredScore: 564969254n, // 50% of total supply
    positiveVoteVolume: 8000n,
    negativeVoteVolume: 1000n,
    blankVoteVolume: 200n,
  },
  {
    id: 4n,
    title: "Modify Slot Duration",
    forumPostLink: "https://forum.massa.net/t/proposal-4",
    summary:
      "Change the slot duration from 16 seconds to 20 seconds to improve network stability and reduce the likelihood of missed blocks. This adjustment will help optimize network performance.",
    parameterChange: JSON.stringify({
      parameter: "slot_duration",
      value: "20",
    }),
    status: ProposalStatus.REJECTED,
    owner: "P4q5w6e7r8t9y0u1i2p3q4w5e6r7t8y9u0i1p2q3",
    creationTimestamp: BigInt(Date.now() - 14400000), // 4 hours ago
    endTimestamp: BigInt(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    requiredScore: 564969254n, // 50% of total supply
    positiveVoteVolume: 3000n,
    negativeVoteVolume: 7000n,
    blankVoteVolume: 500n,
  },
  {
    id: 5n,
    title: "Implement New Consensus Rules",
    forumPostLink: "https://forum.massa.net/t/proposal-5",
    summary:
      "Introduce new consensus rules to improve network security and efficiency. This includes implementing additional validation checks and optimizing the consensus algorithm.",
    parameterChange: JSON.stringify({
      parameter: "consensus_rules",
      value: '{"validation_level": "strict", "timeout": 5000}',
    }),
    status: ProposalStatus.VOTING,
    owner: "P5q6w7e8r9t0y1u2i3p4q5w6e7r8t9y0u1i2p3q4",
    creationTimestamp: BigInt(Date.now() - 18000000), // 5 hours ago
    endTimestamp: BigInt(Date.now() + VOTING_PERIOD), // 21 days from now
    requiredScore: 564969254n, // 50% of total supply
    positiveVoteVolume: 4000n,
    negativeVoteVolume: 1500n,
    blankVoteVolume: 300n,
  },
];
