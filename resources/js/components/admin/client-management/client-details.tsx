import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';
import type { UserEntry } from '@/types/user';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import BoxHeader from '@/components/box-header';

type Props = {
    client?: UserEntry;
    onSave?: (updates: Partial<UserEntry>) => Promise<void>;
    isLoading?: boolean;
};

const ClientDetails: React.FC<Props> = ({ client, onSave, isLoading = false }) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');

    const [editMode, setEditMode] = useState(false);
    const [localData, setLocalData] = useState<Partial<UserEntry>>(client ?? {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalData(client ?? {});
    }, [client]);

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(localData);
            setEditMode(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setLocalData(client ?? {});
        setEditMode(false);
    };

    if (isLoading || !client) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    borderRadius: '24px',
                    backgroundColor: tw.isDark ? '#171717' : '#FFFFFF',
                    padding: '32px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.6)',
                }}
            >
                Loading...
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
            }}
        >
            <div
                style={{
                    borderRadius: '24px',
                    backgroundColor: tw.isDark ? '#171717' : '#FFFFFF',
                    padding: 0,
                }}
            >
                <BoxHeader title="Client Details" />

                <div style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#3b82f6',
                                    fontWeight: 700,
                                    fontSize: '24px',
                                }}
                            >
                                {(client.full_name?.[0] ?? 'U').toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
                                    {client.full_name ?? 'Unknown'}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                                    {client.status === 'active' ? '✓ Active' : '✗ Inactive'}
                                </div>
                            </div>
                        </div>

                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#3b82f6',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                            >
                                <EditIcon style={{ fontSize: '1rem' }} />
                                Edit
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#10b981',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        opacity: isSaving ? 0.6 : 1,
                                    }}
                                    onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#059669')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
                                >
                                    <SaveIcon style={{ fontSize: '1rem' }} />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#ef4444',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        opacity: isSaving ? 0.6 : 1,
                                    }}
                                    onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#dc2626')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
                                >
                                    <CancelIcon style={{ fontSize: '1rem' }} />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                                Full Name
                            </label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={localData.full_name ?? ''}
                                    onChange={(e) => setLocalData({ ...localData, full_name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        marginTop: '6px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        color: '#ffffff',
                                        fontSize: '0.875rem',
                                    }}
                                />
                            ) : (
                                <div style={{ marginTop: '6px', fontSize: '0.875rem', color: '#ffffff', fontWeight: 600 }}>
                                    {client.full_name ?? 'N/A'}
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                                Email
                            </label>
                            {editMode ? (
                                <input
                                    type="email"
                                    value={localData.email ?? ''}
                                    onChange={(e) => setLocalData({ ...localData, email: e.target.value })}
                                    style={{
                                        width: '100%',
                                        marginTop: '6px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        color: '#ffffff',
                                        fontSize: '0.875rem',
                                    }}
                                />
                            ) : (
                                <div style={{ marginTop: '6px', fontSize: '0.875rem', color: '#ffffff', fontWeight: 600 }}>
                                    {client.email ?? 'N/A'}
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                                Phone
                            </label>
                            {editMode ? (
                                <input
                                    type="tel"
                                    value={localData.phone ?? ''}
                                    onChange={(e) => setLocalData({ ...localData, phone: e.target.value })}
                                    style={{
                                        width: '100%',
                                        marginTop: '6px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        color: '#ffffff',
                                        fontSize: '0.875rem',
                                    }}
                                />
                            ) : (
                                <div style={{ marginTop: '6px', fontSize: '0.875rem', color: '#ffffff', fontWeight: 600 }}>
                                    {client.phone ?? 'N/A'}
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                                Status
                            </label>
                            {editMode ? (
                                <select
                                    value={localData.status ?? 'active'}
                                    onChange={(e) => setLocalData({ ...localData, status: e.target.value as any })}
                                    style={{
                                        width: '100%',
                                        marginTop: '6px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        color: '#ffffff',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            ) : (
                                <div style={{ marginTop: '6px', fontSize: '0.875rem', color: '#ffffff', fontWeight: 600 }}>
                                    {client.status === 'active' ? 'Active' : 'Inactive'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ClientDetails;
