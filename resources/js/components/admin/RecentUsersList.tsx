type RecentUser = { user_id: number; email: string; role: string; status: string; created_at: string };

type RecentUsersListProps = {
  recent: RecentUser[];
  loading: boolean;
  cardClass: string;
};

export default function RecentUsersList({ recent, loading, cardClass }: RecentUsersListProps) {
  return (
    <div className={`${cardClass} p-6`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-neutral-700">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
            ))}
          </div>
        )}
        {!loading && recent.length === 0 && (
          <p className="py-4 text-sm text-gray-500 dark:text-neutral-400">No users found.</p>
        )}
        {!loading &&
          recent.map((u) => (
            <div
              key={u.user_id}
              className="flex items-center justify-between py-3 px-2 -mx-2 rounded-md transition-colors duration-200 hover:bg-gray-800/50 dark:hover:bg-neutral-800/50"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.email}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {u.role} • {u.status} • {new Date(u.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
