import type { AmortschedDisplayEntry } from '@/types/user';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SimCardDownloadOutlinedIcon from '@mui/icons-material/SimCardDownloadOutlined';
import { Box, IconButton, Skeleton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useMediaQuery } from '@/hooks/use-media-query';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Printer, RefreshCw, Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useMyTheme } from '@/hooks/use-mytheme';

import type { Border, Borders, Fill } from 'exceljs';
type ExcelModule = typeof import('exceljs');

type Props = {
    title?: string;
    rows: AmortschedDisplayEntry[];
    loading?: boolean;
    onRefresh?: () => void;
    lnnumber?: string | null;
    exportMeta?: {
        clientName?: string | null;
        lnnumber?: string | null;
        remarks?: string | null;
        lastPaymentDate?: string | null;
    };
};

type GridRow = {
    id: number;
    date_pay: string;
    amortization: number | null;
    interest: number | null;
    balance: number | null;
};

const formatDate = (value: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (value: number | null) => {
    if (value == null || Number.isNaN(Number(value))) return '';
    return new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value));
};

const parseNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const cleaned = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(cleaned) ? cleaned : null;
};

const normalizeDateValue = (value: unknown): string | null => {
    if (value === null || value === undefined || value === '') return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object' && value && 'date' in value) {
        const nested = (value as { date?: unknown }).date;
        if (typeof nested === 'string' || typeof nested === 'number') return String(nested);
    }
    return String(value);
};

const AmortschedTable: React.FC<Props> = ({ title = 'Amortization Schedule', rows, loading = false, onRefresh, lnnumber, exportMeta }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [actionsOpen, setActionsOpen] = useState(false);
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const actionButtonSx = tw.isDark
        ? {
              color: '#f9fafb',
              '&:hover': { color: '#ffffff' },
          }
        : undefined;

    const generatedOn = useMemo(() => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()), []);

    useEffect(() => {
        let cancelled = false;
        const loadLogo = async () => {
            try {
                const res = await fetch('/images/logo.png');
                if (!res.ok) return;
                const blob = await res.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (!cancelled && typeof reader.result === 'string') {
                        setLogoDataUrl(reader.result);
                    }
                };
                reader.readAsDataURL(blob);
            } catch {
                // fallback to URL on failure
            }
        };
        loadLogo();
        return () => {
            cancelled = true;
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
        return list
            .filter((row) => row != null)
            .map((row, idx) => {
                const record = row as unknown as Record<string, unknown>;
                const datePay = normalizeDateValue(
                    record.date_pay ?? record.Date_pay ?? record.DatePay ?? record.date ?? record.Date,
                );
                const amortization = parseNumber(record.amortization ?? record.Amortization ?? record.Amort);
                const interest = parseNumber(record.interest ?? record.Interest ?? record.Interestm);
                const balance = parseNumber(record.balance ?? record.Balance);
                return {
                    id: idx + 1,
                    date_pay: datePay ?? '',
                    amortization,
                    interest,
                    balance,
                };
            });
    }, [rows]);

    const sortedRows = useMemo(() => {
        return [...preparedRows].sort((a, b) => {
            const da = a.date_pay ? new Date(a.date_pay).getTime() : 0;
            const db = b.date_pay ? new Date(b.date_pay).getTime() : 0;
            return db - da;
        });
    }, [preparedRows]);

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return preparedRows;
        const term = searchTerm.toLowerCase();
        return preparedRows.filter((row) => {
            const values = [row.date_pay ? formatDate(row.date_pay) : '—', row.amortization ?? '', row.interest ?? '', row.balance ?? ''];
            return values.some((val) => String(val).toLowerCase().includes(term));
        });
    }, [preparedRows, searchTerm]);

    const columns = useMemo<GridColDef<GridRow>[]>(
        () => [
            {
                field: 'date_pay',
                headerName: 'Payment Dates',
                flex: 1.2,
                minWidth: isMobile ? 120 : 140,
                resizable: true,
                valueFormatter: (value) => formatDate((value as string | null) ?? null),
                renderCell: ({ row }) => (
                    <span style={{ color: tw.isDark ? '#e5e7eb' : '#111827', fontWeight: 700 }}>
                        {row.date_pay ? formatDate(row.date_pay) : '-'}
                    </span>
                ),
            },
            {
                field: 'amortization',
                headerName: 'Amortization',
                flex: 1,
                minWidth: isMobile ? 110 : 130,
                resizable: true,
                valueFormatter: (value) => formatCurrency((value as number | null) ?? null),
                renderCell: ({ row }) => (
                    <span style={{ color: tw.isDark ? '#d1d5db' : '#374151', fontWeight: 500 }}>
                        {row.amortization != null ? formatCurrency(row.amortization) : '-'}
                    </span>
                ),
            },
            {
                field: 'balance',
                headerName: 'Balance',
                flex: 1,
                minWidth: isMobile ? 120 : 140,
                resizable: true,
                valueFormatter: (value) => formatCurrency((value as number | null) ?? null),
                renderCell: ({ row }) => (
                    <span style={{ color: tw.isDark ? '#e5e7eb' : '#111827', fontWeight: 600 }}>
                        {row.balance != null ? formatCurrency(row.balance) : '-'}
                    </span>
                ),
            },
        ],
        [isMobile, tw.isDark],
    );

    const handleExportCsv = () => {
        const details = {
            client: exportMeta?.clientName ?? '',
            lnnumber: exportMeta?.lnnumber ?? '',
            remarks: exportMeta?.remarks ?? '',
            lastPayment: exportMeta?.lastPaymentDate
                ? formatDate(exportMeta.lastPaymentDate)
                : rows?.[0]?.date_pay
                  ? formatDate(rows[0].date_pay)
                  : '',
            monthlyInterest: sortedRows[0]?.interest ?? 0,
        };

        const header = ['Payment Dates', 'Amortization', 'Balance'];
        const data = sortedRows.map((row) => [formatDate(row.date_pay ?? null), row.amortization ?? '', row.balance ?? '']);

        const infoBlock = [
            ['Triple Diamond Finance Cooperative'],
            ['San Francisco, Agusan del Sur.'],
            [],
            ['Amortization Schedule'],
            [`Generated on: ${generatedOn}`],
            [],
            ['Remarks', details.remarks],
            ['Loan Number', details.lnnumber],
            ['Client Name', details.client],
            ['Last Payment', details.lastPayment],
            ['Monthly Interest', formatCurrency(details.monthlyInterest)],
        ];

        const csv = [...infoBlock, header, ...data]
            .map((line) => line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const ln = lnnumber || exportMeta?.lnnumber || 'schedule';
        link.setAttribute('download', `amortization_sched_${ln}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportExcel = async () => {
        try {
            const ExcelJS = (await import('exceljs')) as ExcelModule;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Schedule');

            worksheet.columns = [
                { key: 'date', width: 18 },
                { key: 'amort', width: 16 },
                { key: 'balance', width: 16 },
            ];

            worksheet.pageSetup = {
                paperSize: 5, // Legal
                margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.25, footer: 0.25 },
            };

            const details = {
                client: exportMeta?.clientName ?? '',
                lnnumber: exportMeta?.lnnumber ?? '',
                remarks: exportMeta?.remarks ?? '',
                lastPayment: exportMeta?.lastPaymentDate
                    ? formatDate(exportMeta.lastPaymentDate)
                    : rows?.[0]?.date_pay
                      ? formatDate(rows[0].date_pay)
                      : '',
                monthlyInterest: sortedRows[0]?.interest ?? 0,
            };

            const thin: Border = { style: 'thin', color: { argb: 'FFD9D9D9' } };
            const headerFill: Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
            const borderAll: Partial<Borders> = {
                top: { ...thin },
                bottom: { ...thin },
                left: { ...thin },
                right: { ...thin },
            };

            const mergeAcross = (rowNumber: number) => worksheet.mergeCells(`A${rowNumber}:C${rowNumber}`);

            const coopRow = worksheet.addRow(['Triple Diamond Finance Cooperative']);
            coopRow.height = 24;
            coopRow.font = { bold: true, size: 11.5 };
            coopRow.alignment = { vertical: 'middle', horizontal: 'left' };
            mergeAcross(coopRow.number);

            const locationRow = worksheet.addRow(['San Francisco, Agusan del Sur.']);
            locationRow.height = 18;
            locationRow.font = { size: 10.5, color: { argb: 'FF555555' } };
            locationRow.alignment = { vertical: 'middle', horizontal: 'left' };
            mergeAcross(locationRow.number);

            worksheet.addRow([]).height = 6;

            const titleRow = worksheet.addRow([title]);
            titleRow.height = 22;
            titleRow.font = { bold: true, size: 17 };
            titleRow.alignment = { vertical: 'middle', horizontal: 'left' };
            mergeAcross(titleRow.number);

            const generatedRow = worksheet.addRow([`Generated on: ${generatedOn}`]);
            generatedRow.height = 16;
            generatedRow.font = { size: 10 };
            generatedRow.alignment = { vertical: 'middle', horizontal: 'left' };
            mergeAcross(generatedRow.number);

            worksheet.addRow([]).height = 8;

            const remarksRow = worksheet.addRow([details.remarks || '']);
            remarksRow.height = 18;
            remarksRow.font = { bold: true, size: 11.5 };
            remarksRow.alignment = { vertical: 'middle', horizontal: 'left' };
            mergeAcross(remarksRow.number);

            const metaRows = [
                ['Loan Number', details.lnnumber],
                ['Client Name', details.client],
                ['Last Payment', details.lastPayment],
                ['Monthly Interest', formatCurrency(details.monthlyInterest)],
            ];
 
            metaRows.forEach((vals) => {
                const row = worksheet.addRow(vals);
                row.height = 16;
                row.getCell(1).font = { bold: true, size: 10 };
                row.getCell(1).alignment = { horizontal: 'left' };
                row.getCell(2).font = { size: 10 };
                row.getCell(2).alignment = { horizontal: 'left' };
            });

            const metaSpacer = worksheet.addRow([]);
            metaSpacer.height = 8;
            mergeAcross(metaSpacer.number);

            const headerRow = worksheet.addRow(['Payment Dates', 'Amortization', 'Balance']);
            headerRow.height = 20;
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, size: 9 };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.fill = headerFill;
                cell.border = borderAll;
            });

            sortedRows.forEach((row) => {
                const excelRow = worksheet.addRow([
                    row.date_pay ? new Date(row.date_pay) : '',
                    row.amortization ?? null,
                    row.balance ?? null,
                ]);
                excelRow.height = 18;
                excelRow.eachCell((cell, colNumber) => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.border = borderAll;
                    cell.font = { size: 8.5 };
                    if (colNumber === 1 && row.date_pay) {
                        cell.numFmt = 'mmm dd, yyyy';
                    }
                    if (colNumber > 1 && cell.value !== null && cell.value !== '') {
                        cell.numFmt = '#,##0.00';
                    }
                });
            });

            const spacerRow = worksheet.addRow([]);
            spacerRow.height = 10;
            mergeAcross(spacerRow.number);

            const footerRow = worksheet.addRow(['This data is generated by the TDFC Companion app.']);
            footerRow.font = { size: 11, color: { argb: 'FF666666' } };
            footerRow.alignment = { horizontal: 'left' };
            mergeAcross(footerRow.number);

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const ln = lnnumber || exportMeta?.lnnumber || 'schedule';
            link.href = url;
            link.download = `amortization_sched_${ln}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Excel export failed', error);
        }
    };

    const buildPrintableBody = (logoUrl: string) => {
        const details = {
            client: exportMeta?.clientName ?? '',
            lnnumber: exportMeta?.lnnumber ?? '',
            remarks: exportMeta?.remarks ?? '',
            lastPayment: exportMeta?.lastPaymentDate
                ? formatDate(exportMeta.lastPaymentDate)
                : rows?.[0]?.date_pay
                  ? formatDate(rows[0].date_pay)
                  : '',
            monthlyInterest: sortedRows[0]?.interest ?? 0,
        };

        const rowsHtml = sortedRows
            .map((row) => {
                const date = formatDate(row.date_pay ?? null);
                const amort = row.amortization != null ? formatCurrency(row.amortization) : '';
                const bal = row.balance != null ? formatCurrency(row.balance) : '';
                return `
                    <tr>
                        <td class="cell">${date}</td>
                        <td class="cell">${amort}</td>
                        <td class="cell">${bal}</td>
                    </tr>`;
            })
            .join('');

        return `
            <div style="font-family: Arial, sans-serif; padding: 16px; color: #111827; width: 100%; box-sizing: border-box;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
                    <img id="print-logo" src="${logoUrl}" alt="Logo" style="height: 48px;" />
                    <div>
                        <div style="font-weight:700; font-size:11.5px;">Triple Diamond Finance Cooperative</div>
                        <div style="color:#555; font-size:10.5px;">San Francisco, Agusan del Sur.</div>
                    </div>
                </div>
                <h2 style="margin: 10px 0 4px; font-size:17px;">${title}</h2>
                <div style="font-size: 10px; color: #444; margin: 0 0 14px;">Generated on: ${generatedOn}</div>
                <div style="margin: 0 0 14px; font-size: 10px;">
                    <div style="font-weight:700; font-size:11.5px; margin: 0 0 6px;">${details.remarks || ''}</div>
                    <div style="margin: 2px 0;"><strong>Loan Number:</strong> ${details.lnnumber || '-'}</div>
                    <div style="margin: 2px 0;"><strong>Client Name:</strong> ${details.client || '-'}</div>
                    <div style="margin: 2px 0;"><strong>Last Payment:</strong> ${details.lastPayment || '-'}</div>
                    <div style="margin: 2px 0;"><strong>Monthly Interest:</strong> ${formatCurrency(details.monthlyInterest)}</div>
                </div>
                <table class="amort-table">
                    <thead>
                        <tr>
                            <th class="header">Payment Dates</th>
                            <th class="header">Amortization</th>
                            <th class="header">Balance</th>
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
                    table.amort-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
                    table.amort-table th.header { padding: 8px 10px; text-align: center; background: #ffffff; border: 1px solid #d9d9d9; font-weight: 700; font-size: 9px; }
                    table.amort-table td.cell { padding: 7px 10px; text-align: center; border: 1px solid #d9d9d9; color: #111827; font-size: 8.5px; }
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
                        const logo = document.getElementById('print-logo');
                        if (logo && !logo.complete) {
                            logo.addEventListener('load', finish);
                            logo.addEventListener('error', finish);
                            setTimeout(finish, 900);
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
        const printable = buildPrintableHtml(logoUrl);
        const win = window.open('', '_blank', 'width=1024,height=768');
        if (!win) return;
        win.document.open();
        win.document.write(printable);
        win.document.close();
    };

    const handleExportPdf = async () => {
        try {
            const logoUrl = await resolveLogoSrc();
            const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'legal' });
            const margin = 36.1; // 12.7mm
            let y = margin;

            // Header block (match print styling)
            if (logoUrl) {
                try {
                    const logoSize = 44;
                    const textX = margin + logoSize + 12;
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
                    doc.text('Triple Diamond Finance Cooperative', margin, y);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10.5);
                    doc.setTextColor(90, 90, 90);
                    doc.text('San Francisco, Agusan del Sur.', margin, y + 16);
                    y += 46;
                }
            } else {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11.5);
                doc.setTextColor(0, 0, 0);
                doc.text('Triple Diamond Finance Cooperative', margin, y);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10.5);
                doc.setTextColor(90, 90, 90);
                doc.text('San Francisco, Agusan del Sur.', margin, y + 16);
                y += 46;
            }

            // Title + generated date
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(17);
            doc.text(title, margin, y + 11);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Generated on: ${generatedOn}`, margin, y + 28);
            y += 50; // tighter spacing

            const details = {
                client: exportMeta?.clientName ?? '-',
                lnnumber: exportMeta?.lnnumber ?? '-',
                remarks: exportMeta?.remarks ?? '',
                lastPayment: exportMeta?.lastPaymentDate
                    ? formatDate(exportMeta.lastPaymentDate)
                    : rows?.[0]?.date_pay
                      ? formatDate(rows[0].date_pay)
                      : '-',
                monthlyInterest: sortedRows[0]?.interest ?? 0,
            };

            const metaLines = [
                details.remarks ? { label: '', value: details.remarks, bold: true } : null,
                { label: 'Loan Number:', value: details.lnnumber },
                { label: 'Client Name:', value: details.client },
                { label: 'Last Payment:', value: details.lastPayment },
                { label: 'Monthly Interest:', value: formatCurrency(details.monthlyInterest) },
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

            const tableStartY = y + metaLines.length * 17 + 14;
            const head = [['Payment Dates', 'Amortization', 'Balance']];
            const body = sortedRows.map((row) => [
                formatDate(row.date_pay ?? null) || '-',
                row.amortization != null ? formatCurrency(row.amortization) : '',
                row.balance != null ? formatCurrency(row.balance) : '',
            ]);

            autoTable(doc, {
                head,
                body,
                startY: tableStartY,
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
                    halign: 'center',
                    fontStyle: 'bold',
                    fontSize: 9,
                    lineColor: [217, 217, 217],
                    lineWidth: 0.45,
                },
           
                alternateRowStyles: {
                    fillColor: [255, 255, 255], // Remove striped effect
                },
                columnStyles: {
                    0: { halign: 'center' },
                },
                margin: { left: margin, right: margin },
            });

            const finalY = (doc as typeof doc & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? tableStartY;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(102, 102, 102);
            doc.text('This data is generated by the TDFC Companion app.', margin, finalY + 18);

            const ln = lnnumber || exportMeta?.lnnumber || 'schedule';
            doc.save(`amortization_sched_${ln}.pdf`);
        } catch (err) {
            console.error('PDF export failed', err);
        }
    };

    const handlePrint = () => void openPrintable();
    const skeletonRows = isMobile ? 6 : 12;

    return (
        <>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                sx={{ p: 2, pb: 2.5 }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={800}>
                        {title}
                    </Typography>
                    {lnnumber && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: tw.isDark ? '#9ca3af' : '#6b7280' }}>
                            Loan #: {lnnumber}
                        </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: tw.isDark ? '#9ca3af' : '#6b7280' }}>
                        Filter, export, or print this amortization schedule.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center" width={{ xs: '100%', sm: 'auto' }}>
                    <TextField
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search schedule"
                        InputProps={{
                            startAdornment: (
                                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                                    <Search size={16} />
                                </Box>
                            ),
                        }}
                        sx={{ 
                            minWidth: { xs: '100%', sm: 220 },
                            '& .MuiOutlinedInput-root': {
                                bgcolor: tw.isDark ? '#2d2d2d' : '#ffffff',
                                color: tw.isDark ? '#f9fafb' : '#111827',
                                '& fieldset': {
                                    borderColor: tw.isDark ? '#374151' : '#d1d5db',
                                },
                                '&:hover fieldset': {
                                    borderColor: tw.isDark ? '#4b5563' : '#9ca3af',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: tw.isDark ? '#60a5fa' : '#3b82f6',
                                },
                            },
                            '& .MuiOutlinedInput-input': {
                                color: tw.isDark ? '#f9fafb' : '#111827',
                                '&::placeholder': {
                                    color: tw.isDark ? '#9ca3af' : '#6b7280',
                                    opacity: 1,
                                },
                            },
                        }}
                    />
                    {!isMobile ? (
                        <>
                            <Tooltip title="Refresh">
                                <span>
                                    <IconButton onClick={onRefresh} disabled={!onRefresh} sx={actionButtonSx}>
                                        <RefreshCw size={18} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Print">
                                <IconButton onClick={handlePrint} sx={actionButtonSx}>
                                    <Printer size={18} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export CSV">
                                <IconButton onClick={handleExportCsv} sx={actionButtonSx}>
                                    <ListAltOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export Excel">
                                <IconButton onClick={handleExportExcel} sx={actionButtonSx}>
                                    <SimCardDownloadOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export PDF">
                                <IconButton onClick={handleExportPdf} sx={actionButtonSx}>
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
                        bottom: 120,
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
                    <Box sx={{ p: 2, pt: 0 }}>
                        <Box
                            sx={{
                                width: '100%',
                                minWidth: 0,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: tw.isDark ? '#1e1e1e' : '#ffffff',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1.2fr 1fr 1fr',
                                    alignItems: 'center',
                                    height: isMobile ? 44 : 52,
                                    px: 2,
                                    bgcolor: tw.isDark ? '#2d2d2d !important' : '#f9fafb !important',
                                    borderBottom: '1px solid',
                                    borderColor: tw.isDark ? '#374151' : '#e5e7eb',
                                    gap: 2,
                                }}
                            >
                                {['Payment Dates', 'Amortization', 'Balance'].map((text) => (
                                    <Skeleton
                                        key={text}
                                        variant="rounded"
                                        height={14}
                                        width="70%"
                                        sx={{ bgcolor: tw.isDark ? '#2b2b2b' : '#e3e6ea' }}
                                    />
                                ))}
                            </Box>
                            <Box>
                                {Array.from({ length: skeletonRows }).map((_, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '1.2fr 1fr 1fr',
                                            alignItems: 'center',
                                            height: isMobile ? 44 : 52,
                                            px: 2,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            gap: 2,
                                        }}
                                    >
                                        {[60, 55, 55].map((width, colIdx) => (
                                            <Skeleton
                                                key={colIdx}
                                                variant="rounded"
                                                height={14}
                                                width={`${width}%`}
                                                sx={{ bgcolor: tw.isDark ? '#2b2b2b' : '#e3e6ea' }}
                                            />
                                        ))}
                                    </Box>
                                ))}
                            </Box>
                            <Box
                                sx={{
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: tw.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                    p: 1.5,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Skeleton
                                    variant="rounded"
                                    height={20}
                                    width={isMobile ? '50%' : 150}
                                    sx={{ bgcolor: tw.isDark ? '#2b2b2b' : '#e3e6ea' }}
                                />
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ p: 2, pt: 0 }}>
                        <DataGrid
                            autoHeight
                            disableRowSelectionOnClick
                            rows={filteredRows}
                            columns={columns}
                            density={isMobile ? 'compact' : 'comfortable'}
                            disableColumnResize={false}
                            columnHeaderHeight={isMobile ? 44 : 52}
                            rowHeight={isMobile ? 44 : 52}
                            initialState={{
                                sorting: { sortModel: [{ field: 'date_pay', sort: 'desc' }] },
                                pagination: { paginationModel: { page: 0, pageSize: isMobile ? 20 : 8 } },
                            }}
                            pageSizeOptions={[8, 10, 15, 20, 50]}
                            sx={{
                                width: '100%',
                                minWidth: 0,
                                border: '1px solid',
                                borderColor: tw.isDark ? '#374151' : '#e5e7eb',
                                bgcolor: tw.isDark ? '#1e1e1e' : '#ffffff',
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: tw.isDark ? '#2d2d2d !important' : '#f9fafb !important',
                                    fontWeight: 800,
                                    borderBottom: '1px solid',
                                    borderColor: tw.isDark ? '#374151' : '#e5e7eb',
                                    fontSize: { xs: 12, sm: 13 },
                                    color: tw.isDark ? '#f9fafb' : '#111827',
                                },
                                '& .MuiDataGrid-columnHeader': {
                                    bgcolor: tw.isDark ? '#2d2d2d !important' : '#f9fafb !important',
                                },
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    fontWeight: 800,
                                    color: tw.isDark ? '#f9fafb' : '#111827',
                                },
                                '& .MuiDataGrid-row': {
                                    borderBottom: '1px solid',
                                    borderColor: tw.isDark ? '#374151' : '#e5e7eb',
                                    bgcolor: tw.isDark ? '#1e1e1e' : '#ffffff',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderColor: tw.isDark ? '#374151' : '#e5e7eb',
                                    fontSize: { xs: 12, sm: 13 },
                                    py: { xs: 0.75, sm: 1 },
                                    color: tw.isDark ? '#f9fafb' : '#111827',
                                },
                                '& .MuiDataGrid-row:hover': {
                                    bgcolor: tw.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '1px solid',
                                    borderColor: tw.isDark ? '#374151' : '#e5e7eb',
                                    bgcolor: tw.isDark ? '#2d2d2d' : '#f9fafb',
                                },
                                '& .MuiTablePagination-root': {
                                    color: tw.isDark ? '#f9fafb' : '#111827',
                                },
                                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                    color: tw.isDark ? '#9ca3af' : '#6b7280',
                                },
                                '& .MuiIconButton-root': {
                                    color: tw.isDark ? '#f9fafb' : '#111827',
                                },
                            }}
                        />
                    </Box>
                )}
            </Box>
        </>
    );
};

export default AmortschedTable;
