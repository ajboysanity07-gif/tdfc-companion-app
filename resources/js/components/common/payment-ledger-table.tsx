import type { WlnLedEntry } from '@/types/user';
import { useMyTheme } from '@/hooks/use-mytheme';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SimCardDownloadOutlinedIcon from '@mui/icons-material/SimCardDownloadOutlined';
import { Box, IconButton, Skeleton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Printer, RefreshCw, Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type Props = {
    title?: string;
    rows: WlnLedEntry[];
    loading?: boolean;
    onRefresh?: () => void;
    exportMeta?: {
        clientName?: string | null;
        lnnumber?: string | null;
        remarks?: string | null;
        lastPaymentDate?: string | null;
    };
};

type GridRow = {
    id: number;
    date_in: string;
    mreference: string | null;
    lntype: string | null;
    transaction_code: string | null;
    principal: number | null;
    payments: number | null;
    debit: number | null;
    credit: number | null;
    balance: number | null;
    accruedint: number | null;
};

const formatDate = (value: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    // Numeric format to keep rows compact
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
};

const parseAmount = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    const cleaned = Number(String(value).replace(/,/g, ''));
    if (!Number.isFinite(cleaned)) return null;
    return cleaned;
};

const formatCurrency = (value: number | string | null) => {
    const numeric = parseAmount(value);
    if (numeric === null) return value != null && value !== '' ? String(value) : '';
    return new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numeric);
};

const resolveTransactionCode = (record: Record<string, unknown>): string | null => {
    const value = record.transaction_code ?? record.cs_ck ?? record.csck;
    if (value === null || value === undefined || value === '') return null;
    return String(value);
};

const PaymentLedgerTable: React.FC<Props> = ({ title = 'Payment Ledger', rows, loading = false, onRefresh, exportMeta }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [actionsOpen, setActionsOpen] = useState(false);
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');

    const generatedOn = useMemo(
        () => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
        [],
    );

    useEffect(() => {
        // Place any side effects here if needed in the future
        return () => {
        };
    }, []);

    const resolveLogoSrc = async (): Promise<string> => {
        if (logoDataUrl) return logoDataUrl;
        try {
            const res = await fetch('/images/logo.png');
            if (!res.ok) throw new Error('Logo fetch failed');
            const blob = await res.blob();
            const dataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : `${window.location.origin}/images/logo.png`);
                reader.readAsDataURL(blob);
            });
            setLogoDataUrl(dataUrl);
            return dataUrl;
        } catch {
            return `${window.location.origin}/images/logo.png`;
        }
    };

    const preparedRows: GridRow[] = useMemo(() => {
        const list = Array.isArray(rows) ? rows : [];
        return list.map((row, idx) => {
            const record = row as unknown as Record<string, unknown>;
            return {
                id: idx + 1,
                date_in: row?.date_in ?? '',
                mreference: row?.mreference ?? null,
                lntype: row?.lntype ?? null,
                transaction_code: resolveTransactionCode(record),
                principal: row?.principal ?? null,
                payments: row?.payments ?? null,
                debit: row?.debit ?? null,
                credit: row?.credit ?? null,
                balance: row?.balance ?? null,
                accruedint: row?.accruedint ?? null,
            };
        });
    }, [rows]);

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return preparedRows;
        const term = searchTerm.toLowerCase();
        return preparedRows.filter((row) => {
            const values = [
                row.date_in ? formatDate(row.date_in) : '',
                row.mreference ?? '',
                row.lntype ?? '',
                row.transaction_code ?? '',
            ];
            return values.some((val) => String(val).toLowerCase().includes(term));
        });
    }, [preparedRows, searchTerm]);

    const meta = useMemo(
        () => ({
            client: exportMeta?.clientName ?? '',
            lnnumber: exportMeta?.lnnumber ?? '',
            remarks: exportMeta?.remarks ?? '',
            lastPayment: exportMeta?.lastPaymentDate ? formatDate(exportMeta.lastPaymentDate) : '',
        }),
        [exportMeta],
    );

    const columns = useMemo<GridColDef<GridRow>[]>(
        () => [
            {
                field: 'date_in',
                headerName: 'Date',
                flex: 1,
                minWidth: isMobile ? 80 : 110,
                valueFormatter: ({ value }) => formatDate((value as string | null) ?? null),
                renderCell: ({ value }) => (
                    <span style={{ color: tw.isDark ? '#e5e7eb' : '#111827', fontWeight: 600 }}>{formatDate((value as string | null) ?? null) || '-'}</span>
                ),
            },
            {
                field: 'principal',
                headerName: 'Principal',
                flex: 1,
                minWidth: isMobile ? 80 : 110,
                renderCell: ({ value }) => (
                    <span style={{ color: tw.isDark ? '#e5e7eb' : '#111827', fontWeight: 600 }}>
                        {formatCurrency((value as number | string | null) ?? null) || '-'}
                    </span>
                ),
            },
            {
                field: 'payments',
                headerName: 'Payments',
                flex: 1,
                minWidth: isMobile ? 80 : 110,
                renderCell: ({ value }) => (
                    <span style={{ color: tw.isDark ? '#e5e7eb' : '#111827', fontWeight: 600 }}>
                        {formatCurrency((value as number | string | null) ?? null) || '-'}
                    </span>
                ),
            },
            {
                field: 'transaction_code',
                headerName: 'CS/CK',
                flex: 0.6,
                minWidth: isMobile ? 50 : 90,
                renderCell: ({ value }) => <span style={{ color: tw.isDark ? '#d1d5db' : '#374151' }}>{(value as string | null) || '-'}</span>,
            },
            {
                field: 'balance',
                headerName: 'Balance',
                flex: 1,
                minWidth: isMobile ? 90 : 120,
                renderCell: ({ value }) => (
                    <span style={{ color: tw.isDark ? '#e5e7eb' : '#111827', fontWeight: 700 }}>
                        {formatCurrency((value as number | string | null) ?? null) || '-'}
                    </span>
                ),
            },
        ],
        [isMobile, tw.isDark],
    );

    const sortedRows = useMemo(() => {
        return [...preparedRows].sort((a, b) => {
            const da = a.date_in ? new Date(a.date_in).getTime() : 0;
            const db = b.date_in ? new Date(b.date_in).getTime() : 0;
            return db - da;
        });
    }, [preparedRows]);

    const handleExportCsv = () => {
        const header = ['Date', 'Principal', 'Payments', 'CS/CK', 'Balance'];
        const data = sortedRows.map((row) => [
            formatDate(row.date_in),
            formatCurrency(row.principal),
            formatCurrency(row.payments),
            row.transaction_code ?? '',
            formatCurrency(row.balance),
        ]);
        const infoBlock = [
            ['Triple Diamond Finance Cooperative'],
            ['San Francisco, Agusan del Sur.'],
            [],
            [title],
            [`Generated on: ${generatedOn}`],
            [],
            ['Remarks', meta.remarks],
            ['Client Name', meta.client],
            ['Loan Number', meta.lnnumber],
            ['Last Payment', meta.lastPayment],
        ];
        const csv = [...infoBlock, header, ...data]
            .map((line) => line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payment_ledger${meta.lnnumber ? `_${meta.lnnumber}` : ''}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportExcel = async () => {
        try {
            const ExcelJS = await import('exceljs');
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Ledger');

            worksheet.columns = [
                { key: 'date', width: 18 },
                { key: 'ref', width: 24 },
                { key: 'type', width: 18 },
                { key: 'code', width: 14 },
                { key: 'principal', width: 16 },
                { key: 'payments', width: 16 },
                { key: 'debit', width: 14 },
                { key: 'credit', width: 14 },
                { key: 'balance', width: 16 },
                { key: 'accruedint', width: 16 },
            ];

            worksheet.pageSetup = {
                paperSize: 5, // Legal
                margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.25, footer: 0.25 },
            };

            worksheet.addRow(['Triple Diamond Finance Cooperative']);
            worksheet.addRow(['San Francisco, Agusan del Sur.']);
            worksheet.addRow([]);
            worksheet.addRow([title]);
            worksheet.addRow([`Generated on: ${generatedOn}`]);
            worksheet.addRow([]);
            worksheet.addRow(['Remarks', meta.remarks]);
            worksheet.addRow(['Client Name', meta.client]);
            worksheet.addRow(['Loan Number', meta.lnnumber]);
            worksheet.addRow(['Last Payment', meta.lastPayment]);
            worksheet.addRow([]);

            const headerRow = worksheet.addRow(['Date', 'Reference', 'Type', 'CS/CK', 'Principal', 'Payments', 'Debit', 'Credit', 'Balance', 'Accrued Int']);
            headerRow.font = { bold: true, size: 9 };

            sortedRows.forEach((row) => {
                const dataRow = worksheet.addRow([
                    row.date_in ? new Date(row.date_in) : '',
                    row.mreference ?? '',
                    row.lntype ?? '',
                    row.transaction_code ?? '',
                    parseAmount(row.principal),
                    parseAmount(row.payments),
                    parseAmount(row.debit),
                    parseAmount(row.credit),
                    parseAmount(row.balance),
                    parseAmount(row.accruedint),
                ]);
                dataRow.eachCell((cell) => {
                    cell.font = { size: 8.5 };
                });
            });

            worksheet.eachRow((r, idx) => {
                r.eachCell((cell, col) => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    if (col === 1 && idx > 6 && cell.value) {
                        cell.numFmt = 'mm/dd/yyyy';
                    }
                    if (col > 4 && idx > 6 && typeof cell.value === 'number') {
                        cell.numFmt = '#,##0.00';
                    }
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `payment_ledger${meta.lnnumber ? `_${meta.lnnumber}` : ''}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Excel export failed', error);
        }
    };

    const handleExportPdf = async () => {
        try {
            const logoUrl = await resolveLogoSrc();
            const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'legal' });
            const margin = 36.1; // 12.7mm margin across exports/print
            let y = margin;

            if (logoUrl) {
                try {
                    const logoSize = 44;
                    const textX = margin + logoSize + 12; // match print preview spacing
                    doc.addImage(logoUrl, 'PNG', margin, y, logoSize, logoSize);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(11.5);
                    doc.setTextColor(0, 0, 0);
                    doc.text('Triple Diamond Finance Cooperative', textX, y + 15);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10.5);
                    doc.setTextColor(90, 90, 90);
                    doc.text('San Francisco, Agusan del Sur.', textX, y + 30);
                    y += logoSize + 14;
                } catch {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(11.5);
                    doc.setTextColor(0, 0, 0);
                    doc.text('Triple Diamond Finance Cooperative', margin, y + 12);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10.5);
                    doc.setTextColor(90, 90, 90);
                    doc.text('San Francisco, Agusan del Sur.', margin, y + 28);
                    y += 56;
                }
            } else {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11.5);
                doc.setTextColor(0, 0, 0);
                doc.text('Triple Diamond Finance Cooperative', margin, y + 12);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10.5);
                doc.setTextColor(90, 90, 90);
                doc.text('San Francisco, Agusan del Sur.', margin, y + 28);
                y += 56;
            }

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(17);
            doc.text(title, margin, y + 11);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Generated on: ${generatedOn}`, margin, y + 28);
            y += 50;

            const details = {
                client: meta.client || '-',
                lnnumber: meta.lnnumber || '-',
                remarks: meta.remarks || '',
                lastPayment: meta.lastPayment || '-',
            };

            const metaLines = [
                details.remarks ? { label: '', value: details.remarks, bold: true } : null,
                { label: 'Loan Number:', value: details.lnnumber },
                { label: 'Client Name:', value: details.client },
                { label: 'Last Payment:', value: details.lastPayment },
            ].filter(Boolean) as Array<{ label: string; value: string; bold?: boolean }>;

            metaLines.forEach((line, idx) => {
                const lineY = y + idx * 17;
                if (line.label) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0);
                    doc.text(line.label, margin, lineY);
                    doc.setFont('helvetica', 'normal');
                    doc.text(String(line.value), margin + 105, lineY);
                } else if (line.value) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(line.bold ? 11.5 : 10);
                    doc.setTextColor(0, 0, 0);
                    doc.text(String(line.value), margin, lineY);
                }
            });

            const tableStartY = y + metaLines.length * 17 + 16;
            const head = [['Date', 'Principal', 'Payments', 'CS/CK', 'Balance']];
            const body = sortedRows.map((row) => [
                formatDate(row.date_in),
                formatCurrency(row.principal),
                formatCurrency(row.payments),
                row.transaction_code ?? '',
                formatCurrency(row.balance),
            ]);

            autoTable(doc, {
                head,
                body,
                startY: tableStartY,
                margin: { left: margin, right: margin },
                styles: {
                    font: 'helvetica',
                    fontSize: 8.5,
                    halign: 'center',
                    textColor: [0, 0, 0],
                    lineColor: [217, 217, 217],
                    lineWidth: 0.35,
                },
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    fontSize: 9,
                    lineColor: [217, 217, 217],
                    lineWidth: 0.45,
                },
                alternateRowStyles: {
                    fillColor: [255, 255, 255],
                },
                columnStyles: {
                    0: { halign: 'center' },
                    1: { halign: 'center' },
                    2: { halign: 'center' },
                    3: { halign: 'center' },
                    4: { halign: 'center' },
                    5: { halign: 'center' },
                    6: { halign: 'center' },
                    7: { halign: 'center' },
                    8: { halign: 'center' },
                    9: { halign: 'center' },
                },
            });

            const finalY = (doc as typeof doc & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? tableStartY;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(102, 102, 102);
            doc.text('This data is generated by the TDFC Companion app.', margin, finalY + 18);

            doc.save(`payment_ledger${meta.lnnumber ? `_${meta.lnnumber}` : ''}.pdf`);
        } catch (err) {
            console.error('PDF export failed', err);
        }
    };

    const buildPrintableBody = (logoUrl: string) => {
        const rowsHtml = sortedRows
            .map((row) => {
                return `
                    <tr>
                        <td class="cell">${formatDate(row.date_in) || '-'}</td>
                        <td class="cell">${row.mreference ?? ''}</td>
                        <td class="cell type-cell">${row.lntype ?? ''}</td>
                        <td class="cell">${row.transaction_code ?? ''}</td>
                        <td class="cell">${formatCurrency(row.principal)}</td>
                        <td class="cell">${formatCurrency(row.payments)}</td>
                        <td class="cell">${formatCurrency(row.debit)}</td>
                        <td class="cell">${formatCurrency(row.credit)}</td>
                        <td class="cell">${formatCurrency(row.balance)}</td>
                        <td class="cell">${formatCurrency(row.accruedint)}</td>
                    </tr>`;
            })
            .join('');

        return `
            <div style="font-family: Arial, sans-serif; padding: 16px; color: #111827; width: 100%; box-sizing: border-box;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
                    <img id="print-logo" src="${logoUrl}" alt="Logo" style="height: 44px;" />
                    <div>
                        <div style="font-weight:700; font-size:11.5px;">Triple Diamond Finance Cooperative</div>
                        <div style="color:#555; font-size:10.5px;">San Francisco, Agusan del Sur.</div>
                    </div>
                </div>
                <h2 style="margin: 10px 0 4px; font-size:17px;">${title}</h2>
                <div style="font-size: 10px; color: #444; margin: 0 0 10px;">Generated on: ${generatedOn}</div>
                <div style="margin: 0 0 12px; font-size: 10px;">
                    ${meta.remarks ? `<div style="font-weight:700; font-size:11.5px; margin: 0 0 4px;">${meta.remarks}</div>` : ''}
                    <div style="margin: 2px 0;"><strong>Loan Number:</strong> ${meta.lnnumber || '-'}</div>
                    <div style="margin: 2px 0;"><strong>Client Name:</strong> ${meta.client || '-'}</div>
                    <div style="margin: 2px 0;"><strong>Last Payment:</strong> ${meta.lastPayment || '-'}</div>
                </div>
                <table class="ledger-table">
                    <thead>
                        <tr>
                            <th class="header">Date</th>
                            <th class="header">Reference</th>
                            <th class="header">Type</th>
                            <th class="header">CS/CK</th>
                            <th class="header">Principal</th>
                            <th class="header">Payments</th>
                            <th class="header">Debit</th>
                            <th class="header">Credit</th>
                            <th class="header">Balance</th>
                            <th class="header">Accrued Int</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                <p style="margin-top:16px; font-size:12px; color:#666;">This data is generated by the TDFC Companion app.</p>
            </div>
        `;
    };

    const buildPrintableHtml = (logoUrl: string) => `
        <html>
            <head>
                <title>${title}</title>
                <style>
                    @page { size: legal; margin: 12.7mm; }
                    body { margin: 0; padding: 0; }
                    table.ledger-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
                    table.ledger-table th.header { padding: 8px 10px; text-align: center; background: #ffffff; border: 1px solid #d9d9d9; font-weight: 700; font-size: 9px; }
                    table.ledger-table td.cell { padding: 7px 10px; text-align: center; border: 1px solid #d9d9d9; color: #111827; font-size: 8.5px; }
                    table.ledger-table td.type-cell { font-size: 8.5px; }
                </style>
            </head>
            <body>
                ${buildPrintableBody(logoUrl)}
                <script>
                    (function() {
                        const finish = () => {
                            window.focus();
                            window.print();
                            window.close();
                        };
                        const img = document.getElementById('print-logo');
                        if (img && !img.complete) {
                            img.onload = finish;
                            img.onerror = finish;
                        } else {
                            finish();
                        }
                    })();
                </script>
            </body>
        </html>
    `;

    const openPrintable = async () => {
        const logoUrl = await resolveLogoSrc();
        const win = window.open('', '_blank', 'width=1200,height=900');
        if (!win) return;
        win.document.open();
        win.document.write(buildPrintableHtml(logoUrl));
        win.document.close();
    };

    const handlePrint = () => void openPrintable();

    const skeletonRows = isMobile ? 6 : 12;

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 3,
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.08)',
            }}
            className={!tw.isDark ? 'border-black/8' : ''}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={800}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Filter or refresh this payment ledger.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center" width={{ xs: '100%', sm: 'auto' }}>
                    <TextField
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search ledger"
                        InputProps={{
                            startAdornment: (
                                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                            <Search size={16} />
                        </Box>
                    ),
                }}
                sx={{ minWidth: { xs: '100%', sm: 220 } }}
            />
                    {!isMobile ? (
                        <>
                            <Tooltip title="Refresh">
                                <span>
                                    <IconButton onClick={onRefresh} disabled={!onRefresh}>
                                        <RefreshCw size={18} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Print">
                                <IconButton onClick={handlePrint}>
                                    <Printer size={18} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export CSV">
                                <IconButton onClick={handleExportCsv}>
                                    <ListAltOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export Excel">
                                <IconButton onClick={handleExportExcel}>
                                    <SimCardDownloadOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export PDF">
                                <IconButton onClick={handleExportPdf}>
                                    <PictureAsPdfOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : null}
                </Stack>
            </Stack>

            {isMobile ? (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 20,
                        right: 18,
                        zIndex: 1700,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        pointerEvents: 'none',
                    }}
                >
                    <Stack
                        spacing={1}
                        sx={{
                            opacity: actionsOpen ? 1 : 0,
                            transform: actionsOpen ? 'translateY(0)' : 'translateY(14px)',
                            transition: 'opacity 140ms ease, transform 180ms ease',
                            pointerEvents: actionsOpen ? 'auto' : 'none',
                            alignItems: 'center',
                        }}
                    >
                        {[
                            { title: 'Refresh', action: onRefresh, icon: <RefreshCw size={18} /> },
                            { title: 'Print', action: handlePrint, icon: <Printer size={18} /> },
                            { title: 'Export CSV', action: handleExportCsv, icon: <ListAltOutlinedIcon /> },
                            { title: 'Export Excel', action: handleExportExcel, icon: <SimCardDownloadOutlinedIcon /> },
                            { title: 'Export PDF', action: handleExportPdf, icon: <PictureAsPdfOutlinedIcon /> },
                        ].map((item) => (
                            <Tooltip key={item.title} title={item.title} placement="left">
                                <span>
                                    <IconButton
                                        onClick={item.action}
                                        disabled={!item.action}
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            bgcolor: '#F57979',
                                            color: '#fff',
                                            boxShadow: '0 8px 22px rgba(0,0,0,0.18)',
                                            '&:hover': { bgcolor: '#e14e4e' },
                                            transition: 'transform 140ms ease, box-shadow 140ms ease',
                                            transform: 'scale(1)',
                                            pointerEvents: 'auto',
                                        }}
                                    >
                                        {item.icon}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ))}
                    </Stack>
                    <IconButton
                        onClick={() => setActionsOpen((v) => !v)}
                        sx={{
                            width: 62,
                            height: 62,
                            borderRadius: '50%',
                            boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
                            bgcolor: '#F57979',
                            color: '#fff',
                            border: '1px solid rgba(0,0,0,0.08)',
                            pointerEvents: 'auto',
                            transition: 'transform 160ms ease, background-color 160ms ease',
                            transform: actionsOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            '&:hover': { bgcolor: '#e14e4e' },
                            mt: 1,
                        }}
                        aria-label={actionsOpen ? 'Close actions' : 'Open actions'}
                    >
                        {actionsOpen ? <CloseIcon fontSize="medium" /> : <ExpandLessIcon fontSize="medium" />}
                    </IconButton>
                </Box>
            ) : null}

            <Box sx={{ width: '100%', minWidth: 0 }}>
                {loading ? (
                    <Box
                        sx={{
                            minHeight: isMobile ? 340 : 520,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: 'background.paper',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: 1,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(10, 1fr)',
                                alignItems: 'center',
                                p: { xs: 1.25, sm: 1.5 },
                                bgcolor: 'action.hover',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                gap: { xs: 1.25, sm: 1.5 },
                            }}
                        >
                            {['Date', 'Reference', 'Type', 'CS/CK', 'Principal', 'Payments', 'Debit', 'Credit', 'Balance', 'Accrued Int'].map(
                                (text) => (
                                    <Skeleton
                                        key={text}
                                        variant="rounded"
                                        height={18}
                                        width="80%"
                                        sx={{ bgcolor: tw.isDark ? '#2b2b2b' : '#e3e6ea' }}
                                    />
                                ),
                            )}
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            {Array.from({ length: skeletonRows }).map((_, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(10, 1fr)',
                                        alignItems: 'center',
                                        p: { xs: 1.1, sm: 1.35 },
                                        gap: { xs: 1.25, sm: 1.5 },
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    {Array.from({ length: 10 }).map((__, colIdx) => (
                                        <Skeleton
                                            key={colIdx}
                                            variant="rounded"
                                            height={16}
                                            width="80%"
                                            sx={{ bgcolor: tw.isDark ? '#2b2b2b' : '#e3e6ea' }}
                                        />
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ p: { xs: 1, sm: 1.5 }, pt: 0 }}>
                        <DataGrid
                            autoHeight
                            disableRowSelectionOnClick
                            rows={filteredRows}
                            columns={columns}
                            density={isMobile ? 'compact' : 'comfortable'}
                            columnHeaderHeight={isMobile ? 44 : 52}
                            rowHeight={isMobile ? 44 : 52}
                            initialState={{
                                sorting: { sortModel: [{ field: 'date_in', sort: 'desc' }] },
                                pagination: { paginationModel: { page: 0, pageSize: isMobile ? 20 : 8 } },
                            }}
                            pageSizeOptions={[8, 10, 15, 20, 50]}
                            sx={{
                                width: '100%',
                                minWidth: 0,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: tw.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                    fontWeight: 800,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    fontSize: { xs: 12, sm: 13 },
                                    color: 'text.primary',
                                },
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    fontWeight: 800,
                                    color: 'text.primary',
                                },
                                '& .MuiDataGrid-row': {
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderColor: 'divider',
                                    fontSize: { xs: 12, sm: 13 },
                                    py: { xs: 0.75, sm: 1 },
                                },
                                '& .MuiDataGrid-row:hover': {
                                    bgcolor: tw.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: tw.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                },
                            }}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default PaymentLedgerTable;
