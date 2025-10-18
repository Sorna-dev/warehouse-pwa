'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Share2, Download, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { ContainerData, BOX_BLUE, BOX_DARK_BLUE, BOX_SUCCESS, BOX_GRAY, BOX_BORDER } from '@/app/types';

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const [container, setContainer] = useState<ContainerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadContainer();
  }, [params.id]);

  const loadContainer = () => {
    const saved = localStorage.getItem('warehouse-containers');
    if (saved) {
      const containers: ContainerData[] = JSON.parse(saved);
      const found = containers.find(c => c.id === params.id);
      if (found) {
        setContainer(found);
      }
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    if (container?.driveLink) {
      await navigator.clipboard.writeText(container.driveLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" 
          style={{ borderColor: BOX_BLUE }}
        ></div>
      </div>
    );
  }

  if (!container) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: BOX_DARK_BLUE }}>
            Container Not Found
          </h2>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="text-blue-600 underline"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10" style={{ borderColor: BOX_BORDER }}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-1">
              <ChevronLeft size={24} style={{ color: BOX_DARK_BLUE }} />
            </button>
            <h1 className="text-lg font-semibold" style={{ color: BOX_DARK_BLUE }}>
              Container Preview
            </h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Success Banner */}
        <div 
          className="bg-white rounded-lg border p-4" 
          style={{ borderColor: BOX_SUCCESS, borderWidth: 2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center" 
              style={{ backgroundColor: '#E8F5E9' }}
            >
              <CheckCircle2 size={24} style={{ color: BOX_SUCCESS }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BOX_DARK_BLUE }}>
                Container Completed
              </h3>
              <p className="text-sm" style={{ color: BOX_GRAY }}>
                All files uploaded successfully
              </p>
            </div>
          </div>
        </div>

        {/* Container Details */}
        <div className="bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: BOX_BORDER }}>
            <h2 className="font-medium text-sm" style={{ color: BOX_DARK_BLUE }}>
              Container Details
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <DetailRow label="Container #" value={container.containerNumber} />
            <DetailRow label="Operation" value={container.operationType} />
            <DetailRow label="Door" value={container.doorNumber} />
            <DetailRow label="Photos" value={`${container.photos.length} uploaded`} />
            <DetailRow 
              label="Completed" 
              value={new Date(container.updatedAt).toLocaleString()} 
            />
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
                  style={{ 
                    backgroundColor: copied ? BOX_SUCCESS : BOX_BLUE, 
                    color: 'white' 
                  }}
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
                    link.href = container.driveLink ?? '';
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

        {/* Photo Gallery Preview */}
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
                  <div 
                    key={photo.id} 
                    className="relative border rounded overflow-hidden" 
                    style={{ borderColor: BOX_BORDER }}
                  >
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

        {/* Piece Count Summary */}
        {container.pieceCount.length > 0 && (
          <div className="bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: BOX_BORDER }}>
              <h2 className="font-medium text-sm" style={{ color: BOX_DARK_BLUE }}>
                Piece Count
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {container.pieceCount.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span style={{ color: BOX_GRAY }}>{item.type}</span>
                  <span className="font-medium" style={{ color: BOX_DARK_BLUE }}>
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discrepancies */}
        {container.discrepancies && (
          <div className="bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: BOX_BORDER }}>
              <h2 className="font-medium text-sm" style={{ color: BOX_DARK_BLUE }}>
                Discrepancies
              </h2>
            </div>
            <div className="p-4">
              <p className="text-sm" style={{ color: BOX_GRAY }}>
                {container.discrepancies}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg border p-4" style={{ borderColor: BOX_BORDER }}>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 rounded font-medium"
            style={{ backgroundColor: BOX_BLUE, color: 'white' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm" style={{ color: BOX_GRAY }}>{label}:</span>
      <span className="text-sm font-medium" style={{ color: BOX_DARK_BLUE }}>
        {value}
      </span>
    </div>
  );
}