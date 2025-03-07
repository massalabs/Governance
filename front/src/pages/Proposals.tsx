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

      <div className="space-y-6">
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
              className="bg-secondary border border-border rounded-lg shadow-sm divide-y divide-border"
            >
              {/* Header Section */}
              <div className="p-6">
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

                {/* Basic Info */}
                <div className="mt-4 flex items-center space-x-6">
                  <div>
                    <span className="text-f-tertiary mas-caption">
                      Created by
                    </span>
                    <div className="text-f-primary mas-body2">
                      {proposal.creator}
                    </div>
                  </div>
                  <div>
                    <span className="text-f-tertiary mas-caption">Period</span>
                    <div className="text-f-primary mas-body2">
                      {format(
                        new Date(Number(proposal.startTime)),
                        "MMM d, yyyy"
                      )}{" "}
                      -{" "}
                      {format(
                        new Date(Number(proposal.endTime)),
                        "MMM d, yyyy"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Voting Section */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Vote Distribution */}
                  <div>
                    <h4 className="text-f-primary mas-h3 mb-3">
                      Vote Distribution
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-24 text-f-tertiary mas-body2">
                          Positive
                        </div>
                        <div className="flex-1 mx-2">
                          <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-s-success rounded-full"
                              style={{
                                width: `${
                                  (Number(proposal.positiveVotes) /
                                    Number(totalVotes)) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-24 text-right text-f-primary mas-body">
                          {proposal.positiveVotes.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 text-f-tertiary mas-body2">
                          Negative
                        </div>
                        <div className="flex-1 mx-2">
                          <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-s-error rounded-full"
                              style={{
                                width: `${
                                  (Number(proposal.negativeVotes) /
                                    Number(totalVotes)) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-24 text-right text-f-primary mas-body">
                          {proposal.negativeVotes.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 text-f-tertiary mas-body2">
                          Blank
                        </div>
                        <div className="flex-1 mx-2">
                          <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-neutral/30 rounded-full"
                              style={{
                                width: `${
                                  (Number(proposal.blankVotes) /
                                    Number(totalVotes)) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-24 text-right text-f-primary mas-body">
                          {proposal.blankVotes.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <h4 className="text-f-primary mas-h3 mb-3">
                      Quorum Progress
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-f-primary mas-body">
                        <span>Total Votes:</span>
                        <span>{totalVotes.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-right text-f-tertiary mas-caption">
                        {progress}% of quorum reached
                      </div>
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
