/**
 * Document Tracking Service
 * Manages document tracking in localStorage for certification onboarding
 * 
 * Best Practices:
 * - Single source of truth for document tracking
 * - Automatic cleanup on deletion
 * - Sync with Zustand store when available
 * - Robust error handling
 */

const DOCUMENT_TRACKING_KEY = 'certification_documents_tracking';
const UNTRACKED_DOCUMENTS_KEY = 'untracked_documents';

/**
 * Optional Zustand store sync callback
 * Set this from the component level to enable sync between localStorage and Zustand
 */
let zustandSyncCallback = null;

/**
 * Set the Zustand sync callback
 * @param {Function} callback - Function that receives (action, publicId, data) and syncs with Zustand
 */
export const setZustandSyncCallback = (callback) => {
  zustandSyncCallback = callback;
};

/**
 * Clear the Zustand sync callback
 */
export const clearZustandSyncCallback = () => {
  zustandSyncCallback = null;
};

export const DocumentTrackingService = {
  // Get all tracked document public IDs
  getTrackedDocuments: () => {
    try {
      const stored = localStorage.getItem(DOCUMENT_TRACKING_KEY);
      if (!stored) return {};

      const parsed = JSON.parse(stored);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
      console.error('Error reading tracked documents from localStorage:', error);
      return {};
    }
  },

  // Add a document public ID to tracking with full document data
  // SaaS-level: Syncs with Zustand store for consistency
  addTrackedDocument: (publicId, documentData = {}) => {
    try {
      // Validate input
      if (!publicId || typeof publicId !== 'string') {
        console.error('❌ Invalid publicId provided for document tracking');
        return false;
      }

      const tracked = DocumentTrackingService.getTrackedDocuments();

      // Add document with full metadata
      const documentMetadata = {
        publicId,
        url: documentData.url || '',
        fileName: documentData.fileName || '',
        fileType: documentData.fileType || '',
        documentName: documentData.documentName || `Document ${publicId}`,
        documentType: documentData.documentType || 'Support Worker',
        trackedAt: new Date().toISOString(),
        isUsed: false, // Will be set to true when used in certifications
        ...documentData
      };

      tracked[publicId] = documentMetadata;
      localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(tracked));

      // Sync with Zustand store if callback is set
      if (zustandSyncCallback) {
        try {
          zustandSyncCallback('add', publicId, documentMetadata);
        } catch (storeError) {
          console.debug('Zustand store sync skipped:', storeError.message);
        }
      }

      console.log(`✅ Document tracked: ${publicId}`, documentMetadata);
      return true;
    } catch (error) {
      console.error('❌ Error adding document to tracking:', error);
      return false;
    }
  },

  // Check if document public ID is already tracked
  isDocumentTracked: (publicId) => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      return tracked.hasOwnProperty(publicId);
    } catch (error) {
      console.error('Error checking document tracking status:', error);
      return false;
    }
  },

  // Remove document public ID from tracking
  // SaaS-level: Syncs with Zustand store and cleans up properly
  removeTrackedDocument: (publicId) => {
    try {
      if (!publicId || typeof publicId !== 'string') {
        console.warn('Invalid publicId provided for removal');
        return false;
      }

      const tracked = DocumentTrackingService.getTrackedDocuments();
      let removed = false;

      // Remove from localStorage tracking
      if (tracked[publicId]) {
        delete tracked[publicId];
        localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(tracked));
        removed = true;
      }

      // Sync with Zustand store if callback is set
      if (zustandSyncCallback) {
        try {
          zustandSyncCallback('remove', publicId, null);
        } catch (storeError) {
          console.debug('Zustand store sync skipped:', storeError.message);
        }
      }

      if (removed) {
        console.log(`✅ Document removed from tracking: ${publicId}`);
      } else {
        console.warn(`⚠️ Document not found in tracking: ${publicId}`);
      }

      return removed;
    } catch (error) {
      console.error('❌ Error removing document from tracking:', error);
      return false;
    }
  },

  // Mark document as used in certifications
  // SaaS-level: Syncs with Zustand store
  markDocumentAsUsed: (publicId) => {
    try {
      if (!publicId || typeof publicId !== 'string') {
        console.warn('Invalid publicId provided for marking as used');
        return false;
      }

      const tracked = DocumentTrackingService.getTrackedDocuments();
      if (tracked[publicId]) {
        tracked[publicId].isUsed = true;
        tracked[publicId].usedAt = new Date().toISOString();
        localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(tracked));

        // Sync with Zustand store if callback is set
        if (zustandSyncCallback) {
          try {
            zustandSyncCallback('markUsed', publicId, {
              isUsed: true,
              usedAt: new Date().toISOString()
            });
          } catch (storeError) {
            console.debug('Zustand store sync skipped:', storeError.message);
          }
        }

        console.log(`✅ Document marked as used: ${publicId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error marking document as used:', error);
      return false;
    }
  },

  // Get tracking statistics
  getTrackingStats: () => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      const publicIds = Object.keys(tracked);
      const usedDocs = Object.values(tracked).filter(doc => doc.isUsed);
      const unusedDocs = Object.values(tracked).filter(doc => !doc.isUsed);

      return {
        totalTracked: publicIds.length,
        usedDocuments: usedDocs.length,
        unusedDocuments: unusedDocs.length,
        publicIds: publicIds,
        usedPublicIds: usedDocs.map(doc => doc.publicId),
        unusedPublicIds: unusedDocs.map(doc => doc.publicId)
      };
    } catch (error) {
      console.error('Error getting tracking statistics:', error);
      return { totalTracked: 0, usedDocuments: 0, unusedDocuments: 0, publicIds: [], usedPublicIds: [], unusedPublicIds: [] };
    }
  },

  // Get unused documents (untracked documents)
  getUnusedDocuments: () => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      return Object.values(tracked).filter(doc => !doc.isUsed);
    } catch (error) {
      console.error('Error getting unused documents:', error);
      return [];
    }
  },

  // Clean up unused documents (called during submit)
  // SaaS-level: Also syncs with Zustand store
  cleanupUnusedDocuments: () => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      const unusedDocs = Object.values(tracked).filter(doc => !doc.isUsed);

      // Remove unused documents from tracking
      unusedDocs.forEach(doc => {
        delete tracked[doc.publicId];
        
        // Also remove from Zustand store if callback is set
        if (zustandSyncCallback) {
          try {
            zustandSyncCallback('remove', doc.publicId, null);
          } catch (storeError) {
            console.debug('Zustand cleanup sync skipped:', storeError.message);
          }
        }
      });

      localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(tracked));
      console.log(`✅ Cleaned up ${unusedDocs.length} unused documents from tracking`);
      return unusedDocs.length;
    } catch (error) {
      console.error('❌ Error cleaning up unused documents:', error);
      return 0;
    }
  },

  /**
   * Clean up orphaned documents (documents in tracking but not in certifications)
   * SaaS-level: Removes documents that are no longer referenced
   * @param {Array<string>} activePublicIds - Array of publicIds currently in use
   * @returns {number} Number of documents cleaned up
   */
  cleanupOrphanedDocuments: (activePublicIds = []) => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      const trackedPublicIds = Object.keys(tracked);
      const activeIdsSet = new Set(activePublicIds);
      
      // Find orphaned documents (in tracking but not in active list)
      const orphanedIds = trackedPublicIds.filter(id => !activeIdsSet.has(id));
      
      // Remove orphaned documents
      orphanedIds.forEach(publicId => {
        delete tracked[publicId];
        
        // Also remove from Zustand store if callback is set
        if (zustandSyncCallback) {
          try {
            zustandSyncCallback('remove', publicId, null);
          } catch (storeError) {
            console.debug('Zustand orphan cleanup sync skipped:', storeError.message);
          }
        }
      });

      if (orphanedIds.length > 0) {
        localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(tracked));
        console.log(`✅ Cleaned up ${orphanedIds.length} orphaned documents from tracking`);
      }
      
      return orphanedIds.length;
    } catch (error) {
      console.error('❌ Error cleaning up orphaned documents:', error);
      return 0;
    }
  },

  // Clean up old documents (older than specified days)
  cleanupOldDocuments: (daysOld = 30) => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let cleanedCount = 0;
      Object.keys(tracked).forEach(publicId => {
        const trackedAt = new Date(tracked[publicId].trackedAt);
        if (trackedAt < cutoffDate && !tracked[publicId].isUsed) {
          delete tracked[publicId];
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(tracked));
        console.log(`Cleaned up ${cleanedCount} old unused documents from tracking`);
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up old documents:', error);
      return 0;
    }
  },

  // Clear all tracked documents
  // SaaS-level: Also syncs with Zustand store
  clearAllTrackedDocuments: () => {
    try {
      localStorage.removeItem(DOCUMENT_TRACKING_KEY);
      
      // Also clear from Zustand store if callback is set
      if (zustandSyncCallback) {
        try {
          // Get all current tracked documents and remove them
          const tracked = DocumentTrackingService.getTrackedDocuments();
          const publicIds = Object.keys(tracked);
          publicIds.forEach(publicId => {
            zustandSyncCallback('remove', publicId, null);
          });
        } catch (storeError) {
          console.debug('Zustand clear sync skipped:', storeError.message);
        }
      }
      
      console.log('✅ All tracked documents cleared from localStorage');
      return true;
    } catch (error) {
      console.error('❌ Error clearing tracked documents:', error);
      return false;
    }
  },

  /**
   * SaaS-Level: Load documents from backend and populate localStorage
   * Backend is the source of truth
   * @param {Array} backendDocuments - Array of documents from backend API
   * @returns {number} Number of documents loaded
   */
  loadFromBackend: (backendDocuments = []) => {
    try {
      if (!Array.isArray(backendDocuments) || backendDocuments.length === 0) {
        console.log('No backend documents to load');
        return 0;
      }

      // Clear existing localStorage (backend is source of truth)
      localStorage.removeItem(DOCUMENT_TRACKING_KEY);
      
      const tracked = {};
      let loadedCount = 0;

      backendDocuments.forEach(doc => {
        const publicId = doc.documentUrl || doc.publicId;
        if (!publicId) {
          console.warn('⚠️ Backend document missing publicId/documentUrl, skipping:', doc);
          return;
        }

        tracked[publicId] = {
          publicId,
          url: doc.documentUrl || doc.url || '',
          fileName: doc.fileName || '',
          fileType: doc.fileType || '',
          documentName: doc.documentName || `Document ${publicId}`,
          documentType: doc.documentType || 'Support Worker',
          trackedAt: doc.uploadDate || doc.trackedAt || new Date().toISOString(),
          isUsed: doc.isUsed || false,
          additionalInfo: doc.additionalInfo || {}
        };
        loadedCount++;
      });

      localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(tracked));
      console.log(`✅ Loaded ${loadedCount} documents from backend to localStorage`);
      
      return loadedCount;
    } catch (error) {
      console.error('❌ Error loading documents from backend:', error);
      return 0;
    }
  },

  // Export tracking data for backup
  exportTrackingData: () => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      const stats = DocumentTrackingService.getTrackingStats();
      return {
        trackedDocuments: tracked,
        statistics: stats,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting tracking data:', error);
      return null;
    }
  },

  // Import tracking data from backup
  importTrackingData: (data) => {
    try {
      if (data && data.trackedDocuments) {
        localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(data.trackedDocuments));
        console.log('Tracking data imported successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing tracking data:', error);
      return false;
    }
  }
};

