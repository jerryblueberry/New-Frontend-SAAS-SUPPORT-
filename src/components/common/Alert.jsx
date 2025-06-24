import React from 'react';
import MuiAlert from '@mui/material/Alert';

// A simple wrapper for MUI's Alert to allow easy usage and future customization
const Alert = React.forwardRef(function Alert(props, ref) {
  // Accept severity, children, and any other props
  const { severity = 'info', children, ...rest } = props;
  return (
    <MuiAlert ref={ref} severity={severity} variant="filled" {...rest}>
      {children}
    </MuiAlert>
  );
});

export default Alert;
