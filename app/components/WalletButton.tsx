"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  return (
    <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 !rounded-full !px-6 !py-3 !text-white !font-semibold !transition-all hover:!scale-105 hover:!shadow-lg hover:!shadow-purple-500/25" />
  );
}
