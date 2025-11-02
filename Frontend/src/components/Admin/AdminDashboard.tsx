import { useState, Suspense, lazy } from 'react';
import { BookOpen, ArrowRight, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Navigation from '../Navigationbar/Navigation';
import InteractiveBg from '../../animations/Interactivebg';
import ScrollFadeIn from '../../animations/ScrollFadeIn';

const ProfessorCourseManagement = lazy(() => import('./AssingmentModal'));

const AdminDashboard = () => {
  const { data, currentUser } = useApp();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  
  // Get courses taught by the professor
  const myCourses = data?.courses?.filter((c: any) => c.professorId === currentUser?.id) || [];
  
  const handleCourseClick = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  // If a course is selected, show assignments management for that course
  if (selectedCourse) {
    return (
      <Suspense fallback={
        <div className="fixed top-14 sm:top-20 left-0 w-screen h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-5rem)] flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }>
        <ProfessorCourseManagement 
          courseId={selectedCourse} 
          onBack={() => setSelectedCourse(null)} 
        />
      </Suspense>
    );
  }
  
  return (
    <div className="fixed top-14 sm:top-20 left-0 w-screen h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-5rem)] overflow-y-auto pb-8">
      <InteractiveBg />
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollFadeIn direction="up" duration={600} delay={100}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">My Courses</h2>
            <p className="text-white">Manage assignments for courses you teach</p>
          </div>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course: any, index: number) => {
            const courseAssignments = data.assignments?.filter((a: any) => a.courseId === course.id) || [];
            const totalStudents = course.enrolledStudents?.length || 0;
            
            // Calculate overall submission statistics
            let totalSubmissions = 0;
            let totalPossible = 0;
            
            courseAssignments.forEach((assignment: any) => {
              const submittedCount = data.submissions?.filter(
                (s: any) => s.assignmentId === assignment.id && s.submitted
              ).length || 0;
              
              if (assignment.submissionType === 'group') {
                const assignmentGroups = data.groups?.filter((g: any) => g.assignmentId === assignment.id) || [];
                totalPossible += assignmentGroups.length;
                totalSubmissions += submittedCount / (assignmentGroups[0]?.members.length || 1);
              } else {
                totalPossible += totalStudents;
                totalSubmissions += submittedCount;
              }
            });
            
            const submissionRate = totalPossible > 0 ? (totalSubmissions / totalPossible) * 100 : 0;

            return (
              <ScrollFadeIn 
                key={course.id} 
                direction="up" 
                duration={600} 
                delay={index * 100}
              >
                <div
                  className="backdrop-blur-sm bg-black/30 rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105 duration-300"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{course.name}</h3>
                      <p className="text-sm text-white/80">{course.code} • {course.semester}</p>
                    </div>
                    <BookOpen className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-white/70" />
                        <span className="text-white/80">Students:</span>
                      </div>
                      <span className="font-medium text-white">{totalStudents}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Assignments:</span>
                      <span className="font-medium text-white">{courseAssignments.length}</span>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/70">Submission Rate</span>
                        <span className="text-white/90 font-medium">{Math.round(submissionRate)}%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${submissionRate}%` }}
                        />
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                      <span>Manage Assignments</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </ScrollFadeIn>
            );
          })}
        </div>

        {myCourses.length === 0 && (
          <ScrollFadeIn direction="up" duration={700} delay={200}>
            <div className="text-center py-12 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-white/70">No courses assigned yet</p>
            </div>
          </ScrollFadeIn>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;