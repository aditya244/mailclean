"use client";

import { useState, useEffect } from "react";

export default function StatsBar({ refreshKey }) {
  const [stats, setStats] = useState(null)
  const [totalEmailCount, setTotalEmailCount] = useState(0)

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsRes, countRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/gmail/count'),
        ])
        const statsData = await statsRes.json()
        const countData = await countRes.json()

        if (statsData.stats) setStats(statsData.stats)
        if (countData.count) setTotalEmailCount(countData.count)
      } catch (err) {
        console.error('StatsBar error:', err)
      }
    }
    loadStats()
  }, [refreshKey])

  if (!stats || stats.totalSorted === 0) return null

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          fontWeight: "600",
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "16px",
          marginTop: "0",
        }}
      >
        Your Progress
      </p>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom:
            totalEmailCount > 0 && stats.totalCleaned > 0 ? "24px" : "0",
        }}
      >
        {[
          { value: stats.totalSorted, label: "📧 Sorted", color: "#111827" },
          { value: stats.trashed, label: "🗑️ Trashed", color: "#dc2626" },
          { value: stats.archived, label: "📦 Archived", color: "#d97706" },
          { value: stats.labelled, label: "🏷️ Labelled", color: "#4f46e5" },
        ].map((item) => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: item.color,
                margin: "0 0 4px 0",
              }}
            >
              {item.value.toLocaleString()}
            </p>
            <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0" }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {totalEmailCount > 0 && stats.totalCleaned > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {stats.totalCleaned.toLocaleString()} emails cleaned
            </span>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {totalEmailCount.toLocaleString()} total
            </span>
          </div>
          <div
            style={{
              width: "100%",
              backgroundColor: "#f3f4f6",
              borderRadius: "999px",
              height: "8px",
            }}
          >
            <div
              style={{
                width: `${Math.min((stats.totalCleaned / totalEmailCount) * 100, 100)}%`,
                backgroundColor: "#6366f1",
                height: "8px",
                borderRadius: "999px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <p
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginTop: "8px",
              marginBottom: "0",
            }}
          >
            {((stats.totalCleaned / totalEmailCount) * 100).toFixed(1)}% of your
            inbox cleaned
            {stats.totalCleaned < totalEmailCount && (
              <span
                style={{
                  color: "#6366f1",
                  marginLeft: "8px",
                  fontWeight: "500",
                }}
              >
                — {(totalEmailCount - stats.totalCleaned).toLocaleString()} more
                to go
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
