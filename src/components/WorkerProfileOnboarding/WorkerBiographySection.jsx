import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';

/**
 * WorkerBiographySection Component
 * 
 * Premium, production-ready biography editor component with:
 * - Rich text editing (React Quill)
 * - Real-time character counting and validation
 * - Responsive design (mobile, tablet, desktop)
 * - Smooth animations and transitions
 * - Error handling and validation
 * - SaaS-level UI/UX design
 * 
 * Features:
 * - Character limit enforcement (1500 chars)
 * - Plain text length calculation (strips HTML)
 * - Visual feedback for character count
 * - Focus states and hover effects
 * - Mobile-optimized toolbar
 * 
 * Best Practices:
 * - Controlled component pattern
 * - Memoized callbacks for performance
 * - Proper error handling
 * - Accessibility considerations
 * - Production-ready validation
 */

// Validation constants
const VALIDATION_CONFIG = {
  minLength: 0,
  maxLength: 1500,
  required: false,
};


const WorkerBiographySection = ({
  value = '',
  onChange,
  error = null,
  disabled = false,
  label = 'Professional Summary',
  description = 'Share your experience and what makes you unique',
  placeholder = 'Describe your experience, key strengths, and what makes you an exceptional care worker. Share your passion for helping others and any specialized skills you bring to your role.',
  maxLength = VALIDATION_CONFIG.maxLength,
  minLength = VALIDATION_CONFIG.minLength,
  showCharacterCount = true,
  fullHeight = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Local state
  const [biography, setBiography] = useState(value || '');
  const [biographyCharCount, setBiographyCharCount] = useState(0);
  const [isQuillFocused, setIsQuillFocused] = useState(false);
  const [quillKey, setQuillKey] = useState(0); // Force remount on breakpoint change
  const quillRef = useRef(null);
  const containerRef = useRef(null);

  // Get plain text length from HTML content (best practice - accurate counting)
  const getPlainTextLength = useCallback((html) => {
    if (!html || typeof html !== 'string') return 0;
    
    // Create temporary DOM element to extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Return trimmed length for accurate count
    return textContent.trim().length;
  }, []);

  // Initialize biography from prop value
  useEffect(() => {
    if (value !== biography) {
      setBiography(value || '');
      setBiographyCharCount(getPlainTextLength(value || ''));
    }
  }, [value, getPlainTextLength, biography]);

  // Track previous breakpoint to detect actual changes
  const prevIsMobileRef = useRef(isMobile);
  
  // Force remount when breakpoint actually changes
  useEffect(() => {
    // Only remount if breakpoint actually changed
    if (prevIsMobileRef.current !== isMobile) {
      prevIsMobileRef.current = isMobile;
      // Small delay to ensure DOM has updated and Quill can properly reinitialize
      const timeoutId = setTimeout(() => {
        setQuillKey(prev => prev + 1);
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [isMobile]);

  // Handle window resize with debouncing - only remount if breakpoint actually changes
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Check if breakpoint actually changed
        const currentIsMobile = window.innerWidth < theme.breakpoints.values.sm;
        if (prevIsMobileRef.current !== currentIsMobile) {
          prevIsMobileRef.current = currentIsMobile;
          // Force remount with delay to ensure proper cleanup
          setTimeout(() => {
            setQuillKey(prev => prev + 1);
          }, 100);
        }
      }, 300); // Debounce resize events to avoid excessive remounts
    };

    // Handle visibility change (dev tools open/close)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible - ensure Quill is properly initialized
        setTimeout(() => {
          if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            if (quill && !quill.root) {
              // Quill seems broken, force remount
              setQuillKey(prev => prev + 1);
            }
          }
        }, 200);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(resizeTimer);
    };
  }, [theme.breakpoints.values.sm]);

  // Cleanup Quill instance on unmount
  useEffect(() => {
    return () => {
      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        if (quill) {
          quill.off('text-change');
        }
      }
    };
  }, [quillKey]);

  // React Quill configuration - optimized for mobile/desktop
  const quillModules = useMemo(() => ({
    toolbar: {
      container: isMobile ? [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
        ['clean']
      ] : [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['blockquote', 'link'],
        [{ 'align': [] }],
        ['clean']
      ],
      handlers: {
        // Custom handlers can be added here if needed
      }
    },
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: false
    }
  }), [isMobile]);

  const quillFormats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'blockquote', 'link', 'align'
  ], []);

  // Handle biography change with validation
  const handleBiographyChange = useCallback((content) => {
    const plainTextLength = getPlainTextLength(content);
    
    // Enforce character limit
    if (plainTextLength > maxLength) {
      toast.warning(`Biography cannot exceed ${maxLength} characters`, {
        position: "top-center",
        autoClose: 3000,
      });
      return; // Don't update if exceeds limit
    }
    
    // Update local state
    setBiography(content);
    setBiographyCharCount(plainTextLength);
    
    // Call parent onChange handler
    if (onChange && typeof onChange === 'function') {
      onChange(content);
    }
  }, [getPlainTextLength, maxLength, onChange]);

  // Calculate character count percentage for visual feedback
  const characterPercentage = useMemo(() => {
    return Math.min((biographyCharCount / maxLength) * 100, 100);
  }, [biographyCharCount, maxLength]);

  // Determine character count color based on usage
  const getCharacterCountColor = useMemo(() => {
    if (characterPercentage >= 90) return 'error';
    if (characterPercentage >= 75) return 'warning';
    return 'default';
  }, [characterPercentage]);

  // Validate biography
  const validateBiography = useCallback((content) => {
    const plainTextLength = getPlainTextLength(content);
    
    if (minLength > 0 && plainTextLength < minLength) {
      return `Professional summary must be at least ${minLength} characters (currently: ${plainTextLength})`;
    }
    
    if (plainTextLength > maxLength) {
      return `Professional summary must not exceed ${maxLength} characters (currently: ${plainTextLength})`;
    }
    
    return null;
  }, [minLength, maxLength, getPlainTextLength]);

  // Get validation error
  const validationError = useMemo(() => {
    if (error) return error;
    return validateBiography(biography);
  }, [error, biography, validateBiography]);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Box sx={{ 
        p: { xs: 0, sm: 0, md: 0 },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}>
        {/* Header Section - Clean Design Matching Other Sections */}
        <Box sx={{ mb: { xs: 2, sm: 2.5 }, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography 
              variant="h6" 
              fontWeight={700} 
              color="text.primary" 
              sx={{ 
                fontSize: { xs: '1.125rem', sm: '1.25rem' }, 
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
              }}
            >
              {label}
            </Typography>
            {showCharacterCount && (
              <Box
                sx={{
                  px: { xs: 1, sm: 1.25 },
                  py: 0.5,
                  borderRadius: '8px',
                  bgcolor: getCharacterCountColor === 'error'
                    ? alpha(theme.palette.error.main, 0.1)
                    : getCharacterCountColor === 'warning'
                    ? alpha(theme.palette.warning.main, 0.1)
                    : alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${
                    getCharacterCountColor === 'error'
                      ? alpha(theme.palette.error.main, 0.2)
                      : getCharacterCountColor === 'warning'
                      ? alpha(theme.palette.warning.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.15)
                  }`,
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    color: getCharacterCountColor === 'error'
                      ? theme.palette.error.main
                      : getCharacterCountColor === 'warning'
                      ? theme.palette.warning.main
                      : theme.palette.primary.main,
                  }}
                >
                  {biographyCharCount}/{maxLength}
                </Typography>
              </Box>
            )}
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            {description}
          </Typography>
        </Box>

        {/* React Quill Editor Container - Clean Borderless Design */}
        <Box 
          sx={{ 
            position: 'relative',
            width: '100%',
            flex: 1,
            minHeight: { xs: '280px', sm: '320px', md: '400px' },
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '14px',
            overflow: 'hidden',
            bgcolor: validationError 
              ? alpha(theme.palette.error.main, 0.03)
              : alpha(theme.palette.grey[50], 0.5),
            border: validationError 
              ? `1.5px solid ${alpha(theme.palette.error.main, 0.25)}` 
              : `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: validationError 
              ? '0 2px 8px rgba(239, 68, 68, 0.1)' 
              : '0 1px 3px rgba(0, 0, 0, 0.04)',
            '&:hover': {
              bgcolor: validationError 
                ? alpha(theme.palette.error.main, 0.04)
                : alpha(theme.palette.grey[50], 0.8),
              border: validationError 
                ? `1.5px solid ${alpha(theme.palette.error.main, 0.35)}` 
                : `1px solid ${alpha(theme.palette.grey[400], 0.4)}`,
              boxShadow: validationError 
                ? '0 4px 12px rgba(239, 68, 68, 0.15)' 
                : '0 2px 8px rgba(0, 0, 0, 0.06)',
            },
            '&:focus-within': {
              bgcolor: '#ffffff',
              border: validationError 
                ? `2px solid ${theme.palette.error.main}` 
                : `2px solid ${alpha(theme.palette.grey[600], 0.4)}`,
              boxShadow: validationError
                ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.1)}, 0 4px 12px rgba(239, 68, 68, 0.15)`
                : `0 0 0 3px ${alpha(theme.palette.grey[500], 0.08)}, 0 4px 12px ${alpha(theme.palette.common.black, 0.06)}`,
            },
            // React Quill specific styles
            '& .quill-biography-editor': {
              width: '100% !important',
              display: 'block !important',
              visibility: 'visible !important',
              position: 'relative',
            },
            '& .ql-toolbar.ql-snow': {
              border: 'none !important',
              borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.2)} !important`,
              borderRadius: '14px 14px 0 0',
              background: alpha(theme.palette.grey[50], 0.8),
              padding: { xs: '12px 14px', sm: '14px 16px', md: '16px 18px' },
              width: '100% !important',
              boxSizing: 'border-box',
              display: 'block !important',
              visibility: 'visible !important',
              flexWrap: { xs: 'wrap', sm: 'nowrap', md: 'nowrap' },
              gap: { xs: '4px', sm: '6px', md: '8px' },
              transition: 'background 0.2s ease',
              [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                padding: '10px 12px',
                '& .ql-formats': {
                  marginRight: '8px !important',
                  marginBottom: '4px',
                }
              }
            },
            '& .ql-container.ql-snow': {
              border: 'none !important',
              borderRadius: '0 0 14px 14px',
              fontFamily: theme.typography.fontFamily,
              fontSize: { xs: '0.9375rem', sm: '0.96875rem', md: '1rem' },
              lineHeight: 1.6,
              width: '100% !important',
              boxSizing: 'border-box',
              background: 'transparent',
              display: 'block !important',
              visibility: 'visible !important',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '& .ql-editor': {
              minHeight: { xs: '280px !important', sm: '320px !important', md: '400px !important' },
              maxHeight: { xs: '400px', sm: '500px', md: 'none' },
              padding: { xs: '16px 18px', sm: '18px 20px', md: '20px 24px' },
              color: theme.palette.text.primary,
              overflowY: 'auto',
              width: '100% !important',
              boxSizing: 'border-box',
              fontSize: { xs: '0.9375rem', sm: '0.96875rem', md: '1rem' },
              lineHeight: { xs: 1.6, sm: 1.65, md: 1.7 },
              letterSpacing: '0.01em',
              display: 'block !important',
              visibility: 'visible !important',
              scrollbarWidth: 'thin',
              scrollbarColor: `${alpha(theme.palette.grey[400], 0.6)} transparent`,
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': {
                width: { xs: '4px', sm: '5px', md: '6px' },
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.grey[400], 0.5),
                borderRadius: '3px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: alpha(theme.palette.grey[500], 0.7),
                }
              }
            },
            '& .ql-editor.ql-blank::before': {
              content: `"${placeholder}"`,
              color: alpha(theme.palette.text.secondary, 0.5),
              fontStyle: 'normal',
              fontWeight: 400,
              left: { xs: '18px', sm: '20px', md: '24px' },
              right: { xs: '18px', sm: '20px', md: '24px' },
              top: { xs: '16px', sm: '18px', md: '20px' },
              bottom: 'auto',
              position: 'absolute',
              pointerEvents: 'none',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              lineHeight: { xs: 1.6, sm: 1.65, md: 1.7 },
              fontSize: { xs: '0.9375rem', sm: '0.96875rem', md: '1rem' },
              letterSpacing: '0.01em',
              zIndex: 1,
            },
            '& .ql-editor:focus': {
              outline: 'none',
              background: 'transparent',
              borderColor: 'transparent',
            },
            '& .ql-editor:focus-within': {
              background: 'transparent',
            },
            '& .ql-editor::selection': {
              background: alpha(theme.palette.grey[400], 0.25),
              color: theme.palette.text.primary,
            },
            '& .ql-toolbar .ql-formats': {
              marginRight: { xs: '8px', sm: '12px', md: '16px' },
              display: 'inline-flex',
              alignItems: 'center',
              gap: { xs: '2px', sm: '3px', md: '4px' },
              [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                marginRight: '6px !important',
                marginBottom: '4px',
              }
            },
            '& .ql-toolbar button': {
              borderRadius: { xs: '6px', sm: '7px', md: '8px' },
              margin: { xs: '0 1px', sm: '0 1.5px', md: '0 2px' },
              padding: { xs: '6px', sm: '7px', md: '8px' },
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              border: 'none',
              background: 'transparent',
              minWidth: { xs: '28px', sm: '30px', md: '32px' },
              height: { xs: '28px', sm: '30px', md: '32px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              fontSize: { xs: '14px', sm: '15px', md: '16px' },
              '&:active': {
                transform: 'scale(0.95)',
              }
            },
            '& .ql-toolbar button::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'transparent',
              borderRadius: '8px',
              transition: 'all 0.25s ease',
              transform: 'scale(0)',
            },
            '& .ql-toolbar button:hover::before': {
              background: alpha(theme.palette.grey[400], 0.1),
              transform: 'scale(1)',
            },
            '& .ql-toolbar button:hover': {
              color: theme.palette.text.primary,
              transform: 'translateY(-1px)',
              boxShadow: `0 2px 6px ${alpha(theme.palette.common.black, 0.08)}`,
            },
            '& .ql-toolbar button.ql-active': {
              background: alpha(theme.palette.grey[400], 0.15),
              color: theme.palette.text.primary,
              transform: 'translateY(0)',
              boxShadow: `0 1px 4px ${alpha(theme.palette.common.black, 0.1)}`,
            },
            '& .ql-toolbar button.ql-active::before': {
              background: alpha(theme.palette.grey[400], 0.1),
              transform: 'scale(1)',
            },
            '& .ql-toolbar .ql-picker': {
              borderRadius: '8px',
              transition: 'all 0.25s ease',
            },
            '& .ql-toolbar .ql-picker:hover': {
              background: alpha(theme.palette.grey[400], 0.1),
            },
            '& .ql-container': {
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '&:hover .ql-container': {
              borderColor: alpha(theme.palette.grey[400], 0.3),
            },
            '&.focused .ql-container, & .ql-container:focus-within': {
              borderColor: alpha(theme.palette.grey[500], 0.4),
              boxShadow: `0 0 0 3px ${alpha(theme.palette.grey[500], 0.06)}, 0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
              transform: 'translateY(-1px)',
            },
            '& .ql-editor p': {
              margin: { xs: '0.5em 0', sm: '0.55em 0', md: '0.6em 0' },
              textAlign: 'left',
              lineHeight: { xs: 1.6, sm: 1.65, md: 1.7 },
              fontSize: { xs: '0.9375rem', sm: '0.96875rem', md: '1rem' },
              letterSpacing: '0.01em',
            },
            '& .ql-editor p:first-child': {
              marginTop: 0,
            },
            '& .ql-editor p:last-child': {
              marginBottom: 0,
            },
            '& .ql-editor ul, & .ql-editor ol': {
              margin: { xs: '0.5em 0', sm: '0.55em 0', md: '0.6em 0' },
              paddingLeft: { xs: '1.5em', sm: '1.75em', md: '2em' },
              lineHeight: { xs: 1.6, sm: 1.65, md: 1.7 },
            },
            '& .ql-editor li': {
              margin: { xs: '0.3em 0', sm: '0.35em 0', md: '0.4em 0' },
              lineHeight: { xs: 1.6, sm: 1.65, md: 1.7 },
              fontSize: { xs: '0.9375rem', sm: '0.96875rem', md: '1rem' },
              letterSpacing: '0.01em',
            },
            '& .ql-editor strong': {
              fontWeight: 700,
              color: theme.palette.text.primary,
            },
            '& .ql-editor em': {
              fontStyle: 'italic',
              color: `rgba(0, 0, 0, 0.87)`,
            },
            '& .ql-editor a': {
              color: theme.palette.text.primary,
              textDecoration: 'underline',
              textDecorationColor: alpha(theme.palette.grey[400], 0.4),
              textUnderlineOffset: '2px',
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            },
            '& .ql-editor a:hover': {
              background: alpha(theme.palette.grey[200], 0.5),
              textDecorationColor: alpha(theme.palette.grey[600], 0.6),
              transform: 'translateY(-1px)',
            },
            '& .ql-editor blockquote': {
              borderLeft: `4px solid ${alpha(theme.palette.grey[400], 0.5)}`,
              margin: { xs: '0.75em 0', sm: '0.875em 0', md: '1em 0' },
              paddingLeft: { xs: '1.25em', sm: '1.5em', md: '1.75em' },
              paddingRight: { xs: '1em', sm: '1.25em', md: '1.5em' },
              paddingTop: { xs: '0.5em', sm: '0.625em', md: '0.75em' },
              paddingBottom: { xs: '0.5em', sm: '0.625em', md: '0.75em' },
              color: alpha(theme.palette.text.primary, 0.85),
              fontStyle: 'italic',
              background: alpha(theme.palette.grey[50], 0.7),
              borderRadius: '0 8px 8px 0',
              lineHeight: { xs: 1.6, sm: 1.65, md: 1.7 },
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '0.96875rem' },
              letterSpacing: '0.01em',
            },
            '& .ql-toolbar.ql-snow:hover': {
              background: alpha(theme.palette.grey[100], 0.6),
            },
            '& .ql-tooltip': {
              borderRadius: '8px',
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
              background: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '0.96875rem' },
            },
            '&.loading': {
              opacity: 0.7,
              pointerEvents: 'none',
            },
            '&.loading .ql-editor': {
              background: alpha(theme.palette.grey[100], 0.3),
            },
            // Mobile-specific optimizations
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
              '& .ql-toolbar.ql-snow': {
                padding: '6px 8px',
                '& .ql-formats': {
                  marginRight: '6px !important',
                  marginBottom: '4px',
                },
                '& button': {
                  minWidth: '26px',
                  height: '26px',
                  padding: '5px',
                  fontSize: '13px',
                }
              },
              '& .ql-editor': {
                padding: '10px 14px',
                fontSize: '0.875rem',
              },
              '& .ql-editor.ql-blank::before': {
                left: '14px',
                right: '14px',
                top: '10px',
                fontSize: '0.875rem',
              }
            },
            // Tablet optimizations
            [`@media (min-width: ${theme.breakpoints.values.sm}px) and (max-width: ${theme.breakpoints.values.md}px)`]: {
              '& .ql-toolbar.ql-snow': {
                padding: '8px 10px',
              },
              '& .ql-editor': {
                padding: '12px 16px',
              }
            },
          }}
        >
          <ReactQuill 
            key={`quill-${quillKey}-${isMobile ? 'mobile' : 'desktop'}`}
            ref={quillRef}
            theme="snow"
            value={biography}
            onChange={handleBiographyChange}
            onFocus={() => setIsQuillFocused(true)}
            onBlur={() => setIsQuillFocused(false)}
            modules={quillModules}
            formats={quillFormats}
            placeholder={placeholder}
            readOnly={disabled}
            className={`quill-biography-editor ${isQuillFocused ? 'focused' : ''} ${disabled ? 'loading' : ''}`}
          />
        </Box>

        {/* Error Message - Clean Card-Based Design */}
        {validationError && (
          <Box
            sx={{
              mt: { xs: 1.5, sm: 2 },
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.875,
              p: { xs: 1, sm: 1.25 },
              borderRadius: '10px',
              bgcolor: alpha(theme.palette.error.main, 0.06),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              transition: 'all 0.2s ease',
            }}
            role="alert"
            aria-live="polite"
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: theme.palette.error.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.125,
              }}
            >
              <Typography sx={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, lineHeight: 1 }}>
                !
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                color="error"
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  lineHeight: 1.5,
                  fontWeight: 600,
                  display: 'block',
                }}
              >
                {validationError}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

WorkerBiographySection.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  description: PropTypes.string,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  showCharacterCount: PropTypes.bool,
  fullHeight: PropTypes.bool,
};

export default React.memo(WorkerBiographySection);

