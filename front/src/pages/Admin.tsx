import { useState, useEffect, useRef } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { ADMIN_ADDRESSES } from "../config";
import { useAdminData } from "../hooks/queries/useAdminData";
import { useSendCoinsMutation } from "../hooks/queries/useSendCoinsMutation";
import { useManageAutoRefreshMutation } from "../hooks/queries/useManageAutoRefreshMutation";

const AdminPage = () => {
    const [amountToSend, setAmountToSend] = useState<string>("");
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
    const [maxGas, setMaxGas] = useState<string>("1000000");
    const [maxFee, setMaxFee] = useState<string>("1000000");
    const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
    const prevEventsRef = useRef<any[]>([]);

    const { connectedAccount } = useAccountStore();

    // Use React Query hooks
    const { data: adminData, isLoading, error } = useAdminData(10000);
    const sendCoinsMutation = useSendCoinsMutation();
    const manageAutoRefreshMutation = useManageAutoRefreshMutation();

    // Effect to highlight the latest event when it changes
    useEffect(() => {
        if (adminData?.events && adminData.events.length > 0) {
            const latestEvent = adminData.events[adminData.events.length - 1];
            const latestEventId = latestEvent.context.origin_operation_id ||
                `${latestEvent.context.slot.period}-${latestEvent.context.slot.thread}-${latestEvent.data}`;

            // Check if this is a new event by comparing with previous events
            const prevEvents = prevEventsRef.current;
            const isNewEvent = prevEvents.length === 0 ||
                prevEvents[prevEvents.length - 1].context.origin_operation_id !== latestEvent.context.origin_operation_id;

            if (isNewEvent) {
                // Set the highlighted event
                setHighlightedEventId(latestEventId);

                // Clear the highlight after animation
                const timer = setTimeout(() => {
                    setHighlightedEventId(null);
                }, 3000); // Highlight for 3 seconds

                return () => clearTimeout(timer);
            }
        }

        // Update the previous events reference
        prevEventsRef.current = adminData?.events || [];
    }, [adminData?.timestamp]);

    const handleSendCoins = async (contractType: 'governance' | 'masOg') => {
        sendCoinsMutation.mutate({ contractType, amount: amountToSend });
        setAmountToSend("");
    };

    const handleManageAutoRefresh = async () => {
        manageAutoRefreshMutation.mutate({
            enabled: autoRefreshEnabled,
            maxGas,
            maxFee
        });
    };

    // Check if current user is admin
    const isAdmin = connectedAccount?.address && ADMIN_ADDRESSES.includes(connectedAccount.address);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    You do not have permission to access this page.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {error instanceof Error ? error.message : "An error occurred while loading admin data"}
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card dark:bg-darkCard p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Governance Contract Balance</h2>
                    <p className="text-2xl font-bold text-primary mb-4">{adminData?.governanceBalance} MAS</p>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={amountToSend}
                            onChange={(e) => setAmountToSend(e.target.value)}
                            placeholder="Amount to send"
                            className="px-3 py-2 border border-border dark:border-darkBorder rounded-md bg-background dark:bg-darkBg text-f-primary dark:text-f-primary w-full"
                        />
                        <button
                            onClick={() => handleSendCoins('governance')}
                            disabled={sendCoinsMutation.isPending}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {sendCoinsMutation.isPending ? 'Sending...' : 'Send to Governance'}
                        </button>
                    </div>
                </div>

                <div className="bg-card dark:bg-darkCard p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">MasOG Contract Balance</h2>
                    <p className="text-2xl font-bold text-primary mb-4">{adminData?.masOgBalance} MAS</p>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={amountToSend}
                            onChange={(e) => setAmountToSend(e.target.value)}
                            placeholder="Amount to send"
                            className="px-3 py-2 border border-border dark:border-darkBorder rounded-md bg-background dark:bg-darkBg text-f-primary dark:text-f-primary w-full"
                        />
                        <button
                            onClick={() => handleSendCoins('masOg')}
                            disabled={sendCoinsMutation.isPending}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {sendCoinsMutation.isPending ? 'Sending...' : 'Send to MasOG'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-card dark:bg-darkCard p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-4">Auto-Refresh Management</h2>
                <div className="space-y-4">
                    <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={autoRefreshEnabled}
                                    onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                                />
                                <div className={`block w-14 h-8 rounded-full ${autoRefreshEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${autoRefreshEnabled ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
                                {autoRefreshEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Max Gas
                            </label>
                            <input
                                type="number"
                                value={maxGas}
                                onChange={(e) => setMaxGas(e.target.value)}
                                className="px-3 py-2 border border-border dark:border-darkBorder rounded-md bg-background dark:bg-darkBg text-f-primary dark:text-f-primary w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Max Fee
                            </label>
                            <input
                                type="number"
                                value={maxFee}
                                onChange={(e) => setMaxFee(e.target.value)}
                                className="px-3 py-2 border border-border dark:border-darkBorder rounded-md bg-background dark:bg-darkBg text-f-primary dark:text-f-primary w-full"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleManageAutoRefresh}
                        disabled={manageAutoRefreshMutation.isPending}
                        className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {manageAutoRefreshMutation.isPending ? 'Updating...' : 'Update Auto-Refresh Settings'}
                    </button>
                </div>
            </div>

            <div className="bg-card dark:bg-darkCard p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Recent Events</h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Auto-refreshing every 10 seconds
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border dark:border-darkBorder">
                                <th className="text-left py-3 px-4">Op ID</th>
                                <th className="text-left py-3 px-4">Slot</th>
                                <th className="text-left py-3 px-4">Data</th>

                            </tr>
                        </thead>
                        <tbody>
                            {adminData?.events.map((event, index) => {
                                const eventId = event.context.origin_operation_id ||
                                    `${event.context.slot.period}-${event.context.slot.thread}-${event.data}`;
                                const isHighlighted = highlightedEventId === eventId;
                                const slotInfo = `P:${event.context.slot.period} T:${event.context.slot.thread}`;

                                return (
                                    <tr
                                        key={index}
                                        className={`border-b border-border dark:border-darkBorder last:border-0 transition-all duration-500 ${isHighlighted ? 'bg-primary/10 dark:bg-primary/20' : ''
                                            }`}
                                    >
                                        <td className="py-3 px-4">{event.context.origin_operation_id || 'N/A'}</td>
                                        <td className="py-3 px-4">{slotInfo}</td>
                                        <td className="py-3 px-4">{event.data}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPage; 