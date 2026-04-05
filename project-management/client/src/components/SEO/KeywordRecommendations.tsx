"use client";

export interface SEOKeyword {
  keyword: string;
  volume?: number;
  difficulty?: number;
  intent?: string;
}

export default function KeywordRecommendations({ keywords }: { keywords: SEOKeyword[] }) {
  const list = keywords ?? [];

  if (list.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No keyword data available. Run an analysis first.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {list.map((kw, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-800">{kw.keyword}</p>
            {kw.intent && <p className="text-xs text-gray-400 mt-0.5">Intent: {kw.intent}</p>}
          </div>
          <div className="flex gap-3 text-xs text-gray-500">
            {kw.volume !== undefined && (
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                Vol: {kw.volume.toLocaleString()}
              </span>
            )}
            {kw.difficulty !== undefined && (
              <span className={`px-2 py-0.5 rounded-full ${kw.difficulty > 70 ? "bg-red-50 text-red-600" : kw.difficulty > 40 ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"}`}>
                KD: {kw.difficulty}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
