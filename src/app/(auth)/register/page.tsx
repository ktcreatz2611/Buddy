'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Register page component
 */
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto-login on success
      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError('Registered successfully, but auto-login failed. Please log in.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      if (!error) setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Create an account</h1>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={1}
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
            placeholder="your_username"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={3}
            maxLength={30}
          />
          <p className="mt-1 text-xs text-gray-500">Letters, numbers, underscores, dots, hyphens only</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 chars, upper, lower, number, symbol"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={8}
          />
          {password.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              <li className={password.length >= 8 ? 'text-green-600' : 'text-red-500'}>
                {password.length >= 8 ? '✓' : '✗'} At least 8 characters
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                {/[A-Z]/.test(password) ? '✓' : '✗'} One uppercase letter
              </li>
              <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                {/[a-z]/.test(password) ? '✓' : '✗'} One lowercase letter
              </li>
              <li className={/[0-9]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                {/[0-9]/.test(password) ? '✓' : '✗'} One number
              </li>
              <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                {/[^A-Za-z0-9]/.test(password) ? '✓' : '✗'} One special character (!@#$%...)
              </li>
            </ul>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
