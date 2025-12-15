import React from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthCard from "@/components/ui/auth-card";

export default function ForgotPassword() {
  const { data, setData, post, processing, errors } = useForm({ email: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/forgot-password");
  };

  return (
    <>
      <Head title="Forgot Password" />
      <div className="mx-auto grid min-h-screen place-items-center bg-black/2 px-4 py-8">
        <AuthCard title="Reset password">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[--color-brand]">Email</label>
              <input
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                aria-invalid={Boolean(errors.email)}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 aria-invalid:ring-2 aria-invalid:ring-[--ring-invalid]"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <button
              type="submit"
              disabled={processing}
              className="mt-2 w-full rounded-lg bg-[--color-brand] py-2 text-sm font-semibold text-white"
            >
              Send reset link
            </button>
          </form>
        </AuthCard>
      </div>
    </>
  );
}
