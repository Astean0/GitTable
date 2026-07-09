'use client'

import type { Schedule } from '@/lib/types'

interface ConflictSidebarProps {
  conflicts: { scheduleId: string; message: string; schedule?: Schedule }[]
  highlightedId: string | null
  onHighlight: (id: string) => void
}

export default function ConflictSidebar({
  conflicts,
  highlightedId,
  onHighlight,
}: ConflictSidebarProps) {
  return (
    <aside className="w-72 bg-white border border-gray-100 rounded-2xl p-4 shrink-0">
      <h3 className="font-semibold text-gray-900 mb-3">Conflict Log</h3>
      {conflicts.length === 0 ? (
        <p className="text-sm text-gray-400">No active conflicts</p>
      ) : (
        <ul className="space-y-2">
          {conflicts.map((c) => (
            <li
              key={c.scheduleId}
              className={`p-3 rounded-lg text-sm border ${
                highlightedId === c.scheduleId
                  ? 'bg-red-50 border-red-300'
                  : 'bg-gray-50 border-gray-100'
              }`}
            >
              <p className="text-red-700 mb-1">{c.message}</p>
              <button
                onClick={() => onHighlight(c.scheduleId)}
                className="text-xs text-gray-500 underline hover:text-black"
              >
                Ver conflicto
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
