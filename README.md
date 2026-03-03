# 🎓 SkillChain - Verifiable Credentials on Solana

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Platform-9945FF?logo=solana)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

## 📋 Overview

SkillChain is a blockchain-based platform that enables organizations to issue verifiable credentials as soulbound NFTs on Solana. Users can securely store, manage, and selectively share their certificates, while employers can verify authenticity instantly—all for free.

---

## ✨ Key Features

### For Organizations
- 🔐 Secure signup and login
- 📜 Mint certificates as soulbound NFTs
- 🖼️ Add title, description, and images
- 📊 Manage issued certificates

### For Users
- 👛 Connect any Solana wallet
- 📁 View all certificates in one profile
- ✅ Select specific certificates to share
- 📱 Generate QR codes and shareable links
- 🐦 Share directly on X (Twitter)

### For Verifiers
- 🔍 Scan QR code or click shared link
- 👀 View only shared certificates
- ⚡ Instant verification on Solana
- 🆓 Free, no login required

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/skillchain.git
cd skillchain

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev

🛠️ Tech Stack
Category =>	Technologies
Frontend =>	Next.js 15, React, TypeScript, TailwindCSS
Blockchain => Solana, Metaplex
Database => PostgreSQL, Prisma
Storage => IPFS (Pinata)
Auth => NextAuth.js
Wallet => Solana Wallet Adapter


📄 License
MIT © arpan