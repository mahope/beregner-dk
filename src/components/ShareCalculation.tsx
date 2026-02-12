'use client';

/**
 * Share Calculation Component
 * 
 * UI for sharing calculation results via URL or shortlink.
 * 
 * @package Beregner.dk
 * @since 1.1.0
 */

import { useState, useCallback } from 'react';
import { Share2, Copy, Check, Link2, Twitter, Facebook, Mail, QrCode } from 'lucide-react';
import { 
  ShareableLink, 
  copyToClipboard, 
  createShortlink 
} from '@/lib/calculation-state';

interface ShareCalculationProps {
  getShareableLink: () => ShareableLink;
  calculatorName: string;
  resultSummary?: string;
}

export function ShareCalculation({
  getShareableLink,
  calculatorName,
  resultSummary,
}: ShareCalculationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState<ShareableLink | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCreatingShortlink, setIsCreatingShortlink] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleOpen = useCallback(() => {
    const link = getShareableLink();
    setShareableLink(link);
    setIsOpen(true);
    setIsCopied(false);
  }, [getShareableLink]);

  const handleCopy = async () => {
    if (!shareableLink) return;
    
    const url = shareableLink.shortUrl || shareableLink.fullUrl;
    const success = await copyToClipboard(url);
    
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCreateShortlink = async () => {
    if (!shareableLink || shareableLink.shortUrl) return;
    
    setIsCreatingShortlink(true);
    const result = await createShortlink(shareableLink.fullUrl);
    setShareableLink(result);
    setIsCreatingShortlink(false);
  };

  const shareUrl = shareableLink?.shortUrl || shareableLink?.fullUrl || '';
  const shareText = resultSummary 
    ? `${calculatorName}: ${resultSummary}` 
    : `Se min beregning på ${calculatorName}`;

  const socialLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(`${calculatorName} beregning`)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        aria-label="Del beregning"
      >
        <Share2 className="w-4 h-4" />
        <span>Del beregning</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Del din beregning
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Andre kan se og genbruge dine indtastninger
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* URL Copy Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link til beregning
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="w-full px-3 py-2 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600 truncate"
                    />
                    <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isCopied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Shortlink button */}
                {!shareableLink?.shortUrl && (
                  <button
                    onClick={handleCreateShortlink}
                    disabled={isCreatingShortlink}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                  >
                    {isCreatingShortlink ? 'Opretter kort link...' : 'Opret kort link'}
                  </button>
                )}
              </div>

              {/* Social Share */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Del på sociale medier
                </label>
                <div className="flex gap-3">
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1DA1F2] text-white hover:opacity-90 transition-opacity"
                    aria-label="Del på Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
                    aria-label="Del på Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href={socialLinks.email}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-600 text-white hover:opacity-90 transition-opacity"
                    aria-label="Del via email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => setShowQr(!showQr)}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                      showQr
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-label="Vis QR-kode"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {showQr && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="inline-block p-4 bg-white rounded-lg">
                    {/* QR code would be generated here - using placeholder */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`}
                      alt="QR kode"
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Scan for at åbne beregningen
                  </p>
                </div>
              )}

              {/* Result preview */}
              {resultSummary && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Resultat: {resultSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
              >
                Luk
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ShareCalculation;
