import { BookOpen, LogOut, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SplitText from "../../animations/SplitText";

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};



// Navigation Component
const Navigation = () => {
  const { currentUser, logout, showMobileMenu, setShowMobileMenu } = useApp();

  return (
    <>
      <nav className="shadow-sm text-left fixed backdrop-blur-sm border border-gray-200 rounded-full top-0 w-full z-50">
        <div className="mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-20">
            <div className="flex justify-start items-center space-x-2 sm:space-x-3 flex-1 min-w-0 overflow-hidden">
              <BookOpen className="w-4 h-4 sm:w-8 sm:h-8 text-indigo-600 flex-shrink-0" />
              <div className='flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-4 min-w-0 overflow-hidden max-w-[70%] sm:max-w-none'>
                <h1 className="text-[15px] sm:text-xl md:text-2xl lg:text-3xl font-bold truncate leading-tight" 
                style={{background: 'linear-gradient(to right, #a855f7, #3b82f6, #06b6d4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: 'clamp(20px, 2.5vw, 2rem)'}}>Assignment Hub</h1>
                <p className="text-[9px] sm:text-base md:text-lg lg:text-xl truncate leading-tight" 
                style={{background: 'linear-gradient(to right, #a855f7, #3b82f6, #06b6d4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: 'clamp(9px, 2vw, 1.25rem)'}}>
                  {currentUser?.role === 'admin' ? `Professor's Dashboard` : `Student's Dashboard`}
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  <SplitText
                    text={`Hello, ${currentUser.role == 'admin' ? currentUser?.name : currentUser?.name.split(' ')[0]} `}
                    className="text-2xl font-semibold text-[#13062dff]text-center"
                    delay={100}
                    duration={0.6}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 40 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.1}
                    rootMargin="-100px"
                    textAlign="center"
                    onLetterAnimationComplete={handleAnimationComplete}
                  />
                </p>
                <p className="text-s text-white">{currentUser?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 flex-shrink-0 ml-2"
            >
              {showMobileMenu ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}>
          <div 
            className="fixed top-16 sm:top-20 right-2 sm:right-4 bg-white rounded-xl shadow-2xl p-4 sm:p-6 min-w-[260px] max-w-[300px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-200">
                <p className="text-base font-semibold text-gray-900">{currentUser?.name}</p>
                <p className="text-sm text-gray-500 mt-1">{currentUser?.email}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowMobileMenu(false);
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;