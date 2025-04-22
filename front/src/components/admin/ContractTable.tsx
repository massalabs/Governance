import React from 'react';

interface ContractTableProps {
    contracts: {
        contractType: 'governance' | 'masOg' | 'oracle';
        name: string;
        balance: string | undefined;
    }[];
    isLoading: boolean;
    amounts: Record<'governance' | 'masOg' | 'oracle', string>;
    onAmountChange: (contractType: 'governance' | 'masOg' | 'oracle', value: string) => void;
    onSendCoins: (contractType: 'governance' | 'masOg' | 'oracle') => void;
    isSending: boolean;
    sendingContract: 'governance' | 'masOg' | 'oracle' | null;
}

const ContractTable: React.FC<ContractTableProps> = ({
    contracts,
    isLoading,
    amounts,
    onAmountChange,
    onSendCoins,
    isSending,
    sendingContract
}) => {
    return (
        <div className="bg-card dark:bg-darkCard rounded-xl shadow-lg border border-border/10 dark:border-darkBorder/10 overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-border dark:border-darkBorder">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Contract</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Balance</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300" colSpan={2}>Amount (MAS)</th>
                    </tr>
                </thead>
                <tbody>
                    {contracts.map((contract) => (
                        <tr key={contract.contractType} className="border-b border-border dark:border-darkBorder last:border-0">
                            <td className="py-3 px-4 text-base font-medium">{contract.name}</td>
                            <td className="py-3 px-4 text-base text-primary font-medium">
                                {isLoading ? (
                                    <span className="animate-pulse">Loading...</span>
                                ) : (
                                    `${contract.balance || '0'} MAS`
                                )}
                            </td>
                            <td className="py-3 pl-4 pr-1 align-middle">
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        value={amounts[contract.contractType]}
                                        onChange={(e) => onAmountChange(contract.contractType, e.target.value)}
                                        placeholder="Amount in MAS"
                                        className="w-32 px-3 py-2 border border-border dark:border-darkBorder rounded-lg bg-background dark:bg-darkBg text-f-primary dark:text-f-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    />
                                </div>
                            </td>
                            <td className="py-3 pl-1 pr-4 align-middle">
                                <button
                                    onClick={() => onSendCoins(contract.contractType)}
                                    disabled={isSending && sendingContract === contract.contractType}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                                >
                                    {isSending && sendingContract === contract.contractType ? 'Sending...' : 'Send'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ContractTable; 