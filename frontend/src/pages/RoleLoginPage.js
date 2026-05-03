// src/pages/RoleLoginPage.js
import React, { useState } from "react";
import { ADMIN_SECRET_KEY, PROJECT_INFO } from "../data/masterData";
import toast from "react-hot-toast";

export default function RoleLoginPage({ onLogin }) {
  const [step,      setStep]      = useState("choose"); // choose | admin-key
  const [secretKey, setSecretKey] = useState("");
  const [showKey,   setShowKey]   = useState(false);
  const [shaking,   setShaking]   = useState(false);

  function shake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  }

  function handleSelectVerifier() {
    onLogin("verifier");
    toast("Welcome! You can verify certificates freely.", { icon: "🔍" });
  }

  function handleSelectAdmin() { setStep("admin-key"); }

  function handleAdminSubmit(e) {
    e.preventDefault();
    if (secretKey.trim() === ADMIN_SECRET_KEY) {
      onLogin("admin");
      toast.success("Admin access granted! Welcome.", { icon: "🔐" });
    } else {
      shake();
      toast.error("Incorrect secret key. Try again.");
      setSecretKey("");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, var(--hero-from) 0%, var(--hero-to) 100%)",
      display: "flex", flexDirection: "column",
    }}>

      {/* ── TOP HEADER — Project Title ───────────────────────────────────── */}
      <header style={{
        textAlign: "center",
        padding: "2rem 2rem 1.5rem",
        borderBottom: "1px solid rgba(255,255,255,.12)",
      }}>
        <div style={{ fontSize: "2.4rem", marginBottom: ".4rem" }}>🎓</div>
        <h1 style={{
          color: "#fff", fontWeight: 800,
          fontSize: "clamp(1.1rem, 2.5vw, 1.7rem)",
          lineHeight: 1.3, marginBottom: ".4rem",
          textShadow: "0 2px 8px rgba(0,0,0,.3)",
        }}>
          {PROJECT_INFO.title}
        </h1>
        <p style={{
          color: "var(--accent)", fontWeight: 600,
          fontSize: "clamp(.8rem, 1.5vw, 1rem)",
          marginBottom: ".35rem",
        }}>
          {PROJECT_INFO.subtitle}
        </p>
        <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".85rem" }}>
          {PROJECT_INFO.department} &nbsp;·&nbsp; {PROJECT_INFO.institution}
          &nbsp;·&nbsp; {PROJECT_INFO.affiliated}
        </p>
      </header>

      {/* ── BODY — Login card (left) + Team panel (right) ───────────────── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem", gap: "2rem", flexWrap: "wrap",
      }}>

        {/* ── LOGIN CARD ──────────────────────────────────────────────────── */}
        <div
          className="login-card"
          style={{
            animation: shaking ? "shake .5s ease" : "none",
            flex: "0 0 auto", width: "100%", maxWidth: 420,
          }}
        >
          {/* Card header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "var(--primary)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "1.6rem", margin: "0 auto .75rem",
              boxShadow: "0 4px 16px rgba(10,60,120,.35)",
            }}>
              🔐
            </div>
            <h2 style={{ color: "var(--primary)", fontWeight: 800, fontSize: "1.25rem", marginBottom: ".25rem" }}>
              Welcome
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: ".88rem" }}>
              Select your role to continue
            </p>
          </div>

          {/* ── STEP 1: Choose role ── */}
          {step === "choose" && (
            <>
              {/* Admin button */}
              <button
                onClick={handleSelectAdmin}
                style={{
                  width: "100%", padding: "1.1rem 1.25rem",
                  background: "var(--primary-dim)",
                  border: "2px solid var(--primary)",
                  borderRadius: 12, cursor: "pointer",
                  textAlign: "left", marginBottom: ".85rem",
                  transition: "all .2s",
                  display: "flex", alignItems: "center", gap: ".9rem",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--primary)";
                  e.currentTarget.querySelector(".rt").style.color = "#fff";
                  e.currentTarget.querySelector(".rd").style.color = "rgba(255,255,255,.8)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "var(--primary-dim)";
                  e.currentTarget.querySelector(".rt").style.color = "var(--primary)";
                  e.currentTarget.querySelector(".rd").style.color = "var(--text-muted)";
                }}
              >
                <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>🔐</span>
                <div>
                  <div className="rt" style={{ fontWeight: 700, fontSize: "1rem", color: "var(--primary)", transition: "color .2s" }}>
                    Admin
                  </div>
                  <div className="rd" style={{ fontSize: ".82rem", color: "var(--text-muted)", marginTop: ".1rem", transition: "color .2s" }}>
                    Issue certificates, dashboard, manage records
                  </div>
                </div>
                <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "1.1rem" }}>›</span>
              </button>

              {/* Verifier button */}
              <button
                onClick={handleSelectVerifier}
                style={{
                  width: "100%", padding: "1.1rem 1.25rem",
                  background: "var(--card-2)",
                  border: "2px solid var(--border)",
                  borderRadius: 12, cursor: "pointer",
                  textAlign: "left",
                  transition: "all .2s",
                  display: "flex", alignItems: "center", gap: ".9rem",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--success)";
                  e.currentTarget.style.background  = "var(--verified-bg)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background  = "var(--card-2)";
                }}
              >
                <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>🔍</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>
                    Verifier
                  </div>
                  <div style={{ fontSize: ".82rem", color: "var(--text-muted)", marginTop: ".1rem" }}>
                    Verify certificate authenticity — no key required
                  </div>
                </div>
                <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "1.1rem" }}>›</span>
              </button>
            </>
          )}

          {/* ── STEP 2: Admin secret key ── */}
          {step === "admin-key" && (
            <>
              <button
                onClick={() => { setStep("choose"); setSecretKey(""); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: ".88rem",
                  display: "flex", alignItems: "center", gap: ".35rem",
                  marginBottom: "1.25rem", padding: 0,
                }}
              >
                ← Back
              </button>

              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "2.2rem", marginBottom: ".4rem" }}>🔐</div>
                <h3 style={{ color: "var(--primary)", fontSize: "1.1rem", fontWeight: 700 }}>
                  Admin Authentication
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: ".85rem", marginTop: ".25rem" }}>
                  Enter the admin secret key to continue
                </p>
              </div>

              <form onSubmit={handleAdminSubmit}>
                <div className="form-group">
                  <label className="form-label">Secret Key</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="form-input"
                      type={showKey ? "text" : "password"}
                      placeholder="Enter admin secret key..."
                      value={secretKey}
                      onChange={e => setSecretKey(e.target.value)}
                      autoFocus
                      style={{ paddingRight: "3rem" }}
                    />
                    <button type="button" onClick={() => setShowKey(v => !v)}
                      style={{
                        position: "absolute", right: ".75rem", top: "50%",
                        transform: "translateY(-50%)",
                        background: "none", border: "none",
                        cursor: "pointer", fontSize: "1.1rem", color: "var(--text-muted)",
                      }}
                    >
                      {showKey ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block"
                  style={{ marginTop: ".5rem", padding: ".85rem" }}
                  disabled={!secretKey.trim()}
                >
                  🔐 Verify & Enter as Admin
                </button>
              </form>
            </>
          )}

          {/* Blockchain note */}
          <p style={{ textAlign: "center", fontSize: ".75rem", color: "var(--text-muted)", marginTop: "1.5rem" }}>
            🔗 Secured by Ethereum Blockchain &nbsp;·&nbsp; IPFS Storage
          </p>
        </div>

        {/* ── TEAM PANEL ──────────────────────────────────────────────────── */}
        <div style={{
          flex: "0 0 auto", width: "100%", maxWidth: 340,
          background: "rgba(255,255,255,.08)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,.18)",
          borderRadius: 20, padding: "1.75rem",
          color: "#fff",
        }}>
          {/* Guide */}
          <div style={{
            background: "rgba(200,160,50,.15)",
            border: "1px solid rgba(200,160,50,.4)",
            borderRadius: 12, padding: "1rem 1.1rem",
            marginBottom: "1.25rem",
          }}>
            <p style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: ".5rem" }}>
              Project Guide
            </p>
            <p style={{ fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: ".2rem" }}>
              {PROJECT_INFO.guide.name}
            </p>
            <p style={{ fontSize: ".82rem", color: "rgba(255,255,255,.75)" }}>
              {PROJECT_INFO.guide.designation}
            </p>
            <p style={{ fontSize: ".78rem", color: "rgba(255,255,255,.6)" }}>
              {PROJECT_INFO.guide.dept}
            </p>
          </div>

          {/* Team members */}
          <p style={{ fontSize: ".72rem", fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: ".75rem" }}>
            Development Team
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
            {PROJECT_INFO.team.map((member, i) => (
              <div key={member.regNo} style={{
                display: "flex", alignItems: "center", gap: ".75rem",
                background: "rgba(255,255,255,.07)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 10, padding: ".65rem .9rem",
              }}>
                {/* Avatar circle */}
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: `hsl(${i * 60 + 200}, 70%, 55%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: ".85rem", color: "#fff", flexShrink: 0,
                }}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: ".9rem", color: "#fff", margin: 0 }}>
                    {member.name}
                  </p>
                  <p style={{ fontSize: ".75rem", color: "rgba(255,255,255,.55)", margin: 0 }}>
                    {member.regNo}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Institution */}
          <div style={{
            marginTop: "1.25rem", paddingTop: "1rem",
            borderTop: "1px solid rgba(255,255,255,.12)",
            textAlign: "center",
          }}>
            <p style={{ fontSize: ".78rem", color: "rgba(255,255,255,.55)", lineHeight: 1.6 }}>
              {PROJECT_INFO.institution}<br />
              {PROJECT_INFO.affiliated}<br />
              {PROJECT_INFO.year}
            </p>
          </div>
        </div>

      </div>{/* end body */}

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{
        background: "rgba(0,0,0,.25)",
        borderTop: "1px solid rgba(255,255,255,.1)",
        padding: ".9rem 2rem",
        textAlign: "center",
      }}>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".78rem", margin: 0 }}>
          Developed by &nbsp;
          {PROJECT_INFO.team.map((m, i) => (
            <span key={m.regNo}>
              <strong style={{ color: "rgba(255,255,255,.8)" }}>{m.name}</strong>
              {i < PROJECT_INFO.team.length - 1 ? " · " : ""}
            </span>
          ))}
          &nbsp;|&nbsp; Guide: <strong style={{ color: "rgba(255,255,255,.8)" }}>{PROJECT_INFO.guide.name}</strong>
          &nbsp;|&nbsp; {PROJECT_INFO.department}, {PROJECT_INFO.institution}
        </p>
      </footer>

      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-8px); }
          30%      { transform: translateX(8px); }
          45%      { transform: translateX(-6px); }
          60%      { transform: translateX(6px); }
          75%      { transform: translateX(-4px); }
          90%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
