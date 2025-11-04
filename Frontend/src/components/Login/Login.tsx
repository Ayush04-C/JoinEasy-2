  import { useState } from 'react';
  import { BookOpen, Eye, EyeOff, Loader2, Mail, Lock, User, UserPlus } from 'lucide-react';
  import { useApp } from '../../context/AppContext';
  import InteractiveBg from '../../animations/Interactivebg';

  import Orb from '../../animations/orb';


  const Login = () => {
    const { login, register } = useApp();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [nameError, setNameError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Email validation
    const validateEmail = (value: string) => {
      if (!value) {
        setEmailError('Email is required');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setEmailError('Please enter a valid email address');
        return false;
      }
      setEmailError('');
      return true;
    };

    // Name validation
    const validateName = (value: string) => {
      if (!value) {
        setNameError('Name is required');
        return false;
      }
      if (value.length < 2) {
        setNameError('Name must be at least 2 characters');
        return false;
      }
      setNameError('');
      return true;
    };

    // Password validation
    const validatePassword = (value: string) => {
      if (!value) {
        setPasswordError('Password is required');
        return false;
      }
      if (value.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return false;
      }
      setPasswordError('');
      return true;
    };

    // Confirm password validation
    const validateConfirmPassword = (value: string) => {
      if (!value) {
        setConfirmPasswordError('Please confirm your password');
        return false;
      }
      if (value !== password) {
        setConfirmPasswordError('Passwords do not match');
        return false;
      }
      setConfirmPasswordError('');
      return true;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmail(value);
      if (value) validateEmail(value);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setName(value);
      if (value) validateName(value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPassword(value);
      if (value) validatePassword(value);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setConfirmPassword(value);
      if (value) validateConfirmPassword(value);
    };

    const toggleMode = () => {
      setIsRegisterMode(!isRegisterMode);
      setError('');
      setEmailError('');
      setPasswordError('');
      setNameError('');
      setConfirmPasswordError('');
      setEmail('');
      setPassword('');
      setName('');
      setConfirmPassword('');
      setRole('student');
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (isRegisterMode) {
        // Registration flow
        const isNameValid = validateName(name);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

        if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
          return;
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = register(name, email, password, role);
        setIsLoading(false);

        if (result.success) {
          setIsSuccess(true);
          setError('');
          setTimeout(() => {
            setIsSuccess(false);
            toggleMode(); // Switch back to login mode
          }, 2000);
        } else {
          setError(result.message);
        }
      } else {
        // Login flow
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        if (!isEmailValid || !isPasswordValid) {
          return;
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (login(email, password)) {
          setIsSuccess(true);
          setTimeout(() => {
            setError('');
          }, 500);
        } else {
          setIsLoading(false);
          setError('Invalid credentials. Please check your email and password.');
        }
      }
    };

    return (
      <div className="min-h-screen flex items-center w-full justify-center p-2 sm:p-4 relative overflow-hidden">
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 'auto', height: '600px', position: 'relative' }}>
            <Orb
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={0}
              forceHoverState={false}
            />
          </div>
        </div>
        <InteractiveBg />
          <div className="backdrop-blur max-h-[98vh] overflow-y-auto border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-[95vw] sm:max-w-md mx-auto transition-all duration-300 relative z-10 scrollbar-hide" style={{ pointerEvents: 'auto' }}>
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-600/20 rounded-full mb-3 sm:mb-4 backdrop-blur-sm border border-indigo-500/30">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl text-[800] text-white">Assignment Hub</h1>
              <p className="text-sm sm:text-base text-gray-400 mt-2">
                {isRegisterMode ? 'Create Your Account' : 'Student & Professor Portal'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Name Field (Only for Registration) */}
              {isRegisterMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      onBlur={() => name && validateName(name)}
                      disabled={isLoading || isSuccess}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border ${
                        nameError ? 'border-red-500' : 'border-gray-600'
                      } text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                  </div>
                  {nameError && (
                    <p className="mt-1 text-sm text-red-400 animate-pulse">{nameError}</p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => email && validateEmail(email)}
                    disabled={isLoading || isSuccess}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border ${
                      emailError ? 'border-red-500' : 'border-gray-600'
                    } text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="your.email@edu"
                    autoComplete="email"
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-400 animate-pulse">{emailError}</p>
                )}
              </div>

              {/* Role Selection (Only for Registration) */}
              {isRegisterMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">I am a</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      disabled={isLoading || isSuccess}
                      className={`py-3 px-4 rounded-lg border transition-all font-medium ${
                        role === 'student'
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      disabled={isLoading || isSuccess}
                      className={`py-3 px-4 rounded-lg border transition-all font-medium ${
                        role === 'admin'
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Professor
                    </button>
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-sm  font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => password && validatePassword(password)}
                    disabled={isLoading || isSuccess}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-800/50 border ${
                      passwordError ? 'border-red-500' : 'border-gray-600'
                    } text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="••••••••"
                    autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isSuccess}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-400 animate-pulse">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password Field (Only for Registration) */}
              {isRegisterMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onBlur={() => confirmPassword && validateConfirmPassword(confirmPassword)}
                      disabled={isLoading || isSuccess}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-800/50 border ${
                        confirmPasswordError ? 'border-red-500' : 'border-gray-600'
                      } text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading || isSuccess}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="mt-1 text-sm text-red-400 animate-pulse">{confirmPasswordError}</p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm backdrop-blur-sm animate-pulse">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {isSuccess && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg text-sm backdrop-blur-sm animate-pulse">
                  {isRegisterMode 
                    ? '✓ Registration successful! Redirecting to login...'
                    : '✓ Login successful! Redirecting...'
                  }
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess || !!emailError || !!passwordError || (isRegisterMode && (!!nameError || !!confirmPasswordError))}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isRegisterMode ? 'Creating Account...' : 'Authenticating...'}</span>
                  </>
                ) : isSuccess ? (
                  <span>✓ Success</span>
                ) : (
                  <>
                    {isRegisterMode ? (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Create Account</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </>
                )}
              </button>
            </form>

            {/* Toggle between Login and Register */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={toggleMode}
                disabled={isLoading || isSuccess}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
              >
                {isRegisterMode 
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Register"
                }
              </button>
            </div>

            {/* Demo Credentials (Only show in login mode) */}
            {!isRegisterMode && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-xs text-gray-400 text-center mb-2">Demo Credentials:</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('alice@student.edu');
                      setPassword('student123');
                      setEmailError('');
                      setPasswordError('');
                    }}
                    disabled={isLoading || isSuccess}
                    className="w-full text-left px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 transition-all disabled:opacity-50"
                  >
                    <strong className="text-indigo-400">Student:</strong> alice@student.edu / student123
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('emily@prof.edu');
                      setPassword('admin123');
                      setEmailError('');
                      setPasswordError('');
                    }}
                    disabled={isLoading || isSuccess}
                    className="w-full text-left px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 transition-all disabled:opacity-50"
                  >
                    <strong className="text-purple-400">Professor:</strong> emily@prof.edu / admin123
                  </button>
                </div>
              </div>
            )}
          </div>
      </div>
    );
  };


  export default Login;