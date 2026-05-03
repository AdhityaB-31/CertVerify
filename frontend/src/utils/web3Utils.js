// frontend/src/utils/web3Utils.js
import { ethers } from "ethers";
import contractABI from "./contractABI.json";
import contractAddressConfig from "./contractAddress.json";

// ── Constants ───────────────────────────────────────────────────────────────
export const CONTRACT_ADDRESS = contractAddressConfig.contractAddress;
export const CHAIN_ID = "0x539"; // 1337 in hex — Hardhat local network

// ── Get provider & signer via MetaMask ─────────────────────────────────────
export async function getProviderAndSigner() {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask not found. Please install MetaMask to use this application."
    );
  }
  await window.ethereum.request({ method: "eth_requestAccounts" });

  // Switch to Hardhat local network if not already on it
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID }],
    });
  } catch (switchError) {
    // Chain not added yet — add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_ID,
            chainName: "Hardhat Local",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["http://127.0.0.1:8545"],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();
  return { provider, signer };
}

// ── Get contract instance ───────────────────────────────────────────────────
export async function getContract(withSigner = false) {
  if (withSigner) {
    const { signer } = await getProviderAndSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  }
  // Read-only — no MetaMask needed
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
}

// ── Get current wallet address ──────────────────────────────────────────────
export async function getCurrentAccount() {
  if (!window.ethereum) return null;
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return accounts[0] || null;
}

// ── Issue Certificate ───────────────────────────────────────────────────────
export async function issueCertificate(formData) {
  const contract = await getContract(true);
  const tx = await contract.issueCertificate(
    formData.certificateId,
    formData.studentName,
    formData.registrationNumber,
    formData.degree,
    formData.institution,
    formData.ipfsHash
  );
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

// ── Verify Certificate ──────────────────────────────────────────────────────
export async function verifyCertificate(certificateId) {
  const contract = await getContract(false);
  const result   = await contract.verifyCertificate(certificateId);

  // ethers v6 returns a Result object; convert to plain object
  return {
    certificateId:      result[0],
    studentName:        result[1],
    registrationNumber: result[2],
    degree:             result[3],
    institution:        result[4],
    ipfsHash:           result[5],
    issueDate:          Number(result[6]),
    isValid:            result[7],
    issuedBy:           result[8],
    verified:           result[9],
  };
}

// ── Get student certificates ────────────────────────────────────────────────
export async function getStudentCertificates(registrationNumber) {
  const contract = await getContract(false);
  return await contract.getStudentCertificates(registrationNumber);
}

// ── Check institution authorization ────────────────────────────────────────
export async function checkInstitutionAuth(address) {
  const contract = await getContract(false);
  const [isAuth, name] = await contract.isInstitutionAuthorized(address);
  return { isAuthorized: isAuth, name };
}

// ── Revoke Certificate ──────────────────────────────────────────────────────
export async function revokeCertificate(certificateId) {
  const contract = await getContract(true);
  const tx = await contract.revokeCertificate(certificateId);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

// ── Format timestamp to readable date ──────────────────────────────────────
export function formatDate(unixTimestamp) {
  if (!unixTimestamp) return "—";
  return new Date(unixTimestamp * 1000).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// ── Shorten wallet address ──────────────────────────────────────────────────
export function shortenAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
