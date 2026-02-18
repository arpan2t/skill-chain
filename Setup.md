

```markdown
# 🔧 SkillChain Setup Instructions

## Prerequisites

Before you begin, ensure you have installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Git** for version control
- **Pinata account** (free tier) - [Sign up here](https://pinata.cloud)
- **Solana wallet** with private key (Phantom, Backpack, etc.)

---

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/skillchain.git
cd skillchain

2. Install Dependencies
bash
npm install
# or
yarn install
3. Set Up Environment Variables
Create a .env.local file in the root directory:

env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/skillchain"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Solana Configuration
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_NETWORK="devnet"
ADMIN_PRIVATE_KEY="your-base58-encoded-private-key"

# Pinata IPFS Configuration
PINATA_JWT="your-pinata-jwt-token"
NEXT_PUBLIC_PINATA_GATEWAY="https://gateway.pinata.cloud"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
4. Generate Required Keys
NEXTAUTH_SECRET:

bash
openssl rand -base64 32
Solana Admin Wallet:

bash
# Create a new wallet for admin
solana-keygen new -o admin.json

# Get the public key
solana-keygen pubkey admin.json
Pinata JWT:

Log in to Pinata

Go to Dashboard → API Keys

Create new key with admin permissions

Copy the JWT token

5. Set Up Database
bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open database GUI
npx prisma studio
6. Run Development Server
bash
npm run dev
# or
yarn dev
7. Access the Application
Open http://localhost:3000 in your browser.

Database Commands
Command	Purpose
npx prisma generate	Generate Prisma client after schema changes
npx prisma db push	Push schema changes to database
npx prisma studio	Open database GUI
npx prisma db push --force-reset	Reset database (dev only)
