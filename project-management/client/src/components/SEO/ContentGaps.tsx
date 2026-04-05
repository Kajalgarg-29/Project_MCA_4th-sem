"use client";

export interface ContentGap {
  topic: string;
  difficulty?: number;
  opportunity?: string;
}

export default function ContentGaps({ gaps }: { gaps: ContentGap[] }) {
  const list = gaps ?? [];
  if (list.length === 0) return (
    <div className="text-center py-10 text-gray-400 text-sm">No content gap data available. Run an analysis first.</div>
  );
  return (
    <div className="space-y-2">
      {list.map((gap, i) => (
        <div key={i} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-800">{gap.topic}</p>
            {gap.opportunity && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full ml-2 shrink-0">{gap.opportunity}</span>}
          </div>
          {gap.difficulty !== undefined && <p className="text-xs text-gray-400 mt-1">Difficulty: {gap.difficulty}/100</p>}
        </div>
      ))}
    </div>
  );
}
