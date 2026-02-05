import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import CurrencyInputField from './currency-input-field';
import CalculationResultBox from './calculation-result-box';
import type { LoanApplicationRequest } from '@/types/loan-application';
import type { ProductLntype } from '@/types/product-lntype';
import { LoanCalculatorSkeleton } from './skeletons';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLoanCalculation } from '@/hooks/use-loan-calculation';
import { useCalculatorStyles } from '@/hooks/use-calculator-styles';
import CurrencyInput from 'react-currency-input-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Props = {
    selectedProduct: ProductLntype | null;
    onSubmit?: (request: LoanApplicationRequest) => Promise<void>;
    submitting?: boolean;
    submitError?: string | null;
    loading?: boolean;
    forceModalTerms?: boolean;
    loanDefaults?: {
        productName?: string | null;
        typecode?: string | null;
        termMonths?: number | null;
        amortization?: number | null;
        oldBalance?: number | null;
    } | null;
};

export default function LoanCalculator({ selectedProduct, loanDefaults, loading = false, forceModalTerms = false }: Props) {
    const isMobile = useMediaQuery('(max-width:900px)');
    const styles = useCalculatorStyles();
    const {
        termMonths,
        setTermMonths,
        amortization,
        setAmortization,
        existingBalance,
        estimatedNetProceeds,
        monthlyPayment,
    } = useLoanCalculation(selectedProduct, loanDefaults ?? null);

    const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);
    const [showFloatingButton, setShowFloatingButton] = useState<boolean>(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const disclaimerRef = useRef<HTMLDivElement>(null);
    const [appContentElement, setAppContentElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (forceModalTerms) {
            const appContent = document.querySelector('[data-app-content="true"]') as HTMLElement;
            setAppContentElement(appContent);
        }
    }, [forceModalTerms]);

    // Handle scroll to hide/show floating button on mobile
    useEffect(() => {
        if (!isMobile || !disclaimerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowFloatingButton(!entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: '-20px',
            },
        );

        observer.observe(disclaimerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [isMobile]);

    if (loading && !selectedProduct) {
        return <LoanCalculatorSkeleton />;
    }

    return (
        <div ref={containerRef} style={{ padding: '10px', paddingBottom: isMobile ? '100px' : '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
                {/* Product Display */}
                <div>
                    <p
                        style={{
                            marginBottom: 6,
                            display: 'block',
                            textTransform: 'uppercase',
                            letterSpacing: 1.2,
                            fontSize: '0.7rem',
                            textAlign: 'center',
                            color: 'text.secondary',
                            fontWeight: 600,
                        }}
                    >
                        Product
                    </p>
                    <Input
                        type="text"
                        value={(loanDefaults?.productName || selectedProduct?.product_name || '').trim()}
                        placeholder="Select a product from the list"
                        readOnly
                        className="text-center font-bold cursor-default h-auto"
                        style={{
                            fontSize: isMobile ? '1rem' : '1.25rem',
                            padding: isMobile ? '8px 12px' : '10px 12px',
                        }}
                    />
                </div>

                {/* Term in Months */}
                <div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                        <p
                            style={{
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                margin: 0,
                            }}
                        >
                            Term in Months
                        </p>
                        {selectedProduct?.is_max_term_editable === false && (
                            <div title="• This field is disabled by admin" style={{ cursor: 'help' }}>
                                <InfoOutlinedIcon
                                    sx={{ fontSize: 14, opacity: 0.7 }}
                                />
                            </div>
                        )}
                    </div>
                    <CurrencyInput
                        value={termMonths || ''}
                        onValueChange={(val) => setTermMonths(val ? parseInt(val) : 0)}
                        placeholder="0"
                        disabled={selectedProduct?.is_max_term_editable === false}
                        decimalsLimit={0}
                        prefix=""
                        allowNegativeValue={false}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-bold text-center"
                        style={{
                            fontSize: isMobile ? '1.25rem' : '1.5rem',
                            padding: isMobile ? '8px 12px' : '10px 12px',
                        }}
                    />
                </div>

                {/* Amortization */}
                <div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                        <p
                            style={{
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                margin: 0,
                            }}
                        >
                            Amortization
                        </p>
                        {(selectedProduct?.max_amortization_formula || selectedProduct?.is_max_amortization_editable === false) && (
                            <div 
                                title={`${selectedProduct?.max_amortization_formula ? '• Formula: ' + selectedProduct.max_amortization_formula + '\n' : ''}${selectedProduct?.is_max_amortization_editable === false ? '• This field is disabled by admin' : ''}`}
                                style={{ cursor: 'help' }}
                            >
                                <InfoOutlinedIcon
                                    sx={{ fontSize: 14, opacity: 0.7 }}
                                />
                            </div>
                        )}
                    </div>
                    <CurrencyInputField
                        value={amortization || undefined}
                        onValueChange={setAmortization}
                        maxAmount={selectedProduct?.computed_result || undefined}
                        disabled={selectedProduct?.is_max_amortization_editable === false}
                    />
                    {selectedProduct &&
                        !loanDefaults &&
                        ['BASIC', 'CUSTOM'].includes(selectedProduct.max_amortization_mode) &&
                        selectedProduct.computed_result === 0 && (
                            <p style={{ fontSize: '0.75rem', color: '#ef5350', display: 'block', textAlign: 'center', marginTop: 2, margin: 0 }}>
                                Unable to calculate max amortization. Please ensure your salary record is configured.
                            </p>
                        )}
                </div>

                {/* Results Section */}
                <CalculationResultBox label="Amortization Amount" value={amortization} />
                {existingBalance > 0 && (
                    <div>
                        <p
                            style={{
                                marginBottom: 6,
                                display: 'block',
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                                fontSize: '0.7rem',
                                textAlign: 'center',
                                fontWeight: 600,
                            }}
                        >
                            Existing Balance
                        </p>
                        <div
                            style={{
                                backgroundColor: styles.cardBg,
                                borderRadius: 8,
                                padding: 10,
                                textAlign: 'center',
                                border: `2px solid ${styles.cardBorder}`,
                                opacity: 0.7,
                            }}
                        >
                            <h5
                                style={{
                                    fontVariantNumeric: 'tabular-nums',
                                    color: 'text.secondary',
                                    fontWeight: 700,
                                    margin: 0,
                                }}
                            >
                                ₱ {(existingBalance).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h5>
                        </div>
                    </div>
                )}
                <CalculationResultBox label="*Estimated Monthly Payment" value={monthlyPayment} />
                <CalculationResultBox label="*Estimated Net Proceeds" value={estimatedNetProceeds} isAccent />

                {/* Disclaimer */}
                <p
                    ref={disclaimerRef}
                    style={{
                        display: 'block',
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        lineHeight: 1.8,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        fontWeight: 600,
                        margin: 0,
                    }}
                >
                    * Subject to further delinquent balances deduction.
                    <br />
                    Estimated values may vary based on actual processing.
                </p>

                {/* Terms and Conditions - Desktop View */}
                {!isMobile && !forceModalTerms && selectedProduct?.terms && (
                    <div>
                        <p
                            style={{
                                marginBottom: 6,
                                display: 'block',
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                                fontSize: '0.7rem',
                                textAlign: 'center',
                                fontWeight: 600,
                            }}
                        >
                            Terms and Conditions
                        </p>
                        <Textarea
                            value={selectedProduct.terms}
                            readOnly
                            rows={8}
                            className="text-sm leading-relaxed"
                        />
                    </div>
                )}
            </div>

            {/* Floating Info Button */}
            {(isMobile || forceModalTerms) && selectedProduct?.terms && (
                <button
                    onClick={() => setTermsModalOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: 20,
                        right: 24,
                        width: 60,
                        height: 60,
                        color: '#fff',
                        backgroundColor: styles.accentColor,
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        zIndex: 1000,
                        opacity: showFloatingButton ? 1 : 0,
                        transform: showFloatingButton ? 'scale(1)' : 'scale(0.8)',
                        pointerEvents: showFloatingButton ? 'auto' : 'none',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e66767';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = styles.accentColor;
                    }}
                    aria-label="More information"
                >
                    <InfoOutlinedIcon sx={{ fontSize: 28 }} />
                </button>
            )}

            {/* Terms Modal */}
            {isMobile ? (
                <FullScreenModalMobile
                    open={termsModalOpen}
                    onClose={() => setTermsModalOpen(false)}
                    title={selectedProduct?.product_name ? `${selectedProduct.product_name} Terms` : 'Terms and Conditions'}
                    headerBg="#F57979"
                    bodySx={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                    titleSx={{ fontSize: '18px' }}
                    zIndex={1400}
                >
                    <Textarea
                        value={selectedProduct?.terms || 'No terms and conditions available.'}
                        readOnly
                        rows={20}
                        className="text-lg leading-relaxed"
                    />

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                        <button
                            onClick={() => setTermsModalOpen(false)}
                            style={{
                                backgroundColor: '#f57373',
                                color: '#fff',
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e66767';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f57373';
                            }}
                        >
                            <CloseIcon />
                        </button>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f57373', margin: 0 }}>
                            Close
                        </p>
                    </div>
                </FullScreenModalMobile>
            ) : forceModalTerms && appContentElement ? createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: termsModalOpen ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1300,
                    }}
                    onClick={() => setTermsModalOpen(false)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 8,
                            maxHeight: '80vh',
                            width: 'min(90vw, 600px)',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            backgroundColor: '#F57979',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 12,
                            borderRadius: '8px 8px 0 0',
                        }}>
                            <h6 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                                {selectedProduct?.product_name ? `${selectedProduct.product_name} Terms` : 'Terms and Conditions'}
                            </h6>
                            <button
                                onClick={() => setTermsModalOpen(false)}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.25rem',
                                    padding: 0,
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={{ padding: 12, overflowY: 'auto', flex: 1 }}>
                            <Textarea
                                value={selectedProduct?.terms || 'No terms and conditions available.'}
                                readOnly
                                rows={15}
                                className="text-sm leading-relaxed"
                            />
                        </div>
                    </div>
                </div>,
                appContentElement
            ) : null}
        </div>
    );
}
