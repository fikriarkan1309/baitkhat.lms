import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Trash2, Check, RefreshCw, Undo } from 'lucide-react';

interface CanvasAnnotatorProps {
  imageUrl: string;
  onSave: (annotatedImageBase64: string) => void;
  onCancel: () => void;
}

export default function CanvasAnnotator({ imageUrl, onSave, onCancel }: CanvasAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [color, setColor] = useState('#EF4444'); // Default red for corrections
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasInited, setCanvasInited] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Load and draw image onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      // Scale canvas to fit parent or fit standard sizing
      const maxWidth = 600;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      setCanvasInited(true);
      // Save initial state to history
      setHistory([canvas.toDataURL()]);
    };
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      // Prevent scrolling while drawing on mobile touch
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Save state to history
    const canvas = canvasRef.current;
    if (canvas) {
      setHistory(prev => [...prev, canvas.toDataURL()]);
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevHistory = [...history];
    prevHistory.pop(); // Remove current state
    const prevState = prevHistory[prevHistory.length - 1];

    const img = new Image();
    img.src = prevState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setHistory(prevHistory);
    };
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHistory([canvas.toDataURL()]);
    };
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Pencil className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-slate-700">Lembar Koreksi Kaligrafi (Canvas)</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {/* Colors */}
          <div className="flex items-center gap-1.5 mr-2">
            {['#EF4444', '#EC4899', '#3B82F6', '#10B981'].map((c) => (
              <button
                key={c}
                id={`btn-color-${c}`}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                  color === c ? 'scale-125 border-2 border-slate-700 ring-2 ring-slate-200' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                title="Pilih Warna Coretan"
              />
            ))}
          </div>

          {/* Line width */}
          <select 
            id="select-linewidth"
            value={lineWidth} 
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-600"
          >
            <option value={2}>Pena Tipis (2px)</option>
            <option value={4}>Pena Sedang (4px)</option>
            <option value={6}>Pena Tebal (6px)</option>
          </select>

          {/* Action buttons */}
          <button
            id="btn-undo-draw"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-1 px-2.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-50 cursor-pointer flex items-center gap-1"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            id="btn-reset-draw"
            onClick={handleReset}
            className="p-1 px-2.5 bg-white border border-slate-200 rounded text-rose-600 hover:bg-rose-50 cursor-pointer flex items-center gap-1"
            title="Reset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-2">
        💡 Seret kursor/sentuh di atas gambar kaligrafi di bawah untuk menandai kesalahan tarikan garis atau anatomi huruf:
      </div>

      {/* Canvas Area wrapper */}
      <div 
        ref={containerRef}
        className="flex justify-center items-center bg-slate-900 rounded-lg p-2 overflow-auto border border-slate-300 max-h-[500px]"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="bg-white shadow-xl cursor-crosshair rounded touch-none block"
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          id="btn-cancel-annot"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 font-medium"
        >
          Batal
        </button>
        <button
          id="btn-save-annot"
          onClick={handleSave}
          disabled={!canvasInited}
          className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-1 shadow disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> Finalisasi Lembar Koreksi
        </button>
      </div>
    </div>
  );
}
