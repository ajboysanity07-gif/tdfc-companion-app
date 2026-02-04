import axiosClient, { getCsrfCookie } from '@/api/axios-client';
import React, { useEffect, useMemo, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { RejectionReasonEntry } from '@/types/user';

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
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'rgba(18, 18, 20, 0.9)',
                    backdropFilter: 'blur(22px)',
                    boxShadow: '0 26px 70px rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.08)',
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
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '1.125rem',
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
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                    <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        textAlign: 'center',
                    }}>
                        Select rejection reasons for {clientName ?? 'this client'}.
                    </p>
                    <p style={{
                        margin: '0 0 24px 0',
                        fontSize: '0.875rem',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.7)',
                    }}>
                        You can choose more than one reason.
                    </p>

                    {loadingReasons ? (
                        <div style={{
                            padding: '8px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
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
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                }}>
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                    }} />
                                    <div style={{
                                        width: '72%',
                                        height: '18px',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                    }} />
                                </div>
                            ))}
                        </div>
                    ) : safeReasons.length === 0 ? (
                        <p style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                        }}>
                            No rejection reasons configured.
                        </p>
                    ) : (
                        <div style={{
                            padding: '8px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
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
                                            border: selectedReason ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.14)',
                                            backgroundColor: selectedReason ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.02)',
                                            transition: 'all 140ms ease',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => toggle(code)}
                                        onMouseEnter={(e) => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            el.style.borderColor = '#ef4444';
                                            el.style.backgroundColor = 'rgba(239,68,68,0.06)';
                                        }}
                                        onMouseLeave={(e) => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            el.style.borderColor = selectedReason ? '#ef4444' : 'rgba(255,255,255,0.14)';
                                            el.style.backgroundColor = selectedReason ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.02)';
                                        }}
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
                                                    accentColor: '#ef4444',
                                                }}
                                            />
                                            <span style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 700,
                                                color: '#ffffff',
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
                            border: '1px solid rgba(255,255,255,0.25)',
                            backgroundColor: 'transparent',
                            color: '#ffffff',
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
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                            e.currentTarget.style.backgroundColor = 'transparent';
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
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '0.875rem',
                            boxShadow: '0 10px 24px rgba(220,38,38,0.28)',
                            transition: 'all 120ms ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.boxShadow = '0 14px 32px rgba(220,38,38,0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.boxShadow = '0 10px 24px rgba(220,38,38,0.28)';
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
