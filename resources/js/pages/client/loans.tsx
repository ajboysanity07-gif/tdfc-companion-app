import MobileViewLayout from '@/components/mobile-view-layout';
import DesktopViewLayout from '@/components/desktop-view-layout';
import HeaderBlock from '@/components/management/header-block';
import BoxHeader from '@/components/box-header';
import AppLayout from '@/layouts/app-layout';
import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import LoanCalculator from '@/components/client/calculator/loan-calculator';
import { useLoanApply } from '@/hooks/use-loan-apply';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { CircleCheckBig, CircleX } from 'lucide-react';
import LoanList from '@/components/client/loans/loan-list';
import AmortschedTable from '@/components/common/amortsched-table';
import PaymentLedgerTable from '@/components/common/payment-ledger-table';
import { DesktopPanelSkeleton } from '@/components/client/loans/skeletons';
import { Calculator } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProductLntype } from '@/types/product-lntype';
import type { WlnMasterRecord, AmortschedDisplayEntry, WlnLedEntry } from '@/types/user';
import axiosClient from '@/api/axios-client';

type AuthUser = {
    acctno?: string | null;
};

type SharedPageProps = {
    auth?: { user?: AuthUser | null };
    acctno?: string | null;
};

export default function LoansPage() {
    const isMobile = useMediaQuery('(max-width:900px)');
    const { props, url } = usePage<SharedPageProps>();
    const urlMatch = url.match(/\/client\/([^/]+)/);
    const urlAcctno = urlMatch ? urlMatch[1] : '';
    const customerAcct = props.acctno ?? props.auth?.user?.acctno ?? urlAcctno ?? '';
    const calculatorHref = customerAcct ? `/client/${customerAcct}/loan-calculator` : '/loan-calculator';
    const actionButtonRef = useRef<HTMLAnchorElement | null>(null);
    const [hideFloatingAction, setHideFloatingAction] = useState(false);
    const { products, loading: productsLoading, fetchProducts } = useLoanApply();
    const [selectedProduct, setSelectedProduct] = useState<ProductLntype | null>(null);
    const [selectedLoan, setSelectedLoan] = useState<WlnMasterRecord | null>(null);
    const [calculatorModalOpen, setCalculatorModalOpen] = useState(false);
    
    // Desktop-only states for right panel
    const [activeView, setActiveView] = useState<'schedule' | 'ledger' | 'calculator' | null>(null);
    const [activeLoan, setActiveLoan] = useState<WlnMasterRecord | null>(null);
    const [amortschedRows, setAmortschedRows] = useState<AmortschedDisplayEntry[]>([]);
    const [amortschedLoading, setAmortschedLoading] = useState(false);
    const [ledgerRows, setLedgerRows] = useState<WlnLedEntry[]>([]);
    const [ledgerLoading, setLedgerLoading] = useState(false);
    const globalLoading = amortschedLoading || ledgerLoading || productsLoading;
    const successMessage = null;
    const errorMessage = null;

    const header = <HeaderBlock title="Your Loan Applications" subtitle="View and manage your loan applications" />;
    
    // Fetch amortization schedule for desktop
    const fetchAmortsched = async (lnnumber: string) => {
        setAmortschedLoading(true);
        try {
            const response = await axiosClient.get(`/loans/${lnnumber}/amortization`);
            setAmortschedRows(response.data.schedule || []);
        } catch (err: unknown) {
            if (import.meta.env.DEV && err instanceof Error) {
                console.error('[Loans] Failed to fetch amortization schedule:', err.message);
            }
            setAmortschedRows([]);
        } finally {
            setAmortschedLoading(false);
        }
    };

    // Fetch ledger for desktop
    const fetchWlnLed = async (lnnumber: string) => {
        setLedgerLoading(true);
        try {
            const response = await axiosClient.get(`/loans/${lnnumber}/ledger`);
            setLedgerRows(response.data.ledger || []);
        } catch (err: unknown) {
            if (import.meta.env.DEV && err instanceof Error) {
                console.error('[Loans] Failed to fetch ledger:', err.message);
            }
            setLedgerRows([]);
        } finally {
            setLedgerLoading(false);
        }
    };

    // Desktop handlers
    const handleScheduleClick = (loan: WlnMasterRecord) => {
        if (!isMobile) {
            setActiveLoan(loan);
            setActiveView('schedule');
            if (loan.lnnumber) {
                fetchAmortsched(loan.lnnumber);
            }
        }
    };

    const handleLedgerClick = (loan: WlnMasterRecord) => {
        if (!isMobile) {
            setActiveLoan(loan);
            setActiveView('ledger');
            if (loan.lnnumber) {
                fetchWlnLed(loan.lnnumber);
            }
        }
    };

    const refreshSchedule = () => {
        if (activeLoan?.lnnumber) {
            fetchAmortsched(activeLoan.lnnumber);
        }
    };

    // Floating action button overlap detection for mobile
    useEffect(() => {
        if (!isMobile || typeof window === 'undefined') {
            setHideFloatingAction(false);
            return;
        }

        let rafId = 0;
        const checkOverlap = () => {
            const buttonEl: HTMLElement | null =
                actionButtonRef.current ?? document.querySelector<HTMLElement>('[data-new-transaction]');
            if (!buttonEl) return;
            const buttonRect = buttonEl.getBoundingClientRect();
            const targets = document.querySelectorAll<HTMLElement>('[data-loan-action]');
            let overlapping = false;

            targets.forEach((target) => {
                const rect = target.getBoundingClientRect();
                const intersects =
                    rect.right >= buttonRect.left &&
                    rect.left <= buttonRect.right &&
                    rect.bottom >= buttonRect.top &&
                    rect.top <= buttonRect.bottom;
                if (intersects) {
                    overlapping = true;
                }
            });

            setHideFloatingAction(overlapping);
        };

        const scheduleCheck = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            rafId = window.requestAnimationFrame(checkOverlap);
        };

        scheduleCheck();
        window.addEventListener('scroll', scheduleCheck, { passive: true });
        window.addEventListener('resize', scheduleCheck);

        const appContent = document.querySelector<HTMLElement>('[data-app-content="true"]');
        appContent?.addEventListener('scroll', scheduleCheck, { passive: true });

        const listEl = document.querySelector<HTMLElement>('[data-loan-list]');
        const observer = listEl ? new MutationObserver(scheduleCheck) : null;
        if (listEl && observer) {
            observer.observe(listEl, { childList: true, subtree: true, attributes: true });
        }

        return () => {
            window.removeEventListener('scroll', scheduleCheck);
            window.removeEventListener('resize', scheduleCheck);
            appContent?.removeEventListener('scroll', scheduleCheck);
            observer?.disconnect();
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [isMobile]);

    // Fetch products when calculator opens (mobile modal or desktop panel)
    useEffect(() => {
        const isCalculatorOpen = calculatorModalOpen || activeView === 'calculator';
        if (!isCalculatorOpen) return;
        if (!products.length && !productsLoading) {
            if (import.meta.env.DEV) {
                console.log('[Loans] Fetching products (including hidden)');
            }
            // Fetch all products including hidden ones for loan renewal
            fetchProducts(true);
        }
    }, [calculatorModalOpen, activeView, products.length, productsLoading, fetchProducts]);

    const toNumber = (value: unknown) => {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        if (typeof value === 'string') {
            // Trim whitespace and remove commas
            const cleaned = value.trim().replace(/,/g, '');
            if (cleaned === '') return null;
            const num = Number(cleaned);
            return Number.isFinite(num) ? num : null;
        }
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    };

    // Find and select matching product when loan is selected
    useEffect(() => {
        const isCalculatorOpen = calculatorModalOpen || activeView === 'calculator';
        if (!isCalculatorOpen || !products.length) return;
        
        if (import.meta.env.DEV) {
            console.log('[Loans] Calculator data setup - Products:', products.length, 'Loan:', selectedLoan);
        }
        
        // If we have a loan with typecode, find matching product
        if (selectedLoan?.typecode) {
            const matchingProduct = products.find(p => 
                p.tags?.some(tag => tag.typecode === selectedLoan.typecode) ||
                p.types?.some(type => type.typecode === selectedLoan.typecode)
            );
            
            if (matchingProduct) {
                if (import.meta.env.DEV) {
                    console.log('[Loans] Matching product found:', matchingProduct.product_name);
                }
                
                // Use the backend's computed_result which is already calculated based on user's salary
                if (matchingProduct.max_amortization_formula) {
                    // The backend already calculates computed_result based on the user's salary
                    // We should use that value directly for loan renewal
                    let finalComputed: number;
                    
                    if (matchingProduct.computed_result != null && matchingProduct.computed_result > 0) {
                        // Use the backend's computed result (already calculated with user's salary)
                        finalComputed = matchingProduct.computed_result;
                    } else if (matchingProduct.max_amortization && matchingProduct.max_amortization > 0) {
                        finalComputed = matchingProduct.max_amortization;
                    } else {
                        // No valid computed result - this means salary is not configured
                        finalComputed = 0;
                        if (import.meta.env.DEV) {
                            console.warn('[Loans] No valid amortization - salary likely not configured');
                        }
                    }
                    
                    // For renewals: deduct principal from computed result only if balance > 0
                    const balance = toNumber(selectedLoan.balance);
                    const principal = toNumber(selectedLoan.principal);
                    
                    let finalAmortization = finalComputed;
                    if (balance !== null && balance > 0 && principal !== null) {
                        // Balance is still outstanding, deduct principal
                        finalAmortization = Math.max(0, finalComputed - principal);
                    }
                    // If balance = 0, don't deduct anything
                    
                    if (import.meta.env.DEV) {
                        console.log('[Loans] Renewal calculation:');
                        console.log('  - Computed result:', finalComputed);
                        console.log('  - Balance:', balance);
                        console.log('  - Principal:', principal);
                        console.log('  - Final amortization:', finalAmortization);
                    }
                    
                    const productWithComputed = {
                        ...matchingProduct,
                        computed_result: finalAmortization,
                    };
                    setSelectedProduct(productWithComputed);
                } else {
                    // If no formula, use the backend's computed_result or max_amortization
                    let amountToUse = matchingProduct.computed_result || matchingProduct.max_amortization || 0;
                    
                    // For renewals: deduct principal only if balance > 0
                    const balance = toNumber(selectedLoan.balance);
                    const principal = toNumber(selectedLoan.principal);
                    
                    if (balance !== null && balance > 0 && principal !== null) {
                        // Balance is still outstanding, deduct principal
                        amountToUse = Math.max(0, amountToUse - principal);
                    }
                    // If balance = 0, don't deduct anything
                    
                    if (import.meta.env.DEV) {
                        console.log('[Loans] Renewal calculation (no formula):');
                        console.log('  - Base amount:', matchingProduct.computed_result || matchingProduct.max_amortization);
                        console.log('  - Balance:', balance);
                        console.log('  - Principal:', principal);
                        console.log('  - Final amount:', amountToUse);
                    }
                    
                    setSelectedProduct({
                        ...matchingProduct,
                        computed_result: amountToUse,
                    });
                }
                return;
            } else if (import.meta.env.DEV) {
                console.warn('[Loans] No matching product found for typecode:', selectedLoan.typecode);
            }
        }
        
        // Fallback: if no product selected and no loan, select first product
        if (!selectedProduct && !selectedLoan && products.length > 0) {
            if (import.meta.env.DEV) {
                console.log('[Loans] No loan selected, using first product');
            }
            setSelectedProduct(products[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calculatorModalOpen, activeView, products, selectedLoan]);

    const handleOpenCalculator = (loan: WlnMasterRecord) => {
        setSelectedLoan(loan);
        if (isMobile) {
            setCalculatorModalOpen(true);
        } else {
            // Desktop: show in right panel
            setActiveLoan(loan);
            setActiveView('calculator');
        }
    };

    const handleCloseCalculator = () => {
        setCalculatorModalOpen(false);
        setSelectedProduct(null);
        setSelectedLoan(null);
    };

    const isActionHidden = hideFloatingAction || calculatorModalOpen;

    const loanDefaults = useMemo(() => {
        if (!selectedLoan) return null;
        
        console.log('=== Creating loanDefaults ===');
        console.log('selectedLoan:', selectedLoan);
        
        const termMonths = toNumber(selectedLoan.term_mons);
        const existingBalance = toNumber(selectedLoan.balance);
        
        console.log('Extracted values:');
        console.log('  - productName (remarks):', selectedLoan.remarks);
        console.log('  - typecode:', selectedLoan.typecode);
        console.log('  - termMonths (term_mons):', selectedLoan.term_mons, '→', termMonths);
        console.log('  - existingBalance (balance):', selectedLoan.balance, '→', existingBalance);
        
        return {
            productName: selectedLoan.remarks ?? null,
            typecode: selectedLoan.typecode ?? null,
            termMonths,
            existingBalance,
            // DO NOT include amortization from wlnmaster
            // The computed_result from formula evaluation should be used instead
        };
    }, [selectedLoan]);

    // Floating action button for mobile
    const actionButton = isMobile ? (
        <Box
            sx={{
                position: 'fixed',
                bottom: 88,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: (theme) => Math.max(theme.zIndex.modal, 3000) + 60,
                px: 2,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none',
                opacity: isActionHidden ? 0 : 1,
                visibility: isActionHidden ? 'hidden' : 'visible',
                transition: 'opacity 160ms ease',
            }}
        >
            <Button
                component={Link}
                href={calculatorHref}
                variant="contained"
                startIcon={<Calculator size={18} />}
                ref={actionButtonRef}
                data-new-transaction
                sx={{
                    pointerEvents: 'auto',
                    bgcolor: '#F57979',
                    color: '#fff',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 999,
                    px: 4,
                    py: 1.35,
                    minWidth: 220,
                    boxShadow: 'none',
                    animation: isActionHidden ? 'none' : 'new-transaction-float 2.6s ease-in-out infinite',
                    '@keyframes new-transaction-float': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-3px)' },
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                        animation: 'none',
                    },
                    '&:hover': { bgcolor: '#e14e4e' },
                }}
            >
                New Transaction
            </Button>
        </Box>
    ) : null;

    const content = (
        <LoanList 
            onOpenCalculator={handleOpenCalculator} 
            onScheduleClick={isMobile ? undefined : handleScheduleClick}
            onLedgerClick={isMobile ? undefined : handleLedgerClick}
            desktopMode={!isMobile}
        />
    );

    const leftPanel = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {content}
        </Box>
    );

    const rightPanel = !activeView ? (
        <DesktopPanelSkeleton showMessage={true} />
    ) : activeView === 'schedule' && amortschedLoading ? (
        <DesktopPanelSkeleton showMessage={false} />
    ) : activeView === 'ledger' && ledgerLoading ? (
        <DesktopPanelSkeleton showMessage={false} />
    ) : activeView === 'calculator' ? (
        <Box sx={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <BoxHeader
                title="Loan Calculator"
                subtitle="Renew your loan application"
            />
            <Box sx={{ flex: 1, p: 3 }}>
                <LoanCalculator 
                    selectedProduct={selectedProduct} 
                    loading={productsLoading} 
                    loanDefaults={loanDefaults}
                    forceModalTerms={true}
                />
            </Box>
        </Box>
    ) : (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
            {activeView === 'schedule' ? (
                <AmortschedTable 
                    rows={amortschedRows} 
                    loading={amortschedLoading} 
                    onRefresh={refreshSchedule}
                    exportMeta={{
                        clientName: customerAcct,
                        lnnumber: activeLoan?.lnnumber ?? null,
                        remarks: activeLoan?.remarks ?? null,
                        lastPaymentDate: activeLoan?.date_end ?? null,
                    }}
                />
            ) : (
                <PaymentLedgerTable 
                    rows={ledgerRows} 
                    loading={ledgerLoading}
                    exportMeta={{
                        clientName: customerAcct,
                        lnnumber: activeLoan?.lnnumber ?? null,
                        remarks: activeLoan?.remarks ?? null,
                        lastPaymentDate: activeLoan?.date_end ?? null,
                    }}
                />
            )}
        </Box>
    );

    if (isMobile) {
        return (
            <AppLayout>
                <Head title="Your Loan Applications" />
                {globalLoading ? <LinearProgress color="primary" sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 60 }} /> : null}
                <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
                    <Slide in={!!successMessage} direction="down" mountOnEnter unmountOnExit>
                        <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30">
                            <CircleCheckBig className="h-4 w-4" />
                            <span>{successMessage}</span>
                        </div>
                    </Slide>
                    <Slide in={!!globalLoading} direction="down" mountOnEnter unmountOnExit>
                        <div className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/30">
                            Loading...
                        </div>
                    </Slide>
                    <Slide in={!!errorMessage && !globalLoading} direction="down" mountOnEnter unmountOnExit>
                        <div className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30">
                            <CircleX className="h-4 w-4" />
                            <span>{errorMessage}</span>
                        </div>
                    </Slide>
                </div>
                {header}
                {actionButton}
                <MobileViewLayout>
                    {content}
                </MobileViewLayout>
                <FullScreenModalMobile
                    open={calculatorModalOpen}
                    onClose={handleCloseCalculator}
                    title="Loan Calculator"
                    headerBg="#F57979"
                    bodySx={{ p: 3 }}
                    zIndex={1300}
                    titleSx={{ fontSize: { xs: 20, sm: 24 } }}
                    bodyClassName="calculator-modal-open"
                >
                    <LoanCalculator selectedProduct={selectedProduct} loading={productsLoading} loanDefaults={loanDefaults} />
                </FullScreenModalMobile>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Your Loan Applications" />
            {globalLoading ? <LinearProgress color="primary" sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 60 }} /> : null}
            <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
                <Slide in={!!successMessage} direction="down" mountOnEnter unmountOnExit>
                    <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30">
                        <CircleCheckBig className="h-4 w-4" />
                        <span>{successMessage}</span>
                    </div>
                </Slide>
                <Slide in={!!globalLoading} direction="down" mountOnEnter unmountOnExit>
                    <div className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/30">
                        Loading...
                    </div>
                </Slide>
                <Slide in={!!errorMessage && !globalLoading} direction="down" mountOnEnter unmountOnExit>
                    <div className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30">
                        <CircleX className="h-4 w-4" />
                        <span>{errorMessage}</span>
                    </div>
                </Slide>
            </div>
            {header}
            <DesktopViewLayout
                left={leftPanel}
                right={rightPanel}
                stackProps={{ spacing: 3, alignItems: 'stretch' }}
                leftSx={{ 
                    flex: '0 0 30%',
                    minWidth: 350,
                    maxWidth: 500,
                    p: 3,
                    overflowY: 'auto',
                }}
                rightSx={{ 
                    flex: '1',
                    p: 3,
                }}
                wrapperSx={{
                    p: 2,
                    gap: 2,
                }}
            />
        </AppLayout>
    );
}
