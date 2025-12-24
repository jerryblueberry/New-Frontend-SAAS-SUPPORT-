import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
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

// Design tokens
const COLORS = {
  primary: {
    main: '#667EEA',
    light: '#818CF8',
    dark: '#5A67D8',
    subtle: '#F7FAFC',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  neutral: {
    50: '#FAFBFC',
    100: '#F4F6F8',
    200: '#E5E9ED',
    300: '#D1D9E0',
    400: '#9AA5B1',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
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
  const quillRef = useRef(null);

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
  }, [value, getPlainTextLength]);

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
    <Card
      elevation={0}
      sx={{
        height: fullHeight ? { xs: 'auto', sm: 'auto', md: '100%' } : 'auto',
        minHeight: fullHeight ? { xs: 'auto', sm: 'auto', md: '900px' } : 'auto',
        borderRadius: 4,
        border: '1px solid',
        borderColor: { xs: 'divider', sm: 'divider', md: 'rgba(102, 126, 234, 0.12)' },
        overflow: 'visible',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: { xs: 'white', sm: 'white', md: 'linear-gradient(to bottom, #ffffff 0%, #fafbff 100%)' },
        boxShadow: { 
          xs: 'none', 
          sm: 'none', 
          md: '0 4px 20px rgba(102, 126, 234, 0.08), 0 1px 3px rgba(0,0,0,0.05)' 
        },
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: { 
            xs: 'none', 
            sm: 'none', 
            md: '0 8px 40px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(0,0,0,0.08)' 
          },
          transform: { xs: 'none', sm: 'none', md: 'translateY(-4px)' },
          borderColor: { xs: 'divider', sm: 'divider', md: 'rgba(102, 126, 234, 0.2)' },
        }
      }}
    >
      {/* Premium Accent Line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
          backgroundSize: '200% 100%',
          animation: 'gradientShift 3s ease infinite',
          '@keyframes gradientShift': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' }
          }
        }}
      />

      <CardContent sx={{ 
        p: { xs: 3, sm: 3.5, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
          opacity: 0.5
        }
      }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)'
            }}
          >
            <Typography sx={{ fontSize: '1.35rem' }}>👤</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              color="text.primary" 
              sx={{ fontSize: { xs: '1.15rem', md: '1.3rem' }, mb: 0.5 }}
            >
              {label}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}
            >
              {description}
            </Typography>
          </Box>
        </Box>

        {/* Character Count Display */}
        {showCharacterCount && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, flexShrink: 0 }}>
            <Chip
              size="small"
              label={`${biographyCharCount}/${maxLength}`}
              variant="outlined"
              color={getCharacterCountColor}
              sx={{ 
                borderRadius: 2, 
                fontSize: '0.75rem', 
                height: 26,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                fontWeight: 600,
              }}
            />
          </Box>
        )}

        {/* React Quill Editor Container */}
        <Box 
          sx={{ 
            position: 'relative',
            width: '100%',
            flex: 1,
            minHeight: { xs: '300px', sm: '350px', md: '650px' },
            display: 'flex',
            flexDirection: 'column',
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            overflow: 'hidden',
            bgcolor: { xs: 'transparent', sm: 'rgba(255, 255, 255, 0.3)', md: 'rgba(255, 255, 255, 0.6)' },
            border: validationError 
              ? `1px solid ${theme.palette.error.main}` 
              : { xs: '1px solid rgba(0, 0, 0, 0.08)', sm: '1px solid rgba(102, 126, 234, 0.06)', md: '1px solid rgba(102, 126, 234, 0.08)' },
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: { 
              xs: 'inset 0 1px 4px rgba(0,0,0,0.02)', 
              sm: 'inset 0 2px 6px rgba(102, 126, 234, 0.03)', 
              md: 'inset 0 2px 8px rgba(102, 126, 234, 0.04)' 
            },
            '&:hover': {
              bgcolor: { xs: 'rgba(255, 255, 255, 0.5)', sm: 'rgba(255, 255, 255, 0.7)', md: 'rgba(255, 255, 255, 0.9)' },
              borderColor: validationError 
                ? theme.palette.error.main 
                : { xs: 'rgba(0, 0, 0, 0.12)', sm: 'rgba(102, 126, 234, 0.12)', md: 'rgba(102, 126, 234, 0.15)' },
              boxShadow: { 
                xs: 'inset 0 1px 6px rgba(0,0,0,0.03)', 
                sm: 'inset 0 2px 10px rgba(102, 126, 234, 0.05)', 
                md: 'inset 0 2px 12px rgba(102, 126, 234, 0.06)' 
              }
            },
            '&:focus-within': {
              borderColor: validationError 
                ? theme.palette.error.main 
                : { xs: 'rgba(102, 126, 234, 0.2)', sm: 'rgba(102, 126, 234, 0.25)', md: 'rgba(102, 126, 234, 0.3)' },
              boxShadow: { 
                xs: '0 0 0 3px rgba(102, 126, 234, 0.1)', 
                sm: '0 0 0 4px rgba(102, 126, 234, 0.12)', 
                md: '0 0 0 4px rgba(102, 126, 234, 0.15)' 
              }
            },
            // React Quill specific styles
            '& .quill-biography-editor': {
              width: '100% !important',
              display: 'block !important',
              visibility: 'visible !important',
              position: 'relative',
            },
            '& .ql-toolbar.ql-snow': {
              border: `1px solid rgba(0, 0, 0, 0.12) !important`,
              borderBottom: 'none',
              borderRadius: { xs: '8px 8px 0 0', sm: '10px 10px 0 0', md: '12px 12px 0 0' },
              background: `rgba(250, 251, 252, 0.8)`,
              padding: { xs: '8px 10px', sm: '9px 11px', md: '10px 12px' },
              width: '100% !important',
              boxSizing: 'border-box',
              display: 'block !important',
              visibility: 'visible !important',
              flexWrap: { xs: 'wrap', sm: 'nowrap', md: 'nowrap' },
              gap: { xs: '4px', sm: '6px', md: '8px' },
              [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                padding: '6px 8px',
                '& .ql-formats': {
                  marginRight: '8px !important',
                  marginBottom: '4px',
                }
              }
            },
            '& .ql-container.ql-snow': {
              border: `1px solid rgba(0, 0, 0, 0.12) !important`,
              borderRadius: { xs: '0 0 8px 8px', sm: '0 0 10px 10px', md: '0 0 12px 12px' },
              fontFamily: theme.typography.fontFamily,
              fontSize: { xs: '0.9rem', sm: '0.925rem', md: '0.95rem' },
              lineHeight: 1.6,
              width: '100% !important',
              boxSizing: 'border-box',
              background: theme.palette.background.paper,
              display: 'block !important',
              visibility: 'visible !important',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '& .ql-editor': {
              minHeight: { xs: '300px !important', sm: '350px !important', md: '650px !important' },
              maxHeight: { xs: '400px', sm: '500px', md: 'none' },
              padding: { xs: '12px 16px', sm: '14px 18px', md: '16px 20px' },
              color: theme.palette.text.primary,
              overflowY: 'auto',
              width: '100% !important',
              boxSizing: 'border-box',
              fontSize: { xs: '0.9rem', sm: '0.925rem', md: '0.95rem' },
              lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
              letterSpacing: '0.01em',
              display: 'block !important',
              visibility: 'visible !important',
              scrollbarWidth: 'thin',
              scrollbarColor: `rgba(154, 165, 177, 0.6) transparent`,
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': {
                width: { xs: '4px', sm: '5px', md: '6px' },
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: `rgba(154, 165, 177, 0.5)`,
                borderRadius: '3px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: `rgba(107, 114, 128, 0.7)`,
                }
              }
            },
            '& .ql-editor.ql-blank::before': {
              content: `"${placeholder}"`,
              color: `rgba(0, 0, 0, 0.6)`,
              fontStyle: 'italic',
              fontWeight: 400,
              left: { xs: '16px', sm: '18px', md: '20px' },
              right: { xs: '16px', sm: '18px', md: '20px' },
              top: { xs: '12px', sm: '14px', md: '16px' },
              bottom: 'auto',
              position: 'absolute',
              pointerEvents: 'none',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
              fontSize: { xs: '0.9rem', sm: '0.925rem', md: '0.95rem' },
              letterSpacing: '0.01em',
              zIndex: 1,
            },
            '& .ql-editor:focus': {
              outline: 'none',
              background: `rgba(102, 126, 234, 0.01)`,
              borderColor: 'transparent',
            },
            '& .ql-editor:focus-within': {
              background: `rgba(102, 126, 234, 0.01)`,
            },
            '& .ql-editor::selection': {
              background: `rgba(102, 126, 234, 0.2)`,
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
              background: `rgba(102, 126, 234, 0.08)`,
              transform: 'scale(1)',
            },
            '& .ql-toolbar button:hover': {
              color: theme.palette.primary.main,
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px rgba(102, 126, 234, 0.15)`,
            },
            '& .ql-toolbar button.ql-active': {
              background: `rgba(102, 126, 234, 0.12)`,
              color: theme.palette.primary.main,
              transform: 'translateY(0)',
              boxShadow: `0 2px 8px rgba(102, 126, 234, 0.2)`,
            },
            '& .ql-toolbar button.ql-active::before': {
              background: `rgba(102, 126, 234, 0.08)`,
              transform: 'scale(1)',
            },
            '& .ql-toolbar .ql-picker': {
              borderRadius: '8px',
              transition: 'all 0.25s ease',
            },
            '& .ql-toolbar .ql-picker:hover': {
              background: `rgba(102, 126, 234, 0.08)`,
            },
            '& .ql-container': {
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '&:hover .ql-container': {
              borderColor: `rgba(102, 126, 234, 0.3)`,
            },
            '&.focused .ql-container, & .ql-container:focus-within': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 4px rgba(102, 126, 234, 0.08), 0 8px 32px rgba(102, 126, 234, 0.12)`,
              transform: 'translateY(-2px)',
            },
            '& .ql-editor p': {
              margin: { xs: '0.4em 0', sm: '0.45em 0', md: '0.5em 0' },
              textAlign: 'left',
              lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
              fontSize: { xs: '0.9rem', sm: '0.925rem', md: '0.95rem' },
              letterSpacing: '0.01em',
            },
            '& .ql-editor p:first-child': {
              marginTop: 0,
            },
            '& .ql-editor p:last-child': {
              marginBottom: 0,
            },
            '& .ql-editor ul, & .ql-editor ol': {
              margin: { xs: '0.4em 0', sm: '0.45em 0', md: '0.5em 0' },
              paddingLeft: { xs: '1.25em', sm: '1.375em', md: '1.5em' },
              lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
            },
            '& .ql-editor li': {
              margin: { xs: '0.25em 0', sm: '0.275em 0', md: '0.3em 0' },
              lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
              fontSize: { xs: '0.9rem', sm: '0.925rem', md: '0.95rem' },
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
              color: theme.palette.primary.main,
              textDecoration: 'none',
              background: `linear-gradient(transparent 60%, rgba(102, 126, 234, 0.2) 60%)`,
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            },
            '& .ql-editor a:hover': {
              background: `rgba(102, 126, 234, 0.15)`,
              transform: 'translateY(-1px)',
            },
            '& .ql-editor blockquote': {
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              margin: { xs: '0.6em 0', sm: '0.675em 0', md: '0.75em 0' },
              paddingLeft: { xs: '1em', sm: '1.125em', md: '1.25em' },
              paddingRight: { xs: '0.75em', sm: '0.875em', md: '1em' },
              paddingTop: { xs: '0.4em', sm: '0.45em', md: '0.5em' },
              paddingBottom: { xs: '0.4em', sm: '0.45em', md: '0.5em' },
              color: `rgba(0, 0, 0, 0.85)`,
              fontStyle: 'italic',
              background: `rgba(250, 251, 252, 0.4)`,
              borderRadius: '0 8px 8px 0',
              lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
              fontSize: { xs: '0.85rem', sm: '0.875rem', md: '0.9rem' },
              letterSpacing: '0.01em',
            },
            '& .ql-toolbar.ql-snow:hover': {
              background: `linear-gradient(135deg, rgba(250, 251, 252, 0.95) 0%, rgba(244, 246, 248, 0.7) 100%)`,
            },
            '& .ql-tooltip': {
              borderRadius: { xs: '6px', sm: '7px', md: '8px' },
              border: `1px solid rgba(0, 0, 0, 0.12)`,
              boxShadow: `0 8px 32px rgba(0, 0, 0, 0.12)`,
              background: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
            },
            '&.loading': {
              opacity: 0.7,
              pointerEvents: 'none',
            },
            '&.loading .ql-editor': {
              background: `rgba(244, 246, 248, 0.3)`,
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

        {/* Error Message */}
        {validationError && (
          <Typography 
            variant="caption" 
            color="error" 
            sx={{ mt: 1, display: 'block', fontSize: '0.75rem', fontWeight: 500 }}
          >
            {validationError}
          </Typography>
        )}
      </CardContent>
    </Card>
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

