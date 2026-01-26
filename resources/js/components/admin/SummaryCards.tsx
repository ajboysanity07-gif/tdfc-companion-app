import { People, Shield, Person } from '@mui/icons-material';

type Summary = { totalUsers: number; admins: number; customers: number };

type SummaryCardsProps = {
  summary: Summary | null;
  loading: boolean;
  cardClass: string;
};

export default function SummaryCards({ summary, loading, cardClass }: SummaryCardsProps) {
  return (
    <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
      {loading ? (
        [1, 2, 3].map((i) => (
          <div key={i} className={`h-32 animate-pulse rounded-2xl shadow-sm ${cardClass}`} />
        ))
      ) : (
        summary && (
          <>
            <div
              className={`${cardClass} p-4 lg:p-5 text-center flex flex-col justify-between border border-red-200 dark:border-neutral-600/50 bg-gradient-to-br from-red-50 to-orange-50 dark:from-neutral-800/50 dark:to-neutral-900/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-red-300 dark:hover:border-neutral-500/80`}
            >
              <div className="mb-3 lg:mb-4 flex justify-center">
                <div className="rounded-full bg-[#F57979]/15 p-2 lg:p-3">
                  <People sx={{ fontSize: 40, color: '#F57979' }} />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-neutral-500 uppercase tracking-wide">
                  Total Users
                </p>
                <p className="text-5xl font-bold text-gray-900 dark:text-white">{summary.totalUsers}</p>
              </div>
            </div>
            <div
              className={`${cardClass} p-4 lg:p-5 text-center flex flex-col justify-between border border-red-200 dark:border-neutral-600/50 bg-gradient-to-br from-red-50 to-orange-50 dark:from-neutral-800/50 dark:to-neutral-900/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-red-300 dark:hover:border-neutral-500/80`}
            >
              <div className="mb-3 lg:mb-4 flex justify-center">
                <div className="rounded-full bg-[#F57979]/15 p-2 lg:p-3">
                  <Shield sx={{ fontSize: 40, color: '#F57979' }} />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-neutral-500 uppercase tracking-wide">
                  Admins
                </p>
                <p className="text-5xl font-bold text-gray-900 dark:text-white">{summary.admins}</p>
              </div>
            </div>
            <div
              className={`${cardClass} p-4 lg:p-5 text-center flex flex-col justify-between border border-red-200 dark:border-neutral-600/50 bg-gradient-to-br from-red-50 to-orange-50 dark:from-neutral-800/50 dark:to-neutral-900/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-red-300 dark:hover:border-neutral-500/80`}
            >
              <div className="mb-3 lg:mb-4 flex justify-center">
                <div className="rounded-full bg-[#F57979]/15 p-2 lg:p-3">
                  <Person sx={{ fontSize: 40, color: '#F57979' }} />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-neutral-500 uppercase tracking-wide">
                  Clients
                </p>
                <p className="text-5xl font-bold text-gray-900 dark:text-white">{summary.totalUsers - summary.admins}</p>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
