import { useQuery } from "@tanstack/react-query";
import { useContractStore } from "../../store/useContractStore";
import { Mas } from "@massalabs/massa-web3";
import { OutputEvents } from "@massalabs/massa-web3/dist/esm/generated/client-types";

interface AscConfig {
    maxGas: string;
    maxFee: string;
    autoRefresh: boolean;
}

interface AdminData {
    governanceBalance: string;
    masOgBalance: string;
    oracleBalance: string;
    events: OutputEvents;
    timestamp: number;
    ascEndPeriod: string;
    currentPeriod: string;
    isAscExpired: boolean;
    isProposalActive: boolean;
    asc: AscConfig | null;
    ascConfigError?: string;
}

const fetchAdminData = async (): Promise<AdminData> => {
    const { governancePublic, masOgPublic, oraclePublic } = useContractStore.getState();

    if (!governancePublic || !masOgPublic || !oraclePublic) {
        throw new Error("Contracts not available");
    }

    let ascConfig = null;
    let isProposalActive = false;
    let ascEndPeriod = BigInt(0);
    let ascConfigError: string | undefined = undefined;

    try {
        // Fetch all data in parallel for maximum performance
        const [
            balances,
            govEvents,
            currentSlot
        ] = await Promise.all([
            // Balances for all contracts
            Promise.all([
                governancePublic.provider.balanceOf([governancePublic.address]),
                masOgPublic.provider.balanceOf([masOgPublic.address]),
                oraclePublic.provider.balanceOf([oraclePublic.address]),
            ]),
            // Events
            governancePublic.provider.getEvents({
                smartContractAddress: governancePublic.address,
            }),
            // Current node status
            governancePublic.provider.getNodeStatus()
        ]);

        // Extract balances from results
        const [govBalance, masOgBal, oracleBal] = balances;

        // Convert period to bigint once
        const currentPeriod = BigInt(currentSlot.lastSlot.period);

        // Now fetch governance-specific data
        try {
            // Get ASC end period
            ascEndPeriod = await governancePublic.getAscEndPeriod();
        } catch (error) {
            console.error("Failed to fetch ASC end period:", error);
            // Set default value
            ascEndPeriod = BigInt(0);
        }

        try {
            // Check active proposals 
            isProposalActive = await governancePublic.isProposalActive();
        } catch (error) {
            console.error("Failed to check if proposal is active:", error);
        }

        try {
            // Get ASC configuration
            ascConfig = await governancePublic.getAscConfig();
        } catch (error) {
            console.error("Failed to fetch ASC config:", error);
            // Store the error message
            if (error instanceof Error) {
                ascConfigError = error.message;
            } else {
                ascConfigError = "Unknown error fetching ASC configuration";
            }
        }

        // Check if ASC is running
        const isAscExpired = ascEndPeriod > currentPeriod;

        return {
            governanceBalance: Mas.toString(govBalance[0].balance),
            masOgBalance: Mas.toString(masOgBal[0].balance),
            oracleBalance: Mas.toString(oracleBal[0].balance),
            events: govEvents.slice(-5).map((event: any) => ({
                ...event,
                isNew: false
            })),
            timestamp: Date.now(),
            ascEndPeriod: ascEndPeriod.toString(),
            currentPeriod: currentPeriod.toString(),
            isAscExpired,
            isProposalActive,
            asc: ascConfig ? {
                maxGas: ascConfig.maxGas.toString(),
                maxFee: ascConfig.maxFee.toString(),
                autoRefresh: ascConfig.autoRefresh
            } : null,
            ascConfigError
        };
    } catch (error) {
        console.error("Error fetching admin data:", error);
        throw error;
    }
};

export const useAdminData = (refetchInterval = 10000) => {
    return useQuery({
        queryKey: ["adminData"],
        queryFn: fetchAdminData,
        refetchInterval,
        refetchIntervalInBackground: true,
    });
}; 