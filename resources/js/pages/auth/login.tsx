import { login as apiLogin } from '@/api/auth-api';
import AuthCardLayout from '@/layouts/auth/auth-card-layout';
import PWAInstallPrompt from '@/components/pwa-install-prompt';
import { Head } from '@inertiajs/react';
import { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function Login() {
  const [form, setForm] = useState({ login: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [identifierValid, setIdentifierValid] = useState<boolean | null>(null);
  const [pwValid, setPwValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidUsername = (v: string) => /^[A-Za-z0-9._-]{3,30}$/.test(v);

  useEffect(() => {
    if (form.login.length === 0) setIdentifierValid(null);
    else if (isValidEmail(form.login)) setIdentifierValid(true);
    else setIdentifierValid(isValidUsername(form.login));
  }, [form.login]);

  useEffect(() => {
    if (form.password.length === 0) setPwValid(null);
    else setPwValid(form.password.length >= 8);
  }, [form.password]);

  const loginError =
    (fieldErrors.login && fieldErrors.login.length
      ? fieldErrors.login.join(', ')
      : fieldErrors.email && fieldErrors.email.length
      ? fieldErrors.email.join(', ')
      : '') || (identifierValid === false ? 'Please enter a valid email or username.' : '');

  const passwordError =
    fieldErrors.password && fieldErrors.password.length
      ? fieldErrors.password.join(', ')
      : pwValid === false
      ? 'Password must be at least 8 characters.'
      : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGlobalError(null);

    try {
      const response = await apiLogin({ login: form.login, password: form.password, remember: form.remember });
      const user = response.data.user;
      const acct = user.acctno ?? user.user_id ?? user.id;

      console.log('[Login] User object:', user);
      console.log('[Login] User status:', user.status);
      console.log('[Login] User role:', user.role);

      if (user.role === 'admin') {
        console.log('[Login] Redirecting to admin dashboard');
        window.location.href = `/admin/${acct}/dashboard`;
      } else if (user.role === 'client' || user.role === 'client') {
        if (user.status === 'approved') {
          console.log('[Login] User approved, redirecting to client dashboard');
          window.location.href = `/client/${user.acctno}/dashboard`;
        } else if (user.status === 'rejected' || user.status === 'pending') {
          console.log('[Login] User pending/rejected, redirecting to registration-status');
          window.location.href = `/client/${user.acctno}/registration-status`;
        } else {
          console.log('[Login] Unknown status, redirecting to home');
          window.location.href = '/';
        }
      } else {
        console.log('[Login] Unknown role, redirecting to home');
        window.location.href = '/';
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      if (error.response && error.response.data) {
        setFieldErrors(error.response.data.errors || {});
        setGlobalError(error.response.data.message ?? null);
      } else {
        setGlobalError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-400 outline-none focus:border-[#F57979] focus:ring-2 focus:ring-[#F57979]/50';

  return (
    <>
      <Head title="Login - TDFC App" />
      <AuthCardLayout
        title="Login"
        description="Welcome back. Enter your credentials to continue."
        footer={
          <>
            Don't have an account?{' '}
            <a href="/register" className="font-semibold text-[#F57979] hover:underline">
              Register
            </a>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="w-full mx-auto">

          {globalError && (
            <div className="mb-4">
              <div
                className="w-full rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-center text-[15px] text-red-700 shadow"
                role="alert"
              >
                {globalError}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="text-[13px] font-extrabold tracking-wide text-[#F57979] uppercase">Email or Username</label>
            <input
              type="text"
              name="login"
              value={form.login}
              onChange={handleChange}
              placeholder="you@example.com or username"
              aria-invalid={Boolean(loginError)}
              className={`${inputBase} ${loginError ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
              autoComplete="username"
            />
            <div className="min-h-4 mt-1 text-xs text-red-500">
              {loginError || ''}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-[13px] font-extrabold tracking-wide text-[#F57979] uppercase">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                aria-invalid={Boolean(passwordError)}
                className={`${inputBase} pr-10 ${passwordError ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="min-h-4 mt-1 text-xs text-red-500">
              {passwordError || ''}
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-black/70">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="rounded border-gray-300"
              />
              Remember me
            </label>
            <a href="/forgot-password" className="text-sm font-semibold text-[#F57979] hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#F57979] py-2.5 text-sm font-extrabold tracking-wide text-white hover:opacity-95 disabled:opacity-40"
          >
            Sign In
          </button>

        </form>
      </AuthCardLayout>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </>
  );
}
