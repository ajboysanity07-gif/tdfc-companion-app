import IOSSwitch from '@/components/ui/ios-switch';
import type { ProductLntype, ProductPayload, WlnType } from '@/types/product-lntype';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Chip, Divider, FormControl, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { isConstantNode, isFunctionNode, isOperatorNode, isParenthesisNode, isSymbolNode, parse, type MathNode } from 'mathjs';
import React, { useCallback, useEffect, useState } from 'react';
import BoxHeader from '@/components/box-header';

const sanitizeNumber = (value: string) => value.replace(/[^\d.,-]/g, '');
const formatNumber = (value: string, options?: Intl.NumberFormatOptions) => {
    const numeric = value.replace(/,/g, '');
    if (!numeric) return '';
    const num = Number(numeric);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat('en-US', options).format(num);
};
const toNumber = (value: string) => {
    const cleaned = value.replace(/,/g, '');
    return cleaned === '' ? null : Number(cleaned);
};
const toNumberOrZero = (value: string) => {
    const n = toNumber(value);
    return n ?? 0;
};

const validateCustomFormula = (value: string) => {
    const trimmed = (value ?? '').trim();
    if (!trimmed) return 'Custom formula is required';

    const normalized = trimmed.replace(/(^|[^0-9])\.(\d)/g, '$10.$2');
    let node: MathNode;

    try {
        node = parse(normalized);
    } catch {
        return 'Invalid formula syntax';
    }

    const symbols = new Set<string>();
    let unsafe = false;

    node.traverse((n: MathNode) => {
        if (isFunctionNode(n)) unsafe = true;
        if (isSymbolNode(n)) symbols.add(n.name.toLowerCase());

        if (!isOperatorNode(n) && !isParenthesisNode(n) && !isConstantNode(n) && !isSymbolNode(n)) {
            unsafe = true;
        }
    });
    if (unsafe) return 'Allowed: numbers, + - * / ( ), and "basic".';
    if (!symbols.has('basic')) return 'Formula must include the variable "basic".';
    if ([...symbols].some((s) => s !== 'basic')) return 'Only the variable "basic" is allowed.';
    return '';
};

type SchemeOption = 'ADD-ON' | 'PREPAID';
type ModeOption = 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'DUE-DATE';
type AmortModeOption = 'FIXED' | 'BASIC' | 'CUSTOM';

const schemeOptions: SchemeOption[] = ['ADD-ON', 'PREPAID'];
const modeOptions: ModeOption[] = ['MONTHLY', 'WEEKLY', 'DAILY', 'DUE-DATE'];
const maxmortmodeOptions: AmortModeOption[] = ['FIXED', 'BASIC', 'CUSTOM'];
const amortContainerMinHeight = 70;

type Props = {
    product?: ProductLntype | null;
    availableTypes?: WlnType[];
    onSave?: (payload: ProductPayload) => Promise<void> | void;
    onDelete?: (product?: ProductLntype | null) => Promise<void> | void;
    onCancel?: () => void;
    onToggleActive?: (productId: number, value: boolean) => void;
    compactActions?: boolean;
    saveButtonRef?: React.RefObject<HTMLButtonElement | null>;
    deleteButtonRef?: React.RefObject<HTMLButtonElement | null>;
    hideActionsOnMobile?: boolean;
};

/**
 * Pure front-end form (no API wiring yet) styled close to the provided mock.
 * Accepts a product to hydrate fields and exposes save/delete/cancel hookproduct?.
 */
const ProductCreateOrDelete: React.FC<Props> = ({
    product,
    availableTypes = [],
    onSave,
    onDelete,
    onToggleActive,
    onCancel,
    compactActions = false,
    saveButtonRef,
    deleteButtonRef,
    hideActionsOnMobile = false,
}) => {
    const [productName, setProductName] = useState(product?.product_name ?? '');
    const [isActive, setIsActive] = useState(product?.is_active ?? true);
    const [tags, setTags] = useState<string[]>(product?.types?.map((t) => t.typecode) ?? []);
    const [tagsOpen, setTagsOpen] = useState(false);
    const [scheme, setScheme] = useState<SchemeOption>('ADD-ON');
    const [mode, setMode] = useState<ModeOption>('MONTHLY');
    const [rate, setRate] = useState('');
    const [maxTerm, setMaxTerm] = useState('');
    const [maxAmortMode, setMaxAmortMode] = useState<AmortModeOption>('FIXED');
    const [maxAmortFormula, setMaxAmortFormula] = useState('');
    const [maxAmort, setMaxAmort] = useState('');
    const [serviceFee, setServiceFee] = useState('');
    const [lrf, setLrf] = useState('');
    const [docStamp, setDocStamp] = useState('');
    const [mortNotarial, setMortNotarial] = useState('');

    const [allowMultiple, setAllowMultiple] = useState(product?.is_multiple ?? false);
    const [termEditable, setTermEditable] = useState(product?.is_max_term_editable ?? false);
    const [amortEditable, setAmortEditable] = useState(product?.is_max_amortization_editable ?? false);
    const [terms, setTerms] = useState(
        'Lorem ipsum dolor sit amet. Id dolorum aliquam eum laudantium neque et atque sint est eligendi tenetur est provident animi.',
    );
    // for Error Messages
    const [productNameError, setProductNameError] = useState('');
    const [tagsError, setTagsError] = useState('');
    const [rateError, setRateError] = useState('');
    const [maxTermError, setMaxTermError] = useState('');
    const [maxAmortFormulaError, setMaxAmortFormulaError] = useState('');
    const [maxAmortError, setMaxAmortError] = useState('');

    useEffect(() => {
        if (!product) {
            // Reset all fields when no product selected
            setProductName('');
            setIsActive(true);
            setTags([]);
            setScheme('ADD-ON');
            setMode('MONTHLY');
            setRate('');
            setMaxTerm('');
            setMaxAmortMode('FIXED');
            setMaxAmortFormula('');
            setMaxAmort('');
            setServiceFee('');
            setLrf('');
            setDocStamp('');
            setMortNotarial('');
            setAllowMultiple(false);
            setTermEditable(false);
            setAmortEditable(false);
            setTerms('');
            setProductNameError('');
            setTagsError('');
            setRateError('');
            setMaxAmortError('');
            setMaxTermError('');
            setMaxAmortFormulaError('');
            return;
        }

        // Update all fields from selected product
        setProductName(product.product_name ?? '');
        setIsActive(product.is_active ?? true);
        const typecodes = product.types?.map((t) => t.typecode) ?? [];
        console.log('[ProductCrud] Product types loaded:', {
            product_name: product.product_name,
            types: product.types,
            typecodes: typecodes,
            availableTypes: availableTypes
        });
        setTags(typecodes);
        setScheme((product.schemes as SchemeOption) ?? 'ADD-ON');
        setMode((product.mode as ModeOption) ?? 'MONTHLY');
        setRate(formatNumber((product.interest_rate ?? '').toString(), { maximumFractionDigits: 2 }));
        setMaxTerm(formatNumber((product.max_term_days ?? '').toString(), { maximumFractionDigits: 0 }));
        setMaxAmortMode((product.max_amortization_mode as AmortModeOption) ?? 'FIXED');
        setMaxAmortFormula(product.max_amortization_formula ?? '');
        setMaxAmort(formatNumber((product.max_amortization ?? '').toString(), { maximumFractionDigits: 0 }));
        setServiceFee(formatNumber((product.service_fee ?? '').toString(), { maximumFractionDigits: 2 }));
        setLrf(formatNumber((product.lrf ?? '').toString(), { maximumFractionDigits: 2 }));
        setDocStamp(formatNumber((product.document_stamp ?? '').toString(), { maximumFractionDigits: 2 }));
        setMortNotarial(formatNumber((product.mort_plus_notarial ?? '').toString(), { maximumFractionDigits: 2 }));
        setAllowMultiple(product.is_multiple ?? false);
        setTermEditable(product.is_max_term_editable ?? false);
        setAmortEditable(product.is_max_amortization_editable ?? false);
        setTerms(product.terms ?? '');
        setProductNameError('');
        setTagsError('');
        setRateError('');
        setMaxAmortError('');
        setMaxTermError('');
        setMaxAmortFormulaError('');
    }, [product]);

    const showEmptyHint = !product && !productName && tags.length === 0;

    const tagOptions = availableTypes;

    // Helper function to get tag label from typecode
    const findTagsLabel = (typecode: string) => {
        const found = tagOptions.find((t) => t.typecode === typecode);
        if (!found) return typecode;
        
        // If lntags exists and is not empty, return it
        if (found.lntags && found.lntags.trim()) {
            return found.lntags;
        }
        
        // Otherwise return lntype or typecode
        return found.lntype || typecode;
    };

    const handleSave = useCallback(() => {
        let hasError = false;
        //Error Message for Product Name
        if (!productName.trim()) {
            setProductNameError('Product name is required');
            hasError = true;
        } else {
            setProductNameError('');
        }
        //Error Message for Tags
        if (!tags.length) {
            setTagsError('Select at least one tag');
            hasError = true;
        } else {
            setTagsError('');
        }

        if (!rate.trim()) {
            setRateError('Interest Rate is required');
            hasError = true;
        } else {
            setRateError('');
        }
        if (!maxTerm.trim()) {
            setMaxTermError('Max Term name is required');
            hasError = true;
        } else {
            setMaxTermError('');
        }
        //Error Message for Max Amortization if 'FIXED' mode
        if (maxAmortMode === 'FIXED') {
            if (!maxAmort.trim()) {
                setMaxAmortError('Max amortization is required for FIXED mode');
                hasError = true;
            } else {
                setMaxAmortError('');
            }
        } else {
            setMaxAmortError('');
        }
        //Error Message for Max Amortization if 'CUSTOM' mode
        if (maxAmortMode === 'CUSTOM') {
            const err = validateCustomFormula(maxAmortFormula);
            setMaxAmortFormulaError(err);
            if (err) hasError = true;
        } else {
            setMaxAmortFormulaError('');
        }

        if (hasError) return;

        onSave?.({
            product_name: productName,
            is_active: isActive,
            is_multiple: allowMultiple,
            schemes: scheme,
            mode,
            interest_rate: toNumber(rate),
            max_term_days: toNumber(maxTerm),
            is_max_term_editable: termEditable,
            max_amortization_mode: maxAmortMode,
            max_amortization_formula: maxAmortFormula,
            max_amortization: toNumber(maxAmort),
            is_max_amortization_editable: amortEditable,
            service_fee: toNumberOrZero(serviceFee),
            lrf: toNumberOrZero(lrf),
            document_stamp: toNumberOrZero(docStamp),
            mort_plus_notarial: toNumberOrZero(mortNotarial),
            terms,
            typecodes: tags,
        });
    }, [
        allowMultiple,
        amortEditable,
        docStamp,
        isActive,
        lrf,
        maxAmort,
        maxAmortMode,
        maxAmortFormula,
        maxTerm,
        mode,
        mortNotarial,
        onSave,
        productName,
        rate,
        scheme,
        serviceFee,
        tags,
        termEditable,
        terms,
    ]);

    const handleDelete = useCallback(() => onDelete?.(product), [onDelete, product]);

    return (
        <>
            <BoxHeader title="Product Details" />
            {showEmptyHint ? (
                <Stack spacing={0.4} sx={{ mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                        <InfoOutlinedIcon fontSize="small" color="info" />
                        <Typography variant="body2" fontWeight={600} color="info.main">
                            • Select a product on the left to view its details, or start a new one.
                        </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={600} color="info.main" sx={{ pl: 3.5 }}>
                        • Fields marked with * are required.
                    </Typography>
                </Stack>
            ) : (
                <Stack spacing={0.4} sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                        <InfoOutlinedIcon fontSize="small" color="info" />
                        <Typography variant="body2" fontWeight={600} color="info.main">
                            • Fields marked with * are required.
                        </Typography>
                    </Stack>
                </Stack>
            )}

            <Stack spacing={2}>
                <Stack spacing={0.25}>
                    <TextField
                        fullWidth
                        required
                        size="small"
                        label="Product Name"
                        value={productName}
                        onChange={(e) => {
                            setProductName(e.target.value);
                            if (productNameError) setProductNameError('');
                        }}
                        error={!!productNameError}
                        helperText={undefined}
                    />
                    <Typography variant="caption" color={productNameError ? 'error' : 'text.secondary'} sx={{ minHeight: 18 }}>
                        {productNameError || ' '}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="center">
                    <IOSSwitch
                        checked={isActive}
                        value={isActive}
                        onChange={(e) => {
                            const next = e.target.checked;
                            setIsActive(next);
                            if (product?.product_id) onToggleActive?.(product.product_id, next);
                        }}
                    />
                    <Typography variant="body2" color="text.secondary">
                        Enable or Disable this product
                    </Typography>
                </Stack>

                <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        Type Relation Tags:
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <FormControl fullWidth size="small" required error={!!tagsError}>
                            <InputLabel>Tags</InputLabel>
                            <Select
                                open={tagsOpen}
                                onOpen={() => setTagsOpen(true)}
                                onClose={() => setTagsOpen(false)}
                                multiple
                                label="Tags"
                                value={tags}
                                onChange={(e) => {
                                    const next = typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]);
                                    setTags(next);
                                    setTagsOpen(false);
                                }}
                                renderValue={(selected) => (
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" rowGap={0.5}>
                                        {(selected as string[]).map((tag) => (
                                            <Chip
                                                size="small"
                                                key={tag}
                                                label={findTagsLabel(tag)}
                                                onDelete={() => setTags((prev) => prev.filter((t) => t !== tag))}
                                                onMouseDown={(evt) => evt.stopPropagation()}
                                                sx={{ 
                                                    borderRadius: '999px', 
                                                    height: 24, 
                                                    fontSize: 12, 
                                                    px: 0.75,
                                                    backgroundColor: '#f57979',
                                                    color: '#ffffff',
                                                    fontWeight: 600,
                                                    '& .MuiChip-deleteIcon': {
                                                        color: 'rgba(255,255,255,0.7)',
                                                        '&:hover': { color: '#ffffff' }
                                                    }
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                )}
                            >
                                {tagOptions
                                    .filter((opt) => !tags?.includes(opt.typecode))
                                    .map((opt) => {
                                        const lntags = (opt.lntags || '')
                                            .split(',')
                                            .map((t) => t.trim())
                                            .filter(Boolean);
                                        return (
                                            <MenuItem key={opt.typecode} value={opt.typecode}>
                                                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" rowGap={0.5}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {opt.lntype}
                                                    </Typography>
                                                    {lntags.map((tag) => (
                                                        <Chip
                                                            key={tag}
                                                            label={tag}
                                                            size="small"
                                                            sx={{ 
                                                                height: 22, 
                                                                borderRadius: '999px', 
                                                                fontSize: 11, 
                                                                px: 0.5,
                                                                backgroundColor: 'rgba(245, 121, 121, 0.15)',
                                                                color: '#f57979',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </MenuItem>
                                        );
                                    })}
                            </Select>
                            <Typography variant="caption" color={tagsError ? 'error' : 'transparent'} sx={{ mt: 0.25, minHeight: 18 }}>
                                {tagsError || ' '}
                            </Typography>
                        </FormControl>
                    </Stack>
                </Stack>

                <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <FormControl fullWidth size="small">
                            <InputLabel>Scheme</InputLabel>
                            <Select label="Scheme" value={scheme} onChange={(e) => setScheme(e.target.value as SchemeOption)}>
                                {schemeOptions?.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                        {opt}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
                        <FormControl fullWidth size="small">
                            <InputLabel>Mode</InputLabel>
                            <Select label="Mode" value={mode} onChange={(e) => setMode(e.target.value as ModeOption)}>
                                {modeOptions?.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                        {opt}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Stack alignItems="center" spacing={0.25}>
                            <Typography variant="caption" color="text.secondary" textAlign="center">
                                multiple?
                            </Typography>
                            <IOSSwitch checked={allowMultiple} value={allowMultiple} onChange={(e) => setAllowMultiple(e.target.checked)} size="small" />
                        </Stack>
                    </Stack>

                    <Stack spacing={0.25}>
                        <TextField
                            fullWidth
                            required
                            size="small"
                            label="Rate (P.A.)"
                            value={rate}
                            onChange={(e) => {
                                setRate(sanitizeNumber(e.target.value));
                                if (rateError) setRateError('');
                            }}
                            error={!!rateError}
                            helperText={undefined}
                            onBlur={() => setRate((prev) => formatNumber(prev, { maximumFractionDigits: 2 }))}
                            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                        />
                        <Typography variant="caption" color={rateError ? 'error' : 'text.secondary'} sx={{ minHeight: 18 }}>
                            {rateError || ' '}
                        </Typography>
                    </Stack>

                    <Stack spacing={0.25}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <TextField
                                fullWidth
                                size="small"
                                label="Max Term (days)"
                                value={maxTerm}
                                onChange={(e) => {
                                    setMaxTerm(e.target.value);
                                    if (maxTermError) setMaxTermError('');
                                }}
                                error={!!maxTermError}
                                helperText={undefined}
                                onBlur={() => setMaxTerm((prev) => formatNumber(prev, { maximumFractionDigits: 0 }))}
                            />
                            <Stack alignItems="center" spacing={0.25}>
                                <Typography variant="caption" color="text.secondary">
                                    editable?
                                </Typography>
                                <IOSSwitch checked={termEditable} value={termEditable} onChange={(e) => setTermEditable(e.target.checked)} size="small" />
                            </Stack>
                        </Stack>
                        <Typography variant="caption" color={maxTermError ? 'error' : 'text.secondary'} sx={{ minHeight: 18 }}>
                            {maxTermError || ' '}
                        </Typography>
                    </Stack>

                    <Typography variant="body2" sx={{ color: '#4aa3d7', textAlign: 'center' }}>
                        *Max Amortization can use variable (basic) for custom formulas, to do this select <strong>CUSTOM</strong> below.
                    </Typography>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Max Amortization Mode</InputLabel>
                            <Select
                                label="Max Amortization Mode"
                                value={maxAmortMode}
                                onChange={(e) => {
                                    const value = e.target.value as AmortModeOption;
                                    setMaxAmortMode(value);
                                    setMaxAmortError('');
                                    setMaxAmortFormulaError('');
                                    if (value === 'BASIC') {
                                        setMaxAmortFormula('basic');
                                        setMaxAmort('');
                                    } else if (value === 'FIXED') {
                                        setMaxAmortFormula('');
                                    }
                                }}
                            >
                                {maxmortmodeOptions?.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                        {opt}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Box sx={{ position: 'relative', minHeight: amortContainerMinHeight }}>
                        <AnimatePresence mode="wait" initial={false}>
                            {maxAmortMode === 'FIXED' && (
                                <motion.div
                                    key="fixed"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, overflow: 'visible' }}
                                >
                                    <Stack spacing={0.25}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <TextField
                                                required
                                                fullWidth
                                                size="small"
                                                label="Max Amortization"
                                                value={maxAmort}
                                                onChange={(e) => {
                                                    setMaxAmort(sanitizeNumber(e.target.value));
                                                    if (maxAmortError) setMaxAmortError('');
                                                }}
                                                onBlur={() => setMaxAmort((prev) => formatNumber(prev, { maximumFractionDigits: 0 }))}
                                                error={!!maxAmortError}
                                                helperText={undefined}
                                            />
                                            <Stack alignItems="center" spacing={0.25}>
                                                <Typography variant="caption" color="text.secondary">
                                                    editable?
                                                </Typography>
                                                <IOSSwitch
                                                    checked={amortEditable}
                                                    value={amortEditable}
                                                    onChange={(e) => setAmortEditable(e.target.checked)}
                                                    size="small"
                                                />
                                            </Stack>
                                        </Stack>
                                        <Typography variant="caption" color={maxAmortError ? 'error' : 'text.secondary'} sx={{ minHeight: 18 }}>
                                            {maxAmortError || ' '}
                                        </Typography>
                                    </Stack>
                                </motion.div>
                            )}

                            {maxAmortMode === 'BASIC' && (
                                <motion.div
                                    key="basic"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, overflow: 'visible' }}
                                >
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <TextField
                                            required
                                            fullWidth
                                            size="small"
                                            label="Max Amortization"
                                            value={maxAmortFormula || 'basic'}
                                            InputProps={{ readOnly: true }}
                                        />
                                        <Stack alignItems="center" spacing={0.25}>
                                            <Typography variant="caption" color="text.secondary">
                                                editable?
                                            </Typography>
                                            <IOSSwitch
                                                checked={amortEditable}
                                                value={amortEditable}
                                                onChange={(e) => setAmortEditable(e.target.checked)}
                                                size="small"
                                            />
                                        </Stack>
                                    </Stack>
                                </motion.div>
                            )}

                            {maxAmortMode === 'CUSTOM' && (
                                <motion.div
                                    key="custom"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, overflow: 'visible' }}
                                >
                                    <Stack spacing={0.25}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <TextField
                                                required
                                                fullWidth
                                                size="small"
                                                label="Custom Formula"
                                                value={maxAmortFormula}
                                                onChange={(e) => {
                                                    setMaxAmortFormula(e.target.value);
                                                    if (maxAmortFormulaError) setMaxAmortFormulaError('');
                                                }}
                                                onBlur={(e) => setMaxAmortFormulaError(validateCustomFormula(e.target.value))}
                                                error={!!maxAmortFormulaError}
                                                placeholder="e.g. basic, 2 * basic, (basic * 5) / 0.5"
                                                helperText={undefined}
                                            />
                                            <Stack alignItems="center" spacing={0.25}>
                                                <Typography variant="caption" color="text.secondary">
                                                    editable?
                                                </Typography>
                                                <IOSSwitch
                                                    checked={amortEditable}
                                                    value={amortEditable}
                                                    onChange={(e) => setAmortEditable(e.target.checked)}
                                                    size="small"
                                                />
                                            </Stack>
                                        </Stack>
                                        <Typography variant="caption" color={maxAmortFormulaError ? 'error' : 'text.secondary'} sx={{ minHeight: 18 }}>
                                            {maxAmortFormulaError || 'Use "basic" as the member basic salary. Allowed: numbers, + - * / ( ).'}
                                        </Typography>
                                    </Stack>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>

                    <TextField
                        fullWidth
                        size="small"
                        label="Service Fee (% of amount Applied)"
                        value={serviceFee}
                        onChange={(e) => setServiceFee(sanitizeNumber(e.target.value))}
                        onBlur={() => setServiceFee((prev) => formatNumber(prev, { maximumFractionDigits: 2 }))}
                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        label="LRF (% of amount Applied)"
                        value={lrf}
                        onChange={(e) => setLrf(sanitizeNumber(e.target.value))}
                        onBlur={() => setLrf((prev) => formatNumber(prev, { maximumFractionDigits: 2 }))}
                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        label="Doc Stamp (% of amount Applied)"
                        value={docStamp}
                        onChange={(e) => setDocStamp(sanitizeNumber(e.target.value))}
                        onBlur={() => setDocStamp((prev) => formatNumber(prev, { maximumFractionDigits: 2 }))}
                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        label="Mort + Notarial"
                        value={mortNotarial}
                        onChange={(e) => setMortNotarial(sanitizeNumber(e.target.value))}
                        onBlur={() => setMortNotarial((prev) => formatNumber(prev, { maximumFractionDigits: 2 }))}
                    />

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle1" fontWeight={700}>
                        TERMS/INFORMATION FOR CLIENTS:
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        placeholder="Terms and Information about this Loan Product goes here."
                    />
                </Stack>
            </Stack>

            {compactActions ? (
                <Stack
                    direction="row"
                    spacing={1.5}
                    justifyContent="flex-end"
                    sx={{ mt: 2, display: hideActionsOnMobile ? { xs: 'none', sm: 'flex' } : undefined }}
                >
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={handleDelete}
                        ref={deleteButtonRef}
                        sx={{ borderRadius: 2, minWidth: 0, px: 1.5 }}
                    >
                        <DeleteIcon fontSize="small" />
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleSave}
                        ref={saveButtonRef}
                        sx={{ borderRadius: 2, minWidth: 0, px: 1.5 }}
                    >
                        <SaveIcon fontSize="small" />
                    </Button>
                </Stack>
            ) : (
                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                    sx={{ mt: 3, display: hideActionsOnMobile ? { xs: 'none', sm: 'flex' } : undefined }}
                >
                    <Button variant="outlined" color="inherit" startIcon={<CreateIcon />} onClick={onCancel}>
                        Add New Product
                    </Button>
                    <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave} ref={saveButtonRef}>
                        Save
                    </Button>
                    <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDelete} ref={deleteButtonRef}>
                        Delete
                    </Button>
                </Stack>
            )}
        </>
    );
};

export default ProductCreateOrDelete;
