import { useState } from 'react';
import { ArrowLeft, BookOpen, Plus, ExternalLink, Users, User ,CheckCircle, XCircle, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Navigation from '../Navigationbar/Navigation';
import InteractiveBg from '../../animations/Interactivebg';
import ScrollFadeIn from '../../animations/ScrollFadeIn';

interface ProfessorCourseManagementProps {
  courseId: string;
  onBack: () => void;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  driveLink?: string;
  submissionType: 'individual' | 'group';
  courseId: string;
}

const ProfessorCourseManagement = ({ courseId, onBack }: ProfessorCourseManagementProps) => {
  const { data, currentUser, addAssignment, updateAssignment, deleteAssignment } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubmissionType, setFilterSubmissionType] = useState<'all' | 'individual' | 'group'>('all');
  const [filterSubmissionStatus, setFilterSubmissionStatus] = useState<'all' | 'submitted' | 'pending'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    driveLink: '',
    submissionType: 'individual' as 'individual' | 'group'
  });

  const course = data.courses?.find((c: any) => c.id === courseId);
  const allAssignments = data.assignments?.filter((a: any) => a.courseId === courseId) || [];
  const students = data.users?.filter((u: any) => 
    u.role === 'student' && course?.enrolledStudents?.includes(u.id)
  ) || [];
  
  // Filter and search logic
  const assignments = allAssignments.filter((assignment: any) => {
    // Search filter
    const matchesSearch = searchQuery.trim() === '' || 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Submission type filter
    const matchesType = filterSubmissionType === 'all' || 
      assignment.submissionType === filterSubmissionType;
    
    // Submission status filter
    let matchesStatus = true;
    if (filterSubmissionStatus !== 'all') {
      const isGroupAssignment = assignment.submissionType === 'group';
      const assignmentGroups = isGroupAssignment 
        ? data.groups?.filter((g: any) => g.assignmentId === assignment.id) || []
        : [];
      
      let submittedCount = 0;
      let totalCount = 0;

      if (isGroupAssignment) {
        totalCount = assignmentGroups.length;
        assignmentGroups.forEach((group: any) => {
          const groupSubmission = data.submissions?.find(
            (s: any) => s.assignmentId === assignment.id && group.members.includes(s.studentId) && s.submitted
          );
          if (groupSubmission) submittedCount++;
        });
      } else {
        totalCount = students.length;
        submittedCount = data.submissions?.filter(
          (s: any) => s.assignmentId === assignment.id && s.submitted
        ).length || 0;
      }
      
      const hasSubmissions = submittedCount > 0;
      const hasNoSubmissions = submittedCount === 0;
      
      if (filterSubmissionStatus === 'submitted') {
        matchesStatus = hasSubmissions;
      } else if (filterSubmissionStatus === 'pending') {
        matchesStatus = hasNoSubmissions || submittedCount < totalCount;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) {
      alert('Title and Due Date are required.');
      return;
    }

    addAssignment({
      ...formData,
      courseId,
      createdBy: currentUser.id
    });

    setFormData({
      title: '',
      description: '',
      dueDate: '',
      driveLink: '',
      submissionType: 'individual'
    });
    setShowCreateModal(false);
    setSuccessMessage('Assignment created successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUpdateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !formData.title || !formData.dueDate) {
      alert('Title and Due Date are required.');
      return;
    }

    updateAssignment(editingAssignment.id, formData);
    
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      driveLink: '',
      submissionType: 'individual'
    });
    setEditingAssignment(null);
    setSuccessMessage('Assignment updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    deleteAssignment(assignmentId);
    setShowDeleteConfirmation(null);
    setSuccessMessage('Assignment deleted successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      driveLink: assignment.driveLink || '',
      submissionType: assignment.submissionType
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingAssignment(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      driveLink: '',
      submissionType: 'individual'
    });
  };

  if (!course) {
    return (
      <div className="fixed top-14 sm:top-20 left-0 w-screen h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-5rem)] overflow-y-auto pb-8">
        <InteractiveBg />
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Courses</span>
          </button>
          <p className="text-white">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-14 sm:top-20 left-0 w-screen h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-5rem)] overflow-y-auto pb-8">
      <InteractiveBg />
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <div className="fixed top-20 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg z-50 transition-transform">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        <ScrollFadeIn direction="up" duration={600} delay={0}>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Courses</span>
          </button>
        </ScrollFadeIn>

        <ScrollFadeIn direction="up" duration={600} delay={100}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{course.name}</h2>
              <p className="text-white/80">{course.code} • {course.semester} • {students.length} students</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Assignment</span>
            </button>
          </div>
        </ScrollFadeIn>

        {/* Search and Filter Section */}
        <ScrollFadeIn direction="up" duration={600} delay={150}>
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assignments by title or description..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  showFilters || filterSubmissionType !== 'all' || filterSubmissionStatus !== 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800/50 text-white/80 border border-white/20 hover:bg-gray-700/50'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {(filterSubmissionType !== 'all' || filterSubmissionStatus !== 'all') && (
                  <span className="ml-1 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                    {(filterSubmissionType !== 'all' ? 1 : 0) + (filterSubmissionStatus !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="backdrop-blur-sm bg-gray-800/50 border border-white/20 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Submission Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Submission Type</label>
                    <select
                      value={filterSubmissionType}
                      onChange={(e) => setFilterSubmissionType(e.target.value as 'all' | 'individual' | 'group')}
                      className="w-full px-3 py-2 bg-gray-900/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Types</option>
                      <option value="individual">Individual Only</option>
                      <option value="group">Group Only</option>
                    </select>
                  </div>

                  {/* Submission Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Submission Status</label>
                    <select
                      value={filterSubmissionStatus}
                      onChange={(e) => setFilterSubmissionStatus(e.target.value as 'all' | 'submitted' | 'pending')}
                      className="w-full px-3 py-2 bg-gray-900/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="submitted">Has Submissions</option>
                      <option value="pending">Pending/Incomplete</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(filterSubmissionType !== 'all' || filterSubmissionStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setFilterSubmissionType('all');
                      setFilterSubmissionStatus('all');
                    }}
                    className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>
                Showing {assignments.length} of {allAssignments.length} assignment{allAssignments.length !== 1 ? 's' : ''}
              </span>
              {(searchQuery || filterSubmissionType !== 'all' || filterSubmissionStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterSubmissionType('all');
                    setFilterSubmissionStatus('all');
                  }}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </ScrollFadeIn>

        <div className="space-y-6">
          {assignments.map((assignment: any, index: number) => {
            const isGroupAssignment = assignment.submissionType === 'group';
            const assignmentGroups = isGroupAssignment 
              ? data.groups?.filter((g: any) => g.assignmentId === assignment.id) || []
              : [];
            
            let submittedCount = 0;
            let totalCount = 0;

            if (isGroupAssignment) {
              totalCount = assignmentGroups.length;
              assignmentGroups.forEach((group: any) => {
                const groupSubmission = data.submissions?.find(
                  (s: any) => s.assignmentId === assignment.id && group.members.includes(s.studentId) && s.submitted
                );
                if (groupSubmission) submittedCount++;
              });
            } else {
              totalCount = students.length;
              submittedCount = data.submissions?.filter(
                (s: any) => s.assignmentId === assignment.id && s.submitted
              ).length || 0;
            }

            const progressPercentage = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;

            return (
              <ScrollFadeIn 
                key={assignment.id} 
                direction="up" 
                duration={700} 
                delay={index * 100}
              >
                <div className="backdrop-blur-sm bg-black/30 rounded-xl shadow-lg border border-white/20 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{assignment.title}</h3>
                        {isGroupAssignment ? (
                          <span className="flex items-center space-x-1 bg-purple-600/30 text-purple-300 text-xs px-2 py-1 rounded-full">
                            <Users className="w-3 h-3" />
                            <span>Group</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 bg-blue-600/30 text-blue-300 text-xs px-2 py-1 rounded-full">
                            <User className="w-3 h-3" />
                            <span>Individual</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/80 mb-3">{assignment.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-white/80">
                          Due: <span className="font-medium text-white">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </span>
                        {assignment.driveLink && (
                          <a
                            href={assignment.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>OneDrive Link</span>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-2xl font-bold text-indigo-400">
                        <Users className="w-6 h-6" />
                        <span>{submittedCount}/{totalCount}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(assignment)}
                          className="p-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirmation(assignment.id)}
                          className="p-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white/80">
                        {isGroupAssignment ? 'Group' : 'Student'} Submission Rate
                      </span>
                      <span className="text-sm font-semibold text-indigo-400">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="backdrop-blur-sm bg-black/20 p-4 rounded-lg border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      {isGroupAssignment ? 'Group Progress' : 'Student Progress'}
                    </h4>
                    <div className="max-h-50 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {isGroupAssignment ? (
                      // Show groups
                      assignmentGroups.length > 0 ? (
                        assignmentGroups.map((group: any) => {
                          const groupSubmission = data.submissions?.find(
                            (s: any) => s.assignmentId === assignment.id && group.members.includes(s.studentId) && s.submitted
                          );
                          const isSubmitted = !!groupSubmission;

                          return (
                            <div key={group.id} className="p-3 bg-gray-900/50 rounded-lg border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">{group.name}</span>
                                <div className="flex items-center space-x-2">
                                  {isSubmitted ? (
                                    <>
                                      <CheckCircle className="w-5 h-5 text-green-500" />
                                      <span className="text-sm font-medium text-green-400">Submitted</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-5 h-5 text-red-500" />
                                      <span className="text-sm font-medium text-red-400">Not Submitted</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-white/70">
                                <span className="font-medium">Members:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {group.members.map((memberId: string) => {
                                    const member = data.users?.find((u: any) => u.id === memberId);
                                    const isLeader = group.leaderId === memberId;
                                    return (
                                      <span
                                        key={memberId}
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                                          isLeader
                                            ? 'bg-yellow-600/30 text-yellow-300 font-semibold border border-yellow-500/50'
                                            : 'bg-gray-700/50 text-white/80'
                                        }`}
                                      >
                                        {member?.name}
                                        {isLeader && ' (Leader)'}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-white/60 italic text-center py-2">No groups formed yet</p>
                      )
                    ) : (
                      // Show individual students
                      students.map((student: any) => {
                        const submission = data.submissions?.find(
                          (s: any) => s.assignmentId === assignment.id && s.studentId === student.id
                        );
                        const isSubmitted = submission?.submitted || false;

                        return (
                          <div key={student.id} className="flex items-center space-x-4 p-3 bg-gray-900/50 rounded-lg border border-white/10">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{student.name}</p>
                              <p className="text-xs text-white/60">{student.email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isSubmitted ? (
                                <>
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <span className="text-sm font-medium text-green-400">Submitted</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-5 h-5 text-red-500" />
                                  <span className="text-sm font-medium text-red-400">Not Submitted</span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    </div>
                  </div>
                </div>
              </ScrollFadeIn>
            );
          })}
        </div>

        {/* No Results Message */}
        {assignments.length === 0 && allAssignments.length > 0 && (
          <ScrollFadeIn direction="up" duration={700} delay={200}>
            <div className="text-center py-12 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-white/70 mb-2">No assignments match your filters</p>
              <p className="text-white/50 text-sm mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterSubmissionType('all');
                  setFilterSubmissionStatus('all');
                }}
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </ScrollFadeIn>
        )}

        {/* No Assignments Created */}
        {assignments.length === 0 && allAssignments.length === 0 && (
          <ScrollFadeIn direction="up" duration={700} delay={200}>
            <div className="text-center py-12 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-white/70 mb-4">No assignments created yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Assignment</span>
              </button>
            </div>
          </ScrollFadeIn>
        )}

        {/* Create/Edit Assignment Modal */}
        {(showCreateModal || editingAssignment) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-lg border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
              <form onSubmit={editingAssignment ? handleUpdateAssignment : handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">OneDrive Link</label>
                  <input
                    type="url"
                    value={formData.driveLink}
                    onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500"
                    placeholder="https://onedrive.live.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Submission Type</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="individual"
                        checked={formData.submissionType === 'individual'}
                        onChange={(e) => setFormData({ ...formData, submissionType: e.target.value as 'individual' | 'group' })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-white">Individual</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="group"
                        checked={formData.submissionType === 'group'}
                        onChange={(e) => setFormData({ ...formData, submissionType: e.target.value as 'individual' | 'group' })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-white">Group</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Confirm Deletion</h3>
              <p className="text-sm text-white/70 mb-4">
                Are you sure you want to delete this assignment? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDeleteAssignment(showDeleteConfirmation)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirmation(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorCourseManagement;
