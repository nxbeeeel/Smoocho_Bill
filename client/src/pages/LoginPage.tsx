import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { LoadingSpinner } from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, setLoading, isLoading } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter both username and password',
      });
      return;
    }

    setLoading(true);

    try {
      // For now, use demo credentials
      if (username === 'admin' && password === 'admin123') {
        const demoUser = {
          id: '1',
          username: 'admin',
          email: 'admin@smoocho.com',
          role: 'admin' as const,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const demoToken = 'demo-jwt-token';

        login(demoUser, demoToken);

        addNotification({
          type: 'success',
          title: 'Welcome!',
          message: 'Successfully logged in to Smoocho Bill',
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Login Failed',
          message: 'Invalid username or password',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Login Error',
        message: 'An error occurred during login. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-primary-500 rounded-xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-secondary-900">
            Smoocho Bill
          </h2>
          <p className="mt-2 text-lg text-secondary-600">
            POS & Inventory Management
          </p>
          <p className="mt-4 text-sm text-secondary-500">
            Touch-optimized for tablets • Works offline
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-touch w-full"
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-touch w-full"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-secondary-500 bg-secondary-100 p-4 rounded-lg">
              <p className="font-medium mb-2">Demo Credentials:</p>
              <p>
                Username:{' '}
                <span className="font-mono bg-white px-2 py-1 rounded">
                  admin
                </span>
              </p>
              <p>
                Password:{' '}
                <span className="font-mono bg-white px-2 py-1 rounded">
                  admin123
                </span>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
