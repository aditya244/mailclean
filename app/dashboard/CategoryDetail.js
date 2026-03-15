"use client";

import { useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";

const ALL_CATEGORIES = [
  "Spam",
  "Promotions",
  "Newsletter",
  "Social",
  "OTP & Security",
  "Transactions",
  "Receipts",
  "Finance",
  "Work",
  "Personal",
  "Notifications",
  "Travel",
  "Uncertain",
  "Jobs & Careers",
];

const ACTION_BUTTONS = {
  label: {
    label: "🏷️ Label",
    color: "#4338ca",
    backgroundColor: "#e0e7ff",
    border: "1px solid #a5b4fc",
  },
  archive: {
    label: "📦 Archive",
    color: "#92400e",
    backgroundColor: "#fef3c7",
    border: "1px solid #fcd34d",
  },
  trash: {
    label: "🗑️ Trash",
    color: "#991b1b",
    backgroundColor: "#fee2e2",
    border: "1px solid #fca5a5",
  },
};

const HIGH_RISK_CATEGORIES = [
  "Finance",
  "Work",
  "Personal",
  "Receipts",
  "Travel",
  "Transactions",
];

const SOURCE_LABELS = {
  rules: { label: "Auto-sorted", color: "#1d4ed8", bg: "#dbeafe" },
  domain: { label: "Auto-sorted", color: "#1d4ed8", bg: "#dbeafe" },
  ai: { label: "AI-sorted", color: "#6d28d9", bg: "#ede9fe" },
  user: { label: "You moved", color: "#166534", bg: "#dcfce7" },
};

// Parses sender name and email from "Name <email@domain.com>"
function parseSender(from) {
  if (!from) return { name: "Unknown", email: "" };
  const match = from.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return {
      name: match[1].replace(/"/g, "").trim(),
      email: match[2].trim(),
    };
  }
  return { name: from, email: from };
}

// Formats date string into readable format
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getUnsubscribeUrl(headers) {
  const header = headers?.["list-unsubscribe"];
  if (!header) return null;
  // Header format: "<https://unsubscribe.url>, <mailto:...>"
  // Extract the https URL
  const match = header.match(/<(https?:\/\/[^>]+)>/);
  return match ? match[1] : null;
}

export default function CategoryDetail({
  category,
  onBack,
  onCategoryOverride,
  onActionComplete,
  onStatsRefresh
}) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [overriding, setOverriding] = useState(null); // messageId being overridden
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, action: null });
  const [actioning, setActioning] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  const isHighRisk = HIGH_RISK_CATEGORIES.includes(category);

  useEffect(() => {
    fetchEmails(1);
  }, [category]);

  async function fetchEmails(pageNum) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/emails?category=${encodeURIComponent(category)}&page=${pageNum}`,
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (pageNum === 1) {
        setEmails(data.emails);
      } else {
        // Append for "load more"
        setEmails((prev) => [...prev, ...data.emails]);
      }

      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function overrideCategory(messageId, newCategory) {
    try {
      setOverriding(messageId);
      const res = await fetch(`/api/emails/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Update the email list
      setEmails((prev) => prev.filter((e) => e.messageId !== messageId));
      setTotal((prev) => prev - 1);

      // Tell parent to update the summary counts
      onCategoryOverride(category, newCategory);
    } catch (err) {
      setError(err.message);
    } finally {
      setOverriding(null);
    }
  }

  async function executeAction(action) {
    try {
      setActioning(true);
      setModal({ isOpen: false, action: null });
      setError(null);

      const res = await fetch("/api/emails/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, category }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setActionResult(data);
      // Clear the email list since they've been actioned
      setEmails([]);
      setTotal(0);
      onActionComplete(category);
      onStatsRefresh()
    } catch (err) {
      setError(err.message);
    } finally {
      setActioning(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {category}
                </h2>
                <p className="text-sm text-gray-400">{total} emails</p>
              </div>
            </div>

            {/* Action buttons — only show if there are emails and no action taken yet */}
            {total > 0 && !actionResult && !actioning && (
              <div style={{ display: "flex", gap: "8px" }}>
                {["label", "archive", "trash"].map((action) => {
                  const btn = ACTION_BUTTONS[action];
                  return (
                    <button
                      key={action}
                      onClick={() => setModal({ isOpen: true, action })}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: btn.color,
                        backgroundColor: btn.backgroundColor,
                        border: btn.border,
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            )}

            {actioning && (
              <p className="text-sm text-gray-400">Processing...</p>
            )}
          </div>
        </div>

        {/* Action Result */}
        {actionResult && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 text-sm font-medium">
              ✓ {actionResult.affected} emails{" "}
              {actionResult.action === "trash"
                ? "moved to Trash"
                : actionResult.action === "archive"
                  ? "archived"
                  : "labelled"}{" "}
              successfully.
              {actionResult.action === "trash" &&
                " They'll stay in Trash for 30 days."}
              {actionResult.action === "archive" &&
                " Find them anytime in All Mail."}
            </p>
          </div>
        )}
        {/* Email List */}
        {loading && emails.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm">Loading emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm">No emails in this category.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {emails.map((email) => {
              const sender = parseSender(email.from);
              const source =
                SOURCE_LABELS[email.classificationSource] || SOURCE_LABELS.ai;
              const isOverriding = overriding === email.messageId;
              const unsubUrl = getUnsubscribeUrl(email.headers);
                console.log('sender:', email.from, '| headers:', email.headers, '| unsubUrl:', unsubUrl)

              return (
                <div
                  key={email.messageId}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Email info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {sender.name}
                        </p>
                        {email.hasAttachment && (
                          <span
                            className="text-xs text-gray-400"
                            title="Has attachment"
                          >
                            📎
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            fontWeight: "500",
                            backgroundColor: source.bg,
                            color: source.color,
                          }}
                        >
                          {source.label}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 truncate mb-1">
                        {email.subject || "(no subject)"}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <p
                          className="text-xs text-gray-400"
                          style={{ margin: 0 }}
                        >
                          {sender.email} · {formatDate(email.date)}
                          {email.confidence > 0 && (
                            <span className="ml-2">
                              {Math.round(email.confidence * 100)}% confident
                            </span>
                          )}
                        </p>

                        {(category === "Newsletter" ||
                          category === "Promotions") &&
                          unsubUrl && (
                            <a
                              href={unsubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                border: "1px solid #e5e7eb",
                                borderRadius: "4px",
                                padding: "1px 8px",
                                textDecoration: "none",
                                backgroundColor: "#f9fafb",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                            >
                              Unsubscribe
                            </a>
                          )}
                      </div>
                    </div>

                    {/* Override dropdown */}
                    <div className="flex-shrink-0">
                      {isOverriding ? (
                        <span className="text-xs text-gray-400">Moving...</span>
                      ) : (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              overrideCategory(email.messageId, e.target.value);
                            }
                          }}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white hover:border-gray-300 transition-colors"
                        >
                          <option value="" disabled>
                            Move to...
                          </option>
                          {ALL_CATEGORIES.filter((c) => c !== category).map(
                            (c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ),
                          )}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <button
            onClick={() => fetchEmails(page + 1)}
            disabled={loading}
            className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more emails"}
          </button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm font-medium">Error: {error}</p>
          </div>
        )}
      </div>
      {/* Modal lives outside all divs — nothing can interfere with its positioning */}
      <ConfirmModal
        isOpen={modal.isOpen}
        action={modal.action}
        category={category}
        count={total}
        isHighRisk={isHighRisk}
        onConfirm={() => executeAction(modal.action)}
        onCancel={() => setModal({ isOpen: false, action: null })}
      />
    </>
  );
}
