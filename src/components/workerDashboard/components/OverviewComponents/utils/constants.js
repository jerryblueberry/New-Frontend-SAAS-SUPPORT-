/**
 * Constants for Overview Components
 * 
 * Centralized color classes, size configurations, and other constants
 * used across overview dashboard components.
 */

/**
 * Color scheme configurations for stat cards
 */
export const STAT_CARD_COLORS = {
    primary: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        accent: 'bg-blue-500',
        text: 'text-blue-600',
    },
    success: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        accent: 'bg-emerald-500',
        text: 'text-emerald-600',
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        accent: 'bg-amber-500',
        text: 'text-amber-600',
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        accent: 'bg-red-500',
        text: 'text-red-600',
    },
    info: {
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        accent: 'bg-cyan-500',
        text: 'text-cyan-600',
    },
};

/**
 * Chip badge color classes
 */
export const CHIP_COLORS = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

/**
 * Chip badge size classes
 */
export const CHIP_SIZES = {
    sm: 'text-[10px] px-1.5 py-0.5 h-4',
    md: 'text-xs px-2 py-1 h-5',
};

/**
 * Profile completeness status color configurations
 */
export const PROFILE_COMPLETENESS_COLORS = {
    complete: {
        bg: 'bg-emerald-50/50',
        border: 'border-emerald-200/60',
        accent: 'bg-emerald-500',
        text: 'text-emerald-700',
        progress: 'bg-emerald-500',
        progressBg: 'bg-emerald-100/50',
    },
    low: {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        accent: 'bg-slate-400',
        text: 'text-slate-700',
        progress: 'bg-slate-500',
        progressBg: 'bg-slate-100',
    },
    medium: {
        bg: 'bg-blue-50/50',
        border: 'border-blue-200/60',
        accent: 'bg-blue-500',
        text: 'text-blue-700',
        progress: 'bg-blue-500',
        progressBg: 'bg-blue-100/50',
    },
};

/**
 * Verification status configurations
 */
export const VERIFICATION_STATUS_CONFIG = {
    Unverified: {
        color: 'error',
        icon: 'AlertTriangle',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        accentColor: 'bg-red-500',
    },
    'Partially Verified': {
        color: 'warning',
        icon: 'Clock',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        accentColor: 'bg-amber-500',
    },
    Verified: {
        color: 'success',
        icon: 'Shield',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        accentColor: 'bg-emerald-500',
    },
};

