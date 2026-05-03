// frontend/src/pages/VerifyPage.js
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";

import { verifyCertificate, formatDate, shortenAddress } from "../utils/web3Utils";
import { getIPFSUrl } from "../utils/ipfsUtils";

export default function VerifyPage() {
  const { id: urlId } = useParams();

  const [certId,   setCertId]   = useState(urlId || "");
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [scanning, setScanning] = useState(false);

  const scannerRef  = useRef(null);
  const html5QrRef  = useRef(null);

  // Auto-verify if ID comes from URL (QR code scan from PDF)
  useEffect(() => {
    if (urlId) handleVerify(urlId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId]);

  // ── Blockchain verify ─────────────────────────────────────────────────────
  async function handleVerify(id) {
    const targetId = (id || certId).trim();
    if (!targetId) { toast.error("Enter a certificate ID."); return; }

    setLoading(true); setResult(null);
    try {
      const data = await verifyCertificate(targetId);
      setResult(data);
      if (data.verified) toast.success("✅ Certificate verified on blockchain!");
      else if (data.certificateId) toast.error("⚠️ Certificate found but has been revoked.");
      else toast.error("❌ Certificate not found on blockchain.");
    } catch (err) {
      console.error(err);
      toast.error("Verification failed. Is the blockchain node running?");
    } finally {
      setLoading(false);
    }
  }

  // ── QR Scanner ────────────────────────────────────────────────────────────
  async function startScanner() {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 200)); // wait for DOM
    try {
      html5QrRef.current = new Html5Qrcode("qr-reader");
      await html5QrRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScanner();
          // QR might encode a full URL like http://localhost:3000/verify/MVIT-2024-XXX
          let extractedId = decodedText;
          if (decodedText.includes("/verify/")) {
            extractedId = decodedText.split("/verify/").pop();
          }
          setCertId(extractedId);
          handleVerify(extractedId);
        },
        () => {}
      );
    } catch (err) {
      toast.error("Could not start camera: " + err.message);
      setScanning(false);
    }
  }

  async function stopScanner() {
    if (html5QrRef.current) {
      await html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScanning(false);
  }

  // ── Result card ───────────────────────────────────────────────────────────
  function renderResult() {
    if (!result) return null;

    const notFound = !result.certificateId;

    if (notFound) {
      return (
        <div className="status-invalid" style={{ flexDirection: "column", alignItems: "flex-start", gap: ".5rem", marginTop: "1.5rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span className="status-icon">❌</span>
            <div>
              <h3 style={{ color: "#b91c1c" }}>Certificate Not Found</h3>
              <p style={{ color: "#7f1d1d", fontSize: ".9rem" }}>
                No certificate with ID <strong>{certId}</strong> exists on the blockchain.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const isRevoked = !result.isValid;

    return (
      <div style={{ marginTop: "1.5rem" }}>
        {/* Status banner */}
        {isRevoked ? (
          <div className="status-invalid" style={{ marginBottom: "1.25rem" }}>
            <span className="status-icon">⚠️</span>
            <div>
              <h3 style={{ color: "#b91c1c" }}>Certificate Revoked</h3>
              <p style={{ fontSize: ".9rem", color: "#7f1d1d" }}>This certificate has been revoked by the issuing institution.</p>
            </div>
          </div>
        ) : (
          <div className="status-verified" style={{ marginBottom: "1.25rem" }}>
            <span className="status-icon">✅</span>
            <div>
              <h3 style={{ color: "#15803d" }}>Certificate Verified</h3>
              <p style={{ fontSize: ".9rem", color: "#166534" }}>
                This certificate is authentic and stored on the Ethereum blockchain.
              </p>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="card">
          <h2 className="card-title">📋 Certificate Details</h2>
          {[
            ["Certificate ID",    result.certificateId],
            ["Student Name",      result.studentName],
            ["Registration No.",  result.registrationNumber],
            ["Degree",            result.degree],
            ["Institution",       result.institution],
            ["Issue Date",        formatDate(result.issueDate)],
            ["Status",            result.isValid ? "✅ Valid" : "❌ Revoked"],
            ["Issued By",         shortenAddress(result.issuedBy)],
            ["IPFS Hash",         result.ipfsHash],
          ].map(([label, value]) => (
            <div className="detail-row" key={label}>
              <span className="detail-label">{label}</span>
              <span className="detail-value" style={{ wordBreak: "break-all", maxWidth: "62%", textAlign: "right" }}>
                {value}
              </span>
            </div>
          ))}

          {/* View on IPFS */}
          {getIPFSUrl(result.ipfsHash) && (
            <a
              href={getIPFSUrl(result.ipfsHash)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ marginTop: "1.25rem", display: "inline-flex" }}
            >
              🌐 View Certificate on IPFS
            </a>
          )}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="page-title">🔍 Verify Certificate</h1>
      <p className="page-subtitle">
        Enter a Certificate ID or scan the QR code on a certificate to verify its authenticity.
      </p>

      <div className="card">
        {/* Manual entry */}
        <div style={{ display: "flex", gap: ".75rem", marginBottom: "1.25rem" }}>
          <input
            className="form-input"
            placeholder="Enter Certificate ID — e.g. MVIT-2024-22TH0204"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleVerify()}
            disabled={loading}
          >
            {loading ? "Checking..." : "🔍 Verify"}
          </button>
        </div>

        {/* QR Scanner */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
          <p style={{ color: "var(--text-muted)", fontSize: ".88rem", marginBottom: ".75rem" }}>
            Or scan the QR code from a certificate:
          </p>
          {!scanning ? (
            <button className="btn btn-outline" onClick={startScanner}>
              📷 Start QR Code Scanner
            </button>
          ) : (
            <div>
              <div id="qr-reader" ref={scannerRef} style={{ width: "100%", maxWidth: 360 }} />
              <button className="btn btn-danger" style={{ marginTop: ".75rem" }} onClick={stopScanner}>
                ✖ Stop Scanner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <div className="spinner" />
          <p style={{ color: "var(--text-muted)" }}>Querying blockchain...</p>
        </div>
      )}

      {/* Result */}
      {!loading && renderResult()}
    </div>
  );
}
