'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, isModerator, isAdmin } from '@/types/auth';
import { apiService } from '@/services/api';
import { useRouter } from 'next/navigation';
import { BackButton } from '@/components/BackButton';

interface ContentReport {
  id: string;
  type: 'manga' | 'chapter' | 'comment';
  title: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  contentId: string;
  reason: string;
}

interface PendingContent {
  id: string;
  type: 'manga' | 'chapter';
  title: string;
  author: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
}

export default function ContentReviewPage() {
  const { state } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reports' | 'pending'>('reports');
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const mockReports: ContentReport[] = [
    {
      id: '1',
      type: 'manga',
      title: 'Inappropriate Content in "Sample Manga"',
      description: 'Contains violent scenes that may not be suitable for all audiences',
      reportedBy: 'user123',
      reportedAt: '2025-10-08T14:30:00Z',
      status: 'pending',
      priority: 'high',
      contentId: 'manga-1',
      reason: 'Inappropriate content'
    },
    {
      id: '2',
      type: 'chapter',
      title: 'Chapter 15 - Quality Issues',
      description: 'Poor image quality and missing pages',
      reportedBy: 'reader456',
      reportedAt: '2025-10-08T10:15:00Z',
      status: 'pending',
      priority: 'medium',
      contentId: 'chapter-15',
      reason: 'Quality issues'
    },
    {
      id: '3',
      type: 'comment',
      title: 'Spam Comment',
      description: 'User posting spam links in comments',
      reportedBy: 'moderator1',
      reportedAt: '2025-10-07T16:45:00Z',
      status: 'reviewed',
      priority: 'low',
      contentId: 'comment-789',
      reason: 'Spam'
    }
  ];

  const mockPendingContent: PendingContent[] = [
    {
      id: '1',
      type: 'manga',
      title: 'New Adventure Manga',
      author: 'Manga Artist',
      submittedBy: 'creator123',
      submittedAt: '2025-10-08T12:00:00Z',
      status: 'pending',
      description: 'An exciting new adventure manga about heroes saving the world'
    },
    {
      id: '2',
      type: 'chapter',
      title: 'Chapter 25 - The Final Battle',
      author: 'Popular Author',
      submittedBy: 'uploader456',
      submittedAt: '2025-10-08T09:30:00Z',
      status: 'pending',
      description: 'The climactic chapter of the popular series'
    }
  ];

  useEffect(() => {
    if (state.isAuthenticated) {
      loadContent();
    }
  }, [state.isAuthenticated]);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      // For now, use mock data
      // In real implementation, fetch from backend
      setReports(mockReports);
      setPendingContent(mockPendingContent);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'dismiss' | 'resolve') => {
    try {
      // TODO: Implement backend call
      console.log(`${action} report ${reportId}`);
      
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'approve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : 'resolved' }
          : report
      ));
      
      alert(`Report ${action}d successfully!`);
    } catch (error) {
      console.error(`Failed to ${action} report:`, error);
      alert(`Failed to ${action} report. Please try again.`);
    }
  };

  const handleContentAction = async (contentId: string, action: 'approve' | 'reject') => {
    try {
      // TODO: Implement backend call
      console.log(`${action} content ${contentId}`);
      
      setPendingContent(prev => prev.map(content => 
        content.id === contentId 
          ? { ...content, status: action === 'approve' ? 'approved' : 'rejected' }
          : content
      ));
      
      alert(`Content ${action}d successfully!`);
    } catch (error) {
      console.error(`Failed to ${action} content:`, error);
      alert(`Failed to ${action} content. Please try again.`);
    }
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  const { user } = state;

  // Check if user has moderator or admin permissions
  if (!isModerator(user) && !isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access content review. Only moderators and administrators can access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <BackButton />

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Content Review</h1>
            <p className="text-gray-600 mt-2">Review reported content and approve pending submissions</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reported Content ({reports.filter(r => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Approval ({pendingContent.filter(c => c.status === 'pending').length})
              </button>
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Reported Content</h2>
              {reports.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-600">No reported content to review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              report.type === 'manga' ? 'bg-blue-100 text-blue-800' :
                              report.type === 'chapter' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {report.type.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              report.priority === 'high' ? 'bg-red-100 text-red-800' :
                              report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.priority.toUpperCase()} PRIORITY
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              report.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                              report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{report.description}</p>
                          <div className="text-sm text-gray-500">
                            <p>Reason: {report.reason}</p>
                            <p>Reported by: {report.reportedBy} on {new Date(report.reportedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {report.status === 'pending' && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleReportAction(report.id, 'resolve')}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleReportAction(report.id, 'dismiss')}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Pending Approval</h2>
              {pendingContent.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-600">No content pending approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingContent.map((content) => (
                    <div key={content.id} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{content.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              content.type === 'manga' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {content.type.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              content.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              content.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {content.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{content.description}</p>
                          <div className="text-sm text-gray-500">
                            <p>Author: {content.author}</p>
                            <p>Submitted by: {content.submittedBy} on {new Date(content.submittedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {content.status === 'pending' && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleContentAction(content.id, 'approve')}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleContentAction(content.id, 'reject')}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}