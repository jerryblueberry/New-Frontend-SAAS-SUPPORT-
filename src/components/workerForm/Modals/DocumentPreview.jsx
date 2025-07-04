import React, { useState, useEffect, useRef } from 'react';
import './DocumentPreview.css';

const DocumentPreview = ({ document, onClose,onDelete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfViewerFailed, setPdfViewerFailed] = useState(false);
  const modalRef = useRef(null);
  const pdfIframeRef = useRef(null);
  const pdfLoadTimeoutRef = useRef(null);
  
  // Determine file type
  const isPdf = document?.fileType === 'application/pdf';
  const isImage = document?.fileType?.includes('image');
  
  // Ensure URL is properly encoded for special characters
  const encodedUrl = document?.url?.replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/ /g, '%20');
  
  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Add touch events for swipe to close on mobile
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    let touchStartY = 0;
    let touchEndY = 0;
    const minSwipeDistance = 100;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      touchEndY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (touchStartY - touchEndY > minSwipeDistance) {
        // Swipe up - no action
      } else if (touchEndY - touchStartY > minSwipeDistance) {
        // Swipe down - close the preview
        onClose();
      }
      touchStartY = 0;
      touchEndY = 0;
    };

    modal.addEventListener('touchstart', handleTouchStart);
    modal.addEventListener('touchmove', handleTouchMove);
    modal.addEventListener('touchend', handleTouchEnd);

    return () => {
      modal.removeEventListener('touchstart', handleTouchStart);
      modal.removeEventListener('touchmove', handleTouchMove);
      modal.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onClose]);
  
  // Reset zoom and rotation when document changes
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
    setPageNumber(1);
    setIsLoading(true);
    setPdfViewerFailed(false);
    
    // Clear any existing timeouts
    if (pdfLoadTimeoutRef.current) {
      clearTimeout(pdfLoadTimeoutRef.current);
    }
  }, [document]);

  // For PDFs, set up timeout to detect loading failures
  useEffect(() => {
    if (isPdf && isLoading) {
      // Set a timeout to detect if PDF loading takes too long (8 seconds)
      pdfLoadTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setPdfViewerFailed(true);
          setIsLoading(false);
        }
      }, 8000);
    }

    return () => {
      if (pdfLoadTimeoutRef.current) {
        clearTimeout(pdfLoadTimeoutRef.current);
      }
    };
  }, [isPdf, isLoading]);
  
  // Handle content load completion
  const handleContentLoad = () => {
    // Clear the timeout as content has loaded
    if (pdfLoadTimeoutRef.current) {
      clearTimeout(pdfLoadTimeoutRef.current);
    }
    setIsLoading(false);
  };

  // Handle iframe error
  const handlePdfError = () => {
    setPdfViewerFailed(true);
    setIsLoading(false);
    if (pdfLoadTimeoutRef.current) {
      clearTimeout(pdfLoadTimeoutRef.current);
    }
  };
  
  // Zoom control functions
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setZoomLevel(1);
  
  // Rotation function
  const rotateClockwise = () => setRotation(prev => (prev + 90) % 360);
  
  // For PDFs with pagination
  const changePage = (offset) => {
    setPageNumber(prev => Math.max(1, prev + offset));
  };

  // Prevent modal click from propagating to overlay
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Try to reload the PDF viewer
  const retryPdfLoad = () => {
    setPdfViewerFailed(false);
    setIsLoading(true);
    
    // Force iframe reload by temporarily removing it from the DOM
    const iframe = pdfIframeRef.current;
    if (iframe) {
      const parent = iframe.parentNode;
      parent.removeChild(iframe);
      setTimeout(() => {
        parent.appendChild(iframe);
      }, 100);
    }
  };

  // Render file type icon based on document type
  const renderFileIcon = () => {
    if (isImage) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      );
    } else if (isPdf) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      );
    } else {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
      );
    }
  };

  // Get PDF direct embed URL
  const getPdfViewerUrl = () => {
    // Try using PDF.js viewer first (more reliable than Google Docs viewer)
    try {
      return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(document.url)}`;
    } catch (e) {
      // Fall back to Google Docs viewer
      return `https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`;
    }
  };

  if (!document) {
    return null;
  }

  return (
    <div className="doc-preview">
      <div className="doc-preview__overlay" onClick={onClose}></div>
      <div className="doc-preview__container" ref={modalRef} onClick={handleModalClick}>
        {/* Mobile close indicator */}
        <div className="doc-preview__mobile-close-indicator">
          <div className="doc-preview__drag-handle"></div>
          <span className="doc-preview__mobile-close-text">Swipe down to close</span>
        </div>
        
        <div className="doc-preview__header">
          <div className="doc-preview__title">
            <button 
              type="button" 
              className="doc-preview__back-btn" 
              onClick={onClose} 
              aria-label="Close preview"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <span className="doc-preview__icon">
              {renderFileIcon()}
            </span>
            <h3 title={document.fileName}>{document.fileName}</h3>
          </div>
          
          <div className="doc-preview__actions">
            <button 
              type="button" 
              className="doc-preview__action-btn" 
              onClick={zoomOut}
              aria-label="Zoom out"
              disabled={zoomLevel <= 0.5}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </button>
            
            <span className="doc-preview__zoom-level">{Math.round(zoomLevel * 100)}%</span>
            
            <button 
              type="button" 
              className="doc-preview__action-btn" 
              onClick={zoomIn} 
              aria-label="Zoom in"
              disabled={zoomLevel >= 3}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </button>
            
            <button 
              type="button" 
              className="doc-preview__action-btn" 
              onClick={resetZoom} 
              aria-label="Reset zoom"
              disabled={zoomLevel === 1 && rotation === 0}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 3H3v18h18V3z"></path>
                <path d="M21 3l-9 9"></path>
              </svg>
            </button>
            
            <button 
              type="button" 
              className="doc-preview__action-btn" 
              onClick={rotateClockwise} 
              aria-label="Rotate"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
            </button>
            
            <a 
              href={document.url} 
              download={document.fileName}
              className="doc-preview__action-btn"
              aria-label="Download"
              title="Download file"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </a>
            
            <button 
              type="button" 
              className="doc-preview__action-btn doc-preview__close-btn" 
              onClick={onClose} 
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="doc-preview__content">
          {isLoading && (
            <div className="doc-preview__loading" aria-live="polite">
              <div className="doc-preview__spinner" aria-hidden="true"></div>
              <span>Loading document...</span>
            </div>
          )}
          
          {isImage ? (
            <div 
              className="doc-preview__image-container"
              style={{ 
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                opacity: isLoading ? 0 : 1
              }}
            >
              <img 
                src={document.url} 
                alt={document.fileName}
                onLoad={handleContentLoad}
                className="doc-preview__image"
              />
            </div>
          ) : isPdf ? (
            <div className="doc-preview__pdf-container">
              {!pdfViewerFailed ? (
                <iframe 
                  ref={pdfIframeRef}
                  src={getPdfViewerUrl()}
                  title={document.fileName}
                  className="doc-preview__pdf"
                  onLoad={handleContentLoad}
                  onError={handlePdfError}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              ) : (
                <div className="doc-preview__pdf-fallback">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <h4>PDF viewer could not load</h4>
                  <p>The PDF viewer experienced an issue loading this document.</p>
                  <div className="doc-preview__fallback-actions">
                    <button 
                      type="button"
                      className="doc-preview__retry-btn"
                      onClick={retryPdfLoad}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 4v6h-6"></path>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                      </svg>
                      Retry
                    </button>
                    <a 
                      href={document.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="doc-preview__pdf-link"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      Open in new tab
                    </a>
                    <a 
                      href={document.url} 
                      download={document.fileName}
                      className="doc-preview__download-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="doc-preview__unsupported">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
              <h4>Preview not available</h4>
              <p>This file type cannot be previewed. Please download the file to view it.</p>
              <a 
                href={document.url} 
                download={document.fileName}
                className="doc-preview__download-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download File
              </a>
            </div>
          )}
        </div>
        
        {/* Mobile action bar at bottom for easy access */}
        <div className="doc-preview__mobile-actions">
          <button 
            type="button" 
            className="doc-preview__mobile-action-btn" 
            onClick={onClose}
            aria-label="Close preview"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Close
          </button>
          
          <a 
            href={document.url} 
            download={document.fileName}
            className="doc-preview__mobile-action-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;