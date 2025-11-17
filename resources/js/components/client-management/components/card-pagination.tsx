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
          background: isDarkMode ? '#302a34' : '#F57979',
          color: isDarkMode ? '#ffe57b' : '#fff',
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
        color: isDarkMode ? '#ffe57b' : '#F57979'
      }}>
        {page}
      </span>
      <span style={{
        color: isDarkMode ? '#ffe57b' : '#888', fontWeight: 600, fontSize: 15
      }}>/</span>
      <span style={{
        fontSize: 15,
        color: isDarkMode ? '#ffe57b' : '#F57979',
        fontWeight: 600, margin: '0 6px 0 0'
      }}>
        {count}
      </span>
      <button
        onClick={() => onChange(page < count ? page + 1 : page)}
        style={{
          border: 'none',
          background: isDarkMode ? '#302a34' : '#F57979',
          color: isDarkMode ? '#ffe57b' : '#fff',
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
