/**
 * Professional Biography Section
 * Premium SaaS component for professional summary editing with rich text capabilities
 * Features:
 * - Enhanced React Quill with premium styling
 * - Real-time validation and character insights
 * - Mobile-optimized progressive enhancement
 * - Loading states and error handling
 * - Premium MUI design system
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Fade,
  Skeleton,
  alpha,
  useTheme,
  useMediaQuery,
  Alert,
  Zoom,
} from '@mui/material';
import {
  Warning,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-hot-toast';
import { useWorkerProfileStore, profileSelectors } from '../../stores/workerOnboardingStores';

// Validation constants
const VALIDATION_RULES = {
  biography: {
    minLength: 0,
    maxLength: 1500,
    required: false,
  },
};

// Note: MobileToolbar removed - ReactQuill toolbar is now always visible and consistent across all devices

// Premium Section Header - Consistent with CV Component
const PremiumSectionHeader = ({ title, subtitle, icon = '👤' }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        mb: { xs: 2.5, sm: 3 },
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -10,
          left: 0,
          width: { xs: 32, sm: 36 },
          height: 2.5,
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.25, sm: 1.5, md: 2 } }}>
        <Zoom in timeout={300}>
          <Box
            sx={{
              width: { xs: 38, sm: 42, md: 44 },
              height: { xs: 38, sm: 42, md: 44 },
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(102, 126, 234, 0.15)',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: { xs: '1.188rem', sm: '1.313rem', md: '1.375rem' } }}>{icon}</Typography>
          </Box>
        </Zoom>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              fontSize: { xs: '1.063rem', sm: '1.188rem', md: '1.313rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: { xs: 0.5, sm: 0.625 },
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontSize: { xs: '0.75rem', sm: '0.813rem', md: '0.875rem' },
              maxWidth: 600,
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Simple Character Count - Subtle & Best Practice
// Only shows when approaching limit or over limit
const CharacterCount = ({ current, max }) => {
  const threshold = 0.9; // 90% of max
  const isNearLimit = current > max * threshold;
  const isOverLimit = current > max;
  
  // Only show if near limit or over limit (best practice - don't distract user)
  if (!isNearLimit && !isOverLimit) {
    return null;
  }
  
  return (
    <Typography 
      variant="caption" 
      sx={{
        display: 'block',
        mt: { xs: 1, sm: 1.25 },
        textAlign: 'right',
        fontSize: { xs: '0.688rem', sm: '0.75rem' },
        color: isOverLimit ? '#ef4444' : '#f59e0b',
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      {current} / {max} {isOverLimit && 'characters (limit exceeded)'}
    </Typography>
  );
};

// Main Component - SaaS Best Practice: Backend as Source of Truth
const WorkerBiography = React.memo(({ 
  error: biographyError, 
  isPending = false,
  onBiographyChange,
  onValidationChange,
  initialBiography, // Pass from parent (from backend)
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Get biography from store (for temporary edits only)
  const storeBiography = useWorkerProfileStore(profileSelectors.biography);
  const updateProfile = useWorkerProfileStore((state) => state.updateProfile);

  // Local state
  const [biography, setBiography] = useState('');
  const [biographyCharCount, setBiographyCharCount] = useState(0);
  const [isQuillFocused, setIsQuillFocused] = useState(false);
  const [localError, setLocalError] = useState('');
  const quillRef = useRef(null);
  const biographyInitialized = useRef(false);
  const containerRef = useRef(null);
  const lastKnownContentRef = useRef(''); // Track last known content to prevent loss
  const lastValidLengthRef = useRef(0); // Track last valid character count
  
  const maxBiographyChars = VALIDATION_RULES.biography.maxLength;
  
  // Determine source of truth: initialBiography (backend) > storeBiography (temporary)
  const sourceBiography = initialBiography !== undefined ? (initialBiography || '') : (storeBiography || '');
  
  // Tips for better biography
  const writingTips = [
    "Start with your years of experience and specialty areas",
    "Highlight specific skills and certifications",
    "Share your care philosophy and approach",
    "Include measurable achievements or outcomes",
    "Mention any specialized training or expertise",
  ];
  
  // Get plain text length from HTML content - Best Practice: Accurate character counting
  const getPlainTextLength = useCallback((html) => {
    if (!html || html.trim() === '' || html.trim() === '<p><br></p>' || html.trim() === '<p></p>') {
      return 0;
    }
    
    try {
      // Create temporary div to extract plain text
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Get text content (strips HTML tags)
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // Return accurate character count (including spaces, newlines preserved as spaces)
      return textContent.length;
    } catch (error) {
      console.warn('Error calculating text length:', error);
      // Fallback: strip HTML tags and count characters
      return html.replace(/<[^>]*>/g, '').length;
    }
  }, []);

  // Initialize biography from backend (source of truth) - Best Practice
  useEffect(() => {
    if (!biographyInitialized.current) {
      // Use backend data (initialBiography) as source of truth, fallback to store
      const initialContent = sourceBiography || '';
      setBiography(initialContent);
      setBiographyCharCount(getPlainTextLength(initialContent));
      lastKnownContentRef.current = initialContent;
      lastValidLengthRef.current = getPlainTextLength(initialContent);
      biographyInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Sync with backend data when it changes (source of truth)
  useEffect(() => {
    if (biographyInitialized.current && initialBiography !== undefined) {
      const backendContent = initialBiography || '';
      const localContent = biography || '';
      
      // Sync if backend content is different (backend is source of truth)
      if (backendContent !== localContent) {
        setBiography(backendContent);
        setBiographyCharCount(getPlainTextLength(backendContent));
        lastKnownContentRef.current = backendContent;
        lastValidLengthRef.current = getPlainTextLength(backendContent);
        
        // Force ReactQuill to update if it exists
        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          if (quill && quill.root.innerHTML !== backendContent) {
            quill.root.innerHTML = backendContent;
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBiography]); // Sync when backend data changes

  // React Quill configuration - Always consistent toolbar, responsive design
  const quillModules = useMemo(() => {
    // Unified toolbar configuration that works on all devices
    // Never set toolbar to false - always show it for consistency
    const toolbarConfig = isMobile 
      ? [
          // Mobile: Compact toolbar with essential tools
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      : isTablet
      ? [
          // Tablet: Medium toolbar
          [{ 'header': [2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'blockquote'],
          ['clean']
        ]
      : [
          // Desktop: Full toolbar
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          ['blockquote', 'link'],
          [{ 'align': [] }],
          ['clean']
        ];

    return {
      toolbar: {
        container: toolbarConfig,
        // Ensure toolbar is always visible
        handlers: {
          // Custom handlers can be added here if needed
        }
      },
      clipboard: {
        matchVisual: false,
        // Handle paste to trim content if exceeds limit
        matchers: [
          ['Node', (node, delta) => {
            // Custom paste handler
            return delta;
          }]
        ]
      },
      history: {
        delay: 1000,
        maxStack: 50,
        userOnly: false
      }
    };
  }, [isMobile, isTablet]);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'blockquote', 'link', 'align'
  ];

  // Validate biography
  const validateBiography = useCallback((content) => {
    const plainTextLength = getPlainTextLength(content);
    const errors = {};
    let errorMessage = '';

    if (content && typeof content === 'string') {
      if (plainTextLength > VALIDATION_RULES.biography.maxLength) {
        errorMessage = `Professional summary must not exceed ${VALIDATION_RULES.biography.maxLength} characters (currently: ${plainTextLength})`;
        errors.biography = errorMessage;
      } else if (plainTextLength < VALIDATION_RULES.biography.minLength && plainTextLength > 0) {
        errorMessage = `Professional summary must be at least ${VALIDATION_RULES.biography.minLength} characters (currently: ${plainTextLength})`;
        errors.biography = errorMessage;
      }
    }

    setLocalError(errorMessage);

    // Notify parent of validation changes
    if (onValidationChange) {
      onValidationChange(errors);
    }

    return errors;
  }, [getPlainTextLength, onValidationChange]);


  // Handle biography change - Best Practice: Simple, accurate character counting
  const handleBiographyChange = useCallback((content) => {
    // Normalize content
    const normalizedContent = content || '';
    const plainTextLength = getPlainTextLength(normalizedContent);
    
    // Always update state and count (best practice - allow typing, validate on submit)
    lastKnownContentRef.current = normalizedContent;
    lastValidLengthRef.current = plainTextLength;
    
    setBiography(normalizedContent);
    setBiographyCharCount(plainTextLength);
    
    // Update store (allow over limit for better UX - validate on submit)
    updateProfile({ biography: normalizedContent });
    
    // Validate (will show error if over limit)
    validateBiography(normalizedContent);
    
    // Notify parent
    if (onBiographyChange) {
      onBiographyChange(normalizedContent);
    }
  }, [getPlainTextLength, updateProfile, validateBiography, onBiographyChange]);

  // Best Practice: Allow paste, validate on submit (no trimming)
  // User can paste freely, validation happens on form submission

  // Ensure ReactQuill is properly initialized and content persists across viewport changes
  // Best Practice: Sync with backend data (initialBiography) as source of truth
  useEffect(() => {
    if (quillRef.current && !isPending && biographyInitialized.current) {
      const quill = quillRef.current.getEditor();
      if (quill) {
        // Use backend data (initialBiography) as source of truth
        const expectedContent = initialBiography !== undefined 
          ? (initialBiography || '') 
          : (lastKnownContentRef.current || biography || '');
        
        const currentContent = quill.root.innerHTML;
        const currentText = quill.getText().trim();
        const expectedText = getPlainTextLength(expectedContent);
        
        // If content was lost (empty but should have content), restore from backend
        if (currentText.length === 0 && expectedText > 0 && expectedContent.trim() !== '<p><br></p>') {
          quill.root.innerHTML = expectedContent;
          lastKnownContentRef.current = expectedContent;
        } 
        // If content doesn't match backend and we're not focused, sync it
        else if (currentContent !== expectedContent && !isQuillFocused && expectedContent.trim() !== '<p><br></p>') {
          quill.root.innerHTML = expectedContent;
          lastKnownContentRef.current = expectedContent;
        }
        // Update ref with current content to track it (only if within limit)
        else if (currentContent && currentContent.trim() !== '<p><br></p>') {
          const contentLength = getPlainTextLength(currentContent);
          if (contentLength <= maxBiographyChars) {
            lastKnownContentRef.current = currentContent;
          }
        }
        
        // Ensure toolbar is always visible (responsive design)
        const toolbar = quill.getModule('toolbar');
        if (toolbar) {
          const toolbarEl = containerRef.current?.querySelector('.ql-toolbar');
          if (toolbarEl) {
            toolbarEl.style.display = 'flex';
          }
        }
      }
    }
  }, [biography, initialBiography, isPending, quillModules, isMobile, isTablet, isQuillFocused, getPlainTextLength, maxBiographyChars]);

  // Handle viewport resize to maintain state consistency
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      // Debounce resize to avoid too many updates
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Force ReactQuill to maintain content on resize
        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          if (quill && biography) {
            // Save current content before any potential re-render
            const currentContent = quill.root.innerHTML;
            
            // Update store with current content to ensure persistence
            if (currentContent && currentContent.trim() !== '<p><br></p>') {
              updateProfile({ biography: currentContent });
            }
            
            // Ensure content persists after resize
            setTimeout(() => {
              if (quillRef.current) {
                const quillAfterResize = quillRef.current.getEditor();
                if (quillAfterResize) {
                  const contentAfterResize = quillAfterResize.root.innerHTML;
                  const expectedContent = biography || currentContent;
                  if (contentAfterResize !== expectedContent && expectedContent.trim() !== '<p><br></p>') {
                    quillAfterResize.root.innerHTML = expectedContent;
                  }
                }
              }
            }, 100);
          }
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [biography, updateProfile]);

  // Focus effect
  useEffect(() => {
    if (isQuillFocused && containerRef.current) {
      containerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [isQuillFocused]);

  const displayError = biographyError || localError;
  const showTips = biographyCharCount < 100 && biographyCharCount > 0;

  // Loading skeleton
  if (isPending) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Skeleton variant="rectangular" width={200} height={32} sx={{ mb: 3, borderRadius: 1.5 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" width="60%" height={20} sx={{ borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Fade in timeout={400}>
      <Card
        ref={containerRef}
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 2.5 },
          border: '1px solid',
          borderColor: isQuillFocused ? '#667eea' : '#e2e8f0',
          bgcolor: '#ffffff',
          overflow: 'visible',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          '&:hover': {
            borderColor: isQuillFocused ? '#667eea' : alpha('#667eea', 0.4),
            boxShadow: isQuillFocused 
              ? '0 4px 16px rgba(102, 126, 234, 0.12)'
              : '0 2px 8px rgba(102, 126, 234, 0.06)',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, position: 'relative', '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } } }}>
          {/* Premium Header */}
          <PremiumSectionHeader
            title="Professional Summary"
            subtitle="Craft a compelling profile that showcases your expertise, experience, and care philosophy"
            icon="👤"
          />
          
          {/* Editor Container - Always visible toolbar */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: { xs: 1.75, sm: 2 },
              overflow: 'hidden',
              border: '1px solid',
              borderColor: isQuillFocused ? '#667eea' : '#e2e8f0',
              bgcolor: '#ffffff',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: isQuillFocused ? '#667eea' : alpha('#667eea', 0.3),
              },
              // Toolbar styling - Always visible and consistent
              '& .ql-toolbar.ql-snow': {
                border: 'none',
                borderBottom: '1px solid #e2e8f0',
                borderRadius: { xs: '7px 7px 0 0', sm: '8px 8px 0 0' },
                background: '#f8fafc',
                padding: { xs: '6px 10px', sm: '8px 12px', md: '10px 14px' },
                display: 'flex !important', // Force display
                flexWrap: 'wrap',
                gap: { xs: 0.25, sm: 0.5 },
                minHeight: { xs: '44px', sm: '48px' },
                '& button': {
                  minWidth: { xs: '28px', sm: '32px', md: '36px' },
                  height: { xs: '28px', sm: '32px', md: '36px' },
                  padding: { xs: '4px', sm: '5px', md: '6px' },
                  fontSize: { xs: '12px', sm: '13px', md: '14px' },
                  borderRadius: { xs: '5px', sm: '6px' },
                  color: '#64748b',
                  margin: { xs: '2px', sm: '3px' },
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    background: '#f1f5f9',
                    color: '#667eea',
                    transform: 'scale(1.05)',
                  },
                  '&.ql-active': {
                    background: '#e0e7ff',
                    color: '#667eea',
                    boxShadow: '0 1px 3px rgba(102, 126, 234, 0.2)',
                  },
                },
                '& .ql-picker': {
                  height: { xs: '28px', sm: '32px', md: '36px' },
                  fontSize: { xs: '12px', sm: '13px', md: '14px' },
                  color: '#64748b',
                  '&:hover': {
                    color: '#667eea',
                  },
                  '& .ql-picker-label': {
                    padding: { xs: '4px 6px', sm: '5px 8px' },
                    borderRadius: { xs: '5px', sm: '6px' },
                  },
                  '& .ql-picker-options': {
                    borderRadius: { xs: '5px', sm: '6px' },
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  },
                },
              },
              // Container styling
              '& .ql-container.ql-snow': {
                border: 'none',
                borderRadius: { xs: '0 0 7px 7px', sm: '0 0 8px 8px' },
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: '0.813rem', sm: '0.875rem', md: '0.938rem' },
                background: '#ffffff',
              },
              // Editor styling
              '& .ql-editor': {
                minHeight: { xs: '180px !important', sm: '220px !important', md: '260px !important' },
                maxHeight: { xs: '280px', sm: '360px', md: 'none' },
                padding: { xs: '14px', sm: '18px', md: '22px' },
                overflowY: 'auto',
                fontSize: { xs: '0.813rem', sm: '0.875rem', md: '0.938rem' },
                lineHeight: 1.7,
                color: '#1a202c',
                '&::-webkit-scrollbar': {
                  width: { xs: '6px', sm: '8px' },
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f5f9',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#cbd5e1',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#94a3b8',
                  },
                },
                '&.ql-blank::before': {
                  color: '#94a3b8',
                  fontStyle: 'normal',
                  fontSize: { xs: '0.813rem', sm: '0.875rem', md: '0.938rem' },
                  left: { xs: '14px', sm: '18px', md: '22px' },
                  right: { xs: '14px', sm: '18px', md: '22px' },
                },
              },
              // Icon colors
              '& .ql-stroke': {
                stroke: '#64748b',
              },
              '& .ql-fill': {
                fill: '#64748b',
              },
              '& .ql-picker-label': {
                color: '#64748b',
              },
              // Ensure ReactQuill is always rendered
              '& .ql-editor.ql-blank': {
                minHeight: { xs: '180px !important', sm: '220px !important', md: '260px !important' },
              },
            }}
          >
            {/* Loading Overlay */}
            {isPending && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: alpha('#ffffff', 0.8),
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LinearProgress sx={{ width: '80%' }} />
              </Box>
            )}
            
            {/* React Quill Editor - Always rendered for consistency */}
            {ReactQuill && (
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={biography || ''}
                onChange={handleBiographyChange}
                onFocus={() => {
                  setIsQuillFocused(true);
                  // Ensure content is visible when focused
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    if (quill && biography) {
                      const currentContent = quill.root.innerHTML;
                      if (currentContent !== biography) {
                        quill.root.innerHTML = biography;
                      }
                    }
                  }
                }}
                onBlur={() => {
                  setIsQuillFocused(false);
                  // Ensure content is saved on blur
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    if (quill) {
                      const content = quill.root.innerHTML;
                      const contentLength = getPlainTextLength(content);
                      
                      // Only save if within limit
                      if (contentLength <= maxBiographyChars) {
                        lastKnownContentRef.current = content;
                        lastValidLengthRef.current = contentLength;
                        if (content !== biography && content.trim() !== '<p><br></p>') {
                          handleBiographyChange(content);
                        }
                      } else {
                        // Revert to last valid content on blur if over limit
                        if (lastKnownContentRef.current) {
                          quill.root.innerHTML = lastKnownContentRef.current;
                        }
                      }
                    }
                  }
                }}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Describe your professional journey, key achievements, care philosophy, and what makes you an exceptional caregiver..."
                readOnly={isPending}
                preserveWhitespace
                bounds="self"
              />
            )}
          </Box>
          
          {/* Simple Character Count - Only shows when near/over limit */}
          <CharacterCount 
            current={biographyCharCount} 
            max={maxBiographyChars}
          />
          
          {/* Error Display - Compact & Responsive */}
          <Fade in={Boolean(displayError)} timeout={200}>
            <Box>
              {displayError && (
                <Alert 
                  severity="error"
                  icon={<Warning sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }} />}
                  sx={{
                    mt: { xs: 1.75, sm: 2 },
                    py: { xs: 1, sm: 1.25 },
                    px: { xs: 1.25, sm: 1.5 },
                    borderRadius: { xs: 1.5, sm: 1.75 },
                    bgcolor: '#fef2f2',
                    border: '1px solid #fecaca',
                    '& .MuiAlert-icon': {
                      color: '#dc2626',
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      alignItems: 'flex-start',
                      mt: { xs: 0.125, sm: 0.25 },
                    },
                    '& .MuiAlert-message': {
                      color: '#991b1b',
                      fontSize: { xs: '0.75rem', sm: '0.813rem' },
                      fontWeight: 500,
                      padding: 0,
                      lineHeight: 1.5,
                    },
                  }}
                >
                  {displayError}
                </Alert>
              )}
            </Box>
          </Fade>
          
          {/* Writing Tips (Conditional) - Compact & Responsive */}
          {showTips && (
            <Fade in timeout={300}>
              <Box
                sx={{
                  mt: { xs: 2.5, sm: 3 },
                  p: { xs: 2, sm: 2.25, md: 2.5 },
                  borderRadius: { xs: 1.75, sm: 2 },
                  bgcolor: alpha('#3b82f6', 0.05),
                  border: `1px solid ${alpha('#3b82f6', 0.1)}`,
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  fontWeight={600} 
                  sx={{ 
                    color: '#3b82f6', 
                    mb: { xs: 1.25, sm: 1.5 }, 
                    fontSize: { xs: '0.875rem', sm: '0.938rem' },
                    lineHeight: 1.3,
                  }}
                >
                  💡 Tips for a compelling professional summary
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: { xs: 1.75, sm: 2 }, color: '#64748b' }}>
                  {writingTips.map((tip, index) => (
                    <Typography
                      key={index}
                      component="li"
                      variant="body2"
                      sx={{ 
                        mb: { xs: 0.625, sm: 0.75 }, 
                        fontSize: { xs: '0.813rem', sm: '0.875rem' }, 
                        lineHeight: 1.6 
                      }}
                    >
                      {tip}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
});

WorkerBiography.displayName = 'WorkerBiography';

export default WorkerBiography;
