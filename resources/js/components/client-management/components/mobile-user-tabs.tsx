import React, { useState } from 'react';
import { Tabs, Tab, Paper, Box, useTheme, Divider, alpha } from '@mui/material';
import SearchAutocomplete from './search-autocomplete';
import UserAccordionList from './user-accordion-list';
import CardPagination from './card-pagination';
import UserListCard from './user-list-card';
import { PendingUser } from '@/types/user';

// Get child prop type and omit auto-injected props for clean typing
type UserAccordionListProps = React.ComponentProps<typeof UserAccordionList>;
type ForwardAccordionProps = Omit<
  UserAccordionListProps,
  'usersList' | 'groupTab' | 'searchValue' | 'isMobile'
>;

interface Props {
  registeredUsers: PendingUser[];
  pagedRegisteredUsers: PendingUser[] | null;
  registeredSearch: string;
  setRegisteredSearch: React.Dispatch<React.SetStateAction<string>>;
  registeredTotalPages: number;
  registeredPage: number;
  setRegisteredPage: React.Dispatch<React.SetStateAction<number>>;
  forApprovalUsers: PendingUser[];
  pagedPendingUsers: PendingUser[] | null;
  pendingSearch: string;
  setPendingSearch: React.Dispatch<React.SetStateAction<string>>;
  pendingTotalPages: number;
  pendingPage: number;
  setPendingPage: React.Dispatch<React.SetStateAction<number>>;
  rejectedUsers: PendingUser[];
  pagedRejectedUsers: PendingUser[] | null;
  rejectedSearch: string;
  setRejectedSearch: React.Dispatch<React.SetStateAction<string>>;
  rejectedTotalPages: number;
  rejectedPage: number;
  setRejectedPage: React.Dispatch<React.SetStateAction<number>>;
  userAccordionProps: (groupTab: 0 | 1 | 2) => ForwardAccordionProps;
  loading?: boolean; // <-- NEW
}

const USER_TABS = [
  { label: 'Registered', color: '#F57979' },
  { label: 'Pending', color: '#F57979' },
  { label: 'Rejected', color: '#4C92F1' },
];

export default function MobileUserTabs(props: Props) {
  const [tab, setTab] = useState<number>(1); // Default to Pending Approval
  const theme = useTheme();

  const paperBg =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.92)
      : theme.palette.background.paper;
  const paperBorder =
    theme.palette.mode === 'dark'
      ? `1.5px solid ${alpha(theme.palette.divider, 0.30)}`
      : undefined;

  const { loading = false } = props;

  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        width: '100%',
        bgcolor: paperBg,
        border: paperBorder,
        transition: 'background-color 0.3s',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 400,
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        variant="fullWidth"
        sx={{
          px: 1,
          bgcolor: theme.palette.background.default,
          '& button': { fontWeight: 700, fontSize: 16 },
          '& .Mui-selected': { color: USER_TABS[tab].color + '!important' },
        }}
        
      >
        <Tab label="Registered" disabled={loading}/>
        <Tab label="Pending" disabled={loading}/>
        <Tab label="Rejected" disabled={loading}/>
      </Tabs>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
        }}
      >
        {tab === 0 && (
          <UserListCard
            title="REGISTERED USERS"
            titleColor="#F57979"
            userCount={props.registeredUsers.length}
            sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 320 }}
          >
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <SearchAutocomplete
                options={props.registeredUsers.map((u) => u.name)}
                value={props.registeredSearch}
                onChange={props.setRegisteredSearch}
                placeholder="Search registered"
                disabled={loading}
              />
              <UserAccordionList
                usersList={props.pagedRegisteredUsers}
                groupTab={0}
                {...props.userAccordionProps(0)}
                searchValue={props.registeredSearch}
                isMobile={true}
                loading={loading}
              />
            </Box>
            <Divider sx={{ mt: 0.5, mb: 0, borderColor: theme.palette.divider }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
              <CardPagination
                count={props.registeredTotalPages}
                page={props.registeredPage}
                onChange={props.setRegisteredPage}
                disabled={loading}
              />
            </Box>
          </UserListCard>
        )}
        {tab === 1 && (
          <UserListCard
            title="PENDING APPROVAL"
            titleColor="#F57979"
            userCount={props.forApprovalUsers.length}
            sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 320 }}
          >
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <SearchAutocomplete
                options={props.forApprovalUsers.map((u) => u.name)}
                value={props.pendingSearch}
                onChange={props.setPendingSearch}
                placeholder="Search pending"
                disabled={loading}
              />
              <UserAccordionList
                usersList={props.pagedPendingUsers}
                groupTab={1}
                {...props.userAccordionProps(1)}
                searchValue={props.pendingSearch}
                isMobile={true}
                loading={loading}
              />
            </Box>
            <Divider sx={{ mt: 0.5, mb: 0, borderColor: theme.palette.divider }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
              <CardPagination
                count={props.pendingTotalPages}
                page={props.pendingPage}
                onChange={props.setPendingPage}
                disabled={loading}
              />
            </Box>
          </UserListCard>
        )}
        {tab === 2 && (
          <UserListCard
            title="REJECTED USERS"
            titleColor="#4C92F1"
            userCount={props.rejectedUsers.length}
            sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 320 }}
          >
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <SearchAutocomplete
                options={props.rejectedUsers.map((u) => u.name)}
                value={props.rejectedSearch}
                onChange={props.setRejectedSearch}
                placeholder="Search rejected"
                disabled={loading}
              />
              <UserAccordionList
                usersList={props.pagedRejectedUsers}
                groupTab={2}
                {...props.userAccordionProps(2)}
                searchValue={props.rejectedSearch}
                isMobile={true}
                loading={loading}
              />
            </Box>
            <Divider sx={{ mt: 0.5, mb: 0, borderColor: theme.palette.divider }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
              <CardPagination
                count={props.rejectedTotalPages}
                page={props.rejectedPage}
                onChange={props.setRejectedPage}
                disabled={loading}
              />
            </Box>
          </UserListCard>
        )}
      </Box>
    </Paper>
  );
}
