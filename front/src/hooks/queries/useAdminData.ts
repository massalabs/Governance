import { useQuery } from "@tanstack/react-query";
import { useContractStore } from "../../store/useContractStore";
import { Mas } from "@massalabs/massa-web3";

// Define our own event types based on the structure we know
interface EventContext {
    slot: {
        period: number;
        thread: number;
    };
    block?: string;
    origin_operation_id?: string;
    [key: string]: any;
}

interface Event {
    context: EventContext;
    data: string;
    isNew?: boolean;
}

interface AdminData {
    governanceBalance: string;
    masOgBalance: string;
    events: Event[];
    timestamp: number;
}

const fetchAdminData = async (): Promise<AdminData> => {
    const { governancePublic, masOgPublic } = useContractStore.getState();

    if (!governancePublic || !masOgPublic) {
        throw new Error("Contracts not available");
    }

    // Fetch balances
    const [govBalance, masOgBal] = await Promise.all([
        governancePublic.provider.balanceOf([governancePublic.address]),
        masOgPublic.provider.balanceOf([masOgPublic.address]),
    ]);

    // Fetch events (last 5)
    const govEvents = await governancePublic.provider.getEvents({
        smartContractAddress: governancePublic.address,
    });

    return {
        governanceBalance: Mas.toString(govBalance[0].balance),
        masOgBalance: Mas.toString(masOgBal[0].balance),
        events: govEvents.slice(-5).map((event: any) => ({
            ...event,
            isNew: false
        })),
        timestamp: Date.now()
    };
};

export const useAdminData = (refetchInterval = 10000) => {
    return useQuery({
        queryKey: ["adminData"],
        queryFn: fetchAdminData,
        refetchInterval,
        refetchIntervalInBackground: true,
    });
}; 