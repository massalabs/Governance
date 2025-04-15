import { useState, useEffect, useRef } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { ADMIN_ADDRESSES } from "../config";
import { useAdminData } from "../hooks/queries/useAdminData";
import { useSendCoinsMutation } from "../hooks/queries/useSendCoinsMutation";
import { useManageAutoRefreshMutation } from "../hooks/queries/useManageAutoRefreshMutation";
import { useRefreshMutation } from "../hooks/queries/useRefreshMutation";

interface ContractCardProps {
    title: string;
    balance: string | undefined;
    isLoading: boolean;
    amount: string;
    onAmountChange: (value: string) => void;
    onSend: () => void;
    isSending: boolean;
}

const ContractCard = ({ title, balance, isLoading, amount, onAmountChange, onSend, isSending }: ContractCardProps) => (
    <div className="bg-card dark:bg-darkCard p-6 rounded-xl shadow-lg border border-border/10 dark:border-darkBorder/10 hover:shadow-xl transition-all duration-300 h-[240px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Balance</p>
            <p className="text-3xl font-bold text-primary">
                {isLoading ? <span className="animate-pulse">Loading...</span> : `${balance || '0'} MAS`}
            </p>
        </div>
        <div className="mt-auto">
            <div className="flex gap-3">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 px-4 py-2.5 border border-border dark:border-darkBorder rounded-lg bg-background dark:bg-darkBg text-f-primary dark:text-f-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base"
                />
                <button
                    onClick={onSend}
                    disabled={isSending}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium whitespace-nowrap"
                >
                    {isSending ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    </div>
);

interface AutoRefreshCardProps {
    enabled: boolean;
    maxGas: string;
    maxFee: string;
    onToggle: (value: boolean) => void;
    onMaxGasChange: (value: string) => void;
    onMaxFeeChange: (value: string) => void;
    onUpdate: () => void;
    isUpdating: boolean;
}

const AutoRefreshCard = ({ enabled, maxGas, maxFee, onToggle, onMaxGasChange, onMaxFeeChange, onUpdate, isUpdating }: AutoRefreshCardProps) => (
    <div className="bg-card dark:bg-darkCard p-6 rounded-xl shadow-lg border border-border/10 dark:border-darkBorder/10 hover:shadow-xl transition-all duration-300 min-h-[200px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Auto-Refresh Management</h2>
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {enabled ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={enabled}
                        onChange={(e) => onToggle(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
            </div>
        </div>
        <div className="space-y-4 mb-6 flex-grow">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Gas</label>
                <input
                    type="number"
                    value={maxGas}
                    onChange={(e) => onMaxGasChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border dark:border-darkBorder rounded-lg bg-background dark:bg-darkBg text-f-primary dark:text-f-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Fee</label>
                <input
                    type="number"
                    value={maxFee}
                    onChange={(e) => onMaxFeeChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border dark:border-darkBorder rounded-lg bg-background dark:bg-darkBg text-f-primary dark:text-f-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base"
                />
            </div>
        </div>
        <button
            onClick={onUpdate}
            disabled={isUpdating}
            className="w-full px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
        >
            {isUpdating ? 'Updating...' : 'Update Settings'}
        </button>
    </div>
);

interface EventsTableProps {
    events: any[] | undefined;
    isLoading: boolean;
    error: any;
    highlightedEventId: string | null;
}

const EventsTable = ({ events, isLoading, error, highlightedEventId }: EventsTableProps) => (
    <div className="bg-card dark:bg-darkCard p-5 rounded-xl shadow-lg border border-border/10 dark:border-darkBorder/10 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Events</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                {events?.length || 0} events
            </div>
        </div>
        <div className="overflow-x-auto">
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center py-4">
                    {error instanceof Error ? error.message : "Failed to load events"}
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border dark:border-darkBorder">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Op ID</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Slot</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events?.map((event, index) => {
                            const eventId = event.context.origin_operation_id || `${event.context.slot.period}-${event.context.slot.thread}-${event.data}`;
                            const isHighlighted = highlightedEventId === eventId;
                            const slotInfo = `P:${event.context.slot.period} T:${event.context.slot.thread}`;

                            return (
                                <tr
                                    key={index}
                                    className={`border-b border-border dark:border-darkBorder last:border-0 transition-all duration-500 ${isHighlighted ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                >
                                    <td className="py-3 px-4 font-mono text-sm">{event.context.origin_operation_id || 'N/A'}</td>
                                    <td className="py-3 px-4 font-mono text-sm">{slotInfo}</td>
                                    <td className="py-3 px-4 font-mono text-sm">{event.data}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    </div>
);

const AdminPage = () => {
    const [governanceAmount, setGovernanceAmount] = useState<string>("");
    const [masOgAmount, setMasOgAmount] = useState<string>("");
    const [oracleAmount, setOracleAmount] = useState<string>("");
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
    const [maxGas, setMaxGas] = useState<string>("1000000");
    const [maxFee, setMaxFee] = useState<string>("1000000");
    const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
    const prevEventsRef = useRef<any[]>([]);

    const { connectedAccount } = useAccountStore();
    const { data: adminData, isLoading, error } = useAdminData(30000);
    const sendCoinsMutation = useSendCoinsMutation();
    const manageAutoRefreshMutation = useManageAutoRefreshMutation();
    const refreshMutation = useRefreshMutation();

    useEffect(() => {
        if (adminData?.events && adminData.events.length > 0) {
            const latestEvent = adminData.events[adminData.events.length - 1];
            const latestEventId = latestEvent.context.origin_operation_id || `${latestEvent.context.slot.period}-${latestEvent.context.slot.thread}-${latestEvent.data}`;
            const prevEvents = prevEventsRef.current;
            const isNewEvent = prevEvents.length === 0 || prevEvents[prevEvents.length - 1].context.origin_operation_id !== latestEvent.context.origin_operation_id;

            if (isNewEvent) {
                setHighlightedEventId(latestEventId);
                const timer = setTimeout(() => setHighlightedEventId(null), 3000);
                return () => clearTimeout(timer);
            }
        }
        prevEventsRef.current = adminData?.events || [];
    }, [adminData?.timestamp]);

    const handleSendCoins = (contractType: 'governance' | 'masOg' | 'oracle') => {
        const amount = contractType === 'governance' ? governanceAmount :
            contractType === 'masOg' ? masOgAmount :
                oracleAmount;
        sendCoinsMutation.mutate(
            { contractType, amount },
            {
                onSuccess: () => {
                    if (contractType === 'governance') {
                        setGovernanceAmount("");
                    } else if (contractType === 'masOg') {
                        setMasOgAmount("");
                    } else {
                        setOracleAmount("");
                    }
                }
            }
        );
    };

    const handleManageAutoRefresh = () => {
        manageAutoRefreshMutation.mutate({ enabled: autoRefreshEnabled, maxGas, maxFee });
    };

    const isAdmin = connectedAccount?.address && ADMIN_ADDRESSES.includes(connectedAccount.address);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="text-gray-600 dark:text-gray-400">You do not have permission to access this page.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => refreshMutation.mutate()}
                        disabled={refreshMutation.isPending}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Proposals Manually'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ContractCard
                    title="Governance Contract"
                    balance={adminData?.governanceBalance}
                    isLoading={isLoading}
                    amount={governanceAmount}
                    onAmountChange={setGovernanceAmount}
                    onSend={() => handleSendCoins('governance')}
                    isSending={sendCoinsMutation.isPending && sendCoinsMutation.variables?.contractType === 'governance'}
                />
                <ContractCard
                    title="MasOG Contract"
                    balance={adminData?.masOgBalance}
                    isLoading={isLoading}
                    amount={masOgAmount}
                    onAmountChange={setMasOgAmount}
                    onSend={() => handleSendCoins('masOg')}
                    isSending={sendCoinsMutation.isPending && sendCoinsMutation.variables?.contractType === 'masOg'}
                />
                <ContractCard
                    title="Oracle Contract"
                    balance={adminData?.oracleBalance}
                    isLoading={isLoading}
                    amount={oracleAmount}
                    onAmountChange={setOracleAmount}
                    onSend={() => handleSendCoins('oracle')}
                    isSending={sendCoinsMutation.isPending && sendCoinsMutation.variables?.contractType === 'oracle'}
                />
            </div>

            <div className="mb-8">
                <AutoRefreshCard
                    enabled={autoRefreshEnabled}
                    maxGas={maxGas}
                    maxFee={maxFee}
                    onToggle={setAutoRefreshEnabled}
                    onMaxGasChange={setMaxGas}
                    onMaxFeeChange={setMaxFee}
                    onUpdate={handleManageAutoRefresh}
                    isUpdating={manageAutoRefreshMutation.isPending}
                />
            </div>

            <EventsTable
                events={adminData?.events}
                isLoading={isLoading}
                error={error}
                highlightedEventId={highlightedEventId}
            />
        </div>
    );
};

export default AdminPage;