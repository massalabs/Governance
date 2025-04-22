import { useState, useEffect, useRef } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { ADMIN_ADDRESSES } from "../config";
import { useAdminData } from "../hooks/queries/useAdminData";
import { useSendCoinsMutation } from "../hooks/queries/useSendCoinsMutation";
import { useManageAutoRefreshMutation } from "../hooks/queries/useManageAutoRefreshMutation";
import { useRefreshMutation } from "../hooks/queries/useRefreshMutation";
import ContractTable from "../components/admin/ContractTable";
import EventsTable from "../components/admin/EventsTable";
import AutoRefreshCard from "../components/admin/AutoRefreshCard";

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

    const handleAmountChange = (contractType: 'governance' | 'masOg' | 'oracle', value: string) => {
        if (contractType === 'governance') {
            setGovernanceAmount(value);
        } else if (contractType === 'masOg') {
            setMasOgAmount(value);
        } else {
            setOracleAmount(value);
        }
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

    const contracts = [
        {
            contractType: 'governance' as const,
            name: 'Governance Contract',
            balance: adminData?.governanceBalance
        },
        {
            contractType: 'masOg' as const,
            name: 'MasOG Contract',
            balance: adminData?.masOgBalance
        },
        {
            contractType: 'oracle' as const,
            name: 'Oracle Contract',
            balance: adminData?.oracleBalance
        }
    ];

    const amounts = {
        governance: governanceAmount,
        masOg: masOgAmount,
        oracle: oracleAmount
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex items-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>
            </div>

            <div className="mb-8">
                <ContractTable
                    contracts={contracts}
                    isLoading={isLoading}
                    amounts={amounts}
                    onAmountChange={handleAmountChange}
                    onSendCoins={handleSendCoins}
                    isSending={sendCoinsMutation.isPending}
                    sendingContract={sendCoinsMutation.variables?.contractType || null}
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
                    onRefresh={() => refreshMutation.mutate()}
                    isRefreshing={refreshMutation.isPending}
                    ascEndPeriod={adminData?.ascEndPeriod}
                    currentPeriod={adminData?.currentPeriod}
                    isAscExpired={adminData?.isAscExpired}
                    isProposalActive={adminData?.isProposalActive}
                    isLoadingAscData={isLoading}
                    ascData={adminData?.asc}
                    ascConfigError={adminData?.ascConfigError}
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