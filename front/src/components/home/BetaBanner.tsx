import { useEffect, useState } from "react";

const BANNER_STORAGE_KEY = "beta_banner_closed";

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isBannerClosed = localStorage.getItem(BANNER_STORAGE_KEY);
    if (isBannerClosed === "true") {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(BANNER_STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-f-primary text-white px-4 py-2 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm text-center flex-1">
          This is a beta test of decentralized governance, proposals and votes
          will not be considered for now
        </p>
        <button
          onClick={handleClose}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          aria-label="Close banner"
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
