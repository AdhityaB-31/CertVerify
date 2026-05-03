// scripts/deploy.js
const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

async function main() {
  console.log("─────────────────────────────────────────");
  console.log("  Deploying CertificateVerification...");
  console.log("─────────────────────────────────────────");

  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];

  console.log("\n📋 All available Hardhat accounts:");
  for (let i = 0; i < Math.min(5, signers.length); i++) {
    const bal = hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(signers[i].address)
    );
    console.log(`  Account #${i}: ${signers[i].address}  (${bal} ETH)`);
  }

  console.log("\n🚀 Deploying with Account #0:", deployer.address);

  // Deploy
  const CertificateVerification = await hre.ethers.getContractFactory(
    "CertificateVerification"
  );
  const contract = await CertificateVerification.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("\n✅ Contract deployed to:", contractAddress);

  // ── Authorize ALL first 5 Hardhat accounts so any of them can issue certs
  console.log("\n🔐 Authorizing first 5 Hardhat accounts as institutions...");
  for (let i = 1; i < Math.min(5, signers.length); i++) {
    await contract.authorizeInstitution(
      signers[i].address,
      `Hardhat Test Account #${i}`
    );
    console.log(`  ✅ Authorized Account #${i}: ${signers[i].address}`);
  }
  console.log("  (Account #0 is auto-authorized as deployer/owner)");

  // ── Save ABI + address so the React frontend can import it ──────────────
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/CertificateVerification.sol/CertificateVerification.json"
  );

  const frontendDir = path.join(__dirname, "../../frontend/src/utils");
  if (!fs.existsSync(frontendDir)) fs.mkdirSync(frontendDir, { recursive: true });

  // Save contract address + all authorized accounts
  const authorizedAccounts = signers.slice(0, 5).map((s, i) => ({
    index: i,
    address: s.address,
  }));

  const addressConfig = {
    contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    authorizedAccounts,
    _note: "Accounts #0–#4 are all authorized to issue certificates. Import any of them into MetaMask using the private keys printed by 'npx hardhat node'.",
  };
  fs.writeFileSync(
    path.join(frontendDir, "contractAddress.json"),
    JSON.stringify(addressConfig, null, 2)
  );
  console.log("\n📄 Contract address saved to frontend/src/utils/contractAddress.json");

  // Save ABI
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    fs.writeFileSync(
      path.join(frontendDir, "contractABI.json"),
      JSON.stringify(artifact.abi, null, 2)
    );
    console.log("📄 ABI saved to frontend/src/utils/contractABI.json");
  }

  console.log("\n─────────────────────────────────────────");
  console.log("  Deployment complete!");
  console.log("\n  ⚠️  IMPORTANT — MetaMask setup:");
  console.log("  Import ONE of these private keys into MetaMask.");
  console.log("  (They are printed by 'npx hardhat node' above)");
  console.log("\n  Account #0 private key (default deployer):");
  console.log("  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("\n  Account #1 private key:");
  console.log("  0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
  console.log("\n  Account #2 private key:");
  console.log("  0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
  console.log("─────────────────────────────────────────\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
