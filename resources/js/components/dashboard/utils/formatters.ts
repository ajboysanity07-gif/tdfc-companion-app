// 📄 2. resources/js/components/dashboard/utils/formatters.ts
export const formatters = {
  currency: (amount: number, currency: 'PHP' | 'USD' = 'PHP'): string => {
    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be a valid number');
    }
    
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  },

  date: (dateString: string | null): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (!Number.isFinite(date.getTime())) {
      return dateString;
    }
    
    return date.toLocaleDateString('en-PH');
  },

  percentage: (value: number, decimals: number = 0): string => {
    if (!Number.isFinite(value)) {
      return '0%';
    }
    
    return `${value.toFixed(decimals)}%`;
  },

  getFirstName: (fullName: string): string => {
    if (fullName.includes(',')) {
      return fullName.split(',')[1]?.trim().split(' ')[0] ?? fullName;
    }
    return fullName.split(' ')[0] ?? fullName;
  }
} as const;