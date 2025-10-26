import React from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { clsx } from 'clsx';

/**
 * Enhanced Dialog Component with size variants and proper structure
 * 
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {function} props.onClose - Close handler
 * @param {string} props.size - Dialog size: 'small' | 'medium' | 'large' | 'full'
 * @param {string} props.title - Dialog title
 * @param {string} props.subtitle - Optional subtitle
 * @param {boolean} props.showCloseButton - Show close button (default: true)
 * @param {React.ReactNode} props.children - Dialog content
 * @param {React.ReactNode} props.actions - Dialog actions/footer buttons
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 */
const Dialog = ({
  open,
  onClose,
  size = 'medium',
  title,
  subtitle,
  showCloseButton = true,
  children,
  actions,
  loading = false,
  className,
  ...props
}) => {
  const sizeClasses = {
    small: 'dialog-small',
    medium: 'dialog-medium',
    large: 'dialog-large',
    full: 'dialog-full',
  };

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        className: clsx(
          'dialog-container',
          sizeClasses[size],
          { 'dialog-loading': loading },
          className
        ),
      }}
      BackdropProps={{
        className: 'dialog-backdrop',
      }}
      {...props}
    >
      {title && (
        <MuiDialogTitle className="dialog-header">
          <Box className="dialog-header-content">
            <Typography className="dialog-title" component="h3">
              {title}
            </Typography>
            {subtitle && (
              <Typography className="dialog-subtitle">
                {subtitle}
              </Typography>
            )}
          </Box>
          {showCloseButton && onClose && (
            <IconButton
              className="dialog-close-button"
              onClick={onClose}
              aria-label="close"
            >
              <Close />
            </IconButton>
          )}
        </MuiDialogTitle>
      )}

      <MuiDialogContent className="dialog-body">
        {children}
      </MuiDialogContent>

      {actions && (
        <MuiDialogActions className="dialog-footer">
          {actions}
        </MuiDialogActions>
      )}
    </MuiDialog>
  );
};

/**
 * Confirmation Dialog Component
 * Pre-configured for confirmation/alert scenarios
 */
export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning', // 'warning' | 'error' | 'info'
  confirmColor = 'primary',
  loading = false,
  icon: Icon,
}) => {
  const iconClasses = {
    warning: 'dialog-confirmation-icon-warning',
    error: 'dialog-confirmation-icon-error',
    info: 'dialog-confirmation-icon-info',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="small"
      loading={loading}
    >
      <Box className="dialog-confirmation">
        {Icon && (
          <Box className={clsx('dialog-confirmation-icon', iconClasses[variant])}>
            <Icon sx={{ fontSize: 32 }} />
          </Box>
        )}
        <Typography className="dialog-confirmation-title">
          {title}
        </Typography>
        <Typography className="dialog-confirmation-message">
          {message}
        </Typography>
      </Box>

      <MuiDialogActions className="dialog-footer">
        <button
          className="dialog-button-secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          className={clsx(
            'dialog-button-primary',
            { 'dialog-button-destructive': variant === 'error' }
          )}
          onClick={onConfirm}
          disabled={loading}
          color={confirmColor}
        >
          {confirmText}
        </button>
      </MuiDialogActions>
    </Dialog>
  );
};

/**
 * Dialog Section Component
 * For organizing content within dialogs
 */
export const DialogSection = ({ title, description, children }) => (
  <Box className="dialog-section">
    {title && (
      <Typography className="dialog-section-title">
        {title}
      </Typography>
    )}
    {description && (
      <Typography className="dialog-section-description">
        {description}
      </Typography>
    )}
    {children}
  </Box>
);

/**
 * Dialog Alert Component
 * For showing alerts/notices within dialogs
 */
export const DialogAlert = ({ type = 'info', children }) => {
  const alertClasses = {
    info: 'dialog-alert-info',
    warning: 'dialog-alert-warning',
    error: 'dialog-alert-error',
    success: 'dialog-alert-success',
  };

  return (
    <Box className={clsx('dialog-alert', alertClasses[type])}>
      {children}
    </Box>
  );
};

export default Dialog;
