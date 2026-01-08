import MobileViewLayout from '@/components/mobile-view-layout';
import DesktopViewLayout from '@/components/desktop-view-layout';
import HeaderBlock from '@/components/management/header-block';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Box, useMediaQuery } from '@mui/material';
import LoanList from '@/components/client/loans/loan-list';
import BoxHeader from '@/components/box-header';

export default function LoansPage() {
    const isMobile = useMediaQuery('(max-width:900px)');

    const header = <HeaderBlock title="Your Loan Applications" subtitle="View and manage your loan applications" />;

    const content = (
        <Box>
            <BoxHeader title="Active Loans" />
            <LoanList />
        </Box>
    );

    if (isMobile) {
        return (
            <AppLayout>
                <Head title="Your Loan Applications" />
                {header}
                <MobileViewLayout>
                    {content}
                </MobileViewLayout>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Your Loan Applications" />
            {header}
            <DesktopViewLayout
                left={content}
                right={<Box />}
            />
        </AppLayout>
    );
}
