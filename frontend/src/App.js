// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter, Routes, Route,
  Link, Navigate, useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import RoleLoginPage  from "./pages/RoleLoginPage";
import HomePage       from "./pages/HomePage";
import IssuePage      from "./pages/IssuePage";
import VerifyPage     from "./pages/VerifyPage";
import DashboardPage  from "./pages/DashboardPage";

import { getCurrentAccount } from "./utils/web3Utils";
import { DEFAULT_THEME, PROJECT_INFO } from "./data/masterData";
import "./App.css";

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTE — redirects verifiers away from admin-only pages
// ─────────────────────────────────────────────────────────────────────────────
function AdminRoute({ role, children }) {
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────────────────────
function Navbar({ account, onConnect, role, onLogout, theme, onToggleTheme }) {
  const location = useLocation();
  const active = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <span className="brand-icon">🎓</span>
        <span className="brand-text">CertVerify</span>
        <span className="brand-sub">Pondicherry University</span>
      </div>

      {/* Links — verifier only sees Home + Verify */}
      <div className="navbar-links">
        <Link to="/"       className={active("/")}>Home</Link>
        <Link to="/verify" className={active("/verify")}>Verify</Link>
        {role === "admin" && (
          <>
            <Link to="/issue"     className={active("/issue")}>Issue</Link>
            <Link to="/dashboard" className={active("/dashboard")}>Dashboard</Link>
          </>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexShrink: 0 }}>
        {/* Role badge */}
        <span className={`role-badge ${role}`}>
          {role === "admin" ? "🔐 Admin" : "🔍 Verifier"}
        </span>

        {/* Theme toggle */}
        <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        {/* Wallet */}
        {role === "admin" && (
          account ? (
            <div className="wallet-connected">
              <span className="wallet-dot" />
              <span className="wallet-addr">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          ) : (
            <button className="btn-connect" onClick={onConnect}>
              Connect Wallet
            </button>
          )
        )}

        {/* Logout */}
        <button className="btn-logout" onClick={onLogout}>
          ⏏ Exit
        </button>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(
    () => localStorage.getItem("cv_theme") || DEFAULT_THEME
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cv_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === "light" ? "dark" : "light");
  }

  // ── Role ───────────────────────────────────────────────────────────────────
  const [role, setRole] = useState(
    () => sessionStorage.getItem("cv_role") || null   // null = not logged in
  );

  function handleLogin(selectedRole) {
    sessionStorage.setItem("cv_role", selectedRole);
    setRole(selectedRole);
  }

  function handleLogout() {
    sessionStorage.removeItem("cv_role");
    setRole(null);
    setAccount(null);
  }

  // ── Wallet ─────────────────────────────────────────────────────────────────
  const [account, setAccount] = useState(null);

  useEffect(() => {
    getCurrentAccount().then(setAccount);
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accs => setAccount(accs[0] || null));
    }
  }, []);

  async function handleConnect() {
    if (!window.ethereum) { alert("Please install MetaMask!"); return; }
    const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accs[0] || null);
  }

  // ── If no role selected yet → show login screen ────────────────────────────
  if (!role) {
    return (
      <>
        {/* Apply theme even on login screen */}
        <div data-theme={theme} style={{ minHeight: "100vh" }}>
          {/* Floating theme toggle on login screen */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            style={{
              position: "fixed", top: "1rem", right: "1rem",
              zIndex: 999, boxShadow: "0 2px 8px rgba(0,0,0,.25)"
            }}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <RoleLoginPage onLogin={handleLogin} />
        </div>
      </>
    );
  }

  // ── Main app ───────────────────────────────────────────────────────────────
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Navbar
        account={account}
        onConnect={handleConnect}
        role={role}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="main-content">
        <Routes>
          {/* Public routes — both roles */}
          <Route path="/"            element={<HomePage account={account} role={role} />} />
          <Route path="/verify"      element={<VerifyPage />} />
          <Route path="/verify/:id"  element={<VerifyPage />} />

          {/* Admin-only routes */}
          <Route path="/issue" element={
            <AdminRoute role={role}>
              <IssuePage account={account} />
            </AdminRoute>
          } />
          <Route path="/dashboard" element={
            <AdminRoute role={role}>
              <DashboardPage account={account} />
            </AdminRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <p style={{ marginBottom: ".3rem" }}>
          🔗 Ethereum Blockchain &nbsp;·&nbsp; IPFS Storage &nbsp;·&nbsp;
          {PROJECT_INFO.department}, {PROJECT_INFO.institution} &nbsp;·&nbsp; {PROJECT_INFO.year}
        </p>
        <p style={{ fontSize: ".75rem", opacity: .75 }}>
          Developed by &nbsp;
          {PROJECT_INFO.team.map((m, i) => (
            <span key={m.regNo}>
              {m.name}{i < PROJECT_INFO.team.length - 1 ? " · " : ""}
            </span>
          ))}
          &nbsp;|&nbsp; Guide: {PROJECT_INFO.guide.name}, {PROJECT_INFO.guide.designation}
        </p>
      </footer>
    </BrowserRouter>
  );
}
