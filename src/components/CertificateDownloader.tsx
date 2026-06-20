import React, { useRef, useEffect, useState } from 'react';
import { Award, Download, Loader2 } from 'lucide-react';
import { SystemSettings } from '../types';

interface CertificateDownloaderProps {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  settings: SystemSettings;
  buttonLabel?: string;
}

export default function CertificateDownloader({ 
  studentName, 
  courseTitle, 
  completionDate, 
  settings,
  buttonLabel = "Download Sertifikat"
}: CertificateDownloaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(false);

  // Load preview directly onto a microscopic canvas, or handle drawing
  const generateCertificate = () => {
    setLoading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setLoading(false);
      return;
    }

    const img = new Image();
    img.src = settings.certificate_template_url;
    img.onload = () => {
      // Draw background template
      ctx.drawImage(img, 0, 0, 800, 600);

      // 1. Draw Student Name
      ctx.fillStyle = settings.cert_coord_name.font_color || "#1F2937";
      ctx.font = `bold ${settings.cert_coord_name.font_size}px 'Courier New', 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Center placement x
      ctx.fillText(studentName.toUpperCase(), settings.cert_coord_name.x, settings.cert_coord_name.y);

      // 2. Draw Course Title
      ctx.fillStyle = settings.cert_coord_course.font_color || "#10B981";
      ctx.font = `italic 600 ${settings.cert_coord_course.font_size}px 'Inter', sans-serif`;
      ctx.fillText(courseTitle, settings.cert_coord_course.x, settings.cert_coord_course.y);

      // 3. Draw Completion Date
      ctx.fillStyle = settings.cert_coord_date.font_color || "#4B5563";
      ctx.font = `normal ${settings.cert_coord_date.font_size}px 'Inter', sans-serif`;
      const dateStr = new Date(completionDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      ctx.fillText(`Lulus Tanggal: ${dateStr}`, settings.cert_coord_date.x, settings.cert_coord_date.y);

      // Trigger download
      setTimeout(() => {
        const link = document.createElement('a');
        link.download = `Sertifikat_BaitKhat_${studentName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setLoading(false);
      }, 800); // Simulate processing delay
    };

    img.onerror = () => {
      setLoading(false);
      alert("Gagal memuat template sertifikat. Pastikan template valid.");
    };
  };

  return (
    <div>
      <button
        id="btn-generate-cert-action"
        onClick={generateCertificate}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-55"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Memproses PDF Sertifikat...</span>
          </>
        ) : (
          <>
            <Award className="w-5 h-5" />
            <span>{buttonLabel}</span>
          </>
        )}
      </button>
    </div>
  );
}
