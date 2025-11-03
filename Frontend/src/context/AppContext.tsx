import { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  currentUser: any;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string) => { success: boolean; message: string };
  addAssignment: (assignment: any) => void;
  updateSubmission: (assignmentId: string, studentId: string, submitted: boolean) => void;
  addCourse: (course: any) => void;
  addGroup: (group: any) => void;
  joinGroup: (groupId: string, studentId: string) => void;
  updateAssignment: (assignmentId: string, updates: any) => void;
  deleteAssignment: (assignmentId: string) => void;
  showMobileMenu: boolean;
  setShowMobileMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const initializeMockData = () => {
  if (typeof window === 'undefined') {
    return null; 
  }

  const existingData = localStorage.getItem('assignmentSystemData');
  
  const defaultMockData = {
    users: [
      { id: 'student1', name: 'Alice Johnson', email: 'alice@student.edu', role: 'student', password: 'student123' },
      { id: 'student2', name: 'Bob Smith', email: 'bob@student.edu', role: 'student', password: 'student123' },
      { id: 'student3', name: 'Carol White', email: 'carol@student.edu', role: 'student', password: 'student123' },
      { id: 'student4', name: 'David Brown', email: 'david@student.edu', role: 'student', password: 'student123' },
      { id: 'admin1', name: 'Dr. Emily Brown', email: 'emily@prof.edu', role: 'admin', password: 'admin123' }
    ],
    courses: [
      { 
        id: 'course1', 
        name: 'Data Structures & Algorithms', 
        code: 'CS301', 
        professorId: 'admin1',
        semester: 'Fall 2025',
        enrolledStudents: ['student1', 'student2', 'student3', 'student4']
      },
      { 
        id: 'course2', 
        name: 'Machine Learning', 
        code: 'CS402', 
        professorId: 'admin1',
        semester: 'Fall 2025',
        enrolledStudents: ['student1', 'student2', 'student4']
      },
      { 
        id: 'course3', 
        name: 'Introduction to Cryptography', 
        code: 'CS419', 
        professorId: 'admin1',
        semester: 'Fall 2025',
        enrolledStudents: ['student1', 'student2', 'student3', 'student4']
      },
      { 
        id: 'course4', 
        name: 'Introduction to Design', 
        code: 'DE109', 
        professorId: 'admin1',
        semester: 'Fall 2025',
        enrolledStudents: ['student1', 'student2', 'student4']
      }
    ],
    assignments: [
      {
        id: 'assign1',
        title: 'Binary Search Tree Implementation',
        description: 'Implement a balanced binary search tree with full documentation',
        dueDate: '2025-11-15',
        driveLink: 'https://drive.google.com/example1',
        courseId: 'course1',
        createdBy: 'admin1',
        createdAt: '2025-10-01',
        submissionType: 'individual'
      },
      {
        id: 'assign2',
        title: 'Group Project - Neural Network',
        description: 'Build and train a neural network for image classification',
        dueDate: '2025-11-20',
        driveLink: 'https://drive.google.com/example2',
        courseId: 'course2',
        createdBy: 'admin1',
        createdAt: '2025-10-05',
        submissionType: 'group'
      }
    ],
    submissions: [
      { id: 'sub1', assignmentId: 'assign1', studentId: 'student1', submitted: true, submittedAt: '2025-10-28' },
      { id: 'sub2', assignmentId: 'assign1', studentId: 'student2', submitted: false, submittedAt: null },
      { id: 'sub3', assignmentId: 'assign2', studentId: 'student1', submitted: false, submittedAt: null }
    ],
    groups: [
      {
        id: 'group1',
        name: 'ML Team Alpha',
        courseId: 'course2',
        leaderId: 'student1',
        members: ['student1', 'student2'],
        assignmentId: 'assign2'
      }
    ]
  };
  
  if (!existingData) {
    localStorage.setItem('assignmentSystemData', JSON.stringify(defaultMockData));
    return defaultMockData;
  }

  const parsedData = JSON.parse(existingData);
  const migratedData = {
    ...defaultMockData,
    ...parsedData,
    courses: parsedData.courses || defaultMockData.courses,
    groups: parsedData.groups || defaultMockData.groups,
    assignments: (parsedData.assignments || []).map((a: any) => ({
      ...a,
      courseId: a.courseId || 'course1',
      submissionType: a.submissionType || 'individual'
    }))
  };

  localStorage.setItem('assignmentSystemData', JSON.stringify(migratedData));
  return migratedData;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<any>(() => {
    const initialData = initializeMockData();
    return initialData;
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('currentUser');
    const authToken = localStorage.getItem('authToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    // Validate token expiry (simulating JWT validation)
    if (authToken && tokenExpiry && savedUser) {
      const expiryTime = parseInt(tokenExpiry);
      if (Date.now() < expiryTime) {
        return JSON.parse(savedUser);
      } else {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
      }
    }
    return null;
  });
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('assignmentSystemData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    const checkTokenExpiry = () => {
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      if (tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        if (Date.now() >= expiryTime) {
          console.log('Session expired. Please login again.');
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
          localStorage.removeItem('tokenExpiry');
        }
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (data) {
      const validAssignmentIds = data.assignments.map((a: any) => a.id);
      const cleanedSubmissions = data.submissions.filter((s: any) => 
        validAssignmentIds.includes(s.assignmentId)
      );
      
      if (cleanedSubmissions.length !== data.submissions.length) {
        setData((prev: any) => ({
          ...prev,
          submissions: cleanedSubmissions
        }));
      }
    }
  }, []); // Run only once on mount

  const login = (email: string, password: string): boolean => {
    const user = data.users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      const mockToken = btoa(JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        timestamp: Date.now(),
        expiresIn: '24h'
      }));
      
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('tokenExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
      
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = (): void => {
    setCurrentUser(null);
    setShowMobileMenu(false);
    // Clear auth token on logout
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
  };

  const register = (name: string, email: string, password: string, role: string): { success: boolean; message: string } => {
    // Check if user already exists
    const existingUser = data.users.find((u: any) => u.email === email);
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' };
    }

    // Validate inputs
    if (!name || !email || !password || !role) {
      return { success: false, message: 'All fields are required' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Create new user
    const newUser = {
      id: `${role}${Date.now()}`,
      name,
      email,
      role,
      password
    };

    // Add user to data
    setData((prev: any) => ({
      ...prev,
      users: [...prev.users, newUser]
    }));

    return { success: true, message: 'Registration successful! You can now login.' };
  };

  const addAssignment = (assignment: any): void => {
    const newAssignment = {
      ...assignment,
      id: `assign${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData((prev: any) => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment],
    }));
  };

  const updateAssignment = (assignmentId: string, updates: any): void => {
    setData((prev: any) => ({
      ...prev,
      assignments: prev.assignments.map((a: any) =>
        a.id === assignmentId ? { ...a, ...updates } : a
      ),
    }));
  };

  const deleteAssignment = (assignmentId: string): void => {
    setData((prev: any) => ({
      ...prev,
      assignments: prev.assignments.filter((a: any) => a.id !== assignmentId),
      submissions: prev.submissions.filter((s: any) => s.assignmentId !== assignmentId),
    }));
  };

  const addCourse = (course: any): void => {
    const newCourse = {
      ...course,
      id: `course${Date.now()}`,
    };
    setData((prev: any) => ({
      ...prev,
      courses: [...prev.courses, newCourse],
    }));
  };

  const addGroup = (group: any): void => {
    const newGroup = {
      ...group,
      id: `group${Date.now()}`,
    };
    setData((prev: any) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
    }));
  };

  const joinGroup = (groupId: string, studentId: string): void => {
    setData((prev: any) => ({
      ...prev,
      groups: prev.groups.map((g: any) =>
        g.id === groupId
          ? { ...g, members: [...g.members, studentId] }
          : g
      ),
    }));
  };

  const updateSubmission = (
    assignmentId: string,
    studentId: string,
    submitted: boolean
  ): void => {
    setData((prev: any) => {
      const existingSubmission = prev.submissions.find(
        (s: any) => s.assignmentId === assignmentId && s.studentId === studentId
      );

      if (existingSubmission) {
        return {
          ...prev,
          submissions: prev.submissions.map((s: any) =>
            s.assignmentId === assignmentId && s.studentId === studentId
              ? {
                  ...s,
                  submitted,
                  submittedAt: submitted
                    ? new Date().toISOString().split('T')[0]
                    : null,
                }
              : s
          ),
        };
      } else {
        return {
          ...prev,
          submissions: [
            ...prev.submissions,
            {
              id: `sub${Date.now()}`,
              assignmentId,
              studentId,
              submitted,
              submittedAt: submitted
                ? new Date().toISOString().split('T')[0]
                : null,
            },
          ],
        };
      }
    });
  };

  return (
    <AppContext.Provider
      value={{
        data,
        setData,
        currentUser,
        login,
        logout,
        register,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        updateSubmission,
        addCourse,
        addGroup,
        joinGroup,
        showMobileMenu,
        setShowMobileMenu,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export { AppProvider, useApp };