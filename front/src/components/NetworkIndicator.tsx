import { isMainnet, networkName } from "@/config";

export const NetworkIndicator = () => {

  return (
    <div className="flex items-center gap-2">
      <div className={`font-medium ${isMainnet ? "text-s-success" : "text-brand"}`}>
        {networkName}
      </div>
    </div>
  );
};
