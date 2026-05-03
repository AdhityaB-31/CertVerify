// frontend/src/utils/ipfsUtils.js
/**
 * IPFS Utilities using Pinata API
 * Keys are read from localStorage so the user can set them inside the app
 * without editing any files. They fall back to .env if set there.
 */

const PINATA_BASE_URL = "https://api.pinata.cloud";
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

// ── Read keys: localStorage first, then .env ──────────────────────────────
export function getPinataKeys() {
  const apiKey    = localStorage.getItem("PINATA_API_KEY")    || process.env.REACT_APP_PINATA_API_KEY    || "";
  const secretKey = localStorage.getItem("PINATA_SECRET_KEY") || process.env.REACT_APP_PINATA_SECRET_KEY || "";
  return { apiKey, secretKey };
}

export function savePinataKeys(apiKey, secretKey) {
  localStorage.setItem("PINATA_API_KEY",    apiKey.trim());
  localStorage.setItem("PINATA_SECRET_KEY", secretKey.trim());
}

export function clearPinataKeys() {
  localStorage.removeItem("PINATA_API_KEY");
  localStorage.removeItem("PINATA_SECRET_KEY");
}

export function pinataKeysConfigured() {
  const { apiKey, secretKey } = getPinataKeys();
  return (
    apiKey.length > 0 &&
    secretKey.length > 0 &&
    apiKey    !== "your_pinata_api_key_here" &&
    secretKey !== "your_pinata_secret_key_here"
  );
}

// ── Test keys by hitting Pinata's /data/testAuthentication endpoint ────────
export async function testPinataKeys(apiKey, secretKey) {
  try {
    const res = await fetch(`${PINATA_BASE_URL}/data/testAuthentication`, {
      method: "GET",
      headers: {
        pinata_api_key:        apiKey,
        pinata_secret_api_key: secretKey,
      },
    });
    if (res.ok) return { ok: true };
    const body = await res.json();
    return { ok: false, error: body.error || `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Upload any File/Blob to IPFS via Pinata ────────────────────────────────
export async function uploadFileToIPFS(file, fileName = null) {
  const { apiKey, secretKey } = getPinataKeys();

  if (!pinataKeysConfigured()) {
    throw new Error(
      "PINATA_KEYS_MISSING: Pinata API keys are not configured. " +
      "Please set them using the IPFS Setup panel on the Issue Certificate page."
    );
  }

  const formData = new FormData();
  // If file is a Blob (e.g. generated PDF), wrap it with a filename
  const uploadFile = fileName ? new File([file], fileName, { type: file.type || "application/pdf" }) : file;
  formData.append("file", uploadFile);

  const metadata = JSON.stringify({
    name: fileName || uploadFile.name || `Certificate_${Date.now()}.pdf`,
  });
  formData.append("pinataMetadata", metadata);
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

  const response = await fetch(`${PINATA_BASE_URL}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: {
      pinata_api_key:        apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: formData,
  });

  if (!response.ok) {
    let errMsg = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const body = await response.json();
      errMsg = body.error?.details || body.error || errMsg;
    } catch (_) {}
    throw new Error(`IPFS upload failed — ${errMsg}`);
  }

  const data = await response.json();
  return {
    cid:    data.IpfsHash,
    url:    `${IPFS_GATEWAY}${data.IpfsHash}`,
    isMock: false,
  };
}

// ── Upload JSON metadata to IPFS ───────────────────────────────────────────
export async function uploadJSONToIPFS(jsonData, name = "CertMetadata") {
  const { apiKey, secretKey } = getPinataKeys();

  if (!pinataKeysConfigured()) {
    throw new Error("Pinata keys not configured.");
  }

  const response = await fetch(`${PINATA_BASE_URL}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      "Content-Type":        "application/json",
      pinata_api_key:        apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: JSON.stringify({
      pinataContent:  jsonData,
      pinataMetadata: { name: `${name}_${Date.now()}` },
    }),
  });

  if (!response.ok) throw new Error("JSON upload to IPFS failed");
  const data = await response.json();
  return { cid: data.IpfsHash, url: `${IPFS_GATEWAY}${data.IpfsHash}`, isMock: false };
}

// ── Get full gateway URL from CID ──────────────────────────────────────────
export function getIPFSUrl(cid) {
  if (!cid || cid.startsWith("QmDemo") || cid.startsWith("QmMock") || cid === "QmDemoHashNoFileUploaded") return null;
  return `${IPFS_GATEWAY}${cid}`;
}

// ── Generate certificate ID ────────────────────────────────────────────────
export function generateCertificateId(institutionCode, year, regNo) {
  const suffix = regNo.replace(/\s+/g, "").toUpperCase();
  return `${institutionCode.toUpperCase()}-${year}-${suffix}`;
}
