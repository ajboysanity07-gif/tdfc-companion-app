// resources/js/pages/auth/login.tsx
import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthCard from '@/components/ui/auth-card';
import InputError from '@/components/ui/input-error';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false as boolean,
  });

  const [showPassword, setShowPassword] = useState(false);

  // Realtime client validation
  const [emailValid, setEmailValid] = useState<boolean | null>(null); // null = untouched, true/false after typing
  const [pwValid, setPwValid] = useState<boolean | null>(null);

  // Simple, robust email check for UI hints
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  useEffect(() => {
    if (data.email.length === 0) setEmailValid(null);
    else setEmailValid(isValidEmail(data.email));
  }, [data.email]);

  useEffect(() => {
    if (data.password.length === 0) setPwValid(null);
    else setPwValid(data.password.length >= 8);
  }, [data.password]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/login');
  };

  const inputBase =
    'mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-black placeholder:text-gray-400 outline-none focus:border-[#F57979] focus:ring-2 focus:ring-[#F57979]/50';

  // Derive the error messages to show (server errors take priority)
  const emailError =
    errors.email ? errors.email : emailValid === false ? 'Please enter a valid email address.' : '';
  const passwordError =
    errors.password ? errors.password : pwValid === false ? 'Password must be at least 8 characters.' : '';

  return (
    <>
      <Head title="Login" />
      <div className="mx-auto grid min-h-screen place-items-start bg-gradient-to-br from-gray-100 via-white to-gray-200 px-4 py-8 sm:place-items-center">
        <form onSubmit={submit} className="w-full max-w-[540px]">
          <h1 className="text-center text-4xl font-extrabold tracking-tight text-[#F57979]">Login</h1>
          <p className="mx-auto mt-3 max-w-[46ch] text-center text-[15px] leading-6 text-black/70">
            Welcome back. Enter your credentials to continue.
          </p>

          <AuthCard>
            {/* Email */}
            <div className="mb-4">
              <label className="text-[13px] font-extrabold uppercase tracking-wide text-[#F57979]">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="you@example.com"
                aria-invalid={Boolean(emailError)}
                className={`${inputBase} ${emailError ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
              />
              <InputError message={emailError} />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="text-[13px] font-extrabold uppercase tracking-wide text-[#F57979]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Minimum 8 characters"
                  aria-invalid={Boolean(passwordError)}
                  className={`${inputBase} pr-10 ${passwordError ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <InputError message={passwordError} />
            </div>

            {/* Remember + Forgot */}
            <div className="mb-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-black/70">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="rounded border-gray-300"
                />
                Remember me
              </label>
              <a
                href="/forgot-password"
                className="text-sm font-semibold text-[#F57979] hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={processing}
              className="w-full rounded-2xl bg-[#F57979] py-3 text-sm font-extrabold tracking-wide text-white hover:opacity-95 disabled:opacity-40"
            >
              Sign In
            </button>
          </AuthCard>

          {/* Optional footer link to register */}
          <p className="mt-4 text-center text-sm text-black/70">
            Don’t have an account?{' '}
            <a href="/register" className="font-semibold text-[#F57979] hover:underline">
              Register
            </a>
          </p>
        </form>
      </div>
    </>
  );
}
