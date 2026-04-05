"use client";

export interface SEOCompetitor {
  domain: string;
  traffic?: number;
  keywords?: number;
  overlap?: number;
  topKeywords?: string[];
}

export default function CompetitorAnalysis({ competitors }: { competitors: SEOCompetitor[] }) {
  const list = competitors ?? [];
  if (list.length === 0) return (
    <div className="text-center py-10 text-gray-400 text-sm">No competitor data available. Run an analysis first.</div>
  );
  return (
    <div className="space-y-3">
      {list.map((c, i) => (
        <div key={i} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-gray-800">{c.domain}</p>
            {c.overlap !== undefined && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{c.overlap}% overlap</span>}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            {c.traffic !== undefined && <p>Traffic: <strong>{c.traffic.toLocaleString()}</strong></p>}
            {c.keywords !== undefined && <p>Keywords: <strong>{c.keywords.toLocaleString()}</strong></p>}
          </div>
          {c.topKeywords && c.topKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {c.topKeywords.map((kw, j) => <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{kw}</span>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
