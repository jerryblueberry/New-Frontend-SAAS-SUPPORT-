import React from 'react';
import PropTypes from 'prop-types';
import {
  PictureAsPdf,
  Description,
  Image
} from '@mui/icons-material';

/**
 * Document Icon Component
 * Returns appropriate icon based on file extension
 */
const DocumentIcon = ({ fileName, ...iconProps }) => {
  if (!fileName) return <Description {...iconProps} />;
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return <PictureAsPdf {...iconProps} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <Image {...iconProps} />;
    default:
      return <Description {...iconProps} />;
  }
};

DocumentIcon.propTypes = {
  fileName: PropTypes.string
};

export default DocumentIcon;
