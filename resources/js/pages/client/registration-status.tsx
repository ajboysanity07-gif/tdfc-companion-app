import PayslipFileRow from '@/components/auth/register/payslip-filerow';
import PRCFileRow from '@/components/auth/register/prc-filerow';
import PayslipWizard from '@/components/auth/register/payslip-wizard';
import PrcWizard from '@/components/auth/register/prc-wizard';
import MinimalLayout from '@/layouts/minimal-layout';
import { Head } from '@inertiajs/react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import axiosClient from '@/api/axios-client';

interface Props {
  name: string;
  bname?: string | null;
  acctno?: string;
  status: 'pending' | 'rejected';
  rejection_reasons?: { code: string; label: string }[];
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string | null;
}

export default function RegistrationStatus({
  name,
  bname,
  acctno,
  status,
  rejection_reasons = [],
  submitted_at,
  reviewed_at,
  reviewed_by,
}: Props) {
  const isMobile = useMediaQuery('(max-width:639px)');

  const prcCodes = ['prc_id_blurry', 'not_prc_id', 'prc_id_expired'];
  const payslipCodes = ['payslip_blurry', 'payslip_too_old', 'documents_tampered'];
  const userCodes = rejection_reasons.map((r) => r.code);

  const needsPRC = userCodes.some((c) => prcCodes.includes(c));
  const needsPayslip = userCodes.some((c) => payslipCodes.includes(c));

  const [prcWizardOpen, setPrcWizardOpen] = useState(false);
  const [payslipWizardOpen, setPayslipWizardOpen] = useState(false);
  const [prcFront, setPrcFront] = useState<File | null>(null);
  const [prcBack, setPrcBack] = useState<File | null>(null);
  const [payslipFile, setPayslipFile] = useState<File | null>(null);
  const [payName, setPayName] = useState<string | undefined>();
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const normalizeStatus = (s: string | null | undefined) =>
    s && s.trim().toLowerCase() === 'rejected' ? 'rejected' : 'pending';
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'rejected'>(normalizeStatus(status));
  const [currentReasons, setCurrentReasons] = useState(rejection_reasons);
  const [fallbackUser, setFallbackUser] = useState<{ name?: string; acctno?: string; created_at?: string }>({});
  const displayName =
    (bname?.trim()?.length ? bname.trim() : null) ||
    (name?.trim()?.length ? name.trim() : null) ||
    (fallbackUser.name?.trim()?.length ? fallbackUser.name?.trim() : null) ||
    acctno ||
    fallbackUser.acctno ||
    'Your Account';
  const submittedAtValue = submitted_at || fallbackUser.created_at || '';
  const formattedSubmittedAt = submittedAtValue
    ? new Date(submittedAtValue).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  React.useEffect(() => {
    setCurrentStatus(normalizeStatus(status));
    setCurrentReasons(rejection_reasons);
  }, [status, rejection_reasons]);

  // Fetch fallback user data (in case Inertia props are missing bname/name)
  React.useEffect(() => {
    if ((bname && bname.trim()) || (name && name.trim())) {
      return;
    }

    setFallbackLoading(true);
    axiosClient
      .get('/user')
      .then((res) => {
        const u = res.data;
        if (u) {
          setFallbackUser({
            name: u?.wmaster?.bname || u?.name || u?.email,
            acctno: u?.acctno,
            created_at: u?.created_at,
          });
        }
      })
      .catch(() => {
        /* swallow */
      })
      .finally(() => setFallbackLoading(false));
  }, [name, bname]);

  const canSubmit = (needsPRC ? prcFront && prcBack : true) && (needsPayslip ? payslipFile : true);

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setProcessing(true);

    const fd = new FormData();
    if (needsPRC) {
      if (prcFront) fd.append('prc_id_photo_front', prcFront);
      if (prcBack) fd.append('prc_id_photo_back', prcBack);
    }
    if (needsPayslip && payslipFile) {
      fd.append('payslip_photo_path', payslipFile);
    }

    try {
      await axiosClient.post('/client/register-resubmit', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // On success, assume back to pending review
      setCurrentStatus('pending');
      setCurrentReasons([]);
      setPrcFront(null);
      setPrcBack(null);
      setPayslipFile(null);
      setPayName(undefined);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { errors?: Record<string, string> } } };
      const respErrors = axiosError?.response?.data?.errors;
      if (respErrors) {
        setErrors(respErrors);
      } else {
        setErrors({ general: 'Resubmission failed. Please try again.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  const errorBorder = '#e14e4e';
  const errorBg = '#FFF8F8';

  const headlineFont = 'inherit';
  const welcomeFontSize = isMobile ? '14px' : '16px';
  const welcomeLetterSpacing = '0.05em';
  const nameFontSize = isMobile ? '1.125rem' : '1.125rem';
  const showFallbackSkeleton = fallbackLoading && !(bname?.trim() || name?.trim() || acctno);
  const showSubmittedSkeleton = fallbackLoading && !submitted_at;

  const getPrcStatusDisplay = () => {
    if (prcFront && prcBack) return 'Front & Back completed ✓';
    if (prcFront) return 'Front completed, back pending';
    if (prcBack) return 'Back completed, front pending';
    return 'Click to upload...';
  };

  return (
    <MinimalLayout>
      <Head title={currentStatus === 'pending' ? 'Registration Under Review' : 'Registration Rejected'} />
      <div className="h-screen w-full bg-gray-100 dark:bg-neutral-900 flex items-center justify-center px-2 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            ${isMobile ? "max-w-sm" : "max-w-xl"}
            ${isMobile ? "rounded-2xl" : "rounded-3xl"}
            border border-gray-200 bg-white text-center shadow-xl
            dark:border-neutral-700 dark:bg-neutral-800
            ${isMobile ? "py-4 px-3 max-h-screen overflow-y-auto mx-6" : "py-10 px-10"}
            ${isMobile ? "" : "h-fit max-h-[90vh] flex flex-col justify-center"}
          `}
        >
          {/* Greeting */}
          <div className={`text-center ${isMobile ? "mb-2" : "mb-4"}`}>
            <div className={`text-gray-600 dark:text-gray-400 font-medium ${isMobile ? "text-sm" : "text-base"}`}>
              Welcome
            </div>
            <div className={`font-extrabold text-gray-900 dark:text-neutral-100 ${isMobile ? "text-lg mt-1" : "text-2xl mt-3"}`}>
              {showFallbackSkeleton ? (
                <Skeleton variant="text" width={isMobile ? 120 : 200} height={isMobile ? 24 : 32} className="mx-auto" />
              ) : (
                displayName
              )}
            </div>
          </div>

          {/* Main status content */}
          <div className={`text-center ${isMobile ? "mb-4" : "mb-6"}`}>
            <div
              className={`mx-auto ${isMobile ? "mb-3 h-16 w-16" : "mb-4 h-24 w-24"} flex items-center justify-center rounded-full ${
                currentStatus === 'pending'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}
            >
              <span className={`${isMobile ? "text-3xl" : "text-5xl"}`}>{currentStatus === 'pending' ? '⏳' : '❌'}</span>
            </div>
            <h2 className={`${isMobile ? "text-lg mb-1" : "mb-2 text-2xl"} font-bold text-gray-900 dark:text-neutral-100`}>
              {currentStatus === 'pending' ? 'Under Review' : 'Registration Rejected'}
            </h2>
            <p className={`${isMobile ? "text-sm" : "text-base"} text-gray-600 dark:text-neutral-400`}>
              {currentStatus === 'pending'
                ? 'Your registration is currently being reviewed by our team.'
                : 'Unfortunately, your registration could not be approved at this time.'}
            </p>
          </div>

          {/* Status Info Box */}
          <div className={`rounded-xl border border-gray-200 bg-gray-50 ${isMobile ? "mb-4 p-3" : "mb-6 p-4"} dark:border-neutral-700 dark:bg-neutral-900`}>
            <div className={`${isMobile ? "mb-1" : "mb-2"} flex items-center justify-between`}>
              <span className={`${isMobile ? "text-xs" : "text-sm"} text-gray-600 dark:text-neutral-400`}>Submitted</span>
              <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-gray-900 dark:text-neutral-100`}>
                {showSubmittedSkeleton ? (
                  <Skeleton variant="text" width={90} height={16} />
                ) : (
                  formattedSubmittedAt || '--'
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${isMobile ? "text-xs" : "text-sm"} text-gray-600 dark:text-neutral-400`}>Status</span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 ${isMobile ? "text-xs" : "text-sm"} font-medium ${
                  currentStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {currentStatus === 'pending' ? 'Pending' : 'Rejected'}
              </span>
            </div>
            {reviewed_at && currentStatus === 'rejected' && (
              <div className={`${isMobile ? "mt-1" : "mt-2"} flex items-center justify-between`}>
                <span className={`${isMobile ? "text-xs" : "text-sm"} text-gray-600 dark:text-neutral-400`}>Reviewed on</span>
                <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-gray-900 dark:text-neutral-100`}>
                  {new Date(reviewed_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {reviewed_by && currentStatus === 'rejected' && (
              <div className={`${isMobile ? "mt-1" : "mt-2"} flex items-center justify-between`}>
                <span className={`${isMobile ? "text-xs" : "text-sm"} text-gray-600 dark:text-neutral-400`}>Reviewed by</span>
                <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-gray-900 dark:text-neutral-100`}>{reviewed_by}</span>
              </div>
            )}
          </div>

          {currentStatus === 'rejected' && currentReasons && currentReasons.length > 0 && (
            <div className={isMobile ? "mb-4" : "mb-6"}>
              <h3 className={`${isMobile ? "text-sm mb-2" : "mb-3 text-base"} text-left font-semibold text-gray-900 dark:text-neutral-100`}>Reasons for Rejection:</h3>
              <div className="rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-950/20 p-4 mb-4 flex flex-col gap-3">
                {currentReasons.map((reason) => (
                  <div
                    key={reason.code}
                    className="flex items-center text-red-700 dark:text-red-400 font-medium text-sm"
                  >
                    <span className="mr-2">•</span>
                    <span>{reason.label}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleResubmit}>
                {needsPRC && (
                  <PRCFileRow
                    valueFront={prcFront}
                    valueBack={prcBack}
                    onClick={() => setPrcWizardOpen(true)}
                    display={getPrcStatusDisplay()}
                  />
                )}
                {needsPayslip && (
                  <PayslipFileRow
                    value={payslipFile}
                    onClick={() => setPayslipWizardOpen(true)}
                    display={payName}
                  />
                )}
                {(errors.prc_id_photo_front || errors.prc_id_photo_back || errors.payslip_photo_path || errors.general) && (
                  <div className="mb-3 text-sm text-red-600 dark:text-red-400">
                    {errors.prc_id_photo_front || errors.prc_id_photo_back || errors.payslip_photo_path || errors.general}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!canSubmit || processing}
                  className={`w-full bg-red-600 hover:bg-red-700 text-white font-semibold ${isMobile ? "py-2 px-3 text-sm" : "py-3 px-4 text-base"} rounded-lg border-none cursor-pointer transition-opacity ${
                    canSubmit && !processing ? 'opacity-100 hover:opacity-90' : 'opacity-60 cursor-not-allowed'
                  } mt-4`}
                >
                  {processing ? 'Submitting...' : 'Register Again'}
                </button>
              </form>
              <PrcWizard
                open={prcWizardOpen}
                onCancel={() => setPrcWizardOpen(false)}
                onComplete={(front, back) => {
                  setPrcFront(front);
                  setPrcBack(back);
                  setPrcWizardOpen(false);
                }}
              />
              <PayslipWizard
                open={payslipWizardOpen}
                onCancel={() => setPayslipWizardOpen(false)}
                onComplete={(file) => {
                  setPayslipFile(file);
                  setPayName(file?.name);
                  setPayslipWizardOpen(false);
                }}
              />
            </div>
          )}
          <p className={`${isMobile ? "text-xs px-1 mb-4" : "mb-6 text-sm"} text-gray-500 dark:text-neutral-500`}>
            {currentStatus === 'pending'
              ? "We'll notify you once your registration has been reviewed. This typically takes 1-2 business days."
              : 'Please address the issues above and submit a new registration.'}
          </p>
        </motion.div>
      </div>
    </MinimalLayout>
  );
}


