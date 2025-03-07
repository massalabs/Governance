import { useState } from "react";
import { format } from "date-fns";
import { Proposal, ProposalStatus } from "../types/governance";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const mockProposals: Proposal[] = [
  {
    id: 1n,
    creator: "0x1234...5678",
    forumPostLink: "https://forum.example.com/proposal/1",
    title: "Increase Block Reward",
    summary:
      "Proposal to increase the block reward by 10% to incentivize more validators",
    status: ProposalStatus.ACTIVE,
    startTime: BigInt(new Date("2024-03-01").getTime()),
    endTime: BigInt(new Date("2024-03-15").getTime()),
    positiveVotes: BigInt(1000000),
    negativeVotes: BigInt(500000),
    blankVotes: BigInt(100000),
  },
  // Add more mock proposals as needed
];

const statusColors: Record<ProposalStatus, string> = {
  ACTIVE: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100",
  EXECUTED: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100",
  EXPIRED: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100",
  CANCELLED: "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100",
};

const statusIcons: Record<ProposalStatus, any> = {
  ACTIVE: ClockIcon,
  EXECUTED: CheckCircleIcon,
  EXPIRED: XCircleIcon,
  CANCELLED: XCircleIcon,
};

export default function Proposals() {
  const [proposals] = useState<Proposal[]>(mockProposals);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
          Proposals
        </h1>
        <div className="flex space-x-4">
          <button className="btn btn-secondary">Filter</button>
          <button className="btn btn-primary">Sort</button>
        </div>
      </div>

      <div className="space-y-4">
        {proposals.map((proposal) => {
          const StatusIcon = statusIcons[proposal.status];
          const totalVotes =
            proposal.positiveVotes +
            proposal.negativeVotes +
            proposal.blankVotes;
          const progress = Number((totalVotes * BigInt(100)) / BigInt(2000000)); // Using 2M as quorum

          return (
            <div key={proposal.id.toString()} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-text-light dark:text-text-dark">
                    {proposal.title}
                  </h3>
                  <p className="mt-1 text-sm text-secondary-light dark:text-secondary-dark">
                    {proposal.summary}
                  </p>
                  <a
                    href={proposal.forumPostLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-sm text-primary-light dark:text-primary-dark hover:opacity-80"
                  >
                    View forum post →
                  </a>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[proposal.status]
                  }`}
                >
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {proposal.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-secondary-light dark:text-secondary-dark">
                    Creator
                  </span>
                  <div className="text-text-light dark:text-text-dark">
                    {proposal.creator}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-secondary-light dark:text-secondary-dark">
                    Voting Period
                  </span>
                  <div className="text-text-light dark:text-text-dark">
                    {format(
                      new Date(Number(proposal.startTime)),
                      "MMM d, yyyy"
                    )}{" "}
                    -{" "}
                    {format(new Date(Number(proposal.endTime)), "MMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-secondary-light dark:text-secondary-dark">
                    Positive Votes
                  </span>
                  <div className="text-text-light dark:text-text-dark">
                    {proposal.positiveVotes.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-secondary-light dark:text-secondary-dark">
                    Negative Votes
                  </span>
                  <div className="text-text-light dark:text-text-dark">
                    {proposal.negativeVotes.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-secondary-light dark:text-secondary-dark">
                    Blank Votes
                  </span>
                  <div className="text-text-light dark:text-text-dark">
                    {proposal.blankVotes.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-secondary-light dark:text-secondary-dark">
                    Total Votes
                  </span>
                  <div className="text-text-light dark:text-text-dark">
                    {totalVotes.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-secondary-light dark:text-secondary-dark">
                    Progress
                  </span>
                  <div className="text-text-light dark:text-text-dark">
                    {progress}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
