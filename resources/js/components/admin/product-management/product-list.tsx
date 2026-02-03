import IOSSwitch from '@/components/ui/ios-switch';
import { useMyTheme } from '@/hooks/use-mytheme';
import type { ProductLntype } from '@/types/product-lntype';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';
import { useMediaQuery } from '@/hooks/use-media-query';
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCT_LIST_PAGE_SIZE } from './skeletons';
import BoxHeader from '@/components/box-header';

type Props = {
    products: ProductLntype[];
    onSelect?: (product_id: number) => void;
    onToggleActive?: (productId: number, value: boolean) => void;
    onAdd?: () => void;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchOptions?: string[];
    fullHeight?: boolean;
};

const ProductList: React.FC<Props> = ({
    products,
    onSelect,
    onToggleActive,
    searchValue = '',
    onSearchChange,
    searchOptions = [],
    fullHeight = false,
}) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const pageSize = PRODUCT_LIST_PAGE_SIZE;

    const list = products;
    const [page, setPage] = useState(1);
    const totalPages = Math.max(Math.ceil(list.length / pageSize), 1);
    const clampedPage = Math.min(page, totalPages);
    const start = (clampedPage - 1) * pageSize;
    const paginated = useMemo(() => list.slice(start, start + pageSize), [list, start, pageSize]);

    useEffect(() => {
        if (page !== clampedPage) {
            setPage(clampedPage);
        }
    }, [clampedPage, page]);

    useEffect(() => {
        setPage(1);
    }, [searchValue]);

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
                <BoxHeader title="Available Products" />

                <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                    <input
                        type="text"
                        placeholder="Search products"
                        value={searchValue}
                        onChange={(e) => {
                            onSearchChange?.(e.target.value);
                            setPage(1);
                        }}
                        list="product-search-options"
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
                    <datalist id="product-search-options">
                        {searchOptions.map((option) => (
                            <option key={option} value={option} />
                        ))}
                    </datalist>
                </div>

                {paginated.length === 0 ? (
                    <div
                        style={{
                            border: `1px dashed ${tw.isDark ? '#3a3a3a' : '#e5e5e5'}`,
                            borderRadius: '8px',
                            padding: isMobile ? '20px' : '32px',
                            minHeight: fullHeight ? '100%' : isMobile ? '75%' : '360px',
                            height: fullHeight ? '100%' : 'auto',
                            flexGrow: fullHeight ? 1 : 0,
                            width: '100%',
                            maxWidth: '100%',
                            margin: '0 auto',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.6)',
                            gap: isMobile ? '4px' : '6px',
                        }}
                    >
                        <div style={{ fontWeight: 800, fontSize: isMobile ? '1rem' : '1.25rem' }}>
                            No product available.
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
                            You can always add a new product.
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            flex: fullHeight ? 1 : 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: 0,
                            paddingLeft: '16px',
                            paddingRight: '16px',
                        }}
                    >
                        <AnimatePresence initial={false}>
                            {paginated.map((product) => {
                                const isOn = product.is_active ?? false;
                                const typeLabels = product.types
                                    ?.flatMap((t) => {
                                        if (t.lntags && t.lntags.trim()) {
                                            return t.lntags.split(',').map((tag) => tag.trim()).filter(Boolean);
                                        }
                                        return t.typecode ? [t.typecode] : [];
                                    })
                                    .filter(Boolean) ?? [];

                                return (
                                    <motion.div
                                        key={product.product_id}
                                        initial={{ opacity: 0, y: -16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -16 }}
                                        transition={{ type: 'spring', stiffness: 220, damping: 20, mass: 0.6 }}
                                        style={{
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            padding: '16px',
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
                                        <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'center' }}>
                                            <IOSSwitch
                                                checked={isOn}
                                                onChange={(e) => onToggleActive?.(product.product_id, e.target ? (e.target as HTMLInputElement).checked : e)}
                                            />

                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: 700 }}>
                                                    {product.product_name}
                                                </div>
                                                {typeLabels.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', rowGap: '3px', marginTop: '4px' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, marginRight: '4px', color: 'rgba(255,255,255,0.6)' }}>
                                                            Tags:
                                                        </span>
                                                        {typeLabels.slice(0, 3).map((label) => (
                                                            <span
                                                                key={label}
                                                                style={{
                                                                    height: '18px',
                                                                    borderRadius: '999px',
                                                                    backgroundColor: tw.isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                                                                    color: tw.isDark ? 'rgba(255,255,255,0.7)' : '#475569',
                                                                    fontWeight: 600,
                                                                    paddingLeft: '8px',
                                                                    paddingRight: '8px',
                                                                    fontSize: '11px',
                                                                }}
                                                            >
                                                                {label}
                                                            </span>
                                                        ))}
                                                        {typeLabels.length > 3 && (
                                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                                                                +{typeLabels.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onSelect?.(product.product_id)}
                                            style={{
                                                width: isMobile ? '40px' : '44px',
                                                height: isMobile ? '40px' : '44px',
                                                borderRadius: '50%',
                                                border: '1px solid rgba(245,121,121,0.4)',
                                                backgroundColor: 'rgba(245,121,121,0.15)',
                                                color: '#f57979',
                                                transition: 'all 120ms ease',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(245,121,121,0.2)',
                                                flexShrink: 0,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                                e.currentTarget.style.backgroundColor = 'rgba(245,121,121,0.25)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.backgroundColor = 'rgba(245,121,121,0.15)';
                                            }}
                                        >
                                            <ArrowForwardIosIcon style={{ fontSize: '18px' }} />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {list.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '16px' }}>
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={clampedPage <= 1}
                            style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '8px',
                                paddingBottom: '8px',
                                borderRadius: '6px',
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                                backgroundColor: clampedPage <= 1 ? 'rgba(255,255,255,0.08)' : (tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
                                color: clampedPage <= 1 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
                                fontWeight: 700,
                                cursor: clampedPage <= 1 ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem',
                                transition: 'all 120ms ease',
                            }}
                            onMouseEnter={(e) => !e.disabled && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = clampedPage <= 1 ? 'rgba(255,255,255,0.08)' : (tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'))}
                        >
                            Prev
                        </button>
                        <div
                            style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '8px',
                                paddingBottom: '8px',
                                borderRadius: '6px',
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                                backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                color: 'rgba(255,255,255,0.8)',
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
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '8px',
                                paddingBottom: '8px',
                                borderRadius: '6px',
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                                backgroundColor: clampedPage >= totalPages ? 'rgba(255,255,255,0.08)' : (tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
                                color: clampedPage >= totalPages ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
                                fontWeight: 700,
                                cursor: clampedPage >= totalPages ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem',
                                transition: 'all 120ms ease',
                            }}
                            onMouseEnter={(e) => !e.disabled && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = clampedPage >= totalPages ? 'rgba(255,255,255,0.08)' : (tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'))}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
