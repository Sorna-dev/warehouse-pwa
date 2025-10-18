'use client';

import { useState } from 'react';
import { Share2, Download, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { ContainerData, BOX_BLUE, BOX_DARK_BLUE, BOX_SUCCESS, BOX_GRAY, BOX_BORDER } from '../types';

interface PDFPreviewProps {
  container: ContainerData;
}

export default function PDFPreview({ container }: PDFPreviewProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (container.driveLink) {
      await navigator.clipboard.writeText(container.driveLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Success Banner */}
      <div className="bg-white rounded-lg border p-4" style={{ borderColor: BOX_SUCCESS, borderWidth: 2 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
            <CheckCircle2 size={24} style={{ color: BOX_SUCCESS }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: BOX_DARK_BLUE }}>Container Completed</h3>
            <p className="text-sm" style={{ color: BOX_GRAY }}>All files uploaded successfully</p>
          </div>
        </div>
      </div>

      {/* Container Details */}
      <div className="bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: BOX_BORDER }}>
          <h2 className="font-medium text-sm" style={{ color: BOX_DARK_BLUE }}>Container Details</h2>
        </div>
        <div className="p-4 space-y-3">
          <DetailRow label="Container #" value={container.containerNumber} />
          <DetailRow label="Operation" value={container.operationType} />
          <DetailRow label="Door" value={container.doorNumber} />
          <DetailRow label="Photos" value={`${container.photos.length} uploaded`} />
          <DetailRow label="Completed" value={new Date(container.updatedAt).toLocaleString()} />
        </div>
      </div>

      {/* Shareable Link */}
      {container.driveLink && (
        <div className="bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: BOX_BORDER }}>
            <h2 className="font-medium text-sm flex items-center gap-2" style={{ color: BOX_DARK_BLUE }}>
              <Share2 size={16} />
              Shareable PDF Link
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm" style={{ color: BOX_GRAY }}>
              Share this link with anyone to view the PDF report. No login required.
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={container.driveLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded text-sm bg-gray-50"
                style={{ borderColor: BOX_BORDER }}
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded flex items-center gap-2"
                style={{ backgroundColor: copied ? BOX_SUCCESS : BOX_BLUE, color: 'white' }}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-2">
              <a
                href={container.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 rounded font-medium flex items-center justify-center gap-2 border"
                style={{ borderColor: BOX_BORDER, color: BOX_BLUE }}
              >
                <ExternalLink size={18} />
                Open PDF
              </a>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `${container.driveLink}`;
                  link.download = `${container.containerNumber}_Report.pdf`;
                  link.click();
                }}
                className="flex-1 px-4 py-2.5 rounded font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: BOX_BLUE, color: 'white' }}
              >
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      {container.photos.length > 0 && (
        <div className="bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: BOX_BORDER }}>
            <h2 className="font-medium text-sm" style={{ color: BOX_DARK_BLUE }}>
              Photos ({container.photos.length})
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {container.photos.map((photo, index) => (
                <div key={photo.id} className="relative border rounded overflow-hidden" style={{ borderColor: BOX_BORDER }}>
                  <img
                    src={photo.src}
                    alt={`Photo ${index + 1}`}
                    style={{ transform: `rotate(${photo.rotation}deg)` }}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm" style={{ color: BOX_GRAY }}>{label}:</span>
      <span className="text-sm font-medium" style={{ color: BOX_DARK_BLUE }}>{value}</span>
    </div>
  );
}