'use client';
import Login from './components/Login/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import { AppProvider, useApp } from './context/AppContext';



<link href="/src/style.css" rel="stylesheet"></link>




// Main App Component
const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

const AppContent = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Login />;
  }

  return currentUser.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
};

export default App;