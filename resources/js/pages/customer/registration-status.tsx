import PayslipFileRow from '@/components/payslip-filerow';
import PRCFileRow from '@/components/prc-filerow';
import PayslipWizard from '@/components/ui/payslip-wizard';
import PrcWizard from '@/components/ui/prc-wizard';
import MinimalLayout from '@/layouts/minimal-layout';
import { Head, useForm } from '@inertiajs/react';
import { alpha, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface Props {
  name: string;
  status: 'pending' | 'rejected';
  rejection_reasons?: { code: string; label: string }[];
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string | null;
}

export default function RegistrationStatus({
  name,
  status,
  rejection_reasons = [],
  submitted_at,
  reviewed_at,
  reviewed_by,
}: Props) {
  const theme = useTheme();
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

  const { post, processing, errors, setData } = useForm<{
    prc_id_photo_front: File | null;
    prc_id_photo_back: File | null;
    payslip_photo: File | null;
  }>({
    prc_id_photo_front: null,
    prc_id_photo_back: null,
    payslip_photo: null,
  });

  const canSubmit = (needsPRC ? prcFront && prcBack : true) && (needsPayslip ? payslipFile : true);

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setData('prc_id_photo_front', needsPRC ? prcFront : null);
    setData('prc_id_photo_back', needsPRC ? prcBack : null);
    setData('payslip_photo', needsPayslip ? payslipFile : null);
    post('/customer/register-resubmit', { forceFormData: true });
  };

  const errorBorder =
    theme.palette.mode === 'dark'
      ? `1.5px solid ${alpha(theme.palette.error.main, 0.34)}`
      : '1.5px solid #F57979';
  const errorBg =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.error.main, 0.08)
      : '#FFF8F8';

  const headlineFont = theme.typography.h4?.fontFamily ?? 'inherit';
  const welcomeFontSize = theme.typography.subtitle1?.fontSize ?? '16px';
  const welcomeLetterSpacing = theme.typography.subtitle1?.letterSpacing ?? '0.05em';
  const nameFontSize = isMobile
    ? (theme.typography.h5?.fontSize ?? '1.5rem')
    : (theme.typography.h6?.fontSize ?? '1.125rem');

  const getPrcStatusDisplay = () => {
    if (prcFront && prcBack) return 'Front & Back completed ✓';
    if (prcFront) return 'Front completed, back pending';
    if (prcBack) return 'Back completed, front pending';
    return 'Click to upload...';
  };

  return (
    <MinimalLayout>
      <Head title={status === 'pending' ? 'Registration Under Review' : 'Registration Rejected'} />
<div className="h-screen w-full bg-gray-100 dark:bg-neutral-900 flex items-center justify-center px-2 overflow-hidden">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`
      w-full max-h-50vh
      ${isMobile ? "" : "max-w-xl"}
      ${isMobile ? "" : "rounded-3xl"}
      border border-gray-200 bg-white text-center shadow-xl
      dark:border-neutral-700 dark:bg-neutral-800
      ${isMobile ? "py-6 px-4" : "py-10 px-10"}
   
      ${isMobile ? "" : "h-fit max-h-[90vh] flex flex-col justify-center"}
    `}
 
  >
          {/* Greeting */}
          <div className="mb-4 text-center">
            <div
              style={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: welcomeFontSize,
                letterSpacing: welcomeLetterSpacing,
                fontFamily: headlineFont,
              }}
            >
              Welcome
            </div>
            <div
              style={{
                color: theme.palette.text.primary,
                fontWeight: 800,
                fontSize: nameFontSize,
                fontFamily: headlineFont,
                marginTop: 6,
                display: 'block',
              }}
            >
              {name}
            </div>
          </div>

          {/* Main status content */}
          <div className="mb-6 text-center">
            <div
              className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full ${
                status === 'pending'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}
            >
              <span className="text-5xl">{status === 'pending' ? '⏳' : '❌'}</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {status === 'pending' ? 'Under Review' : 'Registration Rejected'}
            </h2>
            <p className="text-gray-600 dark:text-neutral-400">
              {status === 'pending'
                ? 'Your registration is currently being reviewed by our team.'
                : 'Unfortunately, your registration could not be approved at this time.'}
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-neutral-400">Submitted</span>
              <span className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                {new Date(submitted_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-neutral-400">Status</span>
              <span
                style={{
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 500,
                  background:
                    status === 'pending'
                      ? theme.palette.mode === 'dark'
                        ? alpha(theme.palette.warning.main, 0.15)
                        : '#FEF3C7'
                      : theme.palette.mode === 'dark'
                      ? alpha(theme.palette.error.main, 0.15)
                      : '#FEE2E2',
                  color:
                    status === 'pending'
                      ? theme.palette.mode === 'dark'
                        ? theme.palette.warning.light
                        : '#92400E'
                      : theme.palette.mode === 'dark'
                      ? theme.palette.error.light
                      : '#991B1B',
                }}
              >
                {status === 'pending' ? 'Pending' : 'Rejected'}
              </span>
            </div>
            {reviewed_at && status === 'rejected' && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400">Reviewed on</span>
                <span className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                  {new Date(reviewed_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {reviewed_by && status === 'rejected' && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400">Reviewed by</span>
                <span className="text-sm font-medium text-gray-900 dark:text-neutral-100">{reviewed_by}</span>
              </div>
            )}
          </div>

          {status === 'rejected' && rejection_reasons && rejection_reasons.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-left font-semibold text-gray-900 dark:text-neutral-100">Reasons for Rejection:</h3>
              <div
                style={{
                  border: errorBorder,
                  background: errorBg,
                  borderRadius: isMobile ? 12 : 16,
                  padding: isMobile ? '12px 6px' : '17px 14px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '9px',
                  marginBottom: '18px',
                }}
              >
                {rejection_reasons.map((reason) => (
                  <div
                    key={reason.code}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: theme.palette.error.main,
                      fontWeight: 500,
                      fontSize: isMobile ? '14px' : '15px',
                    }}
                  >
                    <span style={{ marginRight: 8, fontSize: '1.1em' }}>•</span>
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
                {(errors.prc_id_photo_front || errors.prc_id_photo_back || errors.payslip_photo) && (
                  <div className="mb-2 text-sm text-red-600">
                    {errors.prc_id_photo_front || errors.prc_id_photo_back || errors.payslip_photo}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!canSubmit || processing}
                  style={{
                    width: '100%',
                    background: theme.palette.error.main,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '15px',
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    opacity: canSubmit && !processing ? 1 : 0.6,
                    marginTop: '14px',
                  }}
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
          <p className={`mb-6 text-sm text-gray-500 dark:text-neutral-400 ${isMobile ? "px-2" : ""}`}>
            {status === 'pending'
              ? "We'll notify you once your registration has been reviewed. This typically takes 1-2 business days."
              : 'Please address the issues above and submit a new registration.'}
          </p>
        </motion.div>
      </div>
    </MinimalLayout>
  );
}
