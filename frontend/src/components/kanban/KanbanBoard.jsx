import React, { useState, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanFilters } from './KanbanFilters';
import { Button } from '../ui/Button';

export const KanbanBoard = ({
  projectId,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  className = ''
}) => {
  const [tasks, setTasks] = useState([]);
  const [columns] = useState([
    { id: 'todo', title: 'To Do', color: '#6b7280' },
    { id: 'in-progress', title: 'In Progress', color: '#3b82f6' },
    { id: 'review', title: 'In Review', color: '#f59e0b' },
    { id: 'done', title: 'Done', color: '#10b981' }
  ]);
  const [filters, setFilters] = useState({
    assignee: '',
    priority: '',
    search: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [projectId, filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockTasks = [
        {
          id: 1,
          title: 'Implement user authentication',
          description: 'Add login and registration functionality',
          status: 'todo',
          priority: 'high',
          assignee: { id: 1, name: 'John Doe', avatar: null },
          tags: ['backend', 'security'],
          dueDate: '2024-02-15',
          estimatedHours: 8
        },
        {
          id: 2,
          title: 'Design dashboard UI',
          description: 'Create wireframes and mockups for the main dashboard',
          status: 'in-progress',
          priority: 'medium',
          assignee: { id: 2, name: 'Jane Smith', avatar: null },
          tags: ['frontend', 'design'],
          dueDate: '2024-02-10',
          estimatedHours: 12
        },
        {
          id: 3,
          title: 'Setup CI/CD pipeline',
          description: 'Configure automated testing and deployment',
          status: 'review',
          priority: 'high',
          assignee: { id: 3, name: 'Mike Johnson', avatar: null },
          tags: ['devops', 'automation'],
          dueDate: '2024-02-08',
          estimatedHours: 6
        },
        {
          id: 4,
          title: 'Write API documentation',
          description: 'Document all REST API endpoints',
          status: 'done',
          priority: 'low',
          assignee: { id: 1, name: 'John Doe', avatar: null },
          tags: ['documentation'],
          dueDate: '2024-02-05',
          estimatedHours: 4
        }
      ];
      
      setTasks(mockTasks.filter(task => 
        (!filters.assignee || task.assignee.id.toString() === filters.assignee) &&
        (!filters.priority || task.priority === filters.priority) &&
        (!filters.search || task.title.toLowerCase().includes(filters.search.toLowerCase()))
      ));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId, newStatus) => {
    try {
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);
      
      if (onTaskUpdate) {
        onTaskUpdate(taskId, { status: newStatus });
      }
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleTaskEdit = (task) => {
    if (onTaskUpdate) {
      onTaskUpdate(task.id, task);
    }
  };

  const handleTaskDelete = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    if (onTaskDelete) {
      onTaskDelete(taskId);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const boardStyles = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const headerStyles = {
    padding: '16px 20px',
    borderBottom: '1px solid #374151',
    backgroundColor: '#111827'
  };

  const columnsContainerStyles = {
    display: 'flex',
    flex: 1,
    gap: '16px',
    padding: '20px',
    overflowX: 'auto',
    minHeight: '600px'
  };

  return (
    <div style={boardStyles} className={className}>
      <div style={headerStyles}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Project Board</h2>
          <Button
            onClick={() => onTaskCreate && onTaskCreate()}
            size="sm"
          >
            Add Task
          </Button>
        </div>
        <KanbanFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      <div style={columnsContainerStyles}>
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.id)}
            onTaskMove={handleTaskMove}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
