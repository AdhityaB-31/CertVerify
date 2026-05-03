// src/pages/IssuePage.js
import React, { useState, useRef, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";

import { issueCertificate, formatDate, checkInstitutionAuth, getContract } from "../utils/web3Utils";
import {
  generateCertificateId, uploadFileToIPFS,
  pinataKeysConfigured, savePinataKeys, clearPinataKeys,
  getPinataKeys, testPinataKeys, getIPFSUrl,
} from "../utils/ipfsUtils";
import { generateCertificatePDF, downloadPDF } from "../utils/pdfUtils";
import { COLLEGES, DEGREE_TYPES, COURSES_BY_DEGREE } from "../data/masterData";

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_DEGREE = DEGREE_TYPES[0].value;

// ─────────────────────────────────────────────────────────────────────────────
// PINATA SETUP PANEL
// ─────────────────────────────────────────────────────────────────────────────
function PinataSetupPanel({ onKeysChanged }) {
  const existing = getPinataKeys();
  const [apiKey,    setApiKey]    = useState(
    existing.apiKey !== "your_pinata_api_key_here" ? existing.apiKey : ""
  );
  const [secretKey, setSecretKey] = useState(
    existing.secretKey !== "your_pinata_secret_key_here" ? existing.secretKey : ""
  );
  const [testing, setTesting] = useState(false);
  const [status,  setStatus]  = useState(pinataKeysConfigured() ? "saved" : "idle");

  async function handleTest() {
    if (!apiKey.trim() || !secretKey.trim()) {
      toast.error("Enter both API Key and Secret Key."); return;
    }
    setTesting(true); setStatus("testing");
    const res = await testPinataKeys(apiKey.trim(), secretKey.trim());
    setTesting(false);
    if (res.ok) {
      savePinataKeys(apiKey.trim(), secretKey.trim());
      setStatus("ok"); onKeysChanged();
      toast.success("✅ Pinata keys verified and saved!");
    } else {
      setStatus("error");
      toast.error("❌ Keys invalid: " + res.error);
    }
  }

  function handleClear() {
    clearPinataKeys(); setApiKey(""); setSecretKey(""); setStatus("idle");
    onKeysChanged(); toast("Pinata keys cleared.");
  }

  const isOk = status === "ok" || status === "saved";
  const colors = {
    idle:    { bg: "var(--alert-warn-bg)", br: "var(--alert-warn-br)" },
    saved:   { bg: "var(--verified-bg)",  br: "var(--verified-br)"  },
    testing: { bg: "var(--alert-info-bg)",br: "var(--alert-info-br)"},
    ok:      { bg: "var(--verified-bg)",  br: "var(--verified-br)"  },
    error:   { bg: "var(--invalid-bg)",   br: "var(--invalid-br)"   },
  };
  const c = colors[status] || colors.idle;

  return (
    <div style={{ background: c.bg, border: `1.5px solid ${c.br}`, borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".75rem" }}>
        <span>{isOk ? "✅" : status === "error" ? "❌" : "🔑"}</span>
        <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--text)" }}>
          Pinata IPFS Setup &nbsp;
          <span className={`badge ${isOk ? "badge-success" : "badge-warn"}`}>
            {isOk ? "Connected" : "Not configured"}
          </span>
        </h3>
      </div>

      {!isOk && (
        <div className="alert alert-info" style={{ marginBottom: "1rem", fontSize: ".85rem" }}>
          📋 Get free keys at{" "}
          <a href="https://app.pinata.cloud" target="_blank" rel="noreferrer"
            style={{ color: "var(--primary)", fontWeight: 600 }}>
            app.pinata.cloud
          </a>
          {" "}→ API Keys → New Key → enable <strong>pinFileToIPFS</strong>
        </div>
      )}

      <div className="grid-2" style={{ gap: ".75rem", marginBottom: ".75rem" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">API Key</label>
          <input className="form-input" type="text" placeholder="Pinata API Key"
            value={apiKey} onChange={e => setApiKey(e.target.value)} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Secret API Key</label>
          <input className="form-input" type="password" placeholder="Pinata Secret Key"
            value={secretKey} onChange={e => setSecretKey(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={handleTest}
          disabled={testing || !apiKey.trim() || !secretKey.trim()}
          style={{ fontSize: ".88rem" }}>
          {testing ? "🔄 Testing..." : "✅ Test & Save Keys"}
        </button>
        {isOk && (
          <button className="btn btn-outline" onClick={handleClear} style={{ fontSize: ".88rem" }}>
            🗑️ Clear Keys
          </button>
        )}
      </div>

      <p style={{ fontSize: ".8rem", color: isOk ? "var(--success)" : "var(--accent)", marginTop: ".6rem" }}>
        {isOk
          ? "✅ Connected. Certificate PDFs will be uploaded to IPFS automatically."
          : "⚠️ Without Pinata keys the certificate cannot be uploaded to IPFS."}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ISSUE PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function IssuePage({ account }) {
  const firstDegree  = DEFAULT_DEGREE;
  const firstCourses = COURSES_BY_DEGREE[firstDegree] || [];

  const [form, setForm] = useState({
    studentName:        "",
    registrationNumber: "",
    college:            COLLEGES[0],
    degreeType:         firstDegree,           // e.g. "Bachelor of Technology"
    course:             firstCourses[0] || "",  // e.g. "Information Technology"
    graduationYear:     String(CURRENT_YEAR),
  });

  // Available courses update when degree changes
  const availableCourses = COURSES_BY_DEGREE[form.degreeType] || [];

  // Full degree string for certificate: "Bachelor of Technology in Information Technology"
  const fullDegree = form.course
    ? `${form.degreeType} in ${form.course}`
    : form.degreeType;

  const [step,       setStep]       = useState("form");
  const [stepMsg,    setStepMsg]    = useState("");
  const [result,     setResult]     = useState(null);
  const [qrValue,    setQrValue]    = useState("");
  const [authStatus, setAuthStatus] = useState(null);
  const [keysReady,  setKeysReady]  = useState(pinataKeysConfigured());
  const qrRef = useRef(null);

  const checkAuth = useCallback(async () => {
    if (!account) return;
    setAuthStatus("checking");
    try {
      const { isAuthorized } = await checkInstitutionAuth(account);
      setAuthStatus(isAuthorized ? "authorized" : "unauthorized");
    } catch { setAuthStatus("unauthorized"); }
  }, [account]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "degreeType") {
      // When degree changes, reset course to first available
      const courses = COURSES_BY_DEGREE[value] || [];
      setForm(prev => ({ ...prev, degreeType: value, course: courses[0] || "" }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }

  async function handleSelfAuthorize() {
    try {
      toast.loading("Authorizing...", { id: "auth" });
      const contract = await getContract(true);
      const tx = await contract.authorizeInstitution(account, form.college);
      await tx.wait();
      toast.success("Authorized! ✅", { id: "auth" });
      setAuthStatus("authorized");
    } catch {
      toast.dismiss("auth");
      toast.error("Only Account #0 can authorize. Switch to Account #0.", { duration: 7000 });
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!account)                    { toast.error("Connect MetaMask first."); return; }
    if (authStatus !== "authorized") { toast.error("Wallet not authorized to issue."); return; }
    if (!form.studentName.trim() || !form.registrationNumber.trim()) {
      toast.error("Please fill all required fields."); return;
    }
    if (!keysReady) {
      toast.error("Configure Pinata IPFS keys first.", { duration: 6000 }); return;
    }

    try {
      const certId    = generateCertificateId("PU", form.graduationYear, form.registrationNumber);
      const verifyUrl = `${window.location.origin}/verify/${certId}`;

      // ── Step 1: Generate PDF ─────────────────────────────────────────────
      setStep("generating"); setStepMsg("Generating certificate PDF...");
      const tempCertData = {
        certificateId:      certId,
        studentName:        form.studentName,
        registrationNumber: form.registrationNumber,
        degree:             fullDegree,
        institution:        form.college,
        issueDate:          Math.floor(Date.now() / 1000),
      };
      const qrDataUrl = await generateQRDataUrl(verifyUrl);
      const pdfBlob   = generateCertificatePDF(tempCertData, qrDataUrl);

      // ── Step 2: Upload to IPFS ────────────────────────────────────────────
      setStep("uploading"); setStepMsg("Uploading certificate to IPFS via Pinata...");
      toast.loading("Uploading to IPFS...", { id: "ipfs" });
      let ipfsResult;
      try {
        ipfsResult = await uploadFileToIPFS(pdfBlob, `${certId}_Certificate.pdf`);
        toast.success("IPFS upload complete! ✅", { id: "ipfs" });
      } catch (ipfsErr) {
        toast.dismiss("ipfs");
        toast.error("IPFS upload failed: " + ipfsErr.message, { duration: 8000 });
        setStep("form"); return;
      }

      // ── Step 3: Blockchain transaction ────────────────────────────────────
      setStep("issuing"); setStepMsg("Confirm the transaction in MetaMask...");
      toast.loading("Recording on blockchain...", { id: "tx" });
      const txResult = await issueCertificate({
        certificateId:      certId,
        studentName:        form.studentName,
        registrationNumber: form.registrationNumber,
        degree:             fullDegree,
        institution:        form.college,
        ipfsHash:           ipfsResult.cid,
      });
      toast.success("Certificate issued on blockchain! ✅", { id: "tx" });

      const finalData = { ...tempCertData, ipfsHash: ipfsResult.cid,
        ipfsUrl: ipfsResult.url, txHash: txResult.txHash, blockNumber: txResult.blockNumber };

      window._lastCertPdfBlob   = pdfBlob;
      window._lastCertQrDataUrl = qrDataUrl;
      setQrValue(verifyUrl);
      setResult(finalData);
      setStep("done");

    } catch (err) {
      console.error(err);
      if (err.message?.includes("not an authorized") || err.reason?.includes("not an authorized")) {
        toast.error("Not authorized. Switch MetaMask to Account #0.", { duration: 8000 });
        setAuthStatus("unauthorized");
      } else {
        toast.error(err.reason || err.message || "Transaction failed.");
      }
      setStep("form");
    }
  }

  async function handleDownloadPDF() {
    if (!window._lastCertPdfBlob) { toast.error("PDF not available. Re-issue."); return; }
    downloadPDF(window._lastCertPdfBlob, `${result.certificateId}.pdf`);
    toast.success("PDF downloaded!");
  }

  function handleReset() {
    const courses = COURSES_BY_DEGREE[firstDegree] || [];
    setForm({ studentName: "", registrationNumber: "", college: COLLEGES[0],
      degreeType: firstDegree, course: courses[0] || "", graduationYear: String(CURRENT_YEAR) });
    setResult(null); setQrValue(""); setStep("form");
    window._lastCertPdfBlob = null;
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (["generating","uploading","issuing"].includes(step)) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <div className="spinner" />
        <h2 style={{ color: "var(--primary)", marginBottom: ".5rem" }}>
          {step === "generating" && "📄 Generating Certificate PDF..."}
          {step === "uploading"  && "⬆️ Uploading to IPFS..."}
          {step === "issuing"    && "⛓️ Recording on Blockchain..."}
        </h2>
        <p style={{ color: "var(--text-muted)" }}>{stepMsg}</p>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (step === "done" && result) {
    return (
      <div>
        <h1 className="page-title">✅ Certificate Issued!</h1>
        <p className="page-subtitle">PDF stored on IPFS and recorded on Ethereum blockchain.</p>
        <div className="grid-2">
          <div className="card">
            <h2 className="card-title">📋 Certificate Details</h2>
            {[
              ["Certificate ID",   result.certificateId],
              ["Student Name",     result.studentName],
              ["Registration No.", result.registrationNumber],
              ["Degree",           result.degree],
              ["Institution",      result.institution],
              ["Issue Date",       formatDate(result.issueDate)],
              ["IPFS CID",         result.ipfsHash],
              ["Tx Hash",          result.txHash ? `${result.txHash.slice(0,20)}...` : "—"],
              ["Block #",          result.blockNumber],
            ].map(([label, value]) => (
              <div className="detail-row" key={label}>
                <span className="detail-label">{label}</span>
                <span className="detail-value" style={{ wordBreak:"break-all", maxWidth:"60%", textAlign:"right" }}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: ".6rem" }}>
              {getIPFSUrl(result.ipfsHash) && (
                <a href={getIPFSUrl(result.ipfsHash)} target="_blank" rel="noreferrer"
                  className="btn btn-success" style={{ justifyContent: "center" }}>
                  🌐 View on IPFS
                </a>
              )}
              <button className="btn btn-primary" onClick={handleDownloadPDF}>📥 Download PDF</button>
              <button className="btn btn-outline" onClick={handleReset}>➕ Issue Another</button>
            </div>
          </div>

          <div className="card" style={{ textAlign: "center" }}>
            <h2 className="card-title" style={{ justifyContent: "center" }}>📱 QR Code</h2>
            <p style={{ color: "var(--text-muted)", fontSize: ".88rem", marginBottom: "1rem" }}>
              Embedded in PDF. Scan to verify on blockchain.
            </p>
            <div ref={qrRef} style={{ display:"inline-block", padding:"1rem", background:"#fff", borderRadius:12, border:"2px solid var(--border)" }}>
              {qrValue && <QRCodeCanvas value={qrValue} size={190} level="H" includeMargin />}
            </div>
            <p style={{ marginTop:".75rem", fontSize:".75rem", color:"var(--text-muted)", wordBreak:"break-all", padding:"0 1rem" }}>
              {qrValue}
            </p>
            <div style={{ marginTop:"1rem", display:"flex", gap:".5rem", justifyContent:"center", flexWrap:"wrap" }}>
              <span className="badge badge-success">🔗 Blockchain Verified</span>
              <span className="badge badge-info">🌐 IPFS Stored</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="page-title">🎓 Issue Certificate</h1>
      <p className="page-subtitle">
        Auto-generates the certificate PDF, uploads to IPFS, and records on Ethereum.
      </p>

      {/* Pinata setup */}
      <PinataSetupPanel onKeysChanged={() => setKeysReady(pinataKeysConfigured())} />

      {/* Wallet status */}
      {!account && (
        <div className="alert alert-warn">⚠️ Connect MetaMask to issue certificates.</div>
      )}
      {account && authStatus === "checking" && (
        <div className="alert alert-info">🔄 Checking wallet authorization...</div>
      )}
      {account && authStatus === "authorized" && (
        <div className="alert alert-info" style={{ background:"var(--verified-bg)", borderColor:"var(--verified-br)", color:"var(--success)" }}>
          ✅ Wallet authorized — ready to issue.
        </div>
      )}
      {account && authStatus === "unauthorized" && (
        <div style={{ background:"var(--invalid-bg)", border:"2px solid var(--invalid-br)", borderRadius:12, padding:"1.25rem", marginBottom:"1.5rem" }}>
          <h3 style={{ color:"var(--danger)", marginBottom:".5rem" }}>❌ Wallet Not Authorized</h3>
          <p style={{ fontSize:".9rem", color:"var(--text)", marginBottom:"1rem" }}>
            <code style={{ background:"var(--card-2)", padding:"2px 6px", borderRadius:4 }}>{account?.slice(0,14)}...</code> is not a registered institution.
          </p>
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:".85rem", marginBottom:".75rem" }}>
            <strong>Switch to Account #0:</strong>
            <code style={{ display:"block", marginTop:".4rem", fontSize:".78rem", wordBreak:"break-all", color:"var(--text-muted)" }}>
              0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
            </code>
          </div>
          <div style={{ display:"flex", gap:".6rem", flexWrap:"wrap" }}>
            <button className="btn btn-danger" onClick={handleSelfAuthorize} style={{ fontSize:".85rem" }}>
              🔐 Authorize This Account
            </button>
            <button className="btn btn-outline" onClick={checkAuth} style={{ fontSize:".85rem" }}>
              🔄 Re-check
            </button>
          </div>
        </div>
      )}

      {/* ── FORM ── */}
      <div className="card">
        <form onSubmit={handleSubmit}>

          {/* Row 1: Student name + Reg No */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Student Full Name *</label>
              <input name="studentName" value={form.studentName} onChange={handleChange}
                className="form-input" placeholder="e.g. Adhitya B" required />
            </div>
            <div className="form-group">
              <label className="form-label">Registration Number *</label>
              <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange}
                className="form-input" placeholder="e.g. 22TH0204" required />
            </div>
          </div>

          {/* Row 2: College */}
          <div className="form-group">
            <label className="form-label">College / Institution *</label>
            <select name="college" value={form.college} onChange={handleChange} className="form-select">
              {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* <small style={{ color:"var(--text-muted)", fontSize:".78rem", marginTop:".3rem", display:"block" }}>
              All colleges are affiliated to Pondicherry University.
              To add a new college, edit <code>src/data/masterData.js → COLLEGES</code>
            </small> */}
          </div>

          {/* Row 3: Degree type + Course (separate) */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Degree *</label>
              <select name="degreeType" value={form.degreeType} onChange={handleChange} className="form-select">
                {DEGREE_TYPES.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              {/* <small style={{ color:"var(--text-muted)", fontSize:".78rem", marginTop:".3rem", display:"block" }}>
                Add more in <code>masterData.js → DEGREE_TYPES</code>
              </small> */}
            </div>
            <div className="form-group">
              <label className="form-label">Course / Specialisation *</label>
              <select name="course" value={form.course} onChange={handleChange} className="form-select">
                {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {/* <small style={{ color:"var(--text-muted)", fontSize:".78rem", marginTop:".3rem", display:"block" }}>
                Add more in <code>masterData.js → COURSES_BY_DEGREE</code>
              </small> */}
            </div>
          </div>

          {/* Row 4: Year */}
          <div className="form-group" style={{ maxWidth: 200 }}>
            <label className="form-label">Graduation Year *</label>
            <input name="graduationYear" value={form.graduationYear} onChange={handleChange}
              className="form-input" type="number" min="2000" max="2030" />
          </div>

          {/* Preview box */}
          <div style={{ background:"var(--primary-dim)", border:"1px solid var(--primary)", borderRadius:10, padding:"1rem", marginTop:".25rem" }}>
            <p style={{ margin:0, fontSize:".88rem", color:"var(--primary)" }}>
              <strong>📄 Certificate Preview:</strong><br />
              <span style={{ color:"var(--text)" }}>
                <strong>{form.studentName || "Student Name"}</strong> will receive a certificate for<br />
                <strong>{fullDegree}</strong><br />
                from <strong>{form.college}</strong><br />
                Certificate ID: <strong>PU-{form.graduationYear}-{form.registrationNumber || "REGNO"}</strong>
              </span>
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop:"1.25rem", padding:".85rem" }}
            disabled={!account || authStatus !== "authorized" || !keysReady}
          >
            {!keysReady
              ? "⚠️ Configure Pinata Keys First"
              : "⛓️ Generate PDF → Upload IPFS → Issue on Blockchain"}
          </button>

          {!keysReady && (
            <p style={{ textAlign:"center", fontSize:".82rem", color:"var(--accent)", marginTop:".5rem" }}>
              ↑ Set up Pinata keys in the panel above
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// QR dataURL generator (no React needed)
function generateQRDataUrl(value) {
  return new Promise(resolve => {
    import("qrcode").then(({ default: QRCode }) => {
      const canvas = document.createElement("canvas");
      QRCode.toCanvas(canvas, value, { width: 200, margin: 1, errorCorrectionLevel: "H" }, err => {
        resolve(err ? null : canvas.toDataURL("image/png"));
      });
    }).catch(() => resolve(null));
  });
}
