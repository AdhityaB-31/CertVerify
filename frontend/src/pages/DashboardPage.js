// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  getContract, formatDate, shortenAddress,
  checkInstitutionAuth, revokeCertificate,
} from "../utils/web3Utils";

export default function DashboardPage({ account }) {
  const [stats,        setStats]        = useState({ total: 0, authorized: false, instName: "" });
  const [events,       setEvents]       = useState([]);
  const [loadingEvts,  setLoadingEvts]  = useState(false);
  const [searchReg,    setSearchReg]    = useState("");
  const [certDetails,  setCertDetails]  = useState([]);
  const [revokeId,     setRevokeId]     = useState("");

  useEffect(() => {
    loadStats();
    loadEvents();
    if (account) checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  async function loadStats() {
    try {
      const contract = await getContract(false);
      const total = await contract.totalCertificates();
      setStats((prev) => ({ ...prev, total: Number(total) }));
    } catch { /* node may not be running */ }
  }

  async function checkAuth() {
    try {
      const { isAuthorized, name } = await checkInstitutionAuth(account);
      setStats((prev) => ({ ...prev, authorized: isAuthorized, instName: name }));
    } catch {}
  }

  async function loadEvents() {
    setLoadingEvts(true);
    try {
      const contract = await getContract(false);

      // ── ethers v6 fix ────────────────────────────────────────────────────
      // CertificateIssued(string indexed certificateId, string studentName,
      //                   string registrationNumber, string degree, uint256 issueDate)
      //
      // Indexed strings are keccak256-hashed in the topic — you cannot decode
      // them back to the original string from the topic alone.
      // So instead we use the non-indexed args (studentName, registrationNumber,
      // degree, issueDate) which ARE recoverable, and we also fetch the certId
      // from a separate verifyCertificate call keyed by registrationNumber.
      //
      // Simplest approach: query ALL logs with no filter then decode manually.
      // ────────────────────────────────────────────────────────────────────

      const filter = contract.filters.CertificateIssued();
      const logs   = await contract.queryFilter(filter, 0, "latest");

      const parsed = logs.map((log) => {
        // log.args is a Result object in ethers v6.
        // Non-indexed fields come through as normal values.
        // Indexed string fields come through as their keccak256 hash (not useful).
        // Our event:
        //   args[0] = certificateId  (indexed → hash object, NOT usable as string)
        //   args[1] = studentName    (not indexed → plain string ✅)
        //   args[2] = registrationNumber (not indexed → plain string ✅)
        //   args[3] = degree         (not indexed → plain string ✅)
        //   args[4] = issueDate      (not indexed → BigInt ✅)

        const studentName        = String(log.args[1] ?? "");
        const registrationNumber = String(log.args[2] ?? "");
        const degree             = String(log.args[3] ?? "");
        const issueDate          = Number(log.args[4] ?? 0);

        // Reconstruct the certificate ID using the same formula as IssuePage
        // generateCertificateId("PU", year, regNo)
        const year   = issueDate
          ? new Date(issueDate * 1000).getFullYear()
          : new Date().getFullYear();
        const suffix = registrationNumber.replace(/\s+/g, "").toUpperCase();
        const certId = `PU-${year}-${suffix}`;

        return {
          certId,
          student:  studentName,
          regNo:    registrationNumber,
          degree,
          date:     issueDate,
          txHash:   log.transactionHash,
          block:    log.blockNumber,
        };
      });

      setEvents(parsed.reverse()); // newest first
    } catch (err) {
      console.error("Could not load events:", err.message);
      toast.error("Could not load event log. Is the blockchain node running?");
    } finally {
      setLoadingEvts(false);
    }
  }

  // ── Search student certs by registration number ───────────────────────────
  async function handleStudentSearch() {
    if (!searchReg.trim()) return;
    try {
      const contract = await getContract(false);
      const ids = await contract.getStudentCertificates(searchReg.trim());

      if (ids.length === 0) {
        toast("No certificates found for this registration number.");
        setCertDetails([]);
        return;
      }

      const details = await Promise.all(
        ids.map(async (id) => {
          const r = await contract.verifyCertificate(id);
          return {
            certificateId:      String(r[0]),
            studentName:        String(r[1]),
            registrationNumber: String(r[2]),
            degree:             String(r[3]),
            institution:        String(r[4]),
            ipfsHash:           String(r[5]),
            issueDate:          Number(r[6]),
            isValid:            Boolean(r[7]),
            issuedBy:           String(r[8]),
          };
        })
      );
      setCertDetails(details);
    } catch (err) {
      toast.error("Search failed: " + err.message);
    }
  }

  // ── Revoke ────────────────────────────────────────────────────────────────
  async function handleRevoke() {
    if (!revokeId.trim()) return;
    if (!window.confirm(`Revoke certificate "${revokeId}"? This cannot be undone.`)) return;
    try {
      toast.loading("Revoking...", { id: "revoke" });
      await revokeCertificate(revokeId.trim());
      toast.success("Certificate revoked on blockchain.", { id: "revoke" });
      setRevokeId("");
      loadEvents();
      loadStats();
    } catch (err) {
      toast.error(err.reason || err.message, { id: "revoke" });
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="page-title">📊 Dashboard</h1>
      <p className="page-subtitle">
        View all issued certificates, search by student, and manage revocations.
      </p>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-icon">📜</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Certificates Issued</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏛️</div>
          <div className="stat-value">{stats.authorized ? "✅" : "—"}</div>
          <div className="stat-label">
            {account
              ? stats.authorized
                ? `Authorized: ${stats.instName || "Institution"}`
                : "Not Authorized to Issue"
              : "Connect Wallet"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Events in Log</div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start", gap: "1.5rem", marginBottom: "2rem" }}>

        {/* Student search */}
        <div className="card">
          <h2 className="card-title">🔎 Search by Student</h2>
          <div style={{ display: "flex", gap: ".5rem", marginBottom: "1rem" }}>
            <input
              className="form-input"
              placeholder="Registration Number e.g. 22TH0204"
              value={searchReg}
              onChange={(e) => setSearchReg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStudentSearch()}
            />
            <button className="btn btn-primary" onClick={handleStudentSearch}>
              Search
            </button>
          </div>

          {certDetails.length === 0 && searchReg && (
            <p style={{ color: "var(--text-muted)", fontSize: ".9rem" }}>
              No results yet — press Search.
            </p>
          )}

          {certDetails.map((c) => (
            <div key={c.certificateId} style={{
              padding: ".85rem", borderRadius: 8,
              border: "1.5px solid var(--border)",
              background: "#f8fafc", marginBottom: ".5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem" }}>
                <div>
                  <strong style={{ fontSize: ".9rem" }}>{c.certificateId}</strong>
                  <p style={{ color: "var(--text-muted)", fontSize: ".83rem", margin: ".2rem 0" }}>{c.degree}</p>
                  <p style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>{formatDate(c.issueDate)}</p>
                </div>
                <span className={`badge ${c.isValid ? "badge-success" : "badge-danger"}`}>
                  {c.isValid ? "✅ Valid" : "❌ Revoked"}
                </span>
              </div>
              <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem", flexWrap: "wrap" }}>
                <Link
                  to={`/verify/${c.certificateId}`}
                  className="btn btn-outline"
                  style={{ fontSize: ".82rem", padding: ".35rem .8rem" }}
                >
                  🔍 Verify
                </Link>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: ".82rem", padding: ".35rem .8rem" }}
                  onClick={() => setRevokeId(c.certificateId)}
                >
                  🚫 Revoke
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Revoke */}
        <div className="card">
          <h2 className="card-title">⚠️ Revoke Certificate</h2>
          <div className="alert alert-warn" style={{ marginBottom: "1rem" }}>
            ⚠️ Revocation is permanent and recorded on the blockchain.
          </div>
          <div className="form-group">
            <label className="form-label">Certificate ID to Revoke</label>
            <input
              className="form-input"
              placeholder="e.g. PU-2024-22TH0204"
              value={revokeId}
              onChange={(e) => setRevokeId(e.target.value)}
            />
          </div>
          <button
            className="btn btn-danger"
            onClick={handleRevoke}
            disabled={!account || !revokeId.trim()}
          >
            🚫 Revoke Certificate
          </button>
          {!account && (
            <p style={{ fontSize: ".82rem", color: "var(--text-muted)", marginTop: ".5rem" }}>
              Connect wallet to revoke certificates.
            </p>
          )}
        </div>
      </div>

      {/* Event log */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: ".5rem" }}>
          <h2 className="card-title" style={{ margin: 0 }}>📋 Certificate Issuance Log</h2>
          <button
            className="btn btn-outline"
            style={{ padding: ".4rem .9rem", fontSize: ".85rem" }}
            onClick={loadEvents}
          >
            🔄 Refresh
          </button>
        </div>

        {loadingEvts ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div className="spinner" />
            <p style={{ color: "var(--text-muted)" }}>Loading blockchain events...</p>
          </div>
        ) : events.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>
            No certificates issued yet.{" "}
            <Link to="/issue" style={{ color: "var(--primary)" }}>Issue one now →</Link>
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                  {["Certificate ID", "Student", "Reg No.", "Degree", "Date", "Block", "Actions"].map((h) => (
                    <th key={h} style={{
                      padding: ".65rem .75rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      background: "#f8fafc",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((ev, idx) => (
                  <tr
                    key={ev.txHash + idx}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td style={{ padding: ".65rem .75rem", fontFamily: "monospace", fontSize: ".8rem", whiteSpace: "nowrap" }}>
                      {ev.certId}
                    </td>
                    <td style={{ padding: ".65rem .75rem" }}>{ev.student}</td>
                    <td style={{ padding: ".65rem .75rem" }}>{ev.regNo}</td>
                    <td style={{
                      padding: ".65rem .75rem",
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {ev.degree}
                    </td>
                    <td style={{ padding: ".65rem .75rem", whiteSpace: "nowrap" }}>
                      {formatDate(ev.date)}
                    </td>
                    <td style={{ padding: ".65rem .75rem" }}>#{ev.block}</td>
                    <td style={{ padding: ".65rem .75rem" }}>
                      <div style={{ display: "flex", gap: ".35rem" }}>
                        <Link
                          to={`/verify/${ev.certId}`}
                          className="btn btn-outline"
                          style={{ padding: ".28rem .65rem", fontSize: ".78rem" }}
                        >
                          Verify
                        </Link>
                        <button
                          className="btn btn-danger"
                          style={{ padding: ".28rem .65rem", fontSize: ".78rem" }}
                          onClick={() => setRevokeId(ev.certId)}
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
