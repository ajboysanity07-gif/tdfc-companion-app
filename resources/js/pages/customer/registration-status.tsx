import PayslipFileRow from '@/components/payslip-filerow';
import PRCFileRow from '@/components/prc-filerow';
import PayslipWizard from '@/components/ui/payslip-wizard';
import PrcWizard from '@/components/ui/prc-wizard';
import MinimalLayout from '@/layouts/minimal-layout';
import { Head, useForm } from '@inertiajs/react';
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

  const getPrcStatusDisplay = () => {
    if (prcFront && prcBack) return 'Front & Back completed ✓';
    if (prcFront) return 'Front completed, back pending';
    if (prcBack) return 'Back completed, front pending';
    return 'Click to upload...';
  };

  return (
    <MinimalLayout>
      <Head title={status === 'pending' ? 'Registration Under Review' : 'Registration Rejected'} />
<div className="h-screen w-full bg-page flex items-center justify-center px-2 overflow-hidden">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mx-auto w-full border border-border bg-card px-4 py-6 text-center shadow-xl sm:flex sm:h-fit sm:max-h-[90vh] sm:max-w-xl sm:flex-col sm:justify-center sm:rounded-3xl sm:p-10"
  >
          {/* Greeting */}
          <div className="mb-4 text-center">
            <div className="text-base font-medium tracking-[0.00938em] text-muted-foreground">Welcome</div>
            <div className="mt-1.5 text-2xl font-extrabold text-foreground sm:text-xl">{name}</div>
          </div>

          {/* Main status content */}
          <div className="mb-6 text-center">
            <div
              className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full ${
                status === 'pending'
                  ? 'bg-yellow-soft'
                  : 'bg-red-soft'
              }`}
            >
              <span className="text-5xl">{status === 'pending' ? '⏳' : '❌'}</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              {status === 'pending' ? 'Under Review' : 'Registration Rejected'}
            </h2>
            <p className="text-muted-foreground">
              {status === 'pending'
                ? 'Your registration is currently being reviewed by our team.'
                : 'Unfortunately, your registration could not be approved at this time.'}
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-border bg-muted p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Submitted</span>
              <span className="text-sm font-medium text-foreground">
                {new Date(submitted_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  status === 'pending' ? 'bg-yellow-soft text-yellow-text' : 'bg-red-soft text-red-text'
                }`}
              >
                {status === 'pending' ? 'Pending' : 'Rejected'}
              </span>
            </div>
            {reviewed_at && status === 'rejected' && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reviewed on</span>
                <span className="text-sm font-medium text-foreground">
                  {new Date(reviewed_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {reviewed_by && status === 'rejected' && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reviewed by</span>
                <span className="text-sm font-medium text-foreground">{reviewed_by}</span>
              </div>
            )}
          </div>

          {status === 'rejected' && rejection_reasons && rejection_reasons.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-left font-semibold text-foreground">Reasons for Rejection:</h3>
              <div className="mb-[18px] flex flex-col gap-[9px] rounded-xl border-[1.5px] border-brand-red bg-red-soft px-1.5 py-3 text-left sm:rounded-2xl sm:px-3.5 sm:py-[17px] dark:border-brand-red/35">
                {rejection_reasons.map((reason) => (
                  <div key={reason.code} className="flex items-center text-sm font-medium text-red-text sm:text-[15px]">
                    <span className="mr-2 text-[1.1em]">•</span>
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
                  <div className="mb-2 text-sm text-destructive">
                    {errors.prc_id_photo_front || errors.prc_id_photo_back || errors.payslip_photo}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!canSubmit || processing}
                  className="mt-3.5 w-full cursor-pointer rounded-xl bg-brand-surface px-3 py-2.5 text-[15px] font-semibold text-on-brand-surface disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3"
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
          <p className="mb-6 px-2 text-sm text-muted-foreground sm:px-0">
            {status === 'pending'
              ? "We'll notify you once your registration has been reviewed. This typically takes 1-2 business days."
              : 'Please address the issues above and submit a new registration.'}
          </p>
        </motion.div>
      </div>
    </MinimalLayout>
  );
}
