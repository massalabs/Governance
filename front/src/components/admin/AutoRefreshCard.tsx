import React from 'react';

interface AutoRefreshCardProps {
    enabled: boolean;
    maxGas: string;
    maxFee: string;
    onToggle: (value: boolean) => void;
    onMaxGasChange: (value: string) => void;
    onMaxFeeChange: (value: string) => void;
    onUpdate: () => void;
    isUpdating: boolean;
    onRefresh: () => void;
    isRefreshing: boolean;
    ascEndPeriod?: string;
    currentPeriod?: string;
    isAscExpired?: boolean;
    isProposalActive?: boolean;
    isLoadingAscData?: boolean;
    ascData?: {
        maxGas: string;
        maxFee: string;
        autoRefresh: boolean;
    } | null;
    ascConfigError?: string;
}

const AutoRefreshCard: React.FC<AutoRefreshCardProps> = ({
    enabled,
    maxGas,
    maxFee,
    onToggle,
    onMaxGasChange,
    onMaxFeeChange,
    onUpdate,
    isUpdating,
    onRefresh,
    isRefreshing,
    ascEndPeriod,
    currentPeriod,
    isAscExpired,
    isProposalActive,
    isLoadingAscData,
    ascData,
    ascConfigError
}) => {
    return (
        <div className="bg-card dark:bg-darkCard p-5 rounded-xl shadow-lg border border-border/10 dark:border-darkBorder/10 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Auto-Refresh Management</h2>
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="px-3 py-1.5 bg-secondary/90 text-white rounded-lg hover:bg-secondary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Manually'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                {/* ASC Status Information */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg h-full">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ASC Status</h3>
                    {isLoadingAscData ? (
                        <div className="animate-pulse flex space-x-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div className="text-gray-600 dark:text-gray-400">Status:</div>
                            <div className={`font-medium ${isAscExpired ? 'text-green-500' : 'text-yellow-500'}`}>
                                {isAscExpired ? 'Running' : 'Not Running'}
                            </div>

                            <div className="text-gray-600 dark:text-gray-400">End Period:</div>
                            <div className="font-medium">{ascEndPeriod || 'N/A'}</div>

                            <div className="text-gray-600 dark:text-gray-400">Current Period:</div>
                            <div className="font-medium">{currentPeriod || 'N/A'}</div>

                            <div className="text-gray-600 dark:text-gray-400">Active Proposals:</div>
                            <div className={`font-medium ${isProposalActive ? 'text-green-500' : 'text-gray-500'}`}>
                                {isProposalActive ? 'Yes' : 'No'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Current ASC Configuration */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg h-full">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Configuration</h3>
                    {isLoadingAscData ? (
                        <div className="animate-pulse flex flex-col gap-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
                        </div>
                    ) : ascConfigError ? (
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded text-sm text-red-600 dark:text-red-400">
                            <p className="font-medium mb-1">Unable to fetch configuration</p>
                            <p className="text-xs">{ascConfigError}</p>
                        </div>
                    ) : !ascData ? (
                        <div className="flex justify-center items-center h-20 text-sm text-gray-500 dark:text-gray-400">
                            No configuration data available
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div className="text-gray-600 dark:text-gray-400">Max Gas:</div>
                            <div className="font-medium">{ascData.maxGas || 'N/A'}</div>

                            <div className="text-gray-600 dark:text-gray-400">Max Fee:</div>
                            <div className="font-medium">{ascData.maxFee || 'N/A'}</div>

                            <div className="text-gray-600 dark:text-gray-400">Auto-Refresh:</div>
                            <div className={`font-medium ${ascData.autoRefresh ? 'text-green-500' : 'text-gray-500'}`}>
                                {ascData.autoRefresh ? 'Enabled' : 'Disabled'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Update ASC Configuration */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Update Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max Gas (NanoMas)</label>
                        <input
                            type="number"
                            value={maxGas}
                            onChange={(e) => onMaxGasChange(e.target.value)}
                            className="w-full px-3 py-1.5 border border-border dark:border-darkBorder rounded-lg bg-background dark:bg-darkBg text-f-primary dark:text-f-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max Fee (NanoMas)</label>
                        <input
                            type="number"
                            value={maxFee}
                            onChange={(e) => onMaxFeeChange(e.target.value)}
                            className="w-full px-3 py-1.5 border border-border dark:border-darkBorder rounded-lg bg-background dark:bg-darkBg text-f-primary dark:text-f-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Auto-Refresh</label>
                        <div className="flex items-center h-9">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={enabled}
                                    onChange={(e) => onToggle(e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    {enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onUpdate}
                disabled={isUpdating}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
                {isUpdating ? 'Updating...' : 'Update Settings'}
            </button>
        </div>
    );
};

export default AutoRefreshCard; 