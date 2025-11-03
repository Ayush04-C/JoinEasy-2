import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, Clock, ExternalLink, XCircle, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Navigation from '../Navigationbar/Navigation';
import InteractiveBg from '../../animations/Interactivebg';
import ScrollFadeIn from '../../animations/ScrollFadeIn';
import FadeContent from '../../animations/FadeContent';
import ConfettiButton from "../../animations/confettie";



interface StudentCourseAssignmentsProps {
  courseId: string;
  onBack: () => void;
}

const StudentCourseAssignments = ({ courseId, onBack }: StudentCourseAssignmentsProps) => {
  const { data, setData, currentUser, updateSubmission, addGroup } = useApp();
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([currentUser.id]);

  useEffect(() => {
    if (!data.groups || !data.submissions) return;
    
    let needsUpdate = false;
    const updatedSubmissions = [...data.submissions];
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Check each group
    data.groups.forEach((group: any) => {
      // For each group, check if any member has submitted
      const anyMemberSubmitted = group.members.some((memberId: string) => {
        const submission = data.submissions.find(
          (s: any) => s.assignmentId === group.assignmentId && s.studentId === memberId
        );
        return submission?.submitted;
      });
      
      // If any member submitted, ensure ALL members have submissions
      if (anyMemberSubmitted) {
        group.members.forEach((memberId: string) => {
          const existingIndex = updatedSubmissions.findIndex(
            (s: any) => s.assignmentId === group.assignmentId && s.studentId === memberId
          );
          
          if (existingIndex >= 0) {
            // Update existing submission to be submitted
            if (!updatedSubmissions[existingIndex].submitted) {
              updatedSubmissions[existingIndex] = {
                ...updatedSubmissions[existingIndex],
                submitted: true,
                submittedAt: currentDate
              };
              needsUpdate = true;
            }
          } else {
            // Create new submission for this member
            updatedSubmissions.push({
              id: `sub${Date.now()}-${memberId}-migration`,
              assignmentId: group.assignmentId,
              studentId: memberId,
              submitted: true,
              submittedAt: currentDate
            });
            needsUpdate = true;
          }
        });
      }
    });
    
    // Update data if we made changes
    if (needsUpdate) {
      console.log('🔧 Migration: Fixed incomplete group submissions');
      setData({
        ...data,
        submissions: updatedSubmissions
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const course = data.courses?.find((c: any) => c.id === courseId);
  const assignments = data.assignments?.filter((a: any) => a.courseId === courseId) || [];
  
  // Get all students enrolled in this course
  const courseStudents = data.users?.filter((u: any) => 
    u.role === 'student' && course?.enrolledStudents?.includes(u.id)
  ) || [];
  
  const getStudentSubmission = (assignmentId: string) => {
    return data.submissions?.find(
      (s: any) => s.assignmentId === assignmentId && s.studentId === currentUser.id
    );
  };

  const getStudentGroup = (assignmentId: string) => {
    return data.groups?.find(
      (g: any) => g.assignmentId === assignmentId && g.members.includes(currentUser.id)
    );
  };

  const isGroupLeader = (group: any) => {
    return group?.leaderId === currentUser.id;
  };

  // Check if a student is already in a group for this assignment (regardless of submission status)
  const isStudentUnavailable = (studentId: string, assignmentId: string) => {
    // Find if student is already in any group for this assignment
    const studentGroup = data.groups?.find(
      (g: any) => g.assignmentId === assignmentId && g.members.includes(studentId)
    );
    
    // Student is unavailable if they're in any group (prevents duplicate group memberships)
    return !!studentGroup;
  };

  const handleSubmit = (assignmentId: string) => {
    updateSubmission(assignmentId, currentUser.id, true);
    setShowConfirmation(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleGroupAcknowledge = (assignmentId: string, group: any) => {
    // Update submission for all group members in a single batch
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Get current data reference
    const updatedSubmissions = [...data.submissions];
    
    // Update or create submissions for each group member
    group.members.forEach((memberId: string) => {
      const existingIndex = updatedSubmissions.findIndex(
        (s: any) => s.assignmentId === assignmentId && s.studentId === memberId
      );
      
      if (existingIndex >= 0) {
        updatedSubmissions[existingIndex] = {
          ...updatedSubmissions[existingIndex],
          submitted: true,
          submittedAt: currentDate
        };
      } else {
        updatedSubmissions.push({
          id: `sub${Date.now()}-${memberId}`,
          assignmentId,
          studentId: memberId,
          submitted: true,
          submittedAt: currentDate
        });
      }
    });
    
    // Update data with all submissions at once
    setData({
      ...data,
      submissions: updatedSubmissions
    });
    
    setShowConfirmation(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleMemberSelection = (studentId: string) => {
    setSelectedMembers(prev => {
      // Can't deselect yourself (you're the leader)
      if (studentId === currentUser.id) return prev;
      
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleCreateGroup = (assignmentId: string) => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    
    if (selectedMembers.length < 2) {
      alert('A group must have at least 2 members');
      return;
    }
    
    // Check if any selected member is already in a group for this assignment
    const unavailableMembers = selectedMembers.filter(memberId => 
      memberId !== currentUser.id && isStudentUnavailable(memberId, assignmentId)
    );
    
    if (unavailableMembers.length > 0) {
      const unavailableNames = unavailableMembers.map(id => 
        data.users?.find((u: any) => u.id === id)?.name
      ).join(', ');
      alert(`Cannot add ${unavailableNames} - they are already in another group for this assignment.`);
      return;
    }
    
    addGroup({
      name: groupName,
      courseId,
      leaderId: currentUser.id,
      members: selectedMembers,
      assignmentId
    });
    
    setGroupName('');
    setSelectedMembers([currentUser.id]);
    setShowGroupModal(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  const openGroupModal = (assignmentId: string) => {
    setShowGroupModal(assignmentId);
    setGroupName('');
    setSelectedMembers([currentUser.id]); // Reset to just current user
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
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Assignment completed successfully!</span>
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{course.name}</h2>
            <p className="text-white/80">{course.code} • {course.semester}</p>
          </div>
        </ScrollFadeIn>

        <div className="space-y-6">
          {assignments.map((assignment: any, index: number) => {
            const submission = getStudentSubmission(assignment.id);
            const isSubmitted = submission?.submitted || false;
            const dueDate = new Date(assignment.dueDate);
            const today = new Date();
            const isOverdue = dueDate < today && !isSubmitted;
            const isGroupAssignment = assignment.submissionType === 'group';
            const group = getStudentGroup(assignment.id);
            const isLeader = isGroupLeader(group);

            return (
              <ScrollFadeIn key={assignment.id} direction="up" duration={600} delay={index * 100}>
                <FadeContent blur={false} duration={800} easing="ease-out" initialOpacity={0}>
                  <div className="backdrop-blur-sm bg-black/30 rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{assignment.title}</h3>
                          {isGroupAssignment && (
                            <span className="flex items-center space-x-1 bg-purple-600/30 text-purple-300 text-xs px-2 py-1 rounded-full">
                              <Users className="w-3 h-3" />
                              <span>Group</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/80 mb-3">{assignment.description}</p>
                      </div>
                      {isSubmitted ? (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-2" />
                      ) : isOverdue ? (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 ml-2" />
                      ) : (
                        <Clock className="w-6 h-6 text-yellow-500 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">Due Date:</span>
                        <span className={`font-medium ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                          {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {assignment.driveLink && (
                        <a
                          href={assignment.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>OneDrive Submission Link</span>
                        </a>
                      )}

                      <div className="pt-3 border-t border-white/10">
                        {isGroupAssignment ? (
                          // Group Assignment Logic
                          group ? (
                            <div className="space-y-3">
                              <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-white">Your Group: {group.name}</span>
                                  {isLeader && (
                                    <span className="text-xs bg-yellow-600/30 text-yellow-300 px-2 py-1 rounded-full">
                                      Leader
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-white/70">
                                  Members: {group.members.map((memberId: string) => {
                                    const member = data.users?.find((u: any) => u.id === memberId);
                                    return member?.name;
                                  }).join(', ')}
                                </div>
                              </div>

                              {isSubmitted ? (
                                <div className="flex items-center space-x-2 text-green-400">
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="text-sm font-medium">
                                    Acknowledged on {submission?.submittedAt}
                                  </span>
                                </div>
                              ) : isLeader ? (
                                <button
                                  onClick={() => setShowConfirmation(assignment.id)}
                                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors"
                                >
                                  Acknowledge Group Submission
                                </button>
                              ) : (
                                <div className="text-sm text-white/70 italic text-center py-2">
                                  Waiting for group leader to acknowledge submission
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                                <p className="text-sm text-yellow-300">
                                  ⚠️ You are not part of any group. Form or join one to submit this assignment.
                                </p>
                              </div>
                              <button
                                onClick={() => openGroupModal(assignment.id)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                              >
                                Create Group
                              </button>
                            </div>
                          )
                        ) : (
                          // Individual Assignment Logic
                          isSubmitted ? (
                            <div className="flex items-center space-x-2 text-green-400">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">
                                Submitted on {submission?.submittedAt}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowConfirmation(assignment.id)}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                            >
                              Yes, I have submitted
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </FadeContent>
              </ScrollFadeIn>
            );
          })}
        </div>

        {assignments.length === 0 && (
          <ScrollFadeIn direction="up" duration={700} delay={0}>
            <div className="text-center py-12 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-white/70">No assignments available for this course yet</p>
            </div>
          </ScrollFadeIn>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-sm rounded-xl p-6 max-w-sm w-full border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Confirm Submission</h3>
              <p className="text-sm text-white/70 mb-4">
                {assignments.find((a: any) => a.id === showConfirmation)?.submissionType === 'group'
                  ? 'Have all group members submitted their work?'
                  : 'Have you submitted your assignment?'}
              </p>
              <div className="flex space-x-3">
                <div 
                  onClick={() => {
                    const assignment = assignments.find((a: any) => a.id === showConfirmation);
                    if (assignment?.submissionType === 'group') {
                      const group = getStudentGroup(assignment.id);
                      if (group) handleGroupAcknowledge(assignment.id, group);
                    } else {
                      handleSubmit(showConfirmation);
                    }
                  }}
                  className="flex-1"
                >
                  <ConfettiButton />
                </div>
                <button
                  onClick={() => setShowConfirmation(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Group Creation Modal */}
        {showGroupModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Create a Group</h3>
              
              {/* Group Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Student Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Select Group Members ({selectedMembers.length} selected)
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {courseStudents.map((student: any) => {
                    const isCurrentUser = student.id === currentUser.id;
                    const isSelected = selectedMembers.includes(student.id);
                    const isUnavailable = !isCurrentUser && isStudentUnavailable(student.id, showGroupModal);
                    const isDisabled = isCurrentUser || isUnavailable;
                    
                    return (
                      <div
                        key={student.id}
                        onClick={() => !isDisabled && toggleMemberSelection(student.id)}
                        className={`p-3 rounded-lg border transition-all ${
                          isUnavailable
                            ? 'bg-gray-800/30 border-red-500/30 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-indigo-600/30 border-indigo-500/50 cursor-pointer'
                            : 'bg-gray-800/50 border-white/10 hover:border-white/30 cursor-pointer'
                        } ${isCurrentUser ? 'opacity-100 cursor-default' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                              {student.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-yellow-600/30 text-yellow-300 px-2 py-0.5 rounded-full">
                                  You (Leader)
                                </span>
                              )}
                              {isUnavailable && (
                                <span className="ml-2 text-xs bg-red-600/30 text-red-300 px-2 py-0.5 rounded-full">
                                  Already in Group
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-white/60">{student.email}</p>
                          </div>
                          <div className="flex items-center">
                            {isUnavailable ? (
                              <XCircle className="w-5 h-5 text-red-400" />
                            ) : isSelected ? (
                              <CheckCircle className="w-5 h-5 text-indigo-400" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-white/30"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info Message */}
              <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <p className="text-xs text-blue-300">
                  💡 You will be the group leader. Select at least one other member to form a group.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleCreateGroup(showGroupModal)}
                  disabled={!groupName.trim() || selectedMembers.length < 2}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Group
                </button>
                <button
                  onClick={() => {
                    setShowGroupModal(null);
                    setGroupName('');
                    setSelectedMembers([currentUser.id]);
                  }}
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

export default StudentCourseAssignments;
