import { listLessons } from '@starkid/core'

export default function LearningPreviewPage() {
  const lessons = listLessons()
  const primary = lessons[0]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-cyan-300 mb-2">LEARNING PREVIEW (DEV)</h1>
      <p className="text-sm text-cyan-200/70 mb-4">
        Seed lesson summary from core learning service.
      </p>

      {primary ? (
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-black/40">
          <div className="text-sm text-cyan-200/70 font-mono">TITLE</div>
          <div className="text-xl text-white font-bold">{primary.title}</div>
          <div className="text-sm text-cyan-200/70 font-mono mt-2">SUBTITLE</div>
          <div className="text-white/80">{primary.subtitle}</div>
          <div className="text-sm text-cyan-200/70 font-mono mt-2">BLOCK COUNT</div>
          <div className="text-white/80">{primary.blocks.length}</div>
          <div className="text-sm text-cyan-200/70 font-mono mt-2">BLOCK LIST</div>
          <ul className="text-white/80 text-sm list-disc pl-5 mt-1">
            {primary.blocks.map((block) => (
              <li key={block.id}>{block.order}. {block.type}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-white/70">No lessons found.</div>
      )}
    </div>
  )
}
