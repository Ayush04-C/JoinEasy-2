import { useState } from 'react';
import { BookOpen, Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import InteractiveBg from '../../animations/Interactivebg';
import ScrollFadeIn from '../../animations/ScrollFadeIn';
<link href="/src/style.css" rel="stylesheet"></link>


const Login = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) validateEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value) validatePassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate both fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    // Simulate API call with loading state
    setIsLoading(true);

    // Simulate network delay (JWT authentication would happen here)
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (login(email, password)) {
      setIsSuccess(true);
      // Short delay to show success state before redirect
      setTimeout(() => {
        setError('');
      }, 500);
    } else {
      setIsLoading(false);
      setError('Invalid credentials. Please check your email and password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center w-screen justify-center p-4">
      <InteractiveBg />
        <div className="backdrop-blur border border-white/20 rounded-2xl shadow-xl p-8 w-full max-w-md transition-all duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 rounded-full mb-4 backdrop-blur-sm border border-indigo-500/30">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Assignment Hub</h1>
            <p className="text-gray-400 mt-2">Student & Professor Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
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
                  className={`w-80 pl-10 pr-12 py-3 bg-gray-800/50 border ${
                    passwordError ? 'border-red-500' : 'border-gray-600'
                  } text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isSuccess}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-400 animate-pulse">{passwordError}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm backdrop-blur-sm animate-pulse">
                {error}
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg text-sm backdrop-blur-sm animate-pulse">
                ✓ Login successful! Redirecting...
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess || !!emailError || !!passwordError}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : isSuccess ? (
                <span>✓ Success</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
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
        </div>
    </div>
  );
};


export default Login;