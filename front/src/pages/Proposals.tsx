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

const statusConfig: Record<
  ProposalStatus,
  { color: string; icon: any; label: string }
> = {
  ACTIVE: {
    color: "bg-s-success/10 text-s-success",
    icon: ClockIcon,
    label: "Active",
  },
  EXECUTED: {
    color: "bg-info/10 text-info",
    icon: CheckCircleIcon,
    label: "Executed",
  },
  EXPIRED: {
    color: "bg-s-error/10 text-s-error",
    icon: XCircleIcon,
    label: "Expired",
  },
  CANCELLED: {
    color: "bg-neutral/10 text-neutral",
    icon: XCircleIcon,
    label: "Cancelled",
  },
};

export default function Proposals() {
  const [proposals] = useState<Proposal[]>(mockProposals);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-f-primary mas-title">Proposals</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-secondary border border-border rounded-lg text-f-primary hover:bg-tertiary transition-colors mas-buttons">
            Filter
          </button>
          <button className="px-4 py-2 bg-brand text-neutral rounded-lg hover:opacity-90 transition-opacity mas-buttons">
            Sort
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {proposals.map((proposal) => {
          const status = statusConfig[proposal.status];
          const totalVotes =
            proposal.positiveVotes +
            proposal.negativeVotes +
            proposal.blankVotes;
          const progress = Number((totalVotes * BigInt(100)) / BigInt(2000000));

          return (
            <div
              key={proposal.id.toString()}
              className="bg-secondary border border-border p-6 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-f-primary mas-h2">{proposal.title}</h3>
                  <p className="mt-1 text-f-tertiary mas-body2">
                    {proposal.summary}
                  </p>
                  <a
                    href={proposal.forumPostLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-sm text-brand hover:opacity-80 transition-opacity mas-buttons"
                  >
                    View forum post →
                  </a>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                >
                  <status.icon className="h-4 w-4 mr-1" />
                  {status.label}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="text-f-tertiary mas-body2">Creator</span>
                  <div className="mt-1 text-f-primary mas-body">
                    {proposal.creator}
                  </div>
                </div>
                <div>
                  <span className="text-f-tertiary mas-body2">
                    Voting Period
                  </span>
                  <div className="mt-1 text-f-primary mas-body">
                    {format(
                      new Date(Number(proposal.startTime)),
                      "MMM d, yyyy"
                    )}{" "}
                    -{" "}
                    {format(new Date(Number(proposal.endTime)), "MMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <span className="text-f-tertiary mas-body2">Votes</span>
                  <div className="mt-1 grid grid-cols-1 gap-1">
                    <div className="flex justify-between text-f-primary mas-body">
                      <span>Positive:</span>
                      <span>{proposal.positiveVotes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-f-primary mas-body">
                      <span>Negative:</span>
                      <span>{proposal.negativeVotes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-f-primary mas-body">
                      <span>Blank:</span>
                      <span>{proposal.blankVotes.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-f-tertiary mas-body2">Progress</span>
                  <div className="mt-1">
                    <div className="flex justify-between text-f-primary mas-body">
                      <span>Total Votes:</span>
                      <span>{totalVotes.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 h-2 bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-1 text-right text-f-tertiary mas-caption">
                      {progress}% of quorum
                    </div>
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
