import React from 'react';
import { Box, TextField, Typography, Stack, FormControlLabel, Checkbox } from '@mui/material';

const CustomFieldsRenderer = ({ customFields, readOnly, onChange }) => {
  if (!customFields || !customFields.length) {
    return <Typography variant="body2" color="text.secondary">No custom fields available.</Typography>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Custom Fields</Typography>
      <Stack spacing={2}>
        {customFields.map((field) => {
          const handleChange = (e) => {
            if (onChange) {
              onChange(field._id, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
            }
          };

          switch (field.fieldType) {
            case 'text':
              return (
                <TextField
                  key={field._id}
                  label={field.fieldName}
                  value={field.value || ''}
                  fullWidth
                  multiline
                  minRows={2}
                  onChange={handleChange}
                  InputProps={{ readOnly }}
                />
              );

            case 'number':
              return (
                <TextField
                  key={field._id}
                  label={field.fieldName}
                  type="number"
                  value={field.value || ''}
                  fullWidth
                  onChange={handleChange}
                  InputProps={{ readOnly }}
                />
              );

            case 'boolean':
              return (
                <FormControlLabel
                  key={field._id}
                  control={
                    <Checkbox
                      checked={!!field.value}
                      onChange={handleChange}
                      disabled={readOnly}
                    />
                  }
                  label={field.fieldName}
                />
              );

            case 'date':
              return (
                <TextField
                  key={field._id}
                  label={field.fieldName}
                  type="date"
                  value={field.value || ''}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  onChange={handleChange}
                  InputProps={{ readOnly }}
                />
              );

            case 'select':
              return (
                <TextField
                  key={field._id}
                  label={field.fieldName}
                  value={field.value || ''}
                  select
                  fullWidth
                  SelectProps={{ native: true }}
                  onChange={handleChange}
                  InputProps={{ readOnly }}
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </TextField>
              );

            default:
              return (
                <TextField
                  key={field._id}
                  label={field.fieldName}
                  value={field.value || ''}
                  fullWidth
                  onChange={handleChange}
                  InputProps={{ readOnly }}
                />
              );
          }
        })}
      </Stack>
    </Box>
  );
};

export default CustomFieldsRenderer;
