import { useQuery } from "@tanstack/react-query";
import { useContractStore } from "../../store/useContractStore";
import { Mas } from "@massalabs/massa-web3";
import { OutputEvents } from "@massalabs/massa-web3/dist/esm/generated/client-types";

interface AdminData {
    governanceBalance: string;
    masOgBalance: string;
    oracleBalance: string;
    events: OutputEvents;
    timestamp: number;
}

const fetchAdminData = async (): Promise<AdminData> => {
    const { governancePublic, masOgPublic, oraclePublic } = useContractStore.getState();

    if (!governancePublic || !masOgPublic || !oraclePublic) {
        throw new Error("Contracts not available");
    }

    // Fetch balances
    const [govBalance, masOgBal, oracleBal] = await Promise.all([
        governancePublic.provider.balanceOf([governancePublic.address]),
        masOgPublic.provider.balanceOf([masOgPublic.address]),
        oraclePublic.provider.balanceOf([oraclePublic.address]),
    ]);

    // Fetch events (last 5)
    const govEvents = await governancePublic.provider.getEvents({
        smartContractAddress: governancePublic.address,
    });

    return {
        governanceBalance: Mas.toString(govBalance[0].balance),
        masOgBalance: Mas.toString(masOgBal[0].balance),
        oracleBalance: Mas.toString(oracleBal[0].balance),
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