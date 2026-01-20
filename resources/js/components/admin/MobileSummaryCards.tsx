import { People, Shield, Person } from '@mui/icons-material';

type Summary = { totalUsers: number; admins: number; customers: number };

type MobileSummaryCardsProps = {
  summary: Summary | null;
  loading: boolean;
  cardClass: string;
};

export default function MobileSummaryCards({ summary, loading, cardClass }: MobileSummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:hidden">
      {loading ? (
        [1, 2, 3].map((i) => (
          <div key={i} className={`h-24 animate-pulse rounded-2xl shadow-sm ${cardClass}`} />
        ))
      ) : (
        summary && (
          <>
            <div className={`${cardClass} p-3 text-center flex flex-col items-center justify-center`}>
              <div className="mb-2 flex justify-center opacity-70">
                <People sx={{ fontSize: 24, color: '#F57979' }} />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-neutral-400">Total Users</p>
              <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{summary.totalUsers}</p>
            </div>
            <div className={`${cardClass} p-3 text-center flex flex-col items-center justify-center`}>
              <div className="mb-2 flex justify-center opacity-70">
                <Shield sx={{ fontSize: 24, color: '#F57979' }} />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-neutral-400">Admins</p>
              <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{summary.admins}</p>
            </div>
            <div className={`${cardClass} p-3 text-center flex flex-col items-center justify-center`}>
              <div className="mb-2 flex justify-center opacity-70">
                <Person sx={{ fontSize: 24, color: '#F57979' }} />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-neutral-400">Clients</p>
              <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{summary.totalUsers - summary.admins}</p>
            </div>
          </>
        )
      )}
    </div>
  );
}
