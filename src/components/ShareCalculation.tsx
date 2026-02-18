'use client';

/**
 * Share Calculation Component
 * 
 * UI for sharing calculation results via URL or shortlink.
 * 
 * @package Beregner.dk
 * @since 1.1.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Share2, Copy, Check, Link2, Twitter, Facebook, Mail, QrCode, X } from 'lucide-react';
import {
  ShareableLink,
  copyToClipboard,
  createShortlink
} from '@/lib/calculation-state';
import { trackShare, trackResultCopied } from '@/lib/analytics';

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
  
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleOpen = useCallback(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    const link = getShareableLink();
    setShareableLink(link);
    setIsOpen(true);
    setIsCopied(false);
    trackShare(calculatorName, 'open');
  }, [getShareableLink, calculatorName]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Restore focus to the button that opened the modal
    previousActiveElement.current?.focus();
  }, []);

  // Handle Escape key and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      // Focus trapping
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus the close button when modal opens
    setTimeout(() => closeButtonRef.current?.focus(), 0);

    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  const handleCopy = async () => {
    if (!shareableLink) return;
    
    const url = shareableLink.shortUrl || shareableLink.fullUrl;
    const success = await copyToClipboard(url);
    
    if (success) {
      setIsCopied(true);
      trackResultCopied(calculatorName);
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div 
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between">
              <div>
                <h2 id="share-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Del din beregning
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Andre kan se og genbruge dine indtastninger
                </p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={handleClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Luk dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* URL Copy Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link til beregning
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      aria-label="Delbart link"
                      className="w-full px-3 py-2 pr-10 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 truncate"
                    />
                    <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  </div>
                  <button
                    onClick={handleCopy}
                    aria-label={isCopied ? "Kopieret!" : "Kopier link"}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isCopied
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* Shortlink button */}
                {!shareableLink?.shortUrl && (
                  <button
                    onClick={handleCreateShortlink}
                    disabled={isCreatingShortlink}
                    className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:text-gray-400"
                  >
                    {isCreatingShortlink ? 'Opretter kort link...' : 'Opret kort link'}
                  </button>
                )}
              </div>

              {/* Social Share */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Del på sociale medier
                </label>
                <div className="flex gap-3">
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackShare(calculatorName, 'twitter')}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1DA1F2] text-white hover:opacity-90 transition-opacity"
                    aria-label="Del på Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackShare(calculatorName, 'facebook')}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
                    aria-label="Del på Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href={socialLinks.email}
                    onClick={() => trackShare(calculatorName, 'email')}
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
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    aria-label={showQr ? "Skjul QR-kode" : "Vis QR-kode"}
                    aria-pressed={showQr}
                  >
                    <QrCode className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {showQr && (
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`}
                      alt="QR kode til beregning"
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Scan for at åbne beregningen
                  </p>
                </div>
              )}

              {/* Result preview */}
              {resultSummary && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Resultat: {resultSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleClose}
                className="w-full py-2 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
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
