/**
 * useWorkerModal Hook
 * 
 * Hook for managing worker detail modal state and interactions.
 */

import { useState, useCallback } from 'react';

/**
 * Custom hook for worker detail modal
 * 
 * @returns {Object} Modal state and handlers
 */
export const useWorkerModal = () => {
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = useCallback((workerId) => {
    setSelectedWorkerId(workerId);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    // Delay to allow fade out animation
    setTimeout(() => setSelectedWorkerId(null), 200);
  }, []);

  return {
    selectedWorkerId,
    modalOpen,
    handleOpenModal,
    handleCloseModal
  };
};
