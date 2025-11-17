import React from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthCard from "@/components/ui/auth-card";

type Props = { token: string; email: string };

export default function ResetPassword({ token, email }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    token,
    email: email ?? "",
    password: "",
    password_confirmation: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/reset-password");
  };

  return (
    <>
      <Head title="Reset Password" />
      <div className="mx-auto grid min-h-screen place-items-center bg-black/[.02] px-4 py-8">
        <AuthCard title="Choose a new password">
          <form onSubmit={submit} className="space-y-4">
            <input type="hidden" value={data.token} />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[--color-brand]">Email</label>
              <input
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[--color-brand]">Password</label>
                <input
                  type="password"
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-[--ring-invalid]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[--color-brand]">Confirm</label>
                <input
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData("password_confirmation", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={processing}
              className="mt-2 w-full rounded-lg bg-[--color-brand] py-2 text-sm font-semibold text-white"
            >
              Reset password
            </button>
          </form>
        </AuthCard>
      </div>
    </>
  );
}
