import React, { useState, useMemo, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';
import type { UserEntry } from '@/types/user';
import { AnimatePresence, motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BoxHeader from '@/components/box-header';

type Props = {
    clients: UserEntry[];
    onEdit?: (client: UserEntry) => void;
    onDelete?: (client: UserEntry) => void;
    fullHeight?: boolean;
};

const ClientList: React.FC<Props> = ({
    clients,
    onEdit,
    onDelete,
    fullHeight = false,
}) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const pageSize = 10;

    const [tabIndex, setTabIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');

    const tabs = [
        { label: 'All', condition: () => true },
        { label: 'Active', condition: (c: UserEntry) => c.status === 'active' },
        { label: 'Inactive', condition: (c: UserEntry) => c.status !== 'active' },
    ];

    const currentTab = tabs[tabIndex] ?? { label: 'All', condition: () => true };
    const filtered = useMemo(
        () =>
            clients.filter(
                (c) =>
                    currentTab.condition(c) &&
                    (searchValue === '' || c.full_name?.toLowerCase().includes(searchValue.toLowerCase())),
            ),
        [clients, currentTab, searchValue],
    );

    const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
    const clampedPage = Math.min(page, totalPages);
    const start = (clampedPage - 1) * pageSize;
    const paginated = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

    useEffect(() => {
        if (page !== clampedPage) {
            setPage(clampedPage);
        }
    }, [clampedPage, page]);

    useEffect(() => {
        setPage(1);
    }, [searchValue, tabIndex]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '11px' : '16px',
                paddingBottom: '24px',
                ...(fullHeight && {
                    flex: 1,
                    minHeight: '100%',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start',
                }),
            }}
        >
            <div
                style={{
                    borderRadius: '24px',
                    backgroundColor: tw.isDark ? '#171717' : '#FAFAFA',
                    padding: 0,
                    flex: fullHeight ? 1 : 'unset',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '12px' : '16px',
                }}
            >
                <BoxHeader title="Clients" />

                <div style={{ paddingLeft: '16px', paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                        {tabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setTabIndex(idx)}
                                style={{
                                    flex: 1,
                                    padding: '12px 8px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderBottom: tabIndex === idx ? '2px solid #3b82f6' : 'none',
                                    color: tabIndex === idx ? '#3b82f6' : 'rgba(255,255,255,0.6)',
                                    fontWeight: tabIndex === idx ? 700 : 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 120ms ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (tabIndex !== idx) {
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (tabIndex !== idx) {
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                                    }
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <input
                        type="text"
                        placeholder="Search clients"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            color: '#ffffff',
                            fontSize: '0.875rem',
                        }}
                    />
                </div>

                {paginated.length === 0 ? (
                    <div
                        style={{
                            border: `1px dashed ${tw.isDark ? '#3a3a3a' : '#e5e5e5'}`,
                            borderRadius: '8px',
                            padding: isMobile ? '20px' : '32px',
                            minHeight: fullHeight ? '100%' : isMobile ? '200px' : '300px',
                            height: fullHeight ? '100%' : 'auto',
                            flexGrow: fullHeight ? 1 : 0,
                            width: '100%',
                            margin: '0 auto',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.6)',
                            marginLeft: '16px',
                            marginRight: '16px',
                        }}
                    >
                        <div style={{ fontWeight: 800, fontSize: isMobile ? '1rem' : '1.125rem' }}>
                            No clients found
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            flex: fullHeight ? 1 : 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            paddingLeft: '16px',
                            paddingRight: '16px',
                        }}
                    >
                        <AnimatePresence initial={false}>
                            {paginated.map((client, idx) => (
                                <motion.div
                                    key={client.user_id}
                                    initial={{ opacity: 0, y: -16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 20, mass: 0.6 }}
                                    style={{
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: tw.isDark ? '#262626' : '#FFFFFF',
                                        transition: 'all 120ms ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = tw.isDark ? '#2f2f2f' : '#F5F5F5';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = tw.isDark ? '#262626' : '#FFFFFF';
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                color: '#3b82f6',
                                                fontWeight: 700,
                                            }}
                                        >
                                            {(client.full_name?.[0] ?? 'U').toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {client.full_name ?? 'Unknown'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {client.email ?? 'No email'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            onClick={() => onEdit?.(client)}
                                            style={{
                                                padding: '6px 10px',
                                                backgroundColor: '#3b82f6',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                                        >
                                            <EditIcon style={{ fontSize: '1rem' }} />
                                        </button>
                                        <button
                                            onClick={() => onDelete?.(client)}
                                            style={{
                                                padding: '6px 10px',
                                                backgroundColor: '#ef4444',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                                        >
                                            <DeleteIcon style={{ fontSize: '1rem' }} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {filtered.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '16px' }}>
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={clampedPage <= 1}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                                backgroundColor: tw.isDark ? '#2f2f2f' : 'rgba(0,0,0,0.04)',
                                color: 'rgba(255,255,255,0.7)',
                                fontWeight: 700,
                                opacity: clampedPage <= 1 ? 0.6 : 1,
                                fontSize: '0.875rem',
                                cursor: clampedPage <= 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Prev
                        </button>
                        <div
                            style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                                backgroundColor: tw.isDark ? '#2f2f2f' : 'rgba(0,0,0,0.04)',
                                color: 'rgba(255,255,255,0.7)',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                            }}
                        >
                            {clampedPage} / {totalPages}
                        </div>
                        <button
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={clampedPage >= totalPages}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                                backgroundColor: tw.isDark ? '#2f2f2f' : 'rgba(0,0,0,0.04)',
                                color: 'rgba(255,255,255,0.7)',
                                fontWeight: 700,
                                opacity: clampedPage >= totalPages ? 0.6 : 1,
                                fontSize: '0.875rem',
                                cursor: clampedPage >= totalPages ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientList;
