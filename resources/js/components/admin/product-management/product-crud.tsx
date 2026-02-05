import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { useMyTheme } from '@/hooks/use-mytheme';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { ProductLntype, WlnType, ProductPayload } from '@/types/product-lntype';
import { AnimatePresence, motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import { Switch } from '@/components/ui/switch';
import Select from 'react-select';
import CurrencyInput from 'react-currency-input-field';

type Props = {
    product?: ProductLntype;
    availableTypes?: WlnType[];
    onSave?: (payload: ProductPayload, productId?: number | null) => Promise<void>;
    onCancel?: () => void;
    onDelete?: () => Promise<void>;
    onToggleActive?: (productId: number, value: boolean) => void;
    hideActionsOnMobile?: boolean;
};

export type ProductCRUDRef = {
    save: () => Promise<void>;
    delete: () => Promise<void>;
};

const ProductCRUD = forwardRef<ProductCRUDRef, Props>(({
    product,
    availableTypes = [],
    onSave,
    onCancel,
    onDelete,
    onToggleActive,
    hideActionsOnMobile,
}, ref) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');

    const [formData, setFormData] = useState<ProductPayload>({
        product_name: product?.product_name || '',
        is_active: product?.is_active ?? true,
        is_multiple: product?.is_multiple ?? false,
        schemes: product?.schemes || null,
        mode: product?.mode || 'MONTHLY',
        interest_rate: product?.interest_rate || 0,
        max_term_days: product?.max_term_days || 0,
        is_max_term_editable: product?.is_max_term_editable ?? false,
        max_amortization_mode: product?.max_amortization_mode || 'FIXED',
        max_amortization_formula: product?.max_amortization_formula || null,
        max_amortization: product?.max_amortization || 0,
        is_max_amortization_editable: product?.is_max_amortization_editable ?? false,
        service_fee: product?.service_fee || 0,
        lrf: product?.lrf || 0,
        document_stamp: product?.document_stamp || 0,
        mort_plus_notarial: product?.mort_plus_notarial || 0,
        terms: product?.terms || '',
        typecodes: product?.types?.map(t => t.typecode) || [],
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(formData, product?.product_id);
            onCancel?.();
        } catch (error) {
            console.error('Failed to save product', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        if (confirm('Are you sure you want to delete this product?')) {
            await onDelete();
            onCancel?.();
        }
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        save: handleSave,
        delete: handleDelete,
    }));

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
        backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
        color: tw.isDark ? '#ffffff' : '#000000',
        fontSize: '0.875rem',
        fontFamily: 'inherit',
        transition: 'all 120ms ease',
    };

    const labelStyle = {
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        color: tw.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
        marginBottom: '6px',
        display: 'block' as const,
    };

    const textColorLight = tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
    const textColorDark = tw.isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';

    const renderSectionTitle = (title: string) => (
        <div style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: tw.isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
            marginTop: '24px',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}>
            {title}
        </div>
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{
                    borderRadius: isMobile ? '0px' : '24px',
                    backgroundColor: tw.isDark ? '#171717' : '#FFFFFF',
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        Product Details
                    </div>
                    {!isMobile && (
                        <button
                            onClick={onCancel}
                            style={{
                                padding: '4px 4px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: textColorLight,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = textColorDark)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = textColorLight)}
                        >
                            <CloseIcon />
                        </button>
                    )}
                </div>

                {/* Form Content */}
                <div style={{
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    overflow: 'auto',
                    flex: 1,
                }}>
                    {/* Basic Info */}
                    <div style={{ fontSize: '0.75rem', color: tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', marginBottom: '16px' }}>
                        Fields marked with * are required.
                    </div>

                    <div>
                        <label style={labelStyle}>Product Name *</label>
                        <input
                            type="text"
                            value={formData.product_name}
                            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                            placeholder="Enter product name"
                            style={inputStyle as React.CSSProperties}
                        />
                    </div>

                    {/* Enable/Disable */}
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) => {
                                setFormData({ ...formData, is_active: checked });
                                if (product) onToggleActive?.(product.product_id, checked);
                            }}
                        />
                        <label style={{ ...labelStyle, marginBottom: 0, textTransform: 'capitalize', fontSize: '0.875rem', fontWeight: 500 }}>
                            Enable or Disable this product
                        </label>
                    </div>

                    {/* Type Relation Tags */}
                    {renderSectionTitle('Type Relation Tags')}
                    <div>
                        <label style={labelStyle}>Tags *</label>
                        <Select
                            isMulti
                            options={availableTypes.map((type) => ({
                                value: type.typecode,
                                label: type.lntype,
                            }))}
                            value={availableTypes
                                .filter((type) => formData.typecodes?.includes(type.typecode))
                                .map((type) => ({
                                    value: type.typecode,
                                    label: type.lntype,
                                }))}
                            onChange={(selected) => {
                                setFormData({
                                    ...formData,
                                    typecodes: selected?.map((s) => s.value) || [],
                                });
                            }}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    borderColor: tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                                    color: tw.isDark ? '#ffffff' : '#000000',
                                    borderRadius: '8px',
                                    padding: '4px',
                                    fontSize: '0.875rem',
                                    minHeight: '44px',
                                    cursor: 'pointer',
                                    transition: 'all 120ms ease',
                                    '&:hover': {
                                        borderColor: tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                                    },
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: tw.isDark ? '#171717' : '#FFFFFF',
                                    borderColor: tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                                    borderRadius: '8px',
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isSelected
                                        ? '#3b82f6'
                                        : state.isFocused
                                          ? tw.isDark
                                            ? 'rgba(59, 130, 246, 0.2)'
                                            : 'rgba(59, 130, 246, 0.1)'
                                          : 'transparent',
                                    color: state.isSelected
                                        ? '#ffffff'
                                        : tw.isDark
                                          ? 'rgba(255,255,255,0.9)'
                                          : '#000000',
                                    cursor: 'pointer',
                                    padding: '10px 12px',
                                    transition: 'all 120ms ease',
                                    '&:active': {
                                        backgroundColor: '#3b82f6',
                                    },
                                }),
                                input: (base) => ({
                                    ...base,
                                    color: tw.isDark ? '#ffffff' : '#000000',
                                }),
                                multiValue: (base) => ({
                                    ...base,
                                    backgroundColor: '#3b82f6',
                                    borderRadius: '4px',
                                }),
                                multiValueLabel: (base) => ({
                                    ...base,
                                    color: '#ffffff',
                                }),
                                multiValueRemove: (base) => ({
                                    ...base,
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: '#2563eb',
                                    },
                                }),
                            }}
                            classNamePrefix="react-select"
                            placeholder="Select tags..."
                        />
                    </div>

                    {/* Scheme and Mode */}
                    {renderSectionTitle('Loan Configuration')}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Scheme</label>
                            <select
                                value={formData.schemes || ''}
                                onChange={(e) => setFormData({ ...formData, schemes: e.target.value || null })}
                                style={{
                                    ...inputStyle,
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${tw.isDark ? '%23ffffff' : '%23000000'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 8px center',
                                    backgroundSize: '20px',
                                    paddingRight: '32px',
                                } as React.CSSProperties}
                            >
                                <option value="">Select scheme...</option>
                                <option value="ADD-ON">ADD-ON</option>
                                <option value="REGULAR">REGULAR</option>
                                <option value="SPECIAL">SPECIAL</option>
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Mode</label>
                            <select
                                value={formData.mode || 'MONTHLY'}
                                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                style={{
                                    ...inputStyle,
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${tw.isDark ? '%23ffffff' : '%23000000'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 8px center',
                                    backgroundSize: '20px',
                                    paddingRight: '32px',
                                } as React.CSSProperties}
                            >
                                <option value="MONTHLY">MONTHLY</option>
                                <option value="QUARTERLY">QUARTERLY</option>
                                <option value="ANNUAL">ANNUAL</option>
                            </select>
                        </div>
                    </div>

                    {/* Rate and Max Term */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Rate (P.A.)</label>
                                <div style={{ display: 'flex', alignItems: 'center', borderRadius: '8px', border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`, overflow: 'hidden', backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                    <CurrencyInput
                                        value={formData.interest_rate || ''}
                                        onValueChange={(value) => setFormData({ ...formData, interest_rate: parseFloat(value || '0') })}
                                        placeholder="0"
                                        decimalsLimit={2}
                                        prefix=""
                                        suffix=""
                                        style={{
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: tw.isDark ? '#ffffff' : '#000000',
                                            fontSize: '0.875rem',
                                            fontFamily: 'inherit',
                                            transition: 'all 120ms ease',
                                            padding: '10px 12px',
                                            flex: 1,
                                            outline: 'none',
                                        } as React.CSSProperties}
                                    />
                                    <span style={{ paddingRight: '12px', color: tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.875rem', fontWeight: 600, minWidth: '24px' }}>%</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Max Term (days)</label>
                                <CurrencyInput
                                    value={formData.max_term_days || ''}
                                    onValueChange={(value) => setFormData({ ...formData, max_term_days: parseInt(value || '0') })}
                                    placeholder="0"
                                    decimalsLimit={0}
                                    prefix=""
                                    style={inputStyle as React.CSSProperties}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.65rem', color: textColorLight }}>editable?</span>
                                <Switch
                                    checked={formData.is_max_term_editable || false}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_max_term_editable: checked })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Max Amortization */}
                    {renderSectionTitle('Max Amortization')}
                    <div style={{ color: tw.isDark ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.8)', fontSize: '0.75rem', marginBottom: '12px', lineHeight: '1.5' }}>
                        *Max Amortization can use variable (basic) for custom formulas, to do this select <strong>CUSTOM</strong> below.
                    </div>

                    <div>
                        <label style={labelStyle}>Max Amortization Mode *</label>
                        <select
                            value={formData.max_amortization_mode || 'FIXED'}
                            onChange={(e) => setFormData({ ...formData, max_amortization_mode: e.target.value as 'FIXED' | 'BASIC' | 'CUSTOM' })}
                            style={{
                                ...inputStyle,
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${tw.isDark ? '%23ffffff' : '%23000000'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                backgroundSize: '20px',
                                paddingRight: '32px',
                            } as React.CSSProperties}
                        >
                            <option value="FIXED">FIXED</option>
                            <option value="BASIC">BASIC</option>
                            <option value="CUSTOM">CUSTOM</option>
                        </select>
                    </div>

                    {formData.max_amortization_mode === 'CUSTOM' && (
                        <div style={{ marginTop: '16px' }}>
                            <label style={labelStyle}>Formula</label>
                            <input
                                type="text"
                                value={formData.max_amortization_formula || ''}
                                onChange={(e) => setFormData({ ...formData, max_amortization_formula: e.target.value })}
                                placeholder="e.g., (salary * 0.5) * months"
                                style={inputStyle as React.CSSProperties}
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginTop: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Max Amortization *</label>
                            <div style={{ display: 'flex', alignItems: 'center', borderRadius: '8px', border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`, overflow: 'hidden', backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', opacity: formData.max_amortization_mode !== 'FIXED' ? 0.6 : 1 }}>
                                <span style={{ paddingLeft: '12px', color: tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.875rem', fontWeight: 600, minWidth: '24px' }}>₱</span>
                                <CurrencyInput
                                    disabled={formData.max_amortization_mode !== 'FIXED'}
                                    value={formData.max_amortization || ''}
                                    onValueChange={(value) => setFormData({ ...formData, max_amortization: parseFloat(value || '0') })}
                                    placeholder="0"
                                    decimalsLimit={2}
                                    prefix=""
                                    suffix=""
                                    style={{
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: tw.isDark ? '#ffffff' : '#000000',
                                        fontSize: '0.875rem',
                                        fontFamily: 'inherit',
                                        transition: 'all 120ms ease',
                                        padding: '10px 12px',
                                        flex: 1,
                                        outline: 'none',
                                        cursor: formData.max_amortization_mode !== 'FIXED' ? 'not-allowed' : 'text',
                                    } as React.CSSProperties}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.65rem', color: textColorLight }}>editable?</span>
                            <Switch
                                checked={formData.is_max_amortization_editable || false}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_max_amortization_editable: checked })}
                            />
                        </div>
                    </div>

                    {/* Fees */}
                    {renderSectionTitle('Fees & Charges')}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Service Fee (% of amount Applied)</label>
                                <div style={{ display: 'flex', alignItems: 'center', borderRadius: '8px', border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`, overflow: 'hidden', backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                    <CurrencyInput
                                        value={formData.service_fee || ''}
                                        onValueChange={(value) => setFormData({ ...formData, service_fee: parseFloat(value || '0') })}
                                        placeholder="0"
                                        decimalsLimit={2}
                                        prefix=""
                                        suffix=""
                                        style={{
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: tw.isDark ? '#ffffff' : '#000000',
                                            fontSize: '0.875rem',
                                            fontFamily: 'inherit',
                                            transition: 'all 120ms ease',
                                            padding: '10px 12px',
                                            flex: 1,
                                            outline: 'none',
                                        } as React.CSSProperties}
                                    />
                                    <span style={{ paddingRight: '12px', color: tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.875rem', fontWeight: 600, minWidth: '24px' }}>%</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>LRF (% of amount Applied)</label>
                                <div style={{ display: 'flex', alignItems: 'center', borderRadius: '8px', border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`, overflow: 'hidden', backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                    <CurrencyInput
                                        value={formData.lrf || ''}
                                        onValueChange={(value) => setFormData({ ...formData, lrf: parseFloat(value || '0') })}
                                        placeholder="0"
                                        decimalsLimit={2}
                                        prefix=""
                                        suffix=""
                                        style={{
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: tw.isDark ? '#ffffff' : '#000000',
                                            fontSize: '0.875rem',
                                            fontFamily: 'inherit',
                                            transition: 'all 120ms ease',
                                            padding: '10px 12px',
                                            flex: 1,
                                            outline: 'none',
                                        } as React.CSSProperties}
                                    />
                                    <span style={{ paddingRight: '12px', color: tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.875rem', fontWeight: 600, minWidth: '24px' }}>%</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Doc Stamp (% of amount Applied)</label>
                                <div style={{ display: 'flex', alignItems: 'center', borderRadius: '8px', border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`, overflow: 'hidden', backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                    <CurrencyInput
                                        value={formData.document_stamp || ''}
                                        onValueChange={(value) => setFormData({ ...formData, document_stamp: parseFloat(value || '0') })}
                                        placeholder="0"
                                        decimalsLimit={2}
                                        prefix=""
                                        suffix=""
                                        style={{
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: tw.isDark ? '#ffffff' : '#000000',
                                            fontSize: '0.875rem',
                                            fontFamily: 'inherit',
                                            transition: 'all 120ms ease',
                                            padding: '10px 12px',
                                            flex: 1,
                                            outline: 'none',
                                        } as React.CSSProperties}
                                    />
                                    <span style={{ paddingRight: '12px', color: tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.875rem', fontWeight: 600, minWidth: '24px' }}>%</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Mort + Notarial</label>
                                <div style={{ display: 'flex', alignItems: 'center', borderRadius: '8px', border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`, overflow: 'hidden', backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                    <span style={{ paddingLeft: '12px', color: tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.875rem', fontWeight: 600, minWidth: '24px' }}>₱</span>
                                    <CurrencyInput
                                        value={formData.mort_plus_notarial || ''}
                                        onValueChange={(value) => setFormData({ ...formData, mort_plus_notarial: parseFloat(value || '0') })}
                                        placeholder="0"
                                        decimalsLimit={2}
                                        prefix=""
                                        style={{
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: tw.isDark ? '#ffffff' : '#000000',
                                            fontSize: '0.875rem',
                                            fontFamily: 'inherit',
                                            transition: 'all 120ms ease',
                                            padding: '10px 12px',
                                            flex: 1,
                                            outline: 'none',
                                        } as React.CSSProperties}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    {renderSectionTitle('Terms/Information for Clients')}
                    <div>
                        <label style={labelStyle}>Terms & Conditions</label>
                        <textarea
                            value={formData.terms || ''}
                            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                            placeholder="Enter terms and information for clients..."
                            style={{
                                ...inputStyle,
                                minHeight: '120px',
                                resize: 'vertical',
                            } as React.CSSProperties}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                {(!isMobile || !hideActionsOnMobile) && (
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        paddingLeft: '16px',
                        paddingRight: '16px',
                        paddingTop: '16px',
                        paddingBottom: '16px',
                        borderTop: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    }}>
                        <button
                            onClick={onCancel}
                            style={{
                                flex: 1,
                                padding: '12px 20px',
                                backgroundColor: 'transparent',
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                                borderRadius: '8px',
                                color: tw.isDark ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                transition: 'all 120ms ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
                                e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            Cancel
                        </button>
                        {product && onDelete && (
                            <button
                                onClick={handleDelete}
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    backgroundColor: '#ef4444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    transition: 'all 120ms ease',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
                            >
                                Delete
                            </button>
                        )}
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
                )}
            </motion.div>
        </AnimatePresence>
    );
});

ProductCRUD.displayName = 'ProductCRUD';

export default ProductCRUD;
