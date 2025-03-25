import React, { useEffect, useState } from "react";

interface WalletConnectingLoaderProps {
  isConnecting: boolean;
  connectionStatus: string;
}

const WalletConnectingLoader: React.FC<WalletConnectingLoaderProps> = ({
  isConnecting,
  connectionStatus,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isConnecting) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isConnecting]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isConnecting ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Connecting Wallet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            {connectionStatus}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectingLoader;
