/**
 * Application-wide constants
 */

export const PAGINATION = {
  DASHBOARD_PAGE_SIZE: 5,
  LOANS_PAGE_SIZE: 4,
  MIN_PAGE_SIZE: 1,
  DEFAULT_PAGE_SIZE: 10,
} as const;

export const CURRENCY = {
  LOCALE: 'en-PH',
  CODE: 'PHP',
  SYMBOL: '₱',
} as const;

export const DATE_FORMAT = {
  LOCALE: 'en-PH',
} as const;

export const DUMMY_VALUES = {
  SAVINGS_DISPLAY: '₱1,000.00',
} as const;
