import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';

// Map roles to MUI palette tokens per requirement
const roleToken = (role) => {
  const r = (role || '').toString().toLowerCase();
  switch (r) {
    case 'admin':
      return 'error.main';
    case 'manager':
      return 'primary.main';
    case 'developer':
      return 'info.main';
    case 'tester':
      return 'warning.main';
    case 'hr':
      return 'success.main';
    case 'sales':
      return 'secondary.main';
    case 'marketing':
      // purple not standard in MUI by default; fall back to primary if not defined on theme
      return 'purple.main';
    case 'intern':
      return 'grey.600';
    default:
      return 'grey.500';
  }
};

const getInitials = ({ firstName, lastName, name, username, email }) => {
  if (firstName || lastName) {
    const f = (firstName || '').trim();
    const l = (lastName || '').trim();
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || '?';
  }
  const source = (name || username || email || '').trim();
  if (!source) return '?';
  const parts = source.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

const UserAvatarName = ({
  firstName,
  lastName,
  name,
  username,
  email,
  role,
  size = 40,
  fontSize = '1rem',
  fontWeight = 600,
  mr = 2,
  primaryText, // optional override for name display
  secondaryText, // optional subtitle (email, etc.)
}) => {
  const initials = getInitials({ firstName, lastName, name, username, email });
  const displayName = primaryText || (name || `${firstName || ''} ${lastName || ''}`.trim() || username || email || '');

  return (
    <Box display="flex" alignItems="center">
      <Avatar
        sx={{
          width: size,
          height: size,
          mr,
          bgcolor: roleToken(role),
          color: '#fff',
          fontSize,
          fontWeight,
        }}
      >
        {initials}
      </Avatar>
      <Box>
        {displayName && (
          <Typography variant="body2" fontWeight={600} noWrap>
            {displayName}
          </Typography>
        )}
        {secondaryText && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {secondaryText}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default UserAvatarName;
