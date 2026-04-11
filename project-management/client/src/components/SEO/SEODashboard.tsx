"use client";
import { useState } from "react";
import KeywordRecommendations from "./KeywordRecommendations";
import ContentGaps from "./ContentGaps";
import CompetitorAnalysis from "./CompetitorAnalysis";

const TABS = ["Keywords", "Content Gaps", "Competitor Analysis"] as const;
type Tab = typeof TABS[number];

export default function SEODashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Keywords");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/seo/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() })
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setResult(data);
    } catch { setError("Analysis failed. Please check the URL and try again."); }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900?text-white mb-1">SEO AI Suggestions</h1>
<<<<<<< HEAD
        <p className="text-sm text-gray-500?text-white">Enter your website URL to get AI-powered keyword, content, and competitor insights.</p>
=======
        <p className="text-sm text-gray-500">Enter your website URL to get AI-powered keyword, content, and competitor insights.</p>
>>>>>>> 2033ba7 (added chatbot)
      </div>
      <div className="flex gap-3 mb-6">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAnalyze()}
          placeholder="Enter your website URL (e.g. mystore.com)"
          className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900" />
        <button onClick={handleAnalyze} disabled={loading}
          className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Analyzing..." : "Analyze ↗"}
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}
      <div className="flex border-b border-gray-200 mb-5">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
              ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab}
          </button>
        ))}
      </div>
      {!result && !loading && <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">🔍</p><p className="text-sm">Enter your URL above and click Analyze to get started.</p></div>}
      {loading && <div className="flex items-center gap-3 py-16 justify-center text-gray-400">
        <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
        <span className="text-sm">Analyzing your website...</span></div>}
      {result && !loading && <>
        {activeTab === "Keywords" && <KeywordRecommendations keywords={result.keywords ?? []} />}
        {activeTab === "Content Gaps" && <ContentGaps gaps={result.contentGaps ?? []} />}
        {activeTab === "Competitor Analysis" && <CompetitorAnalysis competitors={result.competitors ?? []} />}
      </>}
    </div>
  );
}
