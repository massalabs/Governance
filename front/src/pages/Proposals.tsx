import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Proposal } from "../store/useStore";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

const statusConfig = {
  active: {
    icon: ClockIcon,
    color: "text-brand",
    bgColor: "bg-brand/10",
    label: "Active",
  },
  passed: {
    icon: CheckCircleIcon,
    color: "text-s-success",
    bgColor: "bg-s-success/10",
    label: "Passed",
  },
  rejected: {
    icon: XCircleIcon,
    color: "text-s-error",
    bgColor: "bg-s-error/10",
    label: "Rejected",
  },
  executed: {
    icon: CheckBadgeIcon,
    color: "text-s-success",
    bgColor: "bg-s-success/10",
    label: "Executed",
  },
} as const;

export default function Proposals() {
  const { proposals, hasVoted, getUserVote } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-f-primary mas-title">Proposals</h1>
        <Link
          to="/create"
          className="px-4 py-2 bg-brand text-neutral rounded-lg hover:opacity-90 active-button mas-buttons"
        >
          Create Proposal
        </Link>
      </div>

      <div className="grid gap-6">
        {proposals.map((proposal) => {
          const StatusIcon = statusConfig[proposal.status].icon;
          const statusColor = statusConfig[proposal.status].color;
          const statusBgColor = statusConfig[proposal.status].bgColor;
          const statusLabel = statusConfig[proposal.status].label;
          const hasUserVoted = hasVoted(proposal.id);
          const userVote = getUserVote(proposal.id);

          return (
            <div
              key={proposal.id}
              className="bg-secondary border border-border rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h2 className="text-f-primary mas-h2">{proposal.title}</h2>
                    <p className="text-f-tertiary mas-body">
                      {proposal.summary}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBgColor} ${statusColor}`}
                  >
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {statusLabel}
                  </span>
                </div>

                {/* Basic Info Section */}
                <div className="flex items-center gap-4 text-f-tertiary mas-caption">
                  <span>Created by: {proposal.creator}</span>
                  <span>•</span>
                  <span>
                    {new Date(proposal.startTime * 1000).toLocaleDateString()} -{" "}
                    {new Date(proposal.endTime * 1000).toLocaleDateString()}
                  </span>
                </div>

                {/* Voting Section */}
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div className="space-y-4">
                    <h3 className="text-f-primary mas-h3">Vote Distribution</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-f-tertiary mas-body2">Yes</span>
                        <span className="text-f-primary mas-body2">
                          {proposal.votes.yes.toString()}
                        </span>
                      </div>
                      <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-s-success"
                          style={{
                            width: `${
                              (Number(proposal.votes.yes) /
                                Number(
                                  proposal.votes.yes +
                                    proposal.votes.no +
                                    proposal.votes.abstain
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-f-tertiary mas-body2">No</span>
                        <span className="text-f-primary mas-body2">
                          {proposal.votes.no.toString()}
                        </span>
                      </div>
                      <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-s-error"
                          style={{
                            width: `${
                              (Number(proposal.votes.no) /
                                Number(
                                  proposal.votes.yes +
                                    proposal.votes.no +
                                    proposal.votes.abstain
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-f-tertiary mas-body2">
                          Abstain
                        </span>
                        <span className="text-f-primary mas-body2">
                          {proposal.votes.abstain.toString()}
                        </span>
                      </div>
                      <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-f-tertiary"
                          style={{
                            width: `${
                              (Number(proposal.votes.abstain) /
                                Number(
                                  proposal.votes.yes +
                                    proposal.votes.no +
                                    proposal.votes.abstain
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-f-primary mas-h3">Quorum Progress</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-f-tertiary mas-body2">
                          Progress
                        </span>
                        <span className="text-f-primary mas-body2">
                          {(
                            (Number(proposal.votes.yes + proposal.votes.no) /
                              Number(proposal.quorum)) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand"
                          style={{
                            width: `${
                              (Number(proposal.votes.yes + proposal.votes.no) /
                                Number(proposal.quorum)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <p className="text-f-tertiary mas-caption">
                        Required: {proposal.quorum.toString()} votes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Section */}
                <div className="flex justify-end pt-4 border-t border-border">
                  <Link
                    to={`/proposals/${proposal.id}`}
                    className="px-4 py-2 bg-secondary text-f-primary rounded-lg hover:bg-tertiary active-button mas-buttons"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
