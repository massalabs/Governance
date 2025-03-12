import { FormattedProposal } from "../../types/governance";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface VoteDistributionProps {
  proposal: FormattedProposal;
}

const COLORS = {
  yes: "#10B981", // emerald-500, a softer, more pleasant green
  no: "#F43F5E", // rose-500, a softer, warmer red
  abstain: "#6366F1", // indigo-500, a beautiful purple-blue
};

export function VoteDistribution({ proposal }: VoteDistributionProps) {
  const totalVotes =
    proposal.positiveVoteVolume +
    proposal.negativeVoteVolume +
    proposal.blankVoteVolume;

  if (totalVotes === 0n) {
    return <div className="text-center text-f-tertiary py-2">No votes yet</div>;
  }

  const data = [
    {
      name: "Yes",
      value: Number(proposal.positiveVoteVolume),
      percentage: Number((proposal.positiveVoteVolume * 100n) / totalVotes),
      color: COLORS.yes,
    },
    {
      name: "No",
      value: Number(proposal.negativeVoteVolume),
      percentage: Number((proposal.negativeVoteVolume * 100n) / totalVotes),
      color: COLORS.no,
    },
    {
      name: "Abstain",
      value: Number(proposal.blankVoteVolume),
      percentage: Number((proposal.blankVoteVolume * 100n) / totalVotes),
      color: COLORS.abstain,
    },
  ].filter((item) => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-secondary border border-border rounded-lg p-2 shadow-lg">
          <p className="text-f-primary text-sm font-medium">{data.name}</p>
          <p className="text-f-tertiary text-sm">
            {data.percentage.toFixed(1)}%
          </p>
          <p className="text-f-tertiary text-sm">
            {data.value.toString()} votes
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="transparent"
                  className="opacity-90 hover:opacity-100 transition-opacity duration-200"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {data.map((item) => (
          <div key={item.name}>
            <div className="text-sm font-medium text-f-primary mb-1">
              {item.name}
            </div>
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-3 h-3 rounded-full opacity-90"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-f-tertiary">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-f-tertiary mt-1">
              {item.value.toString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
