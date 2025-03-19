import {
  ConnectMassaWallet,
  PopupModal,
  PopupModalContent,
  PopupModalHeader,
} from "@massalabs/react-ui-kit";
import { createPortal } from "react-dom";
import Intl from "@/i18n/i18n";

interface ConnectWalletPopupProps {
  setOpen: (open: boolean) => void;
}

export function ConnectWalletPopup(props: ConnectWalletPopupProps) {
  const { setOpen } = props;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
      <PopupModal
        customClass="w-1/3 min-w-[470px] max-w-[700px] transform transition-all duration-300 ease-in-out"
        customClassNested="border-2 border-primary dark:border-darkAccent bg-secondary/95 dark:bg-darkCard/95 backdrop-blur-lg shadow-2xl"
        fullMode={true}
        onClose={() => setOpen(false)}
      >
        <PopupModalHeader>
          <div className="text-f-primary dark:text-darkText flex flex-col mb-6">
            <label className="mas-title mb-2 text-2xl font-bold">
              {Intl.t("connect-wallet.title")}
            </label>
          </div>
        </PopupModalHeader>
        <div className="pb-8">
          <PopupModalContent>
            <div className="col-span-2">
              <WalletCard>
                <div className="[&_#dropdownUiKitButton]:border-2 [&_#dropdownUiKitButton]:border-primary/20 dark:[&_#dropdownUiKitButton]:border-darkAccent/20 [&_#dropdownUiKitButton]:hover:border-primary/40 dark:[&_#dropdownUiKitButton]:hover:border-darkAccent/40 [&_#dropdownUiKitButton]:rounded-lg [&_#dropdownUiKitButton]:bg-secondary dark:[&_#dropdownUiKitButton]:bg-darkCard [&_#dropdownUiKitButton]:text-f-primary dark:[&_#dropdownUiKitButton]:text-darkText [&_[data-testid=clipboard-field]]:border-2 [&_[data-testid=clipboard-field]]:border-primary/20 dark:[&_[data-testid=clipboard-field]]:border-darkAccent/20 [&_[data-testid=clipboard-field]]:hover:border-primary/40 dark:[&_[data-testid=clipboard-field]]:hover:border-darkAccent/40">
                  <ConnectMassaWallet />
                </div>
              </WalletCard>
            </div>
          </PopupModalContent>
        </div>
      </PopupModal>
    </div>,
    document.body
  );
}

export function WalletCard({ ...props }) {
  const { children } = props;

  return (
    <div className="bg-gradient-to-br from-secondary/40 to-secondary/30 dark:from-darkCard/40 dark:to-darkCard/30 p-8 rounded-2xl flex flex-col justify-center items-center backdrop-blur-sm border border-primary/5 dark:border-darkAccent/5 hover:border-primary/10 dark:hover:border-darkAccent/10 transition-all duration-300">
      <div className="flex flex-col w-full mas-body space-y-4">{children}</div>
    </div>
  );
}
