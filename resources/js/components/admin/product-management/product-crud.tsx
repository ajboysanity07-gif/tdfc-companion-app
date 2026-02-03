import React, { useState, useEffect, useMemo } from 'react';
import { useMyTheme } from '@/hooks/use-mytheme';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { WlnProducts, WlnType } from '@/types/db';
import type { Product } from '@/types/request';
import { AnimatePresence, motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import BoxHeader from '@/components/box-header';

type Props = {
    product?: WlnProducts;
    types: WlnType[];
    onSave?: (product: Product) => Promise<void>;
    onClose?: () => void;
};

const ProductCRUD: React.FC<Props> = ({
    product,
    types = [],
    onSave,
    onClose,
}) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');

    const [formData, setFormData] = useState<Partial<Product>>({
        product_name: '',
        product_code: '',
        wln_type_id: undefined,
        is_active: 1,
        min_loan: 0,
        max_loan: 100000,
        interest_rate: 0,
        processing_fee: 0,
        insurance_rate: 0,
        ...(product && {
            product_name: product.product_name,
            product_code: product.product_code,
            wln_type_id: product.wln_type_id,
            is_active: product.is_active,
            min_loan: product.min_loan,
            max_loan: product.max_loan,
            interest_rate: product.interest_rate,
            processing_fee: product.processing_fee,
            insurance_rate: product.insurance_rate,
        }),
    });

    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSave = async () => {
        if (!onSave) return;

        const newErrors: Record<string, string> = {};
        if (!formData.product_name) newErrors.product_name = 'Product name is required';
        if (!formData.product_code) newErrors.product_code = 'Product code is required';
        if (!formData.wln_type_id) newErrors.wln_type_id = 'Product type is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSaving(true);
        try {
            await onSave({
                ...formData,
                product_name: formData.product_name || '',
                product_code: formData.product_code || '',
                wln_type_id: formData.wln_type_id || 0,
            } as Product);
            onClose?.();
        } catch (error) {
            console.error('Failed to save product', error);
        } finally {
            setIsSaving(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#ffffff',
        fontSize: '0.875rem',
        fontFamily: 'inherit',
        transition: 'all 120ms ease',
    };

    const labelStyle = {
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: '6px',
        display: 'block',
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{
                    borderRadius: isMobile ? '0px' : '24px',
                    backgroundColor: tw.isDark ? '#171717' : '#FAFAFA',
                    padding: 0,
                    maxHeight: isMobile ? 'none' : '90vh',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    height: isMobile ? '100%' : 'auto',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', borderBottom: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                        {product ? 'Edit Product' : 'Create Product'}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '4px 4px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.6)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', paddingBottom: '16px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', maxHeight: isMobile ? 'none' : 'calc(90vh - 200px)', overflow: 'auto', flex: isMobile ? 1 : 'unset' }}>
                    <div>
                        <label style={labelStyle}>Product Name</label>
                        <input
                            type="text"
                            value={formData.product_name || ''}
                            onChange={(e) => {
                                setFormData({ ...formData, product_name: e.target.value });
                                setErrors({ ...errors, product_name: '' });
                            }}
                            placeholder="Enter product name"
                            style={{
                                ...inputStyle,
                                borderColor: errors.product_name ? '#ef4444' : 'rgba(255,255,255,0.2)',
                            } as React.CSSProperties}
                        />
                        {errors.product_name && (
                            <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
                                {errors.product_name}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={labelStyle}>Product Code</label>
                        <input
                            type="text"
                            value={formData.product_code || ''}
                            onChange={(e) => {
                                setFormData({ ...formData, product_code: e.target.value });
                                setErrors({ ...errors, product_code: '' });
                            }}
                            placeholder="e.g., PROD001"
                            style={{
                                ...inputStyle,
                                borderColor: errors.product_code ? '#ef4444' : 'rgba(255,255,255,0.2)',
                            } as React.CSSProperties}
                        />
                        {errors.product_code && (
                            <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
                                {errors.product_code}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={labelStyle}>Product Type</label>
                        <select
                            value={formData.wln_type_id || ''}
                            onChange={(e) => {
                                setFormData({ ...formData, wln_type_id: parseInt(e.target.value) });
                                setErrors({ ...errors, wln_type_id: '' });
                            }}
                            style={{
                                ...inputStyle,
                                borderColor: errors.wln_type_id ? '#ef4444' : 'rgba(255,255,255,0.2)',
                            } as React.CSSProperties}
                        >
                            <option value="">Select a type...</option>
                            {types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.type_name}
                                </option>
                            ))}
                        </select>
                        {errors.wln_type_id && (
                            <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
                                {errors.wln_type_id}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={labelStyle}>Status</label>
                        <select
                            value={formData.is_active ? '1' : '0'}
                            onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                            style={inputStyle as React.CSSProperties}
                        >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Minimum Loan</label>
                        <input
                            type="number"
                            value={formData.min_loan || 0}
                            onChange={(e) => setFormData({ ...formData, min_loan: parseFloat(e.target.value) })}
                            placeholder="0"
                            style={inputStyle as React.CSSProperties}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Maximum Loan</label>
                        <input
                            type="number"
                            value={formData.max_loan || 0}
                            onChange={(e) => setFormData({ ...formData, max_loan: parseFloat(e.target.value) })}
                            placeholder="100000"
                            style={inputStyle as React.CSSProperties}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Interest Rate (%)</label>
                        <input
                            type="number"
                            value={formData.interest_rate || 0}
                            onChange={(e) => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) })}
                            placeholder="0"
                            step="0.01"
                            style={inputStyle as React.CSSProperties}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Processing Fee</label>
                        <input
                            type="number"
                            value={formData.processing_fee || 0}
                            onChange={(e) => setFormData({ ...formData, processing_fee: parseFloat(e.target.value) })}
                            placeholder="0"
                            step="0.01"
                            style={inputStyle as React.CSSProperties}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Insurance Rate (%)</label>
                        <input
                            type="number"
                            value={formData.insurance_rate || 0}
                            onChange={(e) => setFormData({ ...formData, insurance_rate: parseFloat(e.target.value) })}
                            placeholder="0"
                            step="0.01"
                            style={inputStyle as React.CSSProperties}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', paddingBottom: '16px', borderTop: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px 20px',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            transition: 'all 120ms ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            flex: 1,
                            padding: '12px 20px',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ffffff',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            opacity: isSaving ? 0.6 : 1,
                            transition: 'all 120ms ease',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        }}
                        onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#2563eb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
                    >
                        {isSaving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProductCRUD;
