import React from 'react';

export interface CardPaginationProps {
  count: number;
  page: number;
  onChange: React.Dispatch<React.SetStateAction<number>>;
  isDarkMode?: boolean;
}

const CardPagination: React.FC<CardPaginationProps> = ({
  count,
  page,
  onChange,
  isDarkMode
}) => {
  if (count < 1) return null;

  return (
    
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px 0 6px 0',
        background: 'transparent',
        paddingBottom: 0,
      }}
    >
      <button
        onClick={() => onChange(page > 1 ? page - 1 : page)}
        style={{
          border: 'none',
          background: isDarkMode ? 'var(--card)' : 'var(--brand-surface)',
          color: isDarkMode ? 'var(--brand-yellow)' : 'var(--on-brand-surface)',
          borderRadius: 6,
          marginRight: 8,
          padding: '4px 10px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: 17,
        }}
        aria-label="Previous"
      >{'<'}</button>
      <span style={{
        fontSize: 16,
        fontWeight: 700,
        margin: '0 6px',
        color: isDarkMode ? 'var(--brand-yellow)' : 'var(--red-text)'
      }}>
        {page}
      </span>
      <span style={{
        color: isDarkMode ? 'var(--brand-yellow)' : 'var(--muted-foreground)', fontWeight: 600, fontSize: 15
      }}>/</span>
      <span style={{
        fontSize: 15,
        color: isDarkMode ? 'var(--brand-yellow)' : 'var(--red-text)',
        fontWeight: 600, margin: '0 6px 0 0'
      }}>
        {count}
      </span>
      <button
        onClick={() => onChange(page < count ? page + 1 : page)}
        style={{
          border: 'none',
          background: isDarkMode ? 'var(--card)' : 'var(--brand-surface)',
          color: isDarkMode ? 'var(--brand-yellow)' : 'var(--on-brand-surface)',
          borderRadius: 6,
          marginLeft: 8,
          padding: '4px 10px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: 17
        }}
        aria-label="Next"
      >{'>'}</button>
    </div>
  );
};

export default CardPagination;
