"use client";

import { useState, useEffect } from "react";

const CATEGORY_CONFIG = {
  Spam: { emoji: "🚫", risk: "red", riskLabel: "Safe to delete" },
  Promotions: { emoji: "🛍️", risk: "red", riskLabel: "Safe to delete" },
  Newsletter: { emoji: "📰", risk: "red", riskLabel: "Safe to delete" },
  Social: { emoji: "💬", risk: "orange", riskLabel: "Usually safe" },
  "OTP & Security": {
    emoji: "🔐",
    risk: "orange",
    riskLabel: "Delete after use",
  },
  Transactions: { emoji: "💳", risk: "yellow", riskLabel: "Keep short term" },
  Receipts: { emoji: "🧾", risk: "yellow", riskLabel: "Keep short term" },
  Finance: { emoji: "🏦", risk: "green", riskLabel: "Keep" },
  Work: { emoji: "👔", risk: "green", riskLabel: "Keep — real work emails" },
  Personal: { emoji: "👤", risk: "green", riskLabel: "Keep" },
  Notifications: { emoji: "🔔", risk: "orange", riskLabel: "Usually safe" },
  Travel: { emoji: "✈️", risk: "yellow", riskLabel: "Keep short term" },
  Uncertain: { emoji: "❓", risk: "yellow", riskLabel: "Needs review" },
  "Jobs & Careers": {
    emoji: "💼",
    risk: "orange",
    riskLabel: "Review — may not be relevant",
  },
};

const CATEGORY_SUGGESTIONS = {
  Spam: { action: "Trash", color: "#dc2626", bg: "#fee2e2" },
  Promotions: { action: "Trash", color: "#dc2626", bg: "#fee2e2" },
  Newsletter: { action: "Archive", color: "#92400e", bg: "#fef3c7" },
  Social: { action: "Archive", color: "#92400e", bg: "#fef3c7" },
  "Jobs & Careers": { action: "Archive", color: "#92400e", bg: "#fef3c7" },
  Notifications: { action: "Archive", color: "#92400e", bg: "#fef3c7" },
  "OTP & Security": { action: "Archive", color: "#92400e", bg: "#fef3c7" },
  Transactions: { action: "Archive", color: "#92400e", bg: "#fef3c7" },
  Receipts: { action: "Archive", color: "#92400e", bg: "#fef3c7" },
  Travel: { action: "Archive", color: "#92400e", bg: "#fef3c7" },
  Finance: { action: "Label", color: "#166534", bg: "#dcfce7" },
  Work: { action: "Label", color: "#166534", bg: "#dcfce7" },
  Personal: { action: "Label", color: "#166534", bg: "#dcfce7" },
  Uncertain: { action: "Review", color: "#6b7280", bg: "#f3f4f6" },
};

const CATEGORY_ORDER = [
  "Spam",
  "Promotions",
  "Newsletter",
  "Social",
  "Jobs & Careers",
  "Notifications",
  "OTP & Security",
  "Uncertain",
  "Transactions",
  "Receipts",
  "Travel",
  "Finance",
  "Work",
  "Personal",
];

const RISK_BG = {
  red: "#fff1f2",
  orange: "#fff7ed",
  yellow: "#fefce8",
  green: "#f0fdf4",
};

const RISK_BORDER = {
  red: "#fecdd3",
  orange: "#fed7aa",
  yellow: "#fef08a",
  green: "#bbf7d0",
};

const RISK_TEXT = {
  red: "#b91c1c",
  orange: "#c2410c",
  yellow: "#a16207",
  green: "#15803d",
};

export default function CategorySummary({
  onCategorySelect,
  emailCount,
  setEmailCount,
  scanning,
  setScanning,
  scanDone,
  setScanDone,
  classifying,
  setClassifying,
  classifyResult,
  setClassifyResult,
  error,
  setError,
}) {
  async function fetchEmailCount() {
    try {
      setError(null);
      const res = await fetch("/api/gmail/count");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEmailCount(data.count);
    } catch (err) {
      setError(err.message);
    }
  }

  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadExistingSummary();
  }, []);

  async function loadExistingSummary() {
  try {
    const [summaryRes, countRes] = await Promise.all([
      fetch('/api/emails/summary'),
      fetch('/api/gmail/count'),
    ])
    const summaryData = await summaryRes.json()
    const countData = await countRes.json()

    if (summaryData.summary) {
      setClassifyResult({
        summary: summaryData.summary,
        layerStats: summaryData.layerStats,
        classified: Object.values(summaryData.summary).reduce((a, b) => a + b, 0),
      })
      setScanDone(true)
    }

    if (countData.count) setEmailCount(countData.count)

  } catch (err) {
    console.error('Error loading summary:', err)
  }
}

  async function startScanAndClassify() {
    try {
      setError(null);
      setScanDone(false);
      setClassifyResult(null);
      setProgress("Checking your mailbox...");

      // Step 1: Get count
      const countRes = await fetch("/api/gmail/count");
      const countData = await countRes.json();
      if (countData.error) throw new Error(countData.error);
      setEmailCount(countData.count);
      setProgress("Scanning emails...");

      // Step 2: Scan
      const scanRes = await fetch("/api/gmail/scan", { method: "POST" });
      const scanData = await scanRes.json();
      if (scanData.error) throw new Error(scanData.error);
      setScanDone(true);
      setProgress("Classifying emails...");

      // Step 3: Classify
      const classifyRes = await fetch("/api/gmail/classify", {
        method: "POST",
      });
      const classifyData = await classifyRes.json();
      if (classifyData.error) throw new Error(classifyData.error);
      setClassifyResult(classifyData);
      setProgress(null);
    } catch (err) {
      setError(err.message);
      setProgress(null);
    }
  }

  async function startScan() {
    try {
      setScanning(true);
      setError(null);
      setScanDone(false);
      setClassifyResult(null);
      const res = await fetch("/api/gmail/scan", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScanDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  }

  async function startClassification() {
    try {
      setClassifying(true);
      setError(null);
      const res = await fetch("/api/gmail/classify", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setClassifyResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setClassifying(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Mailbox Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Your Mailbox
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          We only read sender info, subject lines and headers — never the
          content of your emails.
        </p>

        {emailCount !== null && (
          <div className="mb-6">
            <p className="text-4xl font-bold text-gray-900">
              {emailCount.toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              total emails in your mailbox
            </p>
          </div>
        )}

        {/* Progress indicator */}
        {progress && (
          <div className="mb-4 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-indigo-600">{progress}</p>
          </div>
        )}

        {!progress && (
          <button
            onClick={startScanAndClassify}
            disabled={!!progress}
            style={{
              padding: "10px 24px",
              backgroundColor: "#276FBF",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {classifyResult ? (
              <>
                <span style={{ fontSize: "14px" }}>↻</span>
                Rescan Emails
              </>
            ) : (
              <>
                <span style={{ fontSize: "14px" }}>→</span>
                Scan & Clean
              </>
            )}
          </button>
        )}
      </div>

      {/* Classification Results */}
      {classifyResult && classifyResult.summary && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Inbox Report
            </h2>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Click any category to review the emails inside.
          </p>

          <div className="space-y-3">
            {Object.entries(classifyResult.summary)
              .sort((a, b) => {
                const orderA = CATEGORY_ORDER.indexOf(a[0]);
                const orderB = CATEGORY_ORDER.indexOf(b[0]);
                // If category not in order list, put it before Finance/Work/Personal
                const posA = orderA === -1 ? 8 : orderA;
                const posB = orderB === -1 ? 8 : orderB;
                return posA - posB;
              })
              .map(([category, count]) => {
                const config = CATEGORY_CONFIG[category] || {
                  emoji: "📧",
                  risk: "yellow",
                  riskLabel: "Review",
                };
                return (
                  <button
                    key={category}
                    onClick={() => onCategorySelect(category)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px",
                      borderRadius: "8px",
                      border: `1px solid`,
                      cursor: "pointer",
                      marginBottom: "0",
                      backgroundColor: RISK_BG[config.risk],
                      borderColor: RISK_BORDER[config.risk],
                      color: RISK_TEXT[config.risk],
                    }}
                  >
                    {/* Left side */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>{config.emoji}</span>
                      <div style={{ textAlign: "left" }}>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {category}
                        </p>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "12px",
                            opacity: "0.7",
                          }}
                        >
                          {config.riskLabel}
                        </p>
                      </div>
                    </div>

                    {/* Right side */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {CATEGORY_SUGGESTIONS[category] && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "500",
                            color: CATEGORY_SUGGESTIONS[category].color,
                            backgroundColor: CATEGORY_SUGGESTIONS[category].bg,
                            padding: "3px 10px",
                            borderRadius: "999px",
                            whiteSpace: "nowrap",
                            width: "120px",
                            textAlign: "center",
                            display: "inline-block",
                            boxSizing: "border-box",
                          }}
                        >
                          Suggested: {CATEGORY_SUGGESTIONS[category].action}
                        </span>
                      )}
                      <span
                        style={{
                          fontWeight: "700",
                          fontSize: "18px",
                          minWidth: "32px",
                          textAlign: "right",
                        }}
                      >
                        {count}
                      </span>
                      <span style={{ fontSize: "12px", opacity: "0.5" }}>
                        →
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm font-medium">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
