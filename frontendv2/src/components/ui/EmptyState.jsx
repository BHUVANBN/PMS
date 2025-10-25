import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { 
  FolderOpen, 
  Assignment, 
  Group, 
  BugReport,
  Event,
  Description
} from '@mui/icons-material';

const iconMap = {
  projects: FolderOpen,
  tasks: Assignment,
  team: Group,
  bugs: BugReport,
  events: Event,
  documents: Description,
  default: FolderOpen,
};

const EmptyState = ({ 
  icon = 'default',
  title = 'No items found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  children
}) => {
  const IconComponent = iconMap[icon] || iconMap.default;

  return (
    <Box className="card-empty-state">
      <IconComponent className="card-empty-state-icon" sx={{ fontSize: 64 }} />
      <Typography className="card-empty-state-title" variant="h6">
        {title}
      </Typography>
      <Typography className="card-empty-state-description" variant="body2">
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Box className="card-empty-state-action">
          <Button 
            variant="contained" 
            color="primary"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </Box>
      )}
      {children}
    </Box>
  );
};

export default EmptyState;
