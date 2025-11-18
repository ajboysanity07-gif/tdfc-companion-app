import CardPagination from '@/components/client-management/components/card-pagination';
import SearchAutocomplete from '@/components/client-management/components/search-autocomplete';
import UserAccordionList from '@/components/client-management/components/user-accordion-list';
import UserListCard from '@/components/client-management/components/user-list-card';
import type { PendingUser } from '@/types';
import type { CSSProperties, ComponentProps, Dispatch, SetStateAction } from 'react';

export type DesktopColumnConfig = {
    key: string;
    title: string;
    titleColor: string;
    userCount: number;
    searchOptions: string[];
    searchValue: string;
    setSearch: Dispatch<SetStateAction<string>>;
    pagedUsers: PendingUser[];
    totalPages: number;
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
    groupTab: number;
    columnIndex: number;
};

export type UserAccordionInjectedProps = Omit<
    ComponentProps<typeof UserAccordionList>,
    'usersList' | 'groupTab' | 'searchValue'
>;

export interface DesktopUserColumnsProps {
    columns: DesktopColumnConfig[];
    userAccordionProps: (columnIndex: number) => UserAccordionInjectedProps;
    appleSeparator: () => CSSProperties;
}

export default function DesktopUserColumns({
    columns,
    userAccordionProps,
    appleSeparator,
}: DesktopUserColumnsProps) {
    return (
        <div className="flex w-full min-w-0 flex-row gap-8">
            {columns.map((column) => (
                <div
                    key={column.key}
                    className="relative flex min-h-[800px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl shadow-md transition-colors duration-300"
                >
                    <UserListCard
                        title={column.title}
                        titleColor={column.titleColor}
                        userCount={column.userCount}
                        className="flex h-full flex-col"
                    >
                        <SearchAutocomplete
                            options={column.searchOptions}
                            value={column.searchValue}
                            onChange={column.setSearch}
                            placeholder={`Search ${column.title.toLowerCase()}`}
                        />
                        <div
                            className="hide-scrollbar flex-1 overflow-y-scroll"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            <UserAccordionList
                                usersList={column.pagedUsers}
                                groupTab={column.groupTab}
                                {...userAccordionProps(column.columnIndex)}
                                searchValue={column.searchValue}
                            />
                        </div>
                        <div style={appleSeparator()} />
                        <div className="mt-auto flex justify-end pt-2 pr-4 pb-0">
                            <CardPagination count={column.totalPages} page={column.page} onChange={column.setPage} />
                        </div>
                    </UserListCard>
                </div>
            ))}
        </div>
    );
}
