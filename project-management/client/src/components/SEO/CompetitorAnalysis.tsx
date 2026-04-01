"use client";
import { useState } from "react";
export default function CompetitorAnalysis({ competitors: initial }: { competitors: any[] }) {
  const [competitors, setCompetitors] = useState<any[]>(initial);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const handleAdd = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/seo/competitor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: domain.trim() }) });
      const data = await res.json();
      setCompetitors(prev => [...prev, data]);
      setDomain("");
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  const scoreColor = (s: number) => s >= 75 ? "bg-red-500" : s >= 55 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div>
      <div className="flex gap-2 mb-5">
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Add a competitor domain (e.g. competitor.com)"
          className="flex-1 text-sm px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleAdd} disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? "..." : "+ Add"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {["Competitor","SEO Score","Shared Keywords","Their Strengths"].map(h => (
                <th key={h} className="text-left py-2 px-3 text-xs text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competitors.map((c:any) => (
              <tr key={c.domain} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                <td className="py-3 px-3"><p className="font-medium text-gray-900 dark:text-white">{c.name}</p><p className="text-xs text-gray-400">{c.domain}</p></td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
                      <div className={`h-full rounded-full ${scoreColor(c.score)}`} style={{ width: `${c.score}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right">{c.score}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-gray-500">{c.sharedKeywords}</td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1">
                    {c.strengths.map((s:string) => <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">{s}</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
