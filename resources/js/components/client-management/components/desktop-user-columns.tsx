import React from 'react';
import CardPagination from './card-pagination';
import SearchAutocomplete from './search-autocomplete';
import UserAccordionList from './user-accordion-list';
import UserListCard from './user-list-card';
import { PendingUser } from '@/types/user';

// Define injected props type if possible
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
  pagedUsers: PendingUser[];
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
}

const DesktopUserColumns: React.FC<DesktopUserColumnsProps> = ({
  columns, userAccordionProps, appleSeparator,
}) => (
  <div className="flex w-full min-w-0 flex-row gap-8">
    {columns.map((column) => (
      <div key={column.key} className="relative flex min-h-[800px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl shadow-md transition-colors duration-300">
        <UserListCard title={column.title} titleColor={column.titleColor} userCount={column.userCount}>
          <div className="flex h-full flex-col">
            <SearchAutocomplete
              options={column.searchOptions}
              value={column.searchValue}
              onChange={column.setSearch}
              placeholder={`Search ${column.title.toLowerCase()}`}
            />
            <div className="hide-scrollbar flex-1 overflow-y-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <UserAccordionList
                usersList={column.pagedUsers}
                groupTab={column.groupTab}
                {...userAccordionProps(column.columnIndex)}
                searchValue={column.searchValue}
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
