"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  return (
    <WalletMultiButton className="!bg-[#358eb8] !rounded-full !px-6 !py-3 !text-white !font-semibold !transition-all hover:!bg-[#2a7296] hover:!scale-105 hover:!shadow-lg hover:!shadow-[#358eb8]/25" />
  );
}
