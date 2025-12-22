declare module 'jspdf' {
    export default class jsPDF {
        constructor(options?: Record<string, unknown>);
        addImage(data: string, format: string, x: number, y: number, width: number, height: number): void;
        addPage(): void;
        save(filename?: string): void;
        setFontSize(size: number): void;
        setFont(font: string, style?: string): void;
        text(text: string, x: number, y: number): void;
        setTextColor(r: number, g: number, b: number): void;
        internal: { pageSize: { getWidth(): number; getHeight(): number } };
    }
}

declare module 'jspdf-autotable' {
    import jsPDF from 'jspdf';
    export interface AutoTableOptions {
        head?: Array<Array<string>>;
        body?: Array<Array<string | number | null>>;
        startY?: number;
        styles?: Record<string, unknown>;
        headStyles?: Record<string, unknown>;
        columnStyles?: Record<number, Record<string, unknown>>;
        margin?: { left?: number; right?: number };
        alternateRowStyles?: Record<string, unknown>;
    }

    export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}
