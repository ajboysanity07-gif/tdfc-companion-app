import React from 'react';
import CardPagination from './card-pagination';
import SearchAutocomplete from './search-autocomplete';
import UserAccordionList from './user-accordion-list';
import UserListCard from './user-list-card';
import { PendingUser } from '@/types/user';

export type UserAccordionInjectedProps = {
  expanded: number | null;
  setExpanded: React.Dispatch<React.SetStateAction<number | null>>;
  openFullScreenImage: (img: string, title: string) => void;
  handleApprove: (e: React.MouseEvent<HTMLElement>, user: PendingUser) => void;
  handleRejectClick: (user: PendingUser) => void;
  isMobile: boolean;
  setModalImagesUser: (user: PendingUser | null) => void;
  processing: boolean;
  setFullScreenImage: (value: string | null) => void;
  setImageTitle: (title: string) => void;
  columnIndex: number;
  expandedColumn: number | null;
  setExpandedColumn: React.Dispatch<React.SetStateAction<number | null>>;
};

export interface DesktopColumnConfig {
  key: string;
  title: string;
  titleColor: string;
  userCount: number;
  searchOptions: string[];
  searchValue: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  pagedUsers: PendingUser[] | null;
  totalPages: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  groupTab: number;
  columnIndex: number;
}

export interface DesktopUserColumnsProps {
  columns: DesktopColumnConfig[];
  userAccordionProps: (columnIndex: number) => UserAccordionInjectedProps;
  appleSeparator: () => React.CSSProperties;
  loadingColumns?: boolean[]; // Add loading indicator per column (optional)
}

const DesktopUserColumns: React.FC<DesktopUserColumnsProps> = ({
  columns,
  userAccordionProps,
  appleSeparator,
  loadingColumns = [], // optional - pass [true, false, ...] in parent to show skeleton
}) => (
  <div className="flex w-full min-w-0 flex-row gap-8">
    {columns.map((column, idx) => (
      <div
        key={column.key}
        className="relative flex min-h-[800px] h-[calc(100vh-260px)] min-w-0 flex-1 flex-col overflow-hidden rounded-xl shadow-md transition-colors duration-300"
      >
        <UserListCard title={column.title} titleColor={column.titleColor} userCount={column.userCount}>
          <div className="flex h-full min-h-0 flex-col">
            <SearchAutocomplete
              options={column.searchOptions}
              value={column.searchValue}
              onChange={column.setSearch}
              placeholder={`Search ${column.title.toLowerCase()}`}
            />
            <div
              className="hide-scrollbar flex-1 min-h-0 overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <UserAccordionList
                usersList={column.pagedUsers}
                groupTab={column.groupTab}
                {...userAccordionProps(column.columnIndex)}
                searchValue={column.searchValue}
                loading={loadingColumns[idx] === true}  // pass skeleton state down
              />
            </div>
            <div style={appleSeparator()} />
            <div className="mt-auto flex justify-end pt-2 pr-4 pb-0">
              <CardPagination
                count={column.totalPages}
                page={column.page}
                onChange={column.setPage}
              />
            </div>
          </div>
        </UserListCard>
      </div>
    ))}
  </div>
);

export default DesktopUserColumns;
