import React, { useRef, useEffect, useState, Suspense, lazy} from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Navigation from '../Navigationbar/Navigation';
import InteractiveBg from '../../animations/Interactivebg';
import ScrollFadeIn from '../../animations/ScrollFadeIn';
import { gsap } from 'gsap';

const StudentCourseAssignments = lazy(() => import('./StudentAssingmentCard'));


const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255'; // Purple glow
const MOBILE_BREAKPOINT = 768;

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card: HTMLElement, mouseX: number, mouseY: number, glow: number, radius: number) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// GlobalSpotlight Component
const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      
      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll('.card');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
        cards.forEach(card => {
          (card as HTMLElement).style.setProperty('--glow-intensity', '0');
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll('.card').forEach(card => {
        (card as HTMLElement).style.setProperty('--glow-intensity', '0');
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };
    
    const section = gridRef.current.closest('.bento-section');
    section?.addEventListener('mousemove', handleMouseMove as EventListener);
    section?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      section?.removeEventListener('mousemove', handleMouseMove as EventListener);
      section?.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};


const StudentDashboard = () => {
  const { data, currentUser } = useApp();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = isMobile;
  const glowColor = DEFAULT_GLOW_COLOR;
  const spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS;

  // Get courses the student is enrolled in
  const enrolledCourses = data?.courses?.filter((course: any) => 
    course.enrolledStudents?.includes(currentUser?.id)
  ) || [];

  // Get all assignments for enrolled courses
  const assignments = data?.assignments?.filter((assignment: any) => 
    enrolledCourses.some((course: any) => course.id === assignment.courseId)
  ) || [];

  const validAssignmentIds = assignments.map((a: any) => a.id);

  const studentSubmissions = data.submissions?.filter(
    (s: any) => s.studentId === currentUser.id && validAssignmentIds.includes(s.assignmentId)
  ) || [];

  const submittedCount = studentSubmissions.filter((s: any) => s.submitted).length;
  const totalCount = assignments.length;
  const progressPercentage = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;

  const handleCourseClick = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  // If a course is selected, show assignments for that course
  if (selectedCourse) {
    return (
      <Suspense fallback={
        <div className="fixed top-14 sm:top-20 left-0 w-screen h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-5rem)] flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }>
        <StudentCourseAssignments 
          courseId={selectedCourse} 
          onBack={() => setSelectedCourse(null)} 
        />
      </Suspense>
    );
  }

  return (

    <div className="fixed top-14 sm:top-20 left-0 w-screen h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-5rem)] overflow-y-auto pb-8">
      <style>
        {`
          .bento-section {
            --glow-x: 50%;
            --glow-y: 50%;
            --glow-intensity: 0;
            --glow-radius: ${spotlightRadius}px;
            --glow-color: ${glowColor};
            position: relative;
            select: none;
          }
          
          .card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 2px; /* Controls the border thickness */
            background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.8)) 0%,
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.4)) 30%,
                transparent 60%);
            border-radius: inherit; /* IMPORTANT: Inherits border-radius from parent */
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: subtract;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 1;
          }
          
          .card--border-glow:hover {
             /* Optional: add a subtle shadow on hover */
            box-shadow: 0 4px 20px rgba(46, 24, 78, 0.4), 0 0 30px rgba(${glowColor}, 0.2);
          }
        `}
      </style>
      
      {!shouldDisableAnimations && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={true}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}
      
      <InteractiveBg />
      <Navigation />
      
     
      <div className="bento-section max-w-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollFadeIn direction="up" duration={600} delay={0} threshold={0.05}>
          <div className="mb-8 ">
            <h2 className="text-2xl font-bold text-white mb-2 ">My Courses</h2>
            <p className="text-white">View all your enrolled courses for this semester</p>
          </div>
        </ScrollFadeIn>
        <ScrollFadeIn direction="up" duration={700} delay={100} threshold={0.05}>
          <div className="card card--border-glow rounded-xl shadow-sm border border-gray-200 p-6 mb-8 relative transition-all duration-300 ease-in-out" style={{color: 'black', opacity: '0.8'}}>
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
              <span className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-sm text-white">
              <span>{submittedCount} of {totalCount} assignments submitted</span>
              <span>{totalCount - submittedCount} pending</span>
            </div>
          </div>
        </ScrollFadeIn>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-5 ">
          {enrolledCourses.map((course: any) => {
            const courseAssignments = assignments.filter((a: any) => a.courseId === course.id);
            const courseSubmissions = studentSubmissions.filter((s: any) => 
              courseAssignments.some((a: any) => a.id === s.assignmentId)
            );
            const courseSubmittedCount = courseSubmissions.filter((s: any) => s.submitted).length;
            const courseTotalCount = courseAssignments.length;
            
            return (
              <ScrollFadeIn
                key={course.id}
                direction="up"
                duration={600}
                delay={0}
                distance={30}
                threshold={0.1}
              >
                <div
                  className="card card--border-glow border border-gray-300 rounded-xl relative overflow-hidden transition-all duration-300 ease-in-out hover:scale-102 cursor-pointer"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="backdrop-blur-sm bg-black/20 p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{course.name}</h3>
                        <p className="text-sm text-white/80">{course.code} • {course.semester}</p>
                      </div>
                      <BookOpen className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/90">Assignments:</span>
                        <span className="font-medium text-white">{courseTotalCount}</span>
                      </div>
                      
                      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${courseTotalCount > 0 ? (courseSubmittedCount / courseTotalCount) * 100 : 0}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-white/80">
                        <span>{courseSubmittedCount} submitted</span>
                        <span>{courseTotalCount - courseSubmittedCount} pending</span>
                      </div>
                      
                      <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                        <span>View Assignments</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollFadeIn>
            );
          })}
        </div>
        {enrolledCourses.length === 0 && (
          <ScrollFadeIn direction="up" duration={700} delay={0} threshold={0.1}>
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No courses enrolled yet</p>
            </div>
          </ScrollFadeIn>
        )}
      </div>

    </div>
  );
};

export default StudentDashboard;