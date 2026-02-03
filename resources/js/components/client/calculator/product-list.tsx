import { useMyTheme } from '@/hooks/use-mytheme';
import type { ProductLntype } from '@/types/product-lntype';
import { useMediaQuery } from '@/hooks/use-media-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductListSkeleton } from './skeletons';

type Props = {
    products: ProductLntype[];
    loading: boolean;
    error: string | null;
    selectedProduct: ProductLntype | null;
    onSelectProduct: (product: ProductLntype) => void;
};

export default function ProductList({ products, loading, error, selectedProduct, onSelectProduct }: Props) {
    const isMobile = useMediaQuery('(max-width:900px)');
    const tw = useMyTheme();
    const cardBg = tw.isDark ? '#2f2f2f' : '#f5f5f5';
    const cardBorder = tw.isDark ? '#3a3a3a' : '#d4d4d4';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading && <ProductListSkeleton />}
            
            {error && !loading && (
                <div style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{ marginBottom: 4, fontWeight: 600, color: '#ef5350' }}>
                        {error}
                    </div>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div
                    style={{
                        border: `1px dashed ${cardBorder}`,
                        borderRadius: 8,
                        padding: isMobile ? 10 : 16,
                        minHeight: isMobile ? 200 : 360,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        color: tw.isDark ? '#999' : '#666',
                        gap: isMobile ? 4 : 6,
                    }}
                >
                    <h6 style={{ fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: 800, margin: 0 }}>
                        No loan products available.
                    </h6>
                    <p style={{ fontSize: '0.875rem', color: tw.isDark ? '#999' : '#666', margin: 0 }}>
                        Please check back later.
                    </p>
                </div>
            )}

            {!loading && !error && products.length > 0 && (
                <div style={{ width: '100%' }}>
                    <AnimatePresence initial={false}>
                        {products.map((product) => {
                            const typeLabels = product.types?.map((t) => t.lntags || t.typecode) ?? [];
                            const isSelected = selectedProduct?.product_id === product.product_id;
                            
                            return (
                                <motion.div
                                    key={product.product_id}
                                    initial={{ opacity: 0, y: -16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 20, mass: 0.6 }}
                                >
                                    <button
                                        onClick={() => onSelectProduct(product)}
                                        style={{
                                            width: '100%',
                                            marginBottom: isMobile ? 8 : 10,
                                            borderRadius: isMobile ? 8 : 10,
                                            overflow: 'hidden',
                                            backgroundColor: isSelected 
                                                ? (tw.isDark ? '#3a3a3a' : '#e3f2fd')
                                                : cardBg,
                                            border: `2px solid ${isSelected 
                                                ? '#F57979' 
                                                : (tw.isDark ? '#3a3a3a' : '#d4d4d4')}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            padding: 0,
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = isSelected ? '#F57979' : (tw.isDark ? 'rgba(255,255,255,0.3)' : '#a3a3a3');
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = isSelected ? '#F57979' : (tw.isDark ? '#3a3a3a' : '#d4d4d4');
                                        }}
                                    >
                                        <div style={{ paddingX: isMobile ? 6 : 8, paddingY: isMobile ? 4 : 6, width: '100%', alignItems: 'center', textAlign: 'center' }}>
                                            <h6 style={{ fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: 800, margin: 0 }}>
                                                {product.product_name}
                                            </h6>
                                            <div style={{ display: 'flex', flexDirection: 'row', gap: isMobile ? 3 : 4, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', rowGap: isMobile ? 2 : 4, marginTop: 4 }}>
                                                <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, marginRight: 4 }}>
                                                    Tags:
                                                </span>
                                                {typeLabels.length ? (
                                                    typeLabels.map((label) => (
                                                        <span
                                                            key={label}
                                                            style={{
                                                                height: isMobile ? 20 : 22,
                                                                borderRadius: '999px',
                                                                backgroundColor: tw.isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                                                                color: tw.isDark ? '#999' : '#1e293b',
                                                                fontWeight: 600,
                                                                fontSize: isMobile ? 11 : 12,
                                                                padding: `4px ${isMobile ? 8 : 10}px`,
                                                                display: 'inline-block',
                                                            }}
                                                        >
                                                            {label}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span
                                                        style={{
                                                            height: isMobile ? 20 : 22,
                                                            borderRadius: '999px',
                                                            backgroundColor: tw.isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                                                            color: tw.isDark ? '#999' : '#1e293b',
                                                            fontSize: isMobile ? 11 : 12,
                                                            padding: `4px ${isMobile ? 8 : 10}px`,
                                                            display: 'inline-block',
                                                        }}
                                                    >
                                                        No tags
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
