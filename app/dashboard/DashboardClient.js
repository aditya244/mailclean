"use client";

import { useState } from "react";
import CategorySummary from "./CategorySummary";
import CategoryDetail from "./CategoryDetail";
import StatsBar from './StatsBar' // add this import


export default function DashboardClient() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // All state lives here so it survives view switches
  const [emailCount, setEmailCount] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [classifyResult, setClassifyResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null)
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)

  function refreshStats() {
  setStatsRefreshKey(prev => prev + 1)
}

  function handleActionComplete(category) {
    if (!classifyResult?.summary) return;
    setClassifyResult((prev) => {
      const newSummary = { ...prev.summary };
      delete newSummary[category];
      return { ...prev, summary: newSummary };
    });
  }

  function handleCategoryOverride(fromCategory, toCategory) {
    if (!classifyResult?.summary) return;

    setClassifyResult((prev) => {
      const newSummary = { ...prev.summary };

      // Decrement the source category
      if (newSummary[fromCategory] > 1) {
        newSummary[fromCategory] = newSummary[fromCategory] - 1;
      } else {
        delete newSummary[fromCategory]; // remove if count hits 0
      }

      // Increment the destination category
      newSummary[toCategory] = (newSummary[toCategory] || 0) + 1;

      return { ...prev, summary: newSummary };
    });
  }

  if (selectedCategory) {
    return (
      <CategoryDetail
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
        onCategoryOverride={handleCategoryOverride}
        onActionComplete={handleActionComplete}
        onStatsRefresh={refreshStats}
      />
    );
  }
  return (
    <>
      <StatsBar refreshKey={statsRefreshKey} emailCount={emailCount}/>
      <div style={{ marginTop: '24px' }}>
        <CategorySummary
          onCategorySelect={setSelectedCategory}
          emailCount={emailCount}
          setEmailCount={setEmailCount}
          scanning={scanning}
          setScanning={setScanning}
          scanDone={scanDone}
          setScanDone={setScanDone}
          classifying={classifying}
          setClassifying={setClassifying}
          classifyResult={classifyResult}
          setClassifyResult={setClassifyResult}
          setProgress={setProgress}
          error={error}
          setError={setError}
        />
      </div>
    </>
  )

//   return (
//     <CategorySummary
//       onCategorySelect={setSelectedCategory}
//       // Pass all state down as props
//       emailCount={emailCount}
//       setEmailCount={setEmailCount}
//       scanning={scanning}
//       setScanning={setScanning}
//       scanDone={scanDone}
//       setScanDone={setScanDone}
//       classifying={classifying}
//       setClassifying={setClassifying}
//       classifyResult={classifyResult}
//       setClassifyResult={setClassifyResult}
//       setProgress={setProgress}
//       error={error}
//       setError={setError}
//     />
//   );
}
