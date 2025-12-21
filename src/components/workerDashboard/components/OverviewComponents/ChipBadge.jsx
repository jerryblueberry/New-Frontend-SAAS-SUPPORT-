import React from 'react';
import PropTypes from 'prop-types';
import { CHIP_COLORS, CHIP_SIZES } from './utils/constants';

/**
 * ChipBadge Component
 * 
 * A small badge component for displaying status indicators, counts, or labels
 * in a compact, visually appealing format.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.chip - Chip data object
 * @param {string} props.chip.label - Text to display in the chip
 * @param {string} props.chip.color - Color variant ('success', 'warning', 'error', 'default', 'info')
 * @param {string} props.size - Size variant ('sm' or 'md')
 * @returns {JSX.Element} Chip badge element
 */
const ChipBadge = ({ chip, size = 'md' }) => {
    const sizeClasses = CHIP_SIZES[size] || CHIP_SIZES.md;
    const colorClasses = CHIP_COLORS[chip.color] || CHIP_COLORS.default;

    return (
        <span className={`
            inline-flex items-center gap-1 font-semibold rounded-full border
            ${sizeClasses}
            ${colorClasses}
        `}>
            {chip.label}
        </span>
    );
};

ChipBadge.propTypes = {
    chip: PropTypes.shape({
        label: PropTypes.string.isRequired,
        color: PropTypes.oneOf(['success', 'warning', 'error', 'default', 'info']),
    }).isRequired,
    size: PropTypes.oneOf(['sm', 'md']),
};

export default ChipBadge;

