import { useAccountStore } from "@massalabs/react-ui-kit";

export const NetworkIndicator = () => {
  const { network } = useAccountStore();

  const getNetworkColor = () => {
    switch (network?.name.toLowerCase()) {
      case "mainnet":
        return "text-s-success";
      case "buildnet":
        return "text-brand";
      case "error":
        return "text-s-error";
      default:
        return "text-f-tertiary";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`font-medium ${getNetworkColor()}`}>
        {network?.name
          ? network.name.charAt(0).toUpperCase() + network.name.slice(1)
          : "Not Connected"}
      </div>
    </div>
  );
};
