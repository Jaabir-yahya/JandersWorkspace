'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setCurrentTenantId } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{
        success: boolean;
        data?: {
          user: { id: string; email: string; tenantId?: string };
          session: { accessToken: string };
        };
      }>('/auth/sign-in', { email, password });
      const data = res.data?.data;
      if (!data?.session?.accessToken) {
        setError('Invalid response from server');
        return;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.session.accessToken);
        if (data.user.tenantId) {
          setCurrentTenantId(data.user.tenantId);
        }
      }
      // If no tenant in profile, user must select one
      if (data.user?.tenantId) {
        router.push('/dashboard');
      } else {
        router.push('/tenant-select');
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        ?? (err as { message?: string })?.message
        ?? 'Sign in failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid-pattern px-4">
      <div className="w-full max-w-sm rounded-xl border border-baobab-200 bg-white p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-baobab-800 mb-1">Project Bridge</h1>
        <p className="text-sm text-baobab-600 mb-6">Sign in to your ledger</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-baobab-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-baobab-200 px-3 py-2 text-baobab-800 focus:border-acacia-500 focus:ring-1 focus:ring-acacia-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-baobab-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-baobab-200 px-3 py-2 text-baobab-800 focus:border-acacia-500 focus:ring-1 focus:ring-acacia-500"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-acacia-600 px-4 py-2 font-medium text-white hover:bg-acacia-700 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-xs text-baobab-500">
          Use your Supabase-backed account. Tenant is set from your profile after sign-in.
        </p>
      </div>
    </div>
  );
}
