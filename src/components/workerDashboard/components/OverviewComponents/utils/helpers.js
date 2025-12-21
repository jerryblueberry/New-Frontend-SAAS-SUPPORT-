import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { VERIFICATION_STATUS_CONFIG } from './constants';

/**
 * Get certification color based on stats
 * 
 * @param {Object} certStats - Certification statistics
 * @returns {string} Color variant ('error', 'warning', or 'primary')
 */
export const getCertColor = (certStats) => {
    if ((certStats.expired || 0) > 0 || (certStats.rejected || 0) > 0) return 'error';
    if ((certStats.expiring || 0) > 0 || (certStats.pending || 0) > 0) return 'warning';
    return 'primary';
};

/**
 * Get verification configuration based on status
 * 
 * @param {string} verificationStatus - Current verification status
 * @returns {Object} Verification configuration with colors and icon
 */
export const getVerificationConfig = (verificationStatus) => {
    const defaultConfig = VERIFICATION_STATUS_CONFIG.Verified;
    
    if (!verificationStatus) {
        return {
            ...VERIFICATION_STATUS_CONFIG.Unverified,
            icon: AlertTriangle,
        };
    }

    const config = VERIFICATION_STATUS_CONFIG[verificationStatus] || defaultConfig;
    
    // Map icon string to component
    const iconMap = {
        AlertTriangle,
        Clock,
        Shield,
    };

    return {
        ...config,
        icon: iconMap[config.icon] || Shield,
    };
};

/**
 * Get profile completeness status text
 * 
 * @param {number} percentage - Profile completeness percentage
 * @returns {string} Status text
 */
export const getCompletenessStatusText = (percentage) => {
    if (percentage === 100) return 'Complete';
    if (percentage >= 75) return 'Almost There';
    if (percentage >= 50) return 'In Progress';
    return 'Getting Started';
};

/**
 * Get profile completeness color configuration
 * 
 * @param {number} percentage - Profile completeness percentage
 * @returns {Object} Color configuration
 */
export const getProfileCompletenessColors = (percentage) => {
    if (percentage === 100) {
        return {
            type: 'complete',
            colors: {
                bg: 'bg-emerald-50/50',
                border: 'border-emerald-200/60',
                accent: 'bg-emerald-500',
                text: 'text-emerald-700',
                progress: 'bg-emerald-500',
                progressBg: 'bg-emerald-100/50',
            },
        };
    }
    
    if (percentage < 50) {
        return {
            type: 'low',
            colors: {
                bg: 'bg-slate-50',
                border: 'border-slate-200',
                accent: 'bg-slate-400',
                text: 'text-slate-700',
                progress: 'bg-slate-500',
                progressBg: 'bg-slate-100',
            },
        };
    }
    
    return {
        type: 'medium',
        colors: {
            bg: 'bg-blue-50/50',
            border: 'border-blue-200/60',
            accent: 'bg-blue-500',
            text: 'text-blue-700',
            progress: 'bg-blue-500',
            progressBg: 'bg-blue-100/50',
        },
    };
};

/**
 * Calculate verification progress
 * 
 * @param {Array} verificationItems - Array of verification items with verified status
 * @returns {Object} Progress data with count and percentage
 */
export const calculateVerificationProgress = (verificationItems) => {
    const verifiedCount = verificationItems.filter(item => item.verified).length;
    const totalCount = verificationItems.length || 3;
    const percentage = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;
    
    return {
        verifiedCount,
        totalCount,
        percentage,
    };
};

/**
 * Build verification items from verification detail
 * 
 * @param {Object} verificationDetail - Verification detail object
 * @returns {Array} Array of verification items
 */
export const buildVerificationItems = (verificationDetail) => {
    if (!verificationDetail) return [];
    
    return [
        {
            label: 'Identity',
            verified: verificationDetail.identityVerified || false,
        },
        {
            label: 'Background',
            verified: verificationDetail.backgroundCheckPassed || false,
        },
        {
            label: 'Skills',
            verified: verificationDetail.skillsVerified || false,
        },
    ];
};

/**
 * Build certification issues from cert stats
 * 
 * @param {Object} certStats - Certification statistics
 * @returns {Array} Array of certification issues
 */
export const buildCertificationIssues = (certStats) => {
    const issues = [];
    
    if ((certStats.pending || 0) > 0) {
        issues.push({ 
            label: `${certStats.pending} pending`, 
            type: 'warning' 
        });
    }
    
    if ((certStats.expiring || 0) > 0) {
        issues.push({ 
            label: `${certStats.expiring} expiring`, 
            type: 'warning' 
        });
    }
    
    if (((certStats.rejected || 0) + (certStats.expired || 0)) > 0) {
        issues.push({ 
            label: `${(certStats.rejected || 0) + (certStats.expired || 0)} issues`, 
            type: 'error' 
        });
    }
    
    return issues;
};

