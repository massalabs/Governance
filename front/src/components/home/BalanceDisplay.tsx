const formatBigInt = (value: bigint | null, isLoading: boolean): string => {
    if (isLoading || value === null) return "...";
    return value.toString();
};

const calculateVotingPowerPercentage = (
    balance: bigint | null,
    totalSupply: bigint | undefined
): string => {
    if (!balance || !totalSupply || totalSupply === 0n) return "0";
    return ((Number(balance) / Number(totalSupply)) * 100).toFixed(4);
};

export const BalanceDisplay = ({
    balance,
    totalSupply,
    loading,
}: {
    balance: bigint | null;
    totalSupply: bigint | undefined;
    loading: boolean;
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <h3 className="text-sm text-f-tertiary dark:text-darkMuted mb-1 mas-h3">
                MASOG Balance
            </h3>
            <p className="text-2xl font-bold text-brand dark:text-darkAccent">
                {formatBigInt(balance, loading)}
            </p>
            <p className="text-xs text-f-tertiary dark:text-darkMuted">
                Minted from your staked rolls
            </p>
        </div>
        <div className="space-y-2">
            <h3 className="text-sm text-f-tertiary dark:text-darkMuted mb-1 mas-h3">
                Voting Power
            </h3>
            <p className="text-2xl font-bold text-brand dark:text-darkAccent">
                {calculateVotingPowerPercentage(balance, totalSupply)}%
            </p>
            <p className="text-xs text-f-tertiary dark:text-darkMuted">
                Of total MASOG supply ({formatBigInt(totalSupply ?? null, loading)}{" "}
                MASOG)
            </p>
        </div>
    </div>
);
