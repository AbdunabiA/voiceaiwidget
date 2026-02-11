export default function WidgetPreview({ color, position, greeting }: { color: string; position: string; greeting: string }) {
  const isRight = position === 'bottom-right';

  return (
    <div className="relative w-full h-80 bg-gray-100 rounded-lg border overflow-hidden">
      <div className="p-4 text-center text-sm text-gray-400">Website Preview</div>
      <div className={`absolute bottom-4 ${isRight ? 'right-4' : 'left-4'}`}>
        <div className="bg-white rounded-xl shadow-lg w-56 mb-3 p-3 text-xs text-gray-600">{greeting}</div>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer ${isRight ? 'ml-auto' : ''}`}
          style={{ backgroundColor: color }}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        </div>
      </div>
    </div>
  );
}
