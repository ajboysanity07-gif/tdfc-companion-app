import React, { useState, useMemo } from 'react';
import DataTable, { createTheme, type TableColumn } from 'react-data-table-component';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Eye, FileText, AlertCircle } from 'lucide-react';

// ✅ TYPE DEFINITIONS
interface Transaction {
  lnnumber: string;
  description: string;
  date: string | null;
  principal: number;
  raw_balance: number;
}

// ✅ FIXED: This interface is now used in the useQuery hook return type
interface TransactionDetail {
  lnnumber: string;
  reference: string;
  transactionCode: string;
  principal: number;
  payment: number;
  balance: number;
  charges: number;
  controlno: string;
}

interface AmortizationItem {
  date: string;
  payPrincipal: number;
  payInterest: number;
  amortization: number;
  balance: number;
}

interface Props {
  transactions: Transaction[];
}

// ✅ API Response Types
interface TransactionDetailsResponse {
  transaction: TransactionDetail;
}

interface AmortizationScheduleResponse {
  schedule: AmortizationItem[];
}

// Utility functions
const formatCurrency = (amount: number): string => {
  if (!Number.isFinite(amount)) return '₱0.00';
  return new Intl.NumberFormat('en-PH', { 
    style: 'currency', 
    currency: 'PHP', 
    maximumFractionDigits: 2 
  }).format(amount);
};

const formatDate = (iso: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  return date.toLocaleDateString('en-PH');
};

// ✅ REACT QUERY HOOKS with proper typing
function useTransactionDetails(lnnumber: string | null) {
  return useQuery<TransactionDetailsResponse>({
    queryKey: ['transaction-details', lnnumber],
    queryFn: async (): Promise<TransactionDetailsResponse> => {
      const response = await fetch(`/api/transactions/loan/${lnnumber}/details`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!response.ok) throw new Error('Failed to fetch transaction details');
      return response.json();
    },
    enabled: !!lnnumber,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

function useAmortizationSchedule(lnnumber: string | null) {
  return useQuery<AmortizationScheduleResponse>({
    queryKey: ['amortization-schedule', lnnumber],
    queryFn: async (): Promise<AmortizationScheduleResponse> => {
      const response = await fetch(`/api/transactions/loan/${lnnumber}/schedule`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!response.ok) throw new Error('Failed to fetch amortization schedule');
      return response.json();
    },
    enabled: !!lnnumber,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// Dark theme for DataTable
createTheme('rb-dark', {
  text: { primary: '#e5e7eb', secondary: '#cbd5e1' },
  background: { default: 'transparent' },
  context: { background: '#374151', text: '#e5e7eb' },
  divider: { default: 'rgba(120,120,120,0.25)' },
  button: { default: '#F57979', hover: '#e26d6d', focus: '#e26d6d' },
  striped: { default: 'rgba(255,255,255,0.02)', text: '#e5e7eb' },
}, 'dark');

// ✅ MAIN COMPONENT
export default function LoansTransactionPage({ transactions }: Props) {
  
  // Modal state management
  const [selectedLnNumber, setSelectedLnNumber] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'details' | 'schedule' | null>(null);

  // Smart data fetching with proper typing
  const { 
    data: transactionData, 
    isLoading: detailsLoading, 
    error: detailsError 
  } = useTransactionDetails(modalType === 'details' ? selectedLnNumber : null);

  const { 
    data: scheduleData, 
    isLoading: scheduleLoading, 
    error: scheduleError 
  } = useAmortizationSchedule(modalType === 'schedule' ? selectedLnNumber : null);

  // Modal handlers
  const openDetailsModal = (lnnumber: string) => {
    console.log('Opening transaction details for:', lnnumber);
    setSelectedLnNumber(lnnumber);
    setModalType('details');
  };

  const openScheduleModal = (lnnumber: string) => {
    console.log('Opening amortization schedule for:', lnnumber);
    setSelectedLnNumber(lnnumber);
    setModalType('schedule');
  };

  const closeModal = () => {
    setSelectedLnNumber(null);
    setModalType(null);
  };

  // Table configuration
  const columns = useMemo<TableColumn<Transaction>[]>(() => [
    {
      name: 'Date',
      selector: (row: Transaction) => formatDate(row.date),
      sortable: true,
      grow: 1,
      cell: (row: Transaction) => (
        <time className="text-sm text-gray-600 dark:text-neutral-300">
          {formatDate(row.date)}
        </time>
      ),
    },
    {
      name: 'Loan Number',
      selector: (row: Transaction) => row.lnnumber,
      sortable: true,
      grow: 1,
      cell: (row: Transaction) => (
        <span className="font-medium text-gray-800 dark:text-neutral-100">
          {row.lnnumber}
        </span>
      ),
    },
    {
      name: 'Description',
      selector: (row: Transaction) => row.description,
      sortable: true,
      grow: 2,
      cell: (row: Transaction) => (
        <span className="font-semibold text-gray-800 dark:text-neutral-100">
          {row.description}
        </span>
      ),
    },
    {
      name: 'Principal',
      selector: (row: Transaction) => row.principal,
      sortable: true,
      right: true,
      cell: (row: Transaction) => (
        <span className="font-semibold text-gray-800 dark:text-neutral-100">
          {formatCurrency(row.principal)}
        </span>
      ),
    },
    {
      name: 'Balance',
      selector: (row: Transaction) => row.raw_balance,
      sortable: true,
      right: true,
      cell: (row: Transaction) => (
        <span className="font-semibold text-gray-800 dark:text-neutral-100">
          {formatCurrency(row.raw_balance)}
        </span>
      ),
    },
    {
      name: 'Actions',
      cell: (row: Transaction) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDetailsModal(row.lnnumber)}
            className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
          >
            <Eye className="h-3 w-3" />
            Details
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => openScheduleModal(row.lnnumber)}
            className="flex items-center gap-1 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
          >
            <FileText className="h-3 w-3" />
            Schedule
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '200px',
    },
  ], []);

  // Theme detection
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const tableTheme = isDark ? 'rb-dark' : 'default';

  return (
    <AppLayout breadcrumbs={[
      { title: 'Loans', href: '/loans' },
      { title: 'Transactions', href: '/loans/transactions' }
    ]}>
      <Head title="Loan Transactions" />
      
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        {/* PAGE HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Loan Transactions
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View your loan transaction history and amortization schedules
          </p>
        </div>

        {/* MAIN TRANSACTIONS TABLE */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
            <DataTable
              columns={columns}
              data={transactions}
              striped
              highlightOnHover
              responsive
              theme={tableTheme}
              pagination
              paginationPerPage={15}
              paginationRowsPerPageOptions={[10, 15, 25, 50]}
              noDataComponent={
                <div className="py-8 text-center text-gray-500 dark:text-neutral-400">
                  No loan transactions found
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* TRANSACTION DETAILS MODAL */}
      <Modal
        isOpen={modalType === 'details'}
        onClose={closeModal}
        title="Transaction Details"
      >
        {detailsLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
            <span className="ml-2 text-gray-600">Loading transaction details...</span>
          </div>
        )}
        
        {detailsError && (
          <div className="text-center py-4 text-red-600">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>Failed to load transaction details</p>
            <button 
              onClick={() => window.location.reload()} 
              className="underline mt-2 hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {!detailsLoading && !detailsError && transactionData?.transaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loan Number
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {transactionData.transaction.lnnumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reference
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {transactionData.transaction.reference}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transaction Code
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {transactionData.transaction.transactionCode}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Principal
                </label>
                <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(transactionData.transaction.principal)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment
                </label>
                <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(transactionData.transaction.payment)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Balance
                </label>
                <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(transactionData.transaction.balance)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Charges
              </label>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(transactionData.transaction.charges)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Control Number
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {transactionData.transaction.controlno}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* AMORTIZATION SCHEDULE MODAL */}
      <Modal
        isOpen={modalType === 'schedule'}
        onClose={closeModal}
        title="Amortization Schedule"
      >
        {scheduleLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent" />
            <span className="ml-2 text-gray-600">Loading amortization schedule...</span>
          </div>
        )}

        {scheduleError && (
          <div className="text-center py-4 text-red-600">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>Failed to load amortization schedule</p>
          </div>
        )}

        {!scheduleLoading && !scheduleError && (!scheduleData?.schedule || scheduleData.schedule.length === 0) && (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No amortization schedule data available for this transaction.
            </p>
          </div>
        )}

        {!scheduleLoading && !scheduleError && scheduleData?.schedule && scheduleData.schedule.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Pay Principal
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Pay Interest
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Amortization
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {scheduleData.schedule.map((item: AmortizationItem, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white">
                      {formatDate(item.date)}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.payPrincipal)}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.payInterest)}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.amortization)}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
