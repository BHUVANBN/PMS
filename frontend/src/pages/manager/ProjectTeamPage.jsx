import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../config/api';

const ProjectTeamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMember, setNewMember] = useState({
    userId: '',
    role: 'developer'
  });

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectResponse, teamResponse, usersResponse] = await Promise.all([
        api.get(`/manager/projects/${id}`),
        api.get(`/manager/projects/${id}/team`),
        api.get('/manager/users/available')
      ]);
      
      setProject(projectResponse.data);
      setTeamMembers(teamResponse.data || []);
      setAvailableUsers(usersResponse.data || []);
    } catch (error) {
      console.error('Error fetching project data:', error);
      // Mock data for demonstration
      setProject({
        id: id,
        name: 'E-commerce Platform Redesign'
      });
      setTeamMembers([
        {
          id: 1,
          userId: 'user1',
          name: 'Alice Johnson',
          email: 'alice@company.com',
          role: 'frontend-developer',
          joinDate: '2024-01-01',
          status: 'active',
          avatar: null,
          skills: ['React', 'TypeScript', 'CSS']
        },
        {
          id: 2,
          userId: 'user2',
          name: 'Bob Wilson',
          email: 'bob@company.com',
          role: 'backend-developer',
          joinDate: '2024-01-01',
          status: 'active',
          avatar: null,
          skills: ['Node.js', 'MongoDB', 'Express']
        },
        {
          id: 3,
          userId: 'user3',
          name: 'Carol Davis',
          email: 'carol@company.com',
          role: 'designer',
          joinDate: '2024-01-05',
          status: 'active',
          avatar: null,
          skills: ['Figma', 'UI/UX', 'Prototyping']
        },
        {
          id: 4,
          userId: 'user4',
          name: 'David Brown',
          email: 'david@company.com',
          role: 'tester',
          joinDate: '2024-01-10',
          status: 'active',
          avatar: null,
          skills: ['Manual Testing', 'Automation', 'Selenium']
        }
      ]);
      setAvailableUsers([
        { id: 'user5', name: 'Eve Wilson', email: 'eve@company.com', department: 'Engineering' },
        { id: 'user6', name: 'Frank Miller', email: 'frank@company.com', department: 'Design' },
        { id: 'user7', name: 'Grace Lee', email: 'grace@company.com', department: 'QA' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      await api.post(`/manager/projects/${id}/team`, newMember);
      fetchProjectData();
      setShowAddModal(false);
      setNewMember({ userId: '', role: 'developer' });
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  const handleRemoveMember = async () => {
    try {
      await api.delete(`/manager/projects/${id}/team/${selectedMember.userId}`);
      setTeamMembers(prev => prev.filter(member => member.userId !== selectedMember.userId));
      setShowRemoveModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await api.put(`/manager/projects/${id}/team/${memberId}`, { role: newRole });
      setTeamMembers(prev => 
        prev.map(member => 
          member.userId === memberId ? { ...member, role: newRole } : member
        )
      );
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'project-manager': return 'error';
      case 'tech-lead': return 'warning';
      case 'frontend-developer': return 'info';
      case 'backend-developer': return 'success';
      case 'fullstack-developer': return 'secondary';
      case 'designer': return 'purple';
      case 'tester': return 'yellow';
      default: return 'default';
    }
  };

  const roleOptions = [
    { value: 'project-manager', label: 'Project Manager' },
    { value: 'tech-lead', label: 'Tech Lead' },
    { value: 'frontend-developer', label: 'Frontend Developer' },
    { value: 'backend-developer', label: 'Backend Developer' },
    { value: 'fullstack-developer', label: 'Fullstack Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'tester', label: 'Tester' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage team members for {project?.name}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/manager/projects/${id}`)}
          >
            Back to Project
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
          >
            Add Member
          </Button>
        </div>
      </div>

      {/* Team Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Team Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamMembers.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Members</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {teamMembers.filter(m => m.role.includes('developer')).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Developers</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {teamMembers.filter(m => m.role === 'designer').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Designers</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {teamMembers.filter(m => m.role === 'tester').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Testers</div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{member.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getRoleColor(member.role)}>
                        {roleOptions.find(r => r.value === member.role)?.label || member.role}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Joined {new Date(member.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                    options={roleOptions}
                    className="min-w-[200px]"
                  />
                  <Button
                    size="sm"
                    variant="error"
                    onClick={() => {
                      setSelectedMember(member);
                      setShowRemoveModal(true);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              {member.skills && member.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {member.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" size="sm">{skill}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Team Member"
      >
        <div className="space-y-4">
          <Select
            label="Select User"
            value={newMember.userId}
            onChange={(e) => setNewMember(prev => ({ ...prev, userId: e.target.value }))}
            options={[
              { value: '', label: 'Select a user...' },
              ...availableUsers.map(user => ({
                value: user.id,
                label: `${user.name} (${user.email})`
              }))
            ]}
          />
          <Select
            label="Role"
            value={newMember.role}
            onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
            options={roleOptions}
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={!newMember.userId}
            >
              Add Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Member Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Team Member"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to remove {selectedMember?.name} from this project? 
            They will lose access to all project resources and their assigned tasks will be unassigned.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowRemoveModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={handleRemoveMember}
            >
              Remove Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectTeamPage;
