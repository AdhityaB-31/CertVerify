# 🎓 Blockchain Certificate Verification System
### Manakula Vinayagar Institute of Technology — Phase II

> Ethereum · Solidity · Hardhat · ReactJS · IPFS (Pinata) · QR Code · ethers.js v6

---

## 📁 Project Structure

```
cert-verify/
├── blockchain/                  ← Smart contracts + Hardhat
│   ├── contracts/
│   │   └── CertificateVerification.sol   ← Main smart contract
│   ├── scripts/
│   │   └── deploy.js            ← Deployment script
│   ├── test/
│   │   └── CertificateVerification.test.js
│   ├── hardhat.config.js
│   └── package.json
│
└── frontend/                    ← React DAPP
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── IssuePage.js     ← Issue certificates
    │   │   ├── VerifyPage.js    ← Verify + QR scanner
    │   │   └── DashboardPage.js ← Admin dashboard
    │   ├── utils/
    │   │   ├── web3Utils.js     ← Blockchain interaction
    │   │   ├── ipfsUtils.js     ← IPFS / Pinata upload
    │   │   ├── pdfUtils.js      ← Certificate PDF generation
    │   │   ├── contractABI.json ← Auto-updated on deploy
    │   │   └── contractAddress.json ← Auto-updated on deploy
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── .env
    └── package.json
```

---

## ✅ Prerequisites

Install these on your Ubuntu machine before starting:

```bash
# 1. Node.js v18+ (you already have v22 ✓)
node --version

# 2. MetaMask browser extension
# → https://metamask.io/download/
# Install in Chrome/Firefox

# 3. Git (already installed ✓)
git --version
```

---

## 🚀 SETUP — Step by Step

### STEP 1 — Install Blockchain Dependencies

```bash
cd ~/cert-verify/blockchain
npm install
```

This installs:  `hardhat`  `@nomicfoundation/hardhat-toolbox`

---

### STEP 2 — Compile the Smart Contract

```bash
cd ~/cert-verify/blockchain
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully (evm target: paris)
```

---

### STEP 3 — Run Tests

```bash
cd ~/cert-verify/blockchain
npx hardhat test
```

Expected output:
```
  CertificateVerification
    Deployment
      ✔ Should set deployer as owner
      ✔ Should auto-authorize deployer as institution
      ✔ Should start with 0 certificates
    Institution Authorization
      ✔ Owner can authorize an institution
      ✔ Non-owner cannot authorize an institution
      ✔ Owner can revoke institution authorization
    Certificate Issuance
      ✔ Authorized institution can issue a certificate
      ✔ Unauthorized address cannot issue a certificate
      ✔ Cannot issue duplicate certificate ID
      ✔ Emits CertificateIssued event
    Certificate Verification
      ✔ Should verify a valid certificate
      ✔ Should return verified=false for non-existent certificate
      ✔ Should return all certificates for a student by reg number
    Certificate Revocation
      ✔ Owner can revoke a certificate
      ✔ Stranger cannot revoke a certificate
      ✔ Cannot revoke an already revoked certificate

  16 passing
```

---

### STEP 4 — Start Hardhat Local Blockchain Node

Open **Terminal 1** and run:

```bash
cd ~/cert-verify/blockchain
npx hardhat node
```

You will see 20 test accounts with 10000 ETH each. **Keep this terminal open.**

Copy **Account #0**'s private key — you'll need it for MetaMask.

---

### STEP 5 — Deploy the Smart Contract

Open **Terminal 2** and run:

```bash
cd ~/cert-verify/blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Expected output:
```
─────────────────────────────────────────
  Deploying CertificateVerification...
─────────────────────────────────────────
Deploying with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000.0 ETH

✅ Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
📄 Contract address saved to frontend/src/utils/contractAddress.json
📄 ABI saved to frontend/src/utils/contractABI.json
```

> The deploy script **automatically updates** `contractAddress.json` and `contractABI.json`
> in the frontend. You do NOT need to copy anything manually.

---

### STEP 6 — Configure MetaMask

1. Open MetaMask in your browser
2. Click the network dropdown → **Add Network** → **Add manually**:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`
3. Click **Save**
4. Import Account → Paste **Account #0 private key** from Terminal 1
   - Default private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

### STEP 7 — Setup Pinata IPFS (Free)

1. Go to [https://app.pinata.cloud](https://app.pinata.cloud) → Create free account
2. Go to **API Keys** → **New Key** → enable `pinFileToIPFS` + `pinJSONToIPFS`
3. Copy the **API Key** and **Secret Key**
4. Edit `~/cert-verify/frontend/.env`:

```env
REACT_APP_PINATA_API_KEY=paste_your_api_key_here
REACT_APP_PINATA_SECRET_KEY=paste_your_secret_here
```

> **Skip this step** to run in demo mode — a mock IPFS hash will be used instead.

---

### STEP 8 — Install Frontend Dependencies

```bash
cd ~/cert-verify/frontend
npm install
```

---

### STEP 9 — Start the React App

Open **Terminal 3**:

```bash
cd ~/cert-verify/frontend
npm start
```

The app opens at **http://localhost:3000**

---

## 🔄 Daily Workflow (Day 2 onwards)

Every time you restart your computer:

```bash
# Terminal 1 — start blockchain node
cd ~/cert-verify/blockchain && npx hardhat node

# Terminal 2 — redeploy contract (fresh chain each restart)
cd ~/cert-verify/blockchain && npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 — start frontend
cd ~/cert-verify/frontend && npm start
```

---

## 🎯 Using the Application

### Issue a Certificate
1. Open http://localhost:3000/issue
2. Connect MetaMask (use Account #0)
3. Fill in student name, registration number, degree
4. Optionally upload a PDF
5. Click **Issue Certificate on Blockchain**
6. Approve the transaction in MetaMask
7. Download the certificate PDF with embedded QR code

### Verify a Certificate
1. Open http://localhost:3000/verify
2. Enter the Certificate ID (e.g. `MVIT-2024-22TH0204`) OR
3. Click **Start QR Scanner** and scan the QR on the certificate

### Dashboard
1. Open http://localhost:3000/dashboard
2. View all issued certificates in the event log
3. Search certificates by student registration number
4. Revoke a certificate (admin only)

---

## 🧪 Quick Demo (without Pinata)

Issue a test certificate using this data:
- **Student Name:** Adhitya B
- **Reg No:** 22TH0204
- **Degree:** B.Tech Information Technology
- **Year:** 2024

Then verify using Certificate ID: `MVIT-2024-22TH0204`

---

## 🛠 Troubleshooting

| Problem | Fix |
|---|---|
| MetaMask says "wrong network" | Switch to Hardhat Local (Chain 1337) in MetaMask |
| "Nonce too high" error | Reset MetaMask account: Settings → Advanced → Reset Account |
| Transaction fails | Make sure `npx hardhat node` is still running in Terminal 1 |
| Contract address is 0x000... | Run the deploy script again (Step 5) |
| IPFS upload fails | Check your Pinata API keys in `.env` or skip for demo mode |
| Port 3000 in use | `kill $(lsof -t -i:3000)` then `npm start` again |
| Port 8545 in use | `kill $(lsof -t -i:8545)` then `npx hardhat node` again |

---

## 📚 Technology Stack

| Layer | Technology |
|---|---|
| Blockchain | Ethereum (Hardhat local network) |
| Smart Contract | Solidity ^0.8.20 |
| Dev Framework | Hardhat + hardhat-toolbox |
| Frontend | ReactJS 18 + React Router v6 |
| Blockchain SDK | ethers.js v6 |
| File Storage | IPFS via Pinata API |
| PDF Generation | jsPDF |
| QR Code | qrcode.react + html5-qrcode (scanner) |
| Wallet | MetaMask |

---

## 👨‍💻 Team

| Name | Reg No |
|---|---|
| Adhitya B | 22TH0204 |
| Harish D | 22TH0230 |
| Hubert Joseva C | 22TH0233 |
| Navvin Kkumar E | 22TH0269 |

**Guide:** Dr. P. Sivakumar, M.E., Ph.D — Professor & Head, IT Department
