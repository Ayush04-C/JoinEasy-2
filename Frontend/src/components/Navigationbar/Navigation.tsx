'use client';
import { BookOpen, LogOut, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import SplitText from "../../animations/SplitText";

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

const Navigation = () => {
  const { currentUser, logout, showMobileMenu, setShowMobileMenu } = useApp();

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 backdrop-blur-2xl border border-white/50 shadow-lg rounded-full"
      >
        <div className="mx-auto px-10 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 sm:h-20">

            <div className="flex justify-start items-center space-x-10 sm:space-x-3 flex-1 min-w-0 overflow-hidden">
              <BookOpen className="w-4 h-4 sm:w-8 sm:h-8 text-indigo-400 flex-shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-4 min-w-0 overflow-hidden max-w-[70%] sm:max-w-none">
                <h1
                  className="sm:text-xl md:text-2xl lg:text-3xl font-bold truncate leading-tight tracking-wide"
                  style={{
                    background: 'linear-gradient(to right, #a855f7, #3b82f6, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: 'clamp(20px, 2.5vw, 2rem)',
                    textShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  Assignment Hub
                </h1>

                <p
                  className="text-[9px] sm:text-base md:text-lg lg:text-xl truncate leading-tight"
                  style={{
                    background: 'linear-gradient(to right, #a855f7, #3b82f6, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: 'clamp(9px, 2vw, 1.25rem)',
                  }}
                >
                  {currentUser?.role === 'admin'
                    ? `Professor's Dashboard`
                    : `Student's Dashboard`}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  <SplitText
                    text={`Hello, ${currentUser.role === 'admin'
                      ? currentUser?.name
                      : currentUser?.name.split(' ')[0]
                      } `}
                    className="text-2xl font-semibold text-white"
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
                <p className="text-xs text-gray-200">{currentUser?.email}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-xl text-white transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </motion.button>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-white/10 flex-shrink-0 ml-2 text-white"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {showMobileMenu && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-md"
          onClick={() => setShowMobileMenu(false)}
        >
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="fixed top-16 sm:top-20 right-2 sm:right-4 bg-white/20 border border-white/30 backdrop-blur-xl text-white rounded-2xl shadow-2xl p-5 sm:p-6 min-w-[260px] max-w-[300px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="pb-4 border-b border-white/30">
                <p className="text-base font-semibold text-white">{currentUser?.name}</p>
                <p className="text-sm text-gray-200 mt-1">{currentUser?.email}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  logout();
                  setShowMobileMenu(false);
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Navigation;
