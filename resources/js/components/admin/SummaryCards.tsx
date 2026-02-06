import { People, Shield, Person } from '@mui/icons-material';

type Summary = { totalUsers: number; admins: number; customers: number };

type SummaryCardsProps = {
  summary: Summary | null;
  loading: boolean;
  cardClass: string;
};

export default function SummaryCards({ summary, loading, cardClass }: SummaryCardsProps) {
  const showSkeleton = loading || !summary;
  const cards = [
    { label: 'Total Users', value: summary?.totalUsers, Icon: People },
    { label: 'Admins', value: summary?.admins, Icon: Shield },
    { label: 'Clients', value: summary ? summary.totalUsers - summary.admins : undefined, Icon: Person },
  ];

  return (
    <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
      {cards.map(({ label, value, Icon }) => (
        <div
          key={label}
          className={`${cardClass} p-4 lg:p-5 text-center flex flex-col justify-between border border-red-200 dark:border-neutral-600/50 bg-linear-to-br from-red-50 to-orange-50 dark:from-neutral-800/50 dark:to-neutral-900/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-red-300 dark:hover:border-neutral-500/80`}
        >
          <div className="mb-3 lg:mb-4 flex justify-center">
            <div className="rounded-full bg-[#F57979]/15 p-2 lg:p-3">
              <Icon sx={{ fontSize: 40, color: '#F57979' }} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-neutral-500 uppercase tracking-wide">
              {label}
            </p>
            {showSkeleton ? (
              <div className="mx-auto h-10 w-24 animate-pulse rounded-md bg-red-200/70 dark:bg-neutral-700/60" />
            ) : (
              <p className="text-5xl font-bold text-gray-900 dark:text-white">{value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
