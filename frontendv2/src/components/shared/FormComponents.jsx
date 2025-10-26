import React, { useState, forwardRef } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  FormHelperText,
  InputLabel,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Autocomplete,
  Chip,
  Box,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
  FormGroup,
  Alert,
  Divider,
  Paper,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CalendarToday,
  AttachFile,
  Clear,
  Add,
  Remove
} from '@mui/icons-material';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';

// Base Input Component
export const FormInput = forwardRef(({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  multiline = false,
  rows = 4,
  maxLength,
  startAdornment,
  endAdornment,
  fullWidth = true,
  size = 'medium',
  variant = 'outlined',
  sx = {},
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const newValue = event.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange && onChange(event);
  };

  const getEndAdornment = () => {
    if (type === 'password') {
      return (
        <InputAdornment position="end">
          <IconButton
            onClick={() => setShowPassword(!showPassword)}
            edge="end"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      );
    }
    return endAdornment;
  };

  return (
    <TextField
      ref={ref}
      label={label}
      name={name}
      type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
      value={value || ''}
      onChange={handleChange}
      onBlur={onBlur}
      error={!!error}
      helperText={error || helperText || (maxLength && `${(value || '').length}/${maxLength}`)}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      fullWidth={fullWidth}
      size={size}
      variant={variant}
      sx={{
        '& .MuiInputBase-root': {
          minHeight: '48px',
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'text.primary',
        },
        '& .MuiInputBase-input': {
          fontSize: '1rem',
          fontWeight: 400,
          lineHeight: 1.5,
          padding: '14px 14px',
        },
        '& .MuiFormHelperText-root': {
          fontSize: '0.75rem',
          fontWeight: 400,
          lineHeight: 1.4,
          marginTop: '0.25rem',
        },
        '& .MuiFormHelperText-root.Mui-error': {
          color: 'error.main',
        },
        ...sx
      }}
      InputProps={{
        startAdornment,
        endAdornment: getEndAdornment(),
      }}
      {...props}
    />
  );
});

// Select Component
export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  multiple = false,
  fullWidth = true,
  size = 'medium',
  variant = 'outlined',
  sx = {},
  ...props
}) => {
  return (
    <FormControl 
      fullWidth={fullWidth} 
      error={!!error} 
      size={size} 
      variant={variant}
      sx={{
        minWidth: '250px',
        flex: 1,
        '& .MuiInputBase-root': {
          minHeight: '48px',
          width: '100%',
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'text.primary',
        },
        '& .MuiSelect-select': {
          fontSize: '1rem',
          fontWeight: 400,
          lineHeight: 1.5,
          padding: '14px 14px',
          minWidth: '200px',
        },
        '& .MuiFormHelperText-root': {
          fontSize: '0.75rem',
          fontWeight: 400,
          lineHeight: 1.4,
          marginTop: '0.25rem',
        },
        ...sx
      }}
    >
      <InputLabel required={required}>{label}</InputLabel>
      <Select
        name={name}
        value={value || (multiple ? [] : '')}
        onChange={onChange}
        onBlur={onBlur}
        label={label}
        disabled={disabled}
        multiple={multiple}
        renderValue={multiple ? (selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => {
              const option = options.find(opt => opt.value === value);
              return <Chip key={value} label={option?.label || value} size="small" />;
            })}
          </Box>
        ) : undefined}
        {...props}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {multiple && (
              <Checkbox checked={value?.indexOf(option.value) > -1} />
            )}
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// Autocomplete Component
export const FormAutocomplete = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  multiple = false,
  freeSolo = false,
  fullWidth = true,
  size = 'medium',
  ...props
}) => {
  return (
    <Autocomplete
      multiple={multiple}
      freeSolo={freeSolo}
      options={options}
      getOptionLabel={(option) => option.label || option}
      value={value}
      onChange={(event, newValue) => {
        onChange && onChange({
          target: { name, value: newValue }
        });
      }}
      onBlur={onBlur}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          name={name}
          error={!!error}
          helperText={error || helperText}
          required={required}
          placeholder={placeholder}
          fullWidth={fullWidth}
          size={size}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={option.label || option}
            {...getTagProps({ index })}
            key={index}
            size="small"
          />
        ))
      }
      {...props}
    />
  );
};

// Checkbox Component
export const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  color = 'primary',
  ...props
}) => {
  return (
    <FormControl error={!!error} component="fieldset">
      <FormControlLabel
        control={
          <Checkbox
            name={name}
            checked={checked || false}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            color={color}
            {...props}
          />
        }
        label={label}
      />
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// Radio Group Component
export const FormRadioGroup = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  row = false,
  color = 'primary',
  ...props
}) => {
  return (
    <FormControl error={!!error} component="fieldset">
      <FormLabel component="legend" required={required}>{label}</FormLabel>
      <RadioGroup
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        row={row}
        {...props}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio color={color} />}
            label={option.label}
            disabled={disabled || option.disabled}
          />
        ))}
      </RadioGroup>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// Switch Component
export const FormSwitch = ({
  label,
  name,
  checked,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  color = 'primary',
  ...props
}) => {
  return (
    <FormControl error={!!error} component="fieldset">
      <FormControlLabel
        control={
          <Switch
            name={name}
            checked={checked || false}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            color={color}
            {...props}
          />
        }
        label={label}
      />
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// Date Picker Component
export const FormDatePicker = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'medium',
  ...props
}) => {
  return (
    <DatePicker
      label={label}
      value={value}
      onChange={(newValue) => {
        onChange && onChange({
          target: { name, value: newValue }
        });
      }}
      onBlur={onBlur}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          error={!!error}
          helperText={error || helperText}
          required={required}
          fullWidth={fullWidth}
          size={size}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <InputAdornment position="end">
                <CalendarToday />
              </InputAdornment>
            ),
          }}
        />
      )}
      {...props}
    />
  );
};

// File Upload Component
export const FormFileUpload = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  multiple = false,
  accept,
  maxSize,
  fullWidth = true,
  ...props
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file size
    if (maxSize) {
      const oversizedFiles = files.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        return; // Handle error
      }
    }

    onChange && onChange({
      target: { name, value: multiple ? files : files[0] }
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    onChange && onChange({
      target: { name, value: multiple ? files : files[0] }
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index) => {
    if (multiple && Array.isArray(value)) {
      const newFiles = value.filter((_, i) => i !== index);
      onChange && onChange({
        target: { name, value: newFiles }
      });
    } else {
      onChange && onChange({
        target: { name, value: null }
      });
    }
  };

  return (
    <FormControl fullWidth={fullWidth} error={!!error}>
      <FormLabel required={required}>{label}</FormLabel>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          border: dragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
          backgroundColor: dragOver ? '#f5f5f5' : 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          '&:hover': {
            backgroundColor: disabled ? 'transparent' : '#f5f5f5'
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          name={name}
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          onBlur={onBlur}
          disabled={disabled}
          style={{ display: 'none' }}
          id={`file-upload-${name}`}
          {...props}
        />
        <label htmlFor={`file-upload-${name}`} style={{ cursor: 'inherit' }}>
          <Box textAlign="center">
            <AttachFile sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              Drop files here or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {accept && `Accepted formats: ${accept}`}
              {maxSize && ` • Max size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`}
            </Typography>
          </Box>
        </label>
      </Paper>
      
      {/* Display selected files */}
      {value && (
        <Box mt={1}>
          {multiple && Array.isArray(value) ? (
            value.map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                onDelete={() => removeFile(index)}
                deleteIcon={<Clear />}
                sx={{ mr: 1, mb: 1 }}
              />
            ))
          ) : value.name ? (
            <Chip
              label={value.name}
              onDelete={() => removeFile()}
              deleteIcon={<Clear />}
            />
          ) : null}
        </Box>
      )}
      
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// Dynamic Form Array Component
export const FormArray = ({
  label,
  name,
  value = [],
  onChange,
  renderItem,
  addButtonText = 'Add Item',
  minItems = 0,
  maxItems,
  error,
  helperText,
}) => {
  const addItem = () => {
    if (maxItems && value.length >= maxItems) return;
    
    const newValue = [...value, {}];
    onChange && onChange({
      target: { name, value: newValue }
    });
  };

  const removeItem = (index) => {
    if (value.length <= minItems) return;
    
    const newValue = value.filter((_, i) => i !== index);
    onChange && onChange({
      target: { name, value: newValue }
    });
  };

  const updateItem = (index, itemValue) => {
    const newValue = [...value];
    newValue[index] = itemValue;
    onChange && onChange({
      target: { name, value: newValue }
    });
  };

  return (
    <FormControl fullWidth error={!!error}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <FormLabel>{label}</FormLabel>
        <Button
          startIcon={<Add />}
          onClick={addItem}
          disabled={maxItems && value.length >= maxItems}
          size="small"
        >
          {addButtonText}
        </Button>
      </Box>
      
      {value.map((item, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Box flex={1}>
              {renderItem && renderItem(item, index, (newItem) => updateItem(index, newItem))}
            </Box>
            <IconButton
              onClick={() => removeItem(index)}
              disabled={value.length <= minItems}
              color="error"
              size="small"
            >
              <Remove />
            </IconButton>
          </Box>
        </Paper>
      ))}
      
      {value.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
          No items added yet. Click "{addButtonText}" to get started.
        </Typography>
      )}
      
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// Form Section Component
export const FormSection = ({
  title,
  subtitle,
  children,
  collapsible = false,
  defaultExpanded = true,
  ...props
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box mb={3} className="form-group" {...props}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        sx={{ cursor: collapsible ? 'pointer' : 'default' }}
        onClick={collapsible ? () => setExpanded(!expanded) : undefined}
      >
        <Box>
          <Typography variant="h3" className="form-section-heading" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 0.75 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" className="text-secondary" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      
      {(!collapsible || expanded) && (
        <Box>
          {children}
        </Box>
      )}
      
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

// Form Actions Component
export const FormActions = ({
  submitText = 'Submit',
  cancelText = 'Cancel',
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
  submitColor = 'primary',
  align = 'right',
  ...props
}) => {
  return (
    <Box
      display="flex"
      gap={2}
      justifyContent={align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end'}
      mt={3}
      {...props}
    >
      {onCancel && (
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          size="large"
          className="button-text"
          sx={{ 
            minHeight: '48px',
            fontSize: '0.875rem',
            fontWeight: 500,
            px: 3,
            py: 1.5
          }}
        >
          {cancelText}
        </Button>
      )}
      <Button
        type="submit"
        variant="contained"
        color={submitColor}
        onClick={onSubmit}
        disabled={disabled || loading}
        size="large"
        className="button-text"
        sx={{ 
          minHeight: '48px',
          fontSize: '0.875rem',
          fontWeight: 500,
          px: 3,
          py: 1.5
        }}
      >
        {loading ? 'Loading...' : submitText}
      </Button>
    </Box>
  );
};

export default {
  FormInput,
  FormSelect,
  FormAutocomplete,
  FormCheckbox,
  FormRadioGroup,
  FormSwitch,
  FormDatePicker,
  FormFileUpload,
  FormArray,
  FormSection,
  FormActions
};
