/**
 * Build a pagination window for compact page controls.
 *
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {number} [maxVisible=5]
 * @returns {number[]}
 */
export function buildPaginationWindow(currentPage, totalPages, maxVisible = 5) {
    const safeTotal = Number.isFinite(totalPages) ? Math.max(0, Math.floor(totalPages)) : 0;
    if (safeTotal === 0) {
        return [];
    }

    const safeMax = Math.max(1, Math.floor(maxVisible));
    const safeCurrent = Number.isFinite(currentPage)
        ? Math.min(Math.max(1, Math.floor(currentPage)), safeTotal)
        : 1;

    if (safeTotal <= safeMax) {
        return Array.from({ length: safeTotal }, (_, idx) => idx + 1);
    }

    const halfWindow = Math.floor(safeMax / 2);
    let start = safeCurrent - halfWindow;
    let end = start + safeMax - 1;

    if (start < 1) {
        start = 1;
        end = safeMax;
    } else if (end > safeTotal) {
        end = safeTotal;
        start = safeTotal - safeMax + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
}
