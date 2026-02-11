import React, { useState, useMemo, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';
import type { Client, RegistrationStatus } from '@/types/user';
import { AnimatePresence, motion } from 'framer-motion';
import BoxHeader from '@/components/box-header';
import { ClientListSkeleton } from './skeletons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type Props = {
    clients: Client[];
    loading?: boolean;
    onSelect?: (userId: number) => void;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchOptions?: string[];
    fullHeight?: boolean;
    enableStatusTabs?: boolean;
    statusTab?: RegistrationStatus;
    onStatusTabChange?: (value: RegistrationStatus) => void;
    selectedId?: number | null;
};

const ClientList: React.FC<Props> = ({
    clients,
    loading = false,
    onSelect,
    searchValue = '',
    fullHeight = false,
    enableStatusTabs = false,
    statusTab = 'pending',
    onStatusTabChange,
    selectedId = null,
}) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const pageSize = 10;

    const [page, setPage] = useState(1);
    const [localSearchValue, setLocalSearchValue] = useState(searchValue);

    const tabs: Array<{ label: string; value: RegistrationStatus }> = [
        { label: 'Registered', value: 'approved' },
        { label: 'Pending', value: 'pending' },
        { label: 'Rejected', value: 'rejected' },
    ];

    const currentTabValue = enableStatusTabs ? statusTab : 'approved';
    
    const filtered = useMemo(
        () =>
            clients.filter((c) => {
                const matchesStatus = !enableStatusTabs || c.status === currentTabValue;
                const searchTerm = (localSearchValue || searchValue).toLowerCase();
                if (!searchTerm) return matchesStatus;
                return (
                    matchesStatus &&
                    (c.name?.toLowerCase().includes(searchTerm) ||
                        c.email?.toLowerCase().includes(searchTerm) ||
                        c.acctno?.toLowerCase().includes(searchTerm))
                );
            }),
        [clients, currentTabValue, enableStatusTabs, localSearchValue, searchValue],
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
    }, [localSearchValue, searchValue, currentTabValue]);

    const handleTabChange = (value: string) => {
        if (enableStatusTabs && onStatusTabChange) {
            onStatusTabChange(value as RegistrationStatus);
        }
    };

    const handleSearchChange = (value: string) => {
        setLocalSearchValue(value);
    };

    const resolveImagePath = (path?: string | null): string | null => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/storage')) return path;
        return `/storage/${path.replace(/^\/+/, '')}`;
    };

    const getProfileImage = (client: Client): string | null => {
        return resolveImagePath(client.profile_picture_url ?? client.profile_picture_path);
    };

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
                    backgroundColor: tw.isDark ? '#171717' : '#FFFFFF',
                    padding: 0,
                    flex: fullHeight ? 1 : 'unset',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '12px' : '16px',
                }}
            >
                <div style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px' }}>
                    <BoxHeader title="Clients" />
                </div>

                {enableStatusTabs ? (
                    <Tabs value={currentTabValue} onValueChange={handleTabChange} style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                        <TabsList 
                            className="w-full bg-transparent p-0 h-auto rounded-none"
                            style={{ 
                                backgroundColor: 'transparent',
                                padding: 0,
                                height: 'auto',
                                borderRadius: 0,
                                borderBottom: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                display: 'flex',
                                gap: '8px',
                            }}
                        >
                            {tabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent"
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '0px',
                                        padding: '12px 8px',
                                        fontSize: '0.875rem',
                                        fontWeight: currentTabValue === tab.value ? 700 : 600,
                                        color: currentTabValue === tab.value ? '#3b82f6' : tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                        borderBottom: currentTabValue === tab.value ? '2px solid #3b82f6' : 'none',
                                        transition: 'all 120ms ease',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {tabs.map((tab) => (
                            <TabsContent key={tab.value} value={tab.value} style={{ marginTop: '12px', padding: '0 16px' }}>
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search clients"
                                        value={localSearchValue || searchValue}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>

                                <ClientListContent 
                                    loading={loading}
                                    paginated={paginated}
                                    filtered={filtered}
                                    clampedPage={clampedPage}
                                    totalPages={totalPages}
                                    setPage={setPage}
                                    fullHeight={fullHeight}
                                    isMobile={isMobile}
                                    tw={tw}
                                    onSelect={onSelect}
                                    getProfileImage={getProfileImage}
                                    selectedId={selectedId}
                                />
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search clients"
                                value={localSearchValue || searchValue}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <ClientListContent 
                            loading={loading}
                            paginated={paginated}
                            filtered={filtered}
                            clampedPage={clampedPage}
                            totalPages={totalPages}
                            setPage={setPage}
                            fullHeight={fullHeight}
                            isMobile={isMobile}
                            tw={tw}
                            onSelect={onSelect}
                            getProfileImage={getProfileImage}
                            selectedId={selectedId}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

interface ClientListContentProps {
    loading: boolean;
    paginated: Client[];
    filtered: Client[];
    getProfileImage: (client: Client) => string | null;
    clampedPage: number;
    totalPages: number;
    setPage: (page: number | ((p: number) => number)) => void;
    fullHeight: boolean;
    isMobile: boolean;
    tw: { isDark: boolean };
    onSelect?: (userId: number) => void;
    selectedId?: number | null;
}

const ClientListContent: React.FC<ClientListContentProps> = ({
    loading,
    paginated,
    filtered,
    clampedPage,
    totalPages,
    setPage,
    fullHeight,
    isMobile,
    tw,
    onSelect,
    getProfileImage,
    selectedId = null,
}) => {
    return (
        <>
            {loading ? (
                <ClientListSkeleton fullHeight={fullHeight} itemCount={10} showTabs={false} showSearch={false} />
            ) : paginated.length === 0 ? (
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
                        color: tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
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
                    }}
                >
                    <AnimatePresence initial={false}>
                        {paginated.map((client) => (
                            <motion.div
                                key={client.user_id}
                                initial={{ opacity: 0, y: -16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ type: 'spring', stiffness: 220, damping: 20, mass: 0.6 }}
                                onClick={() => onSelect?.(client.user_id)}
                                style={{
                                    borderRadius: '8px',
                                    border: selectedId === client.user_id ? '2px solid #3b82f6' : `1px solid ${tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                    padding: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: selectedId === client.user_id 
                                        ? tw.isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'
                                        : tw.isDark ? '#262626' : '#F5F5F5',
                                    transition: 'all 120ms ease',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedId !== client.user_id) {
                                        e.currentTarget.style.backgroundColor = tw.isDark ? '#2f2f2f' : '#E5E5E5';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedId !== client.user_id) {
                                        e.currentTarget.style.backgroundColor = tw.isDark ? '#262626' : '#F5F5F5';
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#3b82f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            overflow: 'hidden',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundImage: getProfileImage(client) ? `url('${getProfileImage(client)}')` : 'none',
                                        }}
                                    >
                                        {!getProfileImage(client) && (client.name?.[0] ?? 'U').toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: tw.isDark ? '#ffffff' : '#000000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {client.name ?? 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {client.email ?? 'No email'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {filtered.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', paddingTop: '16px' }}>
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={clampedPage <= 1}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                            backgroundColor: tw.isDark ? '#2f2f2f' : 'rgba(0,0,0,0.04)',
                            color: tw.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
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
                            color: tw.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
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
                            color: tw.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
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
        </>
    );
};

export default ClientList;
