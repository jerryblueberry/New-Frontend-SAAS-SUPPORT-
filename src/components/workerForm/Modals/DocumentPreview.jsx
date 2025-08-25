import React, { useState, useEffect, useRef } from 'react';
import './DocumentPreview.css';
import { useMediaQuery } from '@mui/material';

const DocumentPreview = ({ document, onClose, certificateData }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfViewerFailed, setPdfViewerFailed] = useState(false);
  const modalRef = useRef(null);
  const pdfIframeRef = useRef(null);
  const pdfLoadTimeoutRef = useRef(null);
  
  const isPdf = document?.fileType === 'application/pdf';
  const isImage = document?.fileType?.includes('image');
  const encodedUrl = document?.url?.replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/ /g, '%20');
  const isDesktop = useMediaQuery('(min-width:768px)');
  console.log('Certifiacate Data',certificateData)

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

  // Reset zoom and rotation when document changes
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
    setPageNumber(1);
    setIsLoading(true);
    setPdfViewerFailed(false);
    
    if (pdfLoadTimeoutRef.current) {
      clearTimeout(pdfLoadTimeoutRef.current);
    }
  }, [document]);

  // For PDFs, set up timeout to detect loading failures
  useEffect(() => {
    if (isPdf && isLoading) {
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
  
  const handleContentLoad = () => {
    if (pdfLoadTimeoutRef.current) {
      clearTimeout(pdfLoadTimeoutRef.current);
    }
    setIsLoading(false);
  };

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
  const rotateClockwise = () => setRotation(prev => (prev + 90) % 360);
  const changePage = (offset) => setPageNumber(prev => Math.max(1, prev + offset));

  const retryPdfLoad = () => {
    setPdfViewerFailed(false);
    setIsLoading(true);
    
    const iframe = pdfIframeRef.current;
    if (iframe) {
      const parent = iframe.parentNode;
      parent.removeChild(iframe);
      setTimeout(() => {
        parent.appendChild(iframe);
      }, 100);
    }
  };

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

  const getPdfViewerUrl = () => {
    try {
      return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(document.url)}`;
    } catch (e) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`;
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderCertificateDetails = () => {
    if (!certificateData) return null;
    
    return (
      <div className="doc-preview__sidebar">
        <h4 className="doc-preview__certificate-title">Certificate Details</h4>
        
        <div className="doc-preview__detail-row">
          <span className="doc-preview__detail-label">Name:</span>
          <span className="doc-preview__detail-value">{certificateData?.certificationType?.name||certificateData?.certificationTitle  || '-'}</span>
        </div>

        {(certificateData.number && certificateData.certificationType?.name === 'Driving License') ? (
          <div className="doc-preview__detail-row">
            <span className="doc-preview__detail-label">License No:</span>
            <span className="doc-preview__detail-value">{certificateData.number}</span>
          </div>
        ) : certificateData.number ? (
          <div className="doc-preview__detail-row">
            <span className="doc-preview__detail-label">Number:</span>
            <span className="doc-preview__detail-value">{certificateData.number}</span>
          </div>
        ) : null}
        
        {certificateData.country && (
          <div className="doc-preview__detail-row">
            <span className="doc-preview__detail-label">Country:</span>
            <span className="doc-preview__detail-value">{certificateData.country}</span>
          </div>
        )}
        
        {certificateData.issuer && (
          <div className="doc-preview__detail-row">
            <span className="doc-preview__detail-label">Issuer:</span>
            <span className="doc-preview__detail-value">{certificateData.issuer}</span>
          </div>
        )}
        
        {certificateData.issuedDate && (
          <div className="doc-preview__detail-row">
            <span className="doc-preview__detail-label">Issued:</span>
            <span className="doc-preview__detail-value">{formatDateTime(certificateData.issuedDate)}</span>
          </div>
        )}
        
        {certificateData.expiryDate && (
          <div className="doc-preview__detail-row">
            <span className="doc-preview__detail-label">Expires:</span>
            <span className="doc-preview__detail-value">{formatDateTime(certificateData.expiryDate)}</span>
          </div>
        )}
        
        {typeof certificateData.degree === 'string' && certificateData.degree.trim() !== '' && (
          <div className="doc-preview__detail-row">
            <span className="doc-preview__detail-label">Degree:</span>
            <span className="doc-preview__detail-value">{certificateData.degree}</span>
          </div>
        )}
        
        {certificateData.verificationStatus && (
          <div className="doc-preview__detail-row">
            <span className="doc-preview__detail-label">Status:</span>
            <span className="doc-preview__detail-value">{certificateData.verificationStatus}</span>
          </div>
        )}
        
        {certificateData.rejectionReason && (
          <div className="doc-preview__detail-row">
            <span className="doc-preview__detail-label">Rejection Reason:</span>
            <span className="doc-preview__detail-value">{certificateData.rejectionReason}</span>
          </div>
        )}
      </div>
    );
  };

  if (!document) {
    return null;
  }

  return (
    <div className="doc-preview">
      <div className="doc-preview__overlay" onClick={onClose}></div>
      <div className="doc-preview__container" ref={modalRef}>
        <div className="doc-preview__header">
          <div className="doc-preview__title">
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
        
        <div className="doc-preview__main-content">
          {isDesktop && renderCertificateDetails()}
          
          <div className="doc-preview__document-container">
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
                  <>
                    <iframe 
                      ref={pdfIframeRef}
                      src={getPdfViewerUrl()}
                      title={document.fileName}
                      className="doc-preview__pdf"
                      onLoad={handleContentLoad}
                      onError={handlePdfError}
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                    <div className="doc-preview__pdf-controls">
                      <button 
                        className="doc-preview__page-btn"
                        onClick={() => changePage(-1)}
                        disabled={pageNumber <= 1}
                        aria-label="Previous page"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      <div className="doc-preview__page-control">
                        Page {pageNumber}
                      </div>
                      <button 
                        className="doc-preview__page-btn"
                        onClick={() => changePage(1)}
                        aria-label="Next page"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="doc-preview__unsupported">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <h4>PDF viewer could not load</h4>
                    <p>The PDF viewer experienced an issue loading this document.</p>
                    <button 
                      type="button"
                      className="doc-preview__download-btn"
                      onClick={retryPdfLoad}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 4v6h-6"></path>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                      </svg>
                      Retry Loading
                    </button>
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
                      Download PDF
                    </a>
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
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;