import { useEffect, useState } from "react";
import { useContractStore } from "../store/useContractStore";

export const NetworkIndicator = () => {
  const { governance } = useContractStore();
  const [network, setNetwork] = useState<string>("Not connected");

  useEffect(() => {
    const getNetwork = async () => {
      if (governance?.public) {
        try {
          const networkInfo = await governance.public.provider.networkInfos();
          setNetwork(networkInfo.name);
        } catch (error) {
          console.error("Failed to get network info:", error);
          setNetwork("Error");
        }
      } else {
        setNetwork("Not connected");
      }
    };

    getNetwork();
    // Refresh every minute
    const interval = setInterval(getNetwork, 60000);
    return () => clearInterval(interval);
  }, [governance?.public]);

  const getNetworkColor = () => {
    switch (network.toLowerCase()) {
      case "mainnet":
        return "text-green-500";
      case "buildnet":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`font-medium ${getNetworkColor()}`}>
        {network.charAt(0).toUpperCase() + network.slice(1)}
      </div>
    </div>
  );
};
