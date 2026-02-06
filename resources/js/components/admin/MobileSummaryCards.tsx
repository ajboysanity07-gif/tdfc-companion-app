import { People, Shield, Person } from '@mui/icons-material';

type Summary = { totalUsers: number; admins: number; customers: number };

type MobileSummaryCardsProps = {
  summary: Summary | null;
  loading: boolean;
  cardClass: string;
};

export default function MobileSummaryCards({ summary, loading, cardClass }: MobileSummaryCardsProps) {
  const showSkeleton = loading || !summary;
  const cards = [
    { label: 'Total Users', value: summary?.totalUsers, Icon: People },
    { label: 'Admins', value: summary?.admins, Icon: Shield },
    { label: 'Clients', value: summary ? summary.totalUsers - summary.admins : undefined, Icon: Person },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:hidden">
      {cards.map(({ label, value, Icon }) => (
        <div key={label} className={`${cardClass} p-3 text-center flex flex-col items-center justify-center`}>
          <div className="mb-2 flex justify-center opacity-70">
            <Icon sx={{ fontSize: 24, color: '#F57979' }} />
          </div>
          <p className="text-[10px] text-gray-500 dark:text-neutral-400">{label}</p>
          {showSkeleton ? (
            <div className="mt-2 h-6 w-10 animate-pulse rounded-md bg-red-200/70 dark:bg-neutral-700/60" />
          ) : (
            <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
          )}
        </div>
      ))}
    </div>
  );
}
