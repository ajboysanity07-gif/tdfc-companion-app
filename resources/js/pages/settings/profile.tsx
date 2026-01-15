import AppearanceTabs from '@/components/appearance-tabs';
import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import AvatarCropModal from '@/components/ui/avatar-crop-modal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, type ChangeEvent } from 'react';

// Modal imports
import Modal from '@/components/ui/modal';
import EmailModal from '@/components/modals/email-modal';
import PasswordModal from '@/components/modals/password-modal';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Profile settings',
    href: '/settings/profile',
  },
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function Profile() {
  const { auth } = usePage<SharedData>().props;

  const [showCropModal, setShowCropModal] = useState<boolean>(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const email: string = auth.user.email ?? '';

  const handleAvatarSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImageSrc(url);
      setShowCropModal(true);
    }
  };

  const handleCroppedFile = (file: File) => {
    setAvatarFile(file);
    setShowCropModal(false);
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
    }
  };

  const formatName = (name: string): string => {
    if (!name) return '';
    let normalized = name;
    
    // Handle comma-separated names (Last, First format)
    if (name.includes(',')) {
      const parts = name.split(',').map((p) => p.trim());
      normalized = parts.reverse().join(' ');
    }
    
    // Handle suffix (Jr., Sr., II, III, etc.)
    const suffixPattern = /\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi;
    const suffixMatch = normalized.match(suffixPattern);
    
    if (suffixMatch) {
      // Remove suffix from current position
      normalized = normalized.replace(suffixPattern, '').trim();
    }
    
    // Clean up extra spaces and standalone periods
    normalized = normalized
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\s*\.\s*\.\s*/g, '. ')  // Replace multiple periods with single period and space
      .replace(/\s+\./g, '.')  // Remove space before period
      .trim();
    
    // Split, filter, and capitalize
    const formattedParts = normalized
      .split(' ')
      .filter(part => part && part !== '.')  // Remove empty strings and standalone periods
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    
    // Add suffix back if it exists with proper casing
    if (suffixMatch) {
      const suffix = suffixMatch[0].toUpperCase();
      // Normalize common suffixes to proper case
      if (suffix === 'JR' || suffix === 'JR.') {
        formattedParts.push('Jr.');
      } else if (suffix === 'SR' || suffix === 'SR.') {
        formattedParts.push('Sr.');
      } else {
        // Roman numerals stay uppercase (II, III, IV, V)
        formattedParts.push(suffix);
      }
    }
    
    return formattedParts.join(' ');
  };

  const fullName = formatName(auth.user.name ?? '');

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile settings" />

      <SettingsLayout>
        {/* Mobile View */}
        <div className="block max-h-screen overflow-y-auto md:hidden">
          <div
            className="flex flex-col space-y-6 rounded-b-3xl border border-white/20 py-6 shadow-2xl backdrop-blur-xl"
            style={{
              background: `linear-gradient(to right, rgba(135, 191, 211, 0.85), rgba(111, 168, 199, 0.85), rgba(87, 147, 187, 0.85))`,
            }}
          >
            <h2 className="ml-6 text-left font-sans text-lg font-black text-white drop-shadow-sm">My Account</h2>

            <div className="flex flex-col items-center px-6">
              <div className="relative flex flex-col items-center">
                {/* Wrapper for positioning badge outside */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => (document.getElementById('avatar-upload') as HTMLInputElement)?.click()}
                    className="h-28 w-28 overflow-hidden rounded-full border-4 border-white/30 shadow-2xl ring-4 ring-white/20 backdrop-blur-sm bg-white/10 transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-400"
                  >
                    {avatarFile ? (
                      <img src={URL.createObjectURL(avatarFile)} alt="Profile" className="h-full w-full object-cover" />
                    ) : auth.user.avatar ? (
                      <img src={auth.user.avatar} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/20 text-white">
                        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Decorative + badge OUTSIDE the circle */}
                  <div className="absolute -bottom-2 -right-1 h-9 w-9 rounded-full bg-[#f57373] flex items-center justify-center shadow-lg pointer-events-none">
                    <span className="text-white text-lg  font-bold">+</span>
                  </div>
                </div>

                <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" id="avatar-upload" />

                {fullName ? (
                  <div className="mt-3 text-center font-sans text-3xl font-bold text-white drop-shadow-sm">{fullName}</div>
                ) : null}
              </div>
            </div>

            <div className="w-full px-6">
              <div className="flex flex-col items-end space-y-1">
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="rounded-md px-2 py-1 text-sm text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white hover:underline"
                >
                  Change Email
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="rounded-md px-2 py-1 text-sm text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white hover:underline"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>

          <div className="mx-5 my-5 rounded-3xl border border-white/20 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col items-center space-y-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Email:</p>
                <p className="font-extrabold break-all text-gray-900 dark:text-muted-foreground">{email}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Class:</p>
                <p className="font-bold text-gray-900 dark:text-muted-foreground">{auth.user.class || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Basic Salary*:</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {auth.user.salary_amount != null 
                    ? formatCurrency(auth.user.salary_amount)
                    : 'Not configured'}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-[#4c92f1]">
              *For Loan Calculator reference only. To update this value, send us an updated copy of your payslip
            </p>

            <div className="mt-6">
              <Button
                onClick={() => router.post('/logout')}
                className="w-full rounded-2xl border border-red-400/30 py-6 text-lg font-semibold shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl"
                variant="destructive"
                style={{ backgroundColor: 'rgba(245, 115, 115, 0.9)', borderColor: 'rgba(245, 115, 115, 0.5)' }}
              >
                LOGOUT
              </Button>
            </div>
          </div>

          <div className="mx-5 space-y-4 pb-8">
            <div className="border border-white/20 rounded-2xl bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <HeadingSmall title="Appearance Settings" description="Customize your profile appearance" />
              <div className="mt-4">
                <AppearanceTabs />
              </div>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <DeleteUser />
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden space-y-8 md:block">
          <div
            className="overflow-hidden rounded-3xl shadow-xl"
            style={{ background: `linear-gradient(to right, #87bfd3, #6fa8c7, #5793bb)` }}
          >
            <div className="p-8">
              <div className="flex items-center space-x-8">
                <div className="relative shrink-0">
                  {/* Wrapper for positioning badge outside */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => (document.getElementById('avatar-upload-desktop') as HTMLInputElement)?.click()}
                      className="h-24 w-24 overflow-hidden rounded-full border-4 border-white/30 shadow-2xl ring-4 ring-white/20 bg-white/10 transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-400"
                    >
                      {avatarFile ? (
                        <img src={URL.createObjectURL(avatarFile)} alt="Profile" className="h-full w-full object-cover" />
                      ) : auth.user.avatar ? (
                        <img src={auth.user.avatar} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/20 text-white">
                          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Decorative + badge OUTSIDE the circle */}
                    <div className="absolute -bottom-2 -right-1 h-8 w-8 rounded-full bg-[#f57373] flex items-center justify-center shadow-lg pointer-events-none">
                      <span className="text-white text-lg font-bold">+</span>
                    </div>
                  </div>

                  <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" id="avatar-upload-desktop" />
                </div>

                <div className="flex-1">
                  <div className="mb-2">
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium tracking-wider text-white/90 uppercase backdrop-blur-sm">
                      My Account
                    </span>
                  </div>

                  {fullName && <h1 className="mb-4 text-3xl font-bold tracking-tight text-white lg:text-4xl">{fullName}</h1>}

                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Change Email
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">Email</h3>
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#87bfd3' }}></div>
              </div>
              <p className="text-lg font-bold break-all text-gray-900 dark:text-white">{email}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">Class</h3>
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#87bfd3' }}></div>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{auth.user.class || 'N/A'}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">Basic Salary</h3>
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {auth.user.salary_amount != null 
                  ? formatCurrency(auth.user.salary_amount)
                  : 'Not configured'}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Monthly</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#4c92f1] bg-[#87bfd3]/10 p-6">
            <div className="flex items-start space-x-3">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-[#4c92f1]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[#4c92f1]">
                  <strong>Note:</strong> Salary information is for Loan Calculator reference only. To update this value, send us an
                  updated copy of your payslip.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <HeadingSmall title="Appearance Settings" description="Customize your profile appearance" />
              <div className="mt-4">
                <AppearanceTabs />
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-neutral-700">
                <h4 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">Session</h4>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Sign out of your account</p>
                <Button
                  onClick={() => router.post('/logout')}
                  variant="destructive"
                  className="w-full rounded-xl bg-red-500 py-3 font-medium text-white hover:bg-red-600"
                >
                  Sign Out
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <div className="w-full">
                <DeleteUser />
              </div>
            </div>
          </div>
        </div>
      </SettingsLayout>

      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Update Email Address"
      >
        <EmailModal
          currentEmail={email}
          onClose={() => setShowEmailModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Update Password"
      >
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      </Modal>

      {showCropModal && (
        <AvatarCropModal
          src={selectedImageSrc}
          onCancel={handleCropCancel}
          onCroppedFile={handleCroppedFile}
          isAuthenticated={!!auth.user}
          userId={auth.user.id}
        />
      )}
    </AppLayout>
  );
}
