import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../config/api';

const ResourcePlanningPage = () => {
  const [resources, setResources] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [allocation, setAllocation] = useState({
    projectId: '',
    hours: '',
    startDate: '',
    endDate: '',
    role: ''
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchResourceData();
  }, []);

  const fetchResourceData = async () => {
    try {
      setLoading(true);
      const [resourcesResponse, projectsResponse] = await Promise.all([
        api.get('/manager/resources'),
        api.get('/manager/projects')
      ]);
      
      setResources(resourcesResponse.data || []);
      setProjects(projectsResponse.data || []);
    } catch (error) {
      console.error('Error fetching resource data:', error);
      // Mock data for demonstration
      setResources([
        {
          id: 1,
          name: 'Alice Johnson',
          email: 'alice@company.com',
          department: 'Engineering',
          skills: ['React', 'TypeScript', 'Node.js'],
          availability: 80, // percentage
          currentAllocations: [
            { projectId: 1, projectName: 'E-commerce Platform', hours: 32, role: 'Frontend Developer' }
          ],
          totalHours: 40,
          allocatedHours: 32,
          cost: 75
        },
        {
          id: 2,
          name: 'Bob Wilson',
          email: 'bob@company.com',
          department: 'Engineering',
          skills: ['Node.js', 'MongoDB', 'AWS'],
          availability: 100,
          currentAllocations: [
            { projectId: 1, projectName: 'E-commerce Platform', hours: 40, role: 'Backend Developer' }
          ],
          totalHours: 40,
          allocatedHours: 40,
          cost: 80
        },
        {
          id: 3,
          name: 'Carol Davis',
          email: 'carol@company.com',
          department: 'Design',
          skills: ['Figma', 'UI/UX', 'Prototyping'],
          availability: 60,
          currentAllocations: [
            { projectId: 1, projectName: 'E-commerce Platform', hours: 24, role: 'UI/UX Designer' }
          ],
          totalHours: 40,
          allocatedHours: 24,
          cost: 65
        },
        {
          id: 4,
          name: 'David Brown',
          email: 'david@company.com',
          department: 'QA',
          skills: ['Manual Testing', 'Automation', 'Selenium'],
          availability: 90,
          currentAllocations: [],
          totalHours: 40,
          allocatedHours: 0,
          cost: 60
        }
      ]);
      setProjects([
        { id: 1, name: 'E-commerce Platform', status: 'active' },
        { id: 2, name: 'Mobile App Development', status: 'planning' },
        { id: 3, name: 'Data Analytics Dashboard', status: 'active' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateResource = async () => {
    try {
      await api.post(`/manager/resources/${selectedResource.id}/allocate`, allocation);
      fetchResourceData();
      setShowAllocationModal(false);
      setAllocation({ projectId: '', hours: '', startDate: '', endDate: '', role: '' });
    } catch (error) {
      console.error('Error allocating resource:', error);
    }
  };

  const getAvailabilityColor = (availability) => {
    if (availability >= 80) return 'success';
    if (availability >= 50) return 'warning';
    return 'error';
  };

  // Removed unused getUtilizationColor to satisfy linter

  const filteredResources = resources.filter(resource => {
    if (filter === 'all') return true;
    if (filter === 'available') return resource.availability > 20;
    if (filter === 'overallocated') return resource.availability < 20;
    if (filter === 'unallocated') return resource.allocatedHours === 0;
    return true;
  });

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resource Planning</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage team resource allocation across projects</p>
        </div>
      </div>

      {/* Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{resources.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {resources.filter(r => r.availability > 20).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fully Allocated</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {resources.filter(r => r.availability <= 20 && r.availability > 0).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overallocated</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {resources.filter(r => r.availability === 0).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
              <span className="text-2xl">🚨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Resources' },
              { value: 'available', label: 'Available' },
              { value: 'overallocated', label: 'Overallocated' },
              { value: 'unallocated', label: 'Unallocated' }
            ]}
          />
        </div>
      </div>

      {/* Resource List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Allocation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {resource.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {resource.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {resource.department} • ${resource.cost}/hr
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {resource.skills?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" size="sm">{skill}</Badge>
                      ))}
                      {resource.skills?.length > 3 && (
                        <Badge variant="secondary" size="sm">+{resource.skills.length - 3}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {resource.allocatedHours}h / {resource.totalHours}h
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          resource.allocatedHours / resource.totalHours > 0.9 ? 'bg-red-500' :
                          resource.allocatedHours / resource.totalHours > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(resource.allocatedHours / resource.totalHours) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getAvailabilityColor(resource.availability)}>
                      {resource.availability}%
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {resource.currentAllocations?.map((allocation, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-gray-900 dark:text-white font-medium">
                            {allocation.projectName}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            ({allocation.hours}h)
                          </span>
                        </div>
                      )) || <span className="text-gray-500 dark:text-gray-400 text-sm">No allocations</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedResource(resource);
                        setShowAllocationModal(true);
                      }}
                      disabled={resource.availability === 0}
                    >
                      Allocate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Allocation Modal */}
      <Modal
        isOpen={showAllocationModal}
        onClose={() => setShowAllocationModal(false)}
        title="Allocate Resource"
      >
        {selectedResource && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Allocating: {selectedResource.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Available capacity: {selectedResource.availability}% ({selectedResource.totalHours - selectedResource.allocatedHours} hours)
              </p>
            </div>

            <Select
              label="Project"
              value={allocation.projectId}
              onChange={(e) => setAllocation(prev => ({ ...prev, projectId: e.target.value }))}
              options={[
                { value: '', label: 'Select a project...' },
                ...projects.map(project => ({
                  value: project.id,
                  label: project.name
                }))
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Hours per week"
                type="number"
                value={allocation.hours}
                onChange={(e) => setAllocation(prev => ({ ...prev, hours: e.target.value }))}
                placeholder="20"
                max={selectedResource.totalHours - selectedResource.allocatedHours}
              />
              <Input
                label="Role"
                value={allocation.role}
                onChange={(e) => setAllocation(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Frontend Developer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={allocation.startDate}
                onChange={(e) => setAllocation(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <Input
                label="End Date"
                type="date"
                value={allocation.endDate}
                onChange={(e) => setAllocation(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAllocationModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAllocateResource}
                disabled={!allocation.projectId || !allocation.hours}
              >
                Allocate Resource
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResourcePlanningPage;
