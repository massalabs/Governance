import { ClockIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { FormattedProposal } from "../../types/governance";

interface ProposalHeaderProps {
  proposal: FormattedProposal;
}

interface StatusConfig {
  icon: typeof ClockIcon;
  color: string;
  bgColor: string;
  label: string;
}

const statusConfigs: Record<string, StatusConfig> = {
  VOTING: {
    icon: ClockIcon,
    color: "text-brand",
    bgColor: "bg-brand/10",
    label: "Voting",
  },
  ACTIVE: {
    icon: ClockIcon,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Active",
  },
  EXECUTED: {
    icon: CheckBadgeIcon,
    color: "text-s-success",
    bgColor: "bg-s-success/10",
    label: "Executed",
  },
  EXPIRED: {
    icon: ClockIcon,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    label: "Expired",
  },
  CANCELLED: {
    icon: CheckBadgeIcon,
    color: "text-s-error",
    bgColor: "bg-s-error/10",
    label: "Cancelled",
  },
};

export function ProposalHeader({ proposal }: ProposalHeaderProps) {
  const normalizedStatus = proposal.status.toUpperCase();
  const statusConfig = statusConfigs[normalizedStatus] || {
    icon: ClockIcon,
    color: "text-f-tertiary",
    bgColor: "bg-f-tertiary/10",
    label: proposal.status,
  };
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-f-primary mas-h2">{proposal.title}</h2>
          <span className="text-f-tertiary mas-caption bg-tertiary px-2 py-0.5 rounded">
            #{proposal.id.toString()}
          </span>
        </div>
        <p className="text-f-tertiary mas-body">{proposal.summary}</p>
      </div>
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
      >
        <StatusIcon className="h-4 w-4 mr-1" />
        {statusConfig.label}
      </span>
    </div>
  );
}
