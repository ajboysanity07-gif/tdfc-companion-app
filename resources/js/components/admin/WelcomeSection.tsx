import { User } from 'lucide-react';

type WelcomeSectionProps = {
  name: string;
  role: string;
  avatar?: string | null;
};

export default function WelcomeSection({ name, role, avatar }: WelcomeSectionProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#F57979] px-6 py-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">
      {/* Mobile Layout */}
      <div className="flex w-full flex-col items-center gap-3 sm:hidden">
        <h1 className="text-center text-3xl font-extrabold tracking-tight text-[#FFF172]">
          Welcome Back, {name.split(' ')[0] ?? 'Admin'} 👋
        </h1>
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20 shadow-lg">
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" />
          ) : (
            <User className="h-14 w-14 text-white" />
          )}
        </div>
        <p className="text-sm text-white/90">
          You are logged in as <span className="font-semibold uppercase">{role}</span>
        </p>
      </div>

      {/* Desktop Layout */}
      <>
        <div className="hidden space-y-2 sm:block">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#FFF172]">
            Welcome Back, {name.split(' ')[0] ?? 'Admin'} 👋
          </h1>
          <p className="text-white/90">
            You are logged in as <span className="font-semibold uppercase">{role}</span>
          </p>
        </div>
        <div className="hidden h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-lg sm:flex">
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" />
          ) : (
            <User className="h-10 w-10 text-white" />
          )}
        </div>
      </>
    </div>
  );
}
