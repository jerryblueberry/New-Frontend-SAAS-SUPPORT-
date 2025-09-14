import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  createProgressNote, 
  updateProgressNote, 
  deleteProgressNote, 
  fetchProgressNotes,
  getProgressNoteById,
  getProgressNotesByWorker,
  getProgressNotesByClient,
  searchProgressNotes
} from '../api/progressNote';

// Query keys for caching
export const progressNoteKeys = {
  all: ['progressNotes'],
  lists: () => [...progressNoteKeys.all, 'list'],
  list: (filters) => [...progressNoteKeys.lists(), filters],
  details: () => [...progressNoteKeys.all, 'detail'],
  detail: (id) => [...progressNoteKeys.details(), id],
  byTimesheet: (timesheetId) => [...progressNoteKeys.all, 'timesheet', timesheetId],
  byWorker: (workerId) => [...progressNoteKeys.all, 'worker', workerId],
  byClient: (clientName) => [...progressNoteKeys.all, 'client', clientName],
  search: (searchTerm, filters) => [...progressNoteKeys.all, 'search', searchTerm, filters],
};

// Hook for fetching progress notes by timesheet
export const useProgressNotesByTimesheet = (timesheetId, workerId, options = {}) => {
  return useQuery({
    queryKey: progressNoteKeys.byTimesheet(timesheetId),
    queryFn: () => fetchProgressNotes({ timesheetId, workerId, ...options }),
    enabled: !!timesheetId && !!workerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

// Hook for fetching a single progress note
export const useProgressNote = (noteId, options = {}) => {
  return useQuery({
    queryKey: progressNoteKeys.detail(noteId),
    queryFn: () => getProgressNoteById(noteId),
    enabled: !!noteId,
    staleTime: 5 * 60 * 1000,
    ...options
  });
};

// Hook for fetching progress notes by worker
export const useProgressNotesByWorker = (workerId, page = 1, limit = 10, options = {}) => {
  return useQuery({
    queryKey: progressNoteKeys.byWorker(workerId),
    queryFn: () => getProgressNotesByWorker(workerId, page, limit),
    enabled: !!workerId,
    staleTime: 5 * 60 * 1000,
    ...options
  });
};

// Hook for fetching progress notes by client
export const useProgressNotesByClient = (clientName, page = 1, limit = 10, options = {}) => {
  return useQuery({
    queryKey: progressNoteKeys.byClient(clientName),
    queryFn: () => getProgressNotesByClient(clientName, page, limit),
    enabled: !!clientName,
    staleTime: 5 * 60 * 1000,
    ...options
  });
};

// Hook for searching progress notes
export const useSearchProgressNotes = (searchTerm, filters = {}, page = 1, limit = 10, options = {}) => {
  return useQuery({
    queryKey: progressNoteKeys.search(searchTerm, filters),
    queryFn: () => searchProgressNotes(searchTerm, filters, page, limit),
    enabled: !!searchTerm,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    ...options
  });
};

// Hook for creating progress notes
export const useCreateProgressNote = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProgressNote,
    onSuccess: (data, variables) => {
      toast.success('Progress note created successfully!');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries(progressNoteKeys.lists());
      
      // If we have timesheetId, invalidate that specific query
      if (variables.timesheetId) {
        queryClient.invalidateQueries(progressNoteKeys.byTimesheet(variables.timesheetId));
      }
      
      // If we have workerId, invalidate worker queries
      if (variables.workerId) {
        queryClient.invalidateQueries(progressNoteKeys.byWorker(variables.workerId));
      }
      
      // If we have clientName, invalidate client queries
      if (variables.clientName) {
        queryClient.invalidateQueries(progressNoteKeys.byClient(variables.clientName));
      }
      
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      const errorMessage = error.response?.data?.message || 'Failed to create progress note';
      toast.error(errorMessage);
      options.onError?.(error, variables);
    },
    ...options
  });
};

// Hook for updating progress notes
export const useUpdateProgressNote = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, updateData }) => updateProgressNote(noteId, updateData),
    onSuccess: (data, variables) => {
      toast.success('Progress note updated successfully!');
      
      // Update the specific note in cache
      queryClient.setQueryData(progressNoteKeys.detail(variables.noteId), data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries(progressNoteKeys.lists());
      
      // If we have timesheetId, invalidate that specific query
      if (data.data?.timesheetId) {
        queryClient.invalidateQueries(progressNoteKeys.byTimesheet(data.data.timesheetId));
      }
      
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      const errorMessage = error.response?.data?.message || 'Failed to update progress note';
      toast.error(errorMessage);
      options.onError?.(error, variables);
    },
    ...options
  });
};

// Hook for deleting progress notes
export const useDeleteProgressNote = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProgressNote,
    onSuccess: (data, noteId) => {
      toast.success('Progress note deleted successfully!');
      
      // Remove from cache
      queryClient.removeQueries(progressNoteKeys.detail(noteId));
      
      // Invalidate relevant queries
      queryClient.invalidateQueries(progressNoteKeys.lists());
      
      options.onSuccess?.(data, noteId);
    },
    onError: (error, noteId) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete progress note';
      toast.error(errorMessage);
      options.onError?.(error, noteId);
    },
    ...options
  });
};

// Hook for managing progress note form state
export const useProgressNoteForm = (initialData = {}) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    clientName: '',
    category: 'daily_activities',
    priority: 'medium',
    confidentialityLevel: 'internal',
    tags: [],
    structuredData: {
      behaviors: [],
      goals: [],
      incident: {
        incidentType: '',
        severity: 'low',
        witnesses: [],
        actionsTaken: [],
        followUpRequired: false
      },
      medical: {
        vitalSigns: {
          temperature: '',
          bloodPressure: '',
          heartRate: '',
          respiratoryRate: ''
        },
        symptoms: [],
        medications: [],
        concerns: []
      }
    },
    customFields: [],
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const updateForm = useCallback((path, value) => {
    setForm(prev => {
      const clone = { ...prev };
      const keys = path.split('.');
      let cursor = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        cursor[k] = { ...cursor[k] };
        cursor = cursor[k];
      }
      cursor[keys[keys.length - 1]] = value;
      return clone;
    });
    
    // Clear error when user starts typing
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: undefined }));
    }
  }, [errors]);

  const addArrayItem = useCallback((path, item) => {
    setForm(prev => {
      const clone = { ...prev };
      const keys = path.split('.');
      let cursor = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        cursor[k] = Array.isArray(cursor[k]) ? [...cursor[k]] : { ...cursor[k] };
        cursor = cursor[k];
      }
      const lastKey = keys[keys.length - 1];
      const arr = Array.isArray(cursor[lastKey]) ? [...cursor[lastKey]] : [];
      arr.push(item);
      cursor[lastKey] = arr;
      return clone;
    });
  }, []);

  const removeArrayItem = useCallback((path, index) => {
    setForm(prev => {
      const clone = { ...prev };
      const keys = path.split('.');
      let cursor = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        cursor[k] = Array.isArray(cursor[k]) ? [...cursor[k]] : { ...cursor[k] };
        cursor = cursor[k];
      }
      const lastKey = keys[keys.length - 1];
      const arr = Array.isArray(cursor[lastKey]) ? [...cursor[lastKey]] : [];
      arr.splice(index, 1);
      cursor[lastKey] = arr;
      return clone;
    });
  }, []);

  const validate = useCallback(() => {
    const e = {};
    if (!form.title?.trim()) e.title = 'Title is required';
    if (!form.content?.trim()) e.content = 'Content is required';
    if (!form.category) e.category = 'Category is required';
    if (form.tags?.some(t => t.length > 50)) e.tags = 'Each tag must be ≤ 50 characters';
    if (form.tags?.some(t => t.length < 2)) e.tags = 'Each tag must be at least 2 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const resetForm = useCallback((newData = {}) => {
    setForm({
      title: '',
      content: '',
      clientName: '',
      category: 'daily_activities',
      priority: 'medium',
      confidentialityLevel: 'internal',
      tags: [],
      structuredData: {
        behaviors: [],
        goals: [],
        incident: {
          incidentType: '',
          severity: 'low',
          witnesses: [],
          actionsTaken: [],
          followUpRequired: false
        },
        medical: {
          vitalSigns: {
            temperature: '',
            bloodPressure: '',
            heartRate: '',
            respiratoryRate: ''
          },
          symptoms: [],
          medications: [],
          concerns: []
        }
      },
      customFields: [],
      ...newData
    });
    setErrors({});
  }, []);

  return {
    form,
    errors,
    updateForm,
    addArrayItem,
    removeArrayItem,
    validate,
    resetForm,
    setErrors
  };
};
