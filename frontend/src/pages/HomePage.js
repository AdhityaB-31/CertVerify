// frontend/src/pages/HomePage.js
import React from "react";
import { Link } from "react-router-dom";

export default function HomePage({ account }) {
  const features = [
    { icon: "🔗", title: "Blockchain Secured",  desc: "Every certificate is stored on Ethereum — immutable and tamper-proof forever." },
    { icon: "📄", title: "IPFS File Storage",   desc: "Certificate PDFs are stored on IPFS — decentralized, always accessible." },
    { icon: "📱", title: "QR Code Verification",desc: "Scan the QR code on any certificate for instant blockchain verification." },
    { icon: "🤖", title: "Smart Contracts",      desc: "Automated issuance & verification through Solidity smart contracts, no middlemen." },
    { icon: "🔐", title: "Role-Based Access",    desc: "Only authorized institutions can issue certificates. Employers verify freely." },
    { icon: "⚡", title: "Instant Results",      desc: "Certificate verification takes seconds — no emails, no waiting, no friction." },
  ];

  const steps = [
    { num: "01", title: "University Issues",    desc: "Admin logs in with MetaMask, fills in student details, uploads PDF → stored on blockchain + IPFS." },
    { num: "02", title: "QR Code Generated",    desc: "A QR code linking to the blockchain record is embedded in the certificate PDF." },
    { num: "03", title: "Employer Verifies",    desc: "Scan the QR code or enter the Certificate ID on the Verify page — instant result." },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        {/* <div className="badge badge-success" style={{ marginBottom: "1rem" }}>
          ✅ Phase II — Live on Hardhat Local Network
        </div> */}
        <h1 className="hero-title">
          Blockchain-Based Certificate<br />Verification System
        </h1>
        <p className="hero-sub">
          Eliminate fake academic credentials. Issue and verify university certificates
          on Ethereum using smart contracts, IPFS storage, and QR code authentication.
        </p>
        <div className="hero-actions">
          <Link to="/issue"  className="btn btn-accent">🎓 Issue Certificate</Link>
          <Link to="/verify" className="btn btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,.6)" }}>
            🔍 Verify Certificate
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        {[
          { icon: "🏛️", val: "12",       label: "Institution Connected" },
          { icon: "📜", val: "100%",    label: "Tamper-Proof Storage" },
          { icon: "⚡", val: "<2s",     label: "Avg Verification Time" },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">⚙️ How It Works</h2>
        <div className="grid-3">
          {steps.map((s) => (
            <div key={s.num} style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "var(--primary)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", fontWeight: 800, margin: "0 auto 1rem"
              }}>{s.num}</div>
              <h3 style={{ color: "var(--primary)", marginBottom: ".4rem" }}>{s.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: ".9rem", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">🚀 Key Features</h2>
        <div className="grid-3">
          {features.map((f) => (
            <div key={f.title} style={{
              padding: "1.25rem", borderRadius: 10,
              border: "1.5px solid var(--border)", background: "#f8fafc"
            }}>
              <div style={{ fontSize: "1.8rem", marginBottom: ".5rem" }}>{f.icon}</div>
              <h3 style={{ color: "var(--primary)", marginBottom: ".4rem", fontSize: "1rem" }}>{f.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: ".88rem", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet status */}
      {!account && (
        <div className="alert alert-warn">
          ⚠️ &nbsp; Connect MetaMask wallet to issue certificates. Verification works without a wallet.
        </div>
      )}

      {/* Tech stack */}
      <div className="card">
        <h2 className="card-title">🛠️ Technology Stack</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {["Ethereum Blockchain","Solidity Smart Contracts","Hardhat","ReactJS","ethers.js v6","IPFS / Pinata","QR Code","jsPDF"].map((t) => (
            <span className="badge badge-info" key={t} style={{ fontSize: ".82rem" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
