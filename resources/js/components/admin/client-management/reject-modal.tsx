import axiosClient, { getCsrfCookie } from '@/api/axios-client';
import React, { useEffect, useMemo, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { RejectionReasonEntry } from '@/types/user';
import { useMyTheme } from '@/hooks/use-mytheme';

type Props = {
    open: boolean;
    reasons: RejectionReasonEntry[];
    selected?: string[];
    onClose: () => void;
    onSubmit: (codes: string[]) => void;
    clientName?: string;
};

const RejectModal: React.FC<Props> = ({ open, reasons, selected = [], onClose, onSubmit, clientName }) => {
    const [fallbackReasons, setFallbackReasons] = useState<RejectionReasonEntry[]>([]);
    const [loadingReasons, setLoadingReasons] = useState(false);
    const [localSelected, setLocalSelected] = useState<string[]>(selected ?? []);
    const tw = useMyTheme();

    const brand = tw.colors.red;
    const brandHover = tw.colors.redLight;
    const surface = tw.isDark ? 'rgba(17,17,20,0.96)' : 'rgba(255,255,255,0.98)';
    const surfaceMuted = tw.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)';
    const borderColor = tw.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)';
    const borderSoft = tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
    const textPrimary = tw.isDark ? '#e5e7eb' : '#0f172a';
    const textSecondary = tw.isDark ? 'rgba(226,232,240,0.78)' : 'rgba(55,65,81,0.82)';
    const backdrop = tw.isDark ? 'rgba(0,0,0,0.65)' : 'rgba(15,23,42,0.42)';
    const listBackground = tw.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)';
    const skeletonShade = tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)';

    const normalizeReasons = (body: unknown): RejectionReasonEntry[] => {
        if (Array.isArray(body)) return body as RejectionReasonEntry[];
        if (body && typeof body === 'object') {
            const maybeObj = body as { data?: unknown; reasons?: unknown };
            if (Array.isArray(maybeObj.reasons)) return maybeObj.reasons as RejectionReasonEntry[];
            if (maybeObj.data) {
                const data = maybeObj.data as { data?: unknown } | unknown[];
                if (Array.isArray(data)) return data as RejectionReasonEntry[];
                if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
                    return (data as { data: RejectionReasonEntry[] }).data;
                }
            }
        }
        return [];
    };

    useEffect(() => {
        if (!open) return;
        // Always fetch to ensure we have fresh reasons
        setLoadingReasons(true);
        getCsrfCookie()
            .catch(() => null)
            .then(() =>
                axiosClient.get<
                    | RejectionReasonEntry[]
                    | { data: RejectionReasonEntry[] }
                    | { data: { data: RejectionReasonEntry[] } }
                    | { reasons: RejectionReasonEntry[] }
                >('/rejection-reasons'),
            )
            .then((response) => {
                const normalized = normalizeReasons(response.data);
                setFallbackReasons(normalized);
            })
            .catch(() => {
                /* Ignore API errors, use provided reasons */
            })
            .finally(() => setLoadingReasons(false));
    }, [open]);

    useEffect(() => {
        setLocalSelected(selected ?? []);
    }, [selected, open]);

    const safeReasons = useMemo(() => {
        const merged = [...reasons];
        for (const fr of fallbackReasons) {
            if (!merged.some((r) => r.code === fr.code && r.label === fr.label)) {
                merged.push(fr);
            }
        }
        return merged;
    }, [reasons, fallbackReasons]);

    const toggle = (code: string) => {
        setLocalSelected((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
        );
    };

    const reasonCount = Math.max(safeReasons.length, 3);
    const listMinHeight = 32 + reasonCount * 48;

    if (!open) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: backdrop,
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
                padding: '20px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: surface,
                    backdropFilter: 'blur(18px)',
                    boxShadow: tw.isDark ? '0 32px 72px rgba(0,0,0,0.55)' : '0 32px 72px rgba(15,23,42,0.16)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '20px',
                    maxWidth: '540px',
                    width: '100%',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    textAlign: 'center',
                    fontWeight: 900,
                    letterSpacing: 0.4,
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    borderBottom: `1px solid ${borderSoft}`,
                    fontSize: '1.125rem',
                    color: textPrimary,
                }}>
                    Reject Client
                </div>

                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    borderBottom: `1px solid ${borderSoft}`,
                }}>
                    <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        color: textPrimary,
                    }}>
                        Select rejection reasons for {clientName ?? 'this client'}.
                    </p>
                    <p style={{
                        margin: '0 0 24px 0',
                        fontSize: '0.875rem',
                        textAlign: 'center',
                        color: textSecondary,
                    }}>
                        You can choose more than one reason.
                    </p>

                    {loadingReasons ? (
                        <div style={{
                            padding: '8px',
                            borderRadius: '12px',
                            backgroundColor: listBackground,
                            border: `1px solid ${borderSoft}`,
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '6px',
                            minHeight: `${listMinHeight}px`,
                        }}>
                            {[...Array(reasonCount)].map((_, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    paddingLeft: '10px',
                                    paddingRight: '10px',
                                    paddingTop: '8px',
                                    paddingBottom: '8px',
                                    borderRadius: '8px',
                                    border: `1px solid ${borderSoft}`,
                                    backgroundColor: surfaceMuted,
                                }}>
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '4px',
                                        backgroundColor: skeletonShade,
                                    }} />
                                    <div style={{
                                        width: '72%',
                                        height: '18px',
                                        borderRadius: '4px',
                                        backgroundColor: skeletonShade,
                                    }} />
                                </div>
                            ))}
                        </div>
                    ) : safeReasons.length === 0 ? (
                        <p style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            color: textSecondary,
                        }}>
                            No rejection reasons configured.
                        </p>
                    ) : (
                        <div style={{
                            padding: '8px',
                            borderRadius: '12px',
                            backgroundColor: listBackground,
                            border: `1px solid ${borderSoft}`,
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '6px',
                            minHeight: `${listMinHeight}px`,
                        }}>
                            {safeReasons.map((reason) => {
                                const key = reason.code ?? String(reason.id ?? reason.label ?? Math.random());
                                const label = reason.label ?? reason.code ?? 'Reason';
                                const code = reason.code ?? String(reason.id ?? label);
                                const selectedReason = localSelected.includes(code);

                                return (
                                    <div
                                        key={key}
                                        style={{
                                            paddingLeft: '10px',
                                            paddingRight: '10px',
                                            paddingTop: '8px',
                                            paddingBottom: '8px',
                                            borderRadius: '8px',
                                            border: selectedReason ? `1px solid ${brand}` : `1px solid ${borderColor}`,
                                            backgroundColor: selectedReason
                                                ? tw.isDark
                                                    ? 'rgba(225,78,78,0.16)'
                                                    : 'rgba(225,78,78,0.1)'
                                                : surfaceMuted,
                                            transition: 'all 140ms ease',
                                            cursor: 'pointer',
                                            boxShadow: selectedReason ? '0 12px 30px rgba(225,78,78,0.18)' : 'none',
                                        }}
                                        onClick={() => toggle(code)}
                                        className="hover:border-[#e14e4e] hover:bg-[#e14e4e]/8"
                                    >
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            margin: 0,
                                            width: '100%',
                                            cursor: 'pointer',
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedReason}
                                                onChange={() => toggle(code)}
                                                style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    cursor: 'pointer',
                                                    accentColor: brand,
                                                }}
                                            />
                                            <span style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 700,
                                                color: textPrimary,
                                            }}>
                                                {label}
                                            </span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    gap: '8px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '8px 16px',
                            borderRadius: '999px',
                            border: `1px solid ${borderColor}`,
                            backgroundColor: tw.isDark ? 'rgba(255,255,255,0.04)' : '#f4f4f5',
                            color: textPrimary,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '0.875rem',
                            transition: 'all 120ms ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = tw.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.2)';
                            e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = borderColor;
                            e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(255,255,255,0.04)' : '#f4f4f5';
                        }}
                    >
                        <X size={20} />
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSubmit(localSelected);
                            onClose();
                        }}
                        style={{
                            flex: 1,
                            padding: '8px 16px',
                            borderRadius: '999px',
                            border: 'none',
                            backgroundColor: brand,
                            color: '#ffffff',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '0.875rem',
                            boxShadow: '0 12px 28px rgba(225,78,78,0.32)',
                            transition: 'all 120ms ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = brandHover;
                            e.currentTarget.style.boxShadow = '0 16px 32px rgba(225,78,78,0.42)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = brand;
                            e.currentTarget.style.boxShadow = '0 12px 28px rgba(225,78,78,0.32)';
                        }}
                    >
                        <AlertCircle size={20} />
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectModal;
