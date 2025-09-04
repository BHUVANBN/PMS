import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../config/api';

const CodeReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/developer/code-reviews?status=${filter}`);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error fetching code reviews:', error);
      // Mock data for demonstration
      setReviews([
        {
          id: 1,
          title: 'Add user authentication middleware',
          description: 'Implement JWT-based authentication middleware for API routes',
          author: 'Alice Johnson',
          reviewer: 'Bob Wilson',
          project: 'E-commerce Platform',
          status: 'pending',
          priority: 'high',
          createdDate: '2024-01-20',
          updatedDate: '2024-01-20',
          filesChanged: 5,
          linesAdded: 120,
          linesRemoved: 15,
          comments: [],
          branch: 'feature/auth-middleware',
          pullRequestUrl: 'https://github.com/company/project/pull/123'
        },
        {
          id: 2,
          title: 'Fix payment processing bug',
          description: 'Resolve issue with duplicate payment charges',
          author: 'Carol Davis',
          reviewer: 'Alice Johnson',
          project: 'E-commerce Platform',
          status: 'approved',
          priority: 'critical',
          createdDate: '2024-01-18',
          updatedDate: '2024-01-19',
          filesChanged: 3,
          linesAdded: 45,
          linesRemoved: 32,
          comments: [
            { author: 'Alice Johnson', text: 'Good fix, but please add unit tests', timestamp: '2024-01-19' }
          ],
          branch: 'hotfix/payment-bug',
          pullRequestUrl: 'https://github.com/company/project/pull/122'
        },
        {
          id: 3,
          title: 'Update product search algorithm',
          description: 'Improve search relevance and performance',
          author: 'David Brown',
          reviewer: 'Bob Wilson',
          project: 'E-commerce Platform',
          status: 'changes-requested',
          priority: 'medium',
          createdDate: '2024-01-15',
          updatedDate: '2024-01-17',
          filesChanged: 8,
          linesAdded: 200,
          linesRemoved: 85,
          comments: [
            { author: 'Bob Wilson', text: 'Please optimize the database queries', timestamp: '2024-01-17' }
          ],
          branch: 'feature/search-improvement',
          pullRequestUrl: 'https://github.com/company/project/pull/121'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (reviewId, action, comment = '') => {
    try {
      await api.post(`/developer/code-reviews/${reviewId}/review`, {
        action,
        comment
      });
      fetchReviews();
      setShowModal(false);
      setReviewComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'changes-requested': return 'error';
      case 'merged': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Code Reviews</h1>
          <p className="text-gray-600 dark:text-gray-400">Review code changes and pull requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: 'pending', label: 'Pending Review' },
                { value: 'approved', label: 'Approved' },
                { value: 'changes-requested', label: 'Changes Requested' },
                { value: 'merged', label: 'Merged' },
                { value: 'all', label: 'All Reviews' }
              ]}
            />
          </div>
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Review Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {reviews.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {reviews.filter(r => r.status === 'approved').length}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Changes Requested</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {reviews.filter(r => r.status === 'changes-requested').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
              <span className="text-2xl">🔄</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Merged</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reviews.filter(r => r.status === 'merged').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <span className="text-2xl">🔀</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {review.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {review.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>By {review.author}</span>
                  <span>•</span>
                  <span>{review.project}</span>
                  <span>•</span>
                  <span>{new Date(review.createdDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusColor(review.status)}>{review.status}</Badge>
                <Badge variant={getPriorityColor(review.priority)}>{review.priority}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Files Changed:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{review.filesChanged}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Lines Added:</span>
                <span className="ml-2 font-medium text-green-600 dark:text-green-400">+{review.linesAdded}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Lines Removed:</span>
                <span className="ml-2 font-medium text-red-600 dark:text-red-400">-{review.linesRemoved}</span>
              </div>
            </div>

            {review.comments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recent Comments:</h4>
                <div className="space-y-2">
                  {review.comments.slice(-2).map((comment, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-sm text-gray-900 dark:text-white">{comment.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {comment.author} • {new Date(comment.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Branch:</span>
                <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {review.branch}
                </code>
              </div>
              <div className="flex space-x-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(review.pullRequestUrl, '_blank')}
                >
                  View PR
                </Button>
                {review.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="error"
                      onClick={() => {
                        setSelectedReview(review);
                        setShowModal(true);
                      }}
                    >
                      Request Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleReviewAction(review.id, 'approve')}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No code reviews found.</p>
        </div>
      )}

      {/* Review Comment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Request Changes"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Please provide feedback on what changes are needed:
          </p>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe the changes needed..."
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleReviewAction(selectedReview?.id, 'request-changes', reviewComment)}
              disabled={!reviewComment.trim()}
            >
              Request Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CodeReviewPage;
