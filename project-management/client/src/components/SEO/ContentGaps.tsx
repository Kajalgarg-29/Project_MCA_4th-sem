"use client";
const urgencyStyle: Record<string, { tag: string; icon: string }> = {
  critical: { tag: "bg-red-100 text-red-700", icon: "bg-red-50" },
  moderate: { tag: "bg-yellow-100 text-yellow-700", icon: "bg-yellow-50" },
  low:      { tag: "bg-green-100 text-green-700", icon: "bg-green-50" },
};
export default function ContentGaps({ gaps }: { gaps: any[] }) {
  return (
    <div className="space-y-3">
      {gaps.map((gap:any) => {
        const style = urgencyStyle[gap.urgency] ?? urgencyStyle.low;
        return (
          <div key={gap.topic} className="flex items-start gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg text-lg ${style.icon}`}>{gap.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{gap.topic}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{gap.reason}</p>
              <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${style.tag}`}>
                {gap.urgency.charAt(0).toUpperCase() + gap.urgency.slice(1)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
