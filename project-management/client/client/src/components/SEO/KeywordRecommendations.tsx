"use client";
import { SEOKeyword } from "@/state/api";
const priorityClass: Record<string, string> = {
  high: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-600",
};
export default function KeywordRecommendations({ keywords }: { keywords: SEOKeyword[] }) {
  const avgVol = Math.round(keywords.reduce((a, k) => a + k.volume, 0) / keywords.length);
  const highPri = keywords.filter(k => k.priority === "high").length;
  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[{ label: "Keywords Found", value: keywords.length },{ label: "Avg Monthly Volume", value: avgVol.toLocaleString() },{ label: "High Priority", value: highPri }].map(s => (
          <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-medium text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {keywords.map(kw => (
          <div key={kw.word} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="font-medium text-gray-900 dark:text-white text-sm">{kw.word}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityClass[kw.priority]}`}>{kw.priority}</span>
            </div>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(Math.round((kw.volume/100000)*100),100)}%` }} />
                </div>
                <span>{kw.volume.toLocaleString()}/mo</span>
              </div>
              <div className="flex gap-3"><span>Difficulty: {kw.difficulty}</span><span className="capitalize">{kw.intent}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
