import { PendingUser } from '@/types/user';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, Box, Typography, useTheme } from '@mui/material';
import React from 'react';
import UserAccordionDetails from './user-accordion-details';

interface Props {
  usersList: PendingUser[];
  groupTab: number;
  expanded: number | null;
  setExpanded: (id: number | null) => void;
  openFullScreenImage: (url: string, title: string) => void;
  handleApprove: (event: React.MouseEvent<HTMLElement>, user: PendingUser) => void;
  handleRejectClick: (user: PendingUser) => void;
  isMobile: boolean;
  processing: boolean;
  setModalImagesUser: (user: PendingUser | null) => void;
  setFullScreenImage: (value: string) => void;
  setImageTitle: (title: string) => void;
  searchValue: string;
  columnIndex?: number;
  expandedColumn?: number | null;
  setExpandedColumn?: (id: number | null) => void;
}

const UserAccordionList: React.FC<Props> = ({
  usersList,
  groupTab,
  expanded,
  setExpanded,
  openFullScreenImage,
  handleApprove,
  handleRejectClick,
  isMobile,
  processing,
  setModalImagesUser,
  setFullScreenImage,
  setImageTitle,
  searchValue,
  columnIndex,
  setExpandedColumn,
}) => {
  const theme = useTheme();

  // Use your brand palette
  const border = theme.palette.divider;
  const paperBg = theme.palette.background.paper;
  const mainText = theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[700];
  const neutralText = theme.palette.text.secondary;
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const thirtiary = theme.palette.warning.main;

  return usersList.length === 0 ? (
    <Box
      sx={{
        border: `1.5px dashed ${secondary}`,
        borderRadius: 2,
        py: 3,
        px: 2,
        my: 2,
        background: paperBg,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 90,
      }}
    >
      <Typography sx={{ color: neutralText, fontWeight: 500, fontSize: '1rem', textAlign: 'center' }}>
        {searchValue
          ? 'No records found.'
          : groupTab === 0
            ? 'No registered users.'
            : groupTab === 2
              ? 'No rejected users.'
              : 'No pending users.'}
      </Typography>
    </Box>
  ) : (
    usersList.map((user: PendingUser, i) => (
      <React.Fragment key={user.user_id}>
        <Accordion
          disableGutters
          expanded={expanded === user.user_id}
          onChange={() => {
            // Open: set both expanded and expandedColumn. Close: set both to null.
            const willExpand = expanded !== user.user_id;
            setExpanded(willExpand ? user.user_id : null);
            if (setExpandedColumn && typeof columnIndex === 'number') {
              setExpandedColumn(willExpand ? columnIndex : null);
            }
          }}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 'none',
            bgcolor: 'transparent',
            border: 0,
            mb: 0,
            width: '100%',
            minWidth: 0,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: primary, fontSize: 22 }} />}
            aria-controls={`panel-${user.user_id}-content`}
            id={`panel-${user.user_id}-header`}
            sx={{
              px: 0,
              py: 0.9,
              minHeight: 0,
              width: '100%',
              minWidth: 0,
              '&.Mui-expanded': {
                minHeight: 0,
                py: 0.9,
              },
              mt: 0,
              mb: 0,
              alignItems: 'center',
              background: paperBg,
              '& .MuiAccordionSummary-content': {
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                minHeight: 0,
                width: '100%',
                minWidth: 0,
                flexWrap: 'wrap',
              },
              '& .MuiAccordionSummary-content.Mui-expanded': {
                margin: 0,
                minHeight: 0,
              },
              '& .MuiAccordionSummary-expandIconWrapper': {
                margin: 0,
              },
              '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                margin: 0,
              },
            }}
          >
            <img
              src={
                user.profile_picture_path
                  ? user.profile_picture_path.startsWith('/')
                    ? user.profile_picture_path
                    : `/storage/${user.profile_picture_path}`
                  : '/images/default-profile-01.png'
              }
              alt="Profile"
              style={{
                width: isMobile ? 28 : 34,
                height: isMobile ? 28 : 34,
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: 8,
                border: `2px solid ${thirtiary}`,
                background: paperBg,
                verticalAlign: 'middle',
                flexShrink: 0,
              }}
              onError={(e) => {
                e.currentTarget.src = '/images/default-profile.png';
              }}
            />
            <Typography
              variant="h6"
              fontWeight="550"
              component="span"
              sx={{
                fontSize: { xs: '1.08rem', sm: '1.12rem', md: '1.18rem' },
                letterSpacing: '-0.1px',
                lineHeight: 1.2,
                color: mainText,
                verticalAlign: 'middle',
                wordBreak: 'break-word',
                minWidth: 0,
                flex: 1,
              }}
            >
              {user.name}
            </Typography>
          </AccordionSummary>
          <UserAccordionDetails
            user={user}
            groupTab={groupTab}
            isMobile={isMobile}
            openFullScreenImage={openFullScreenImage}
            handleApprove={handleApprove}
            handleRejectClick={handleRejectClick}
            processing={processing}
            setModalImagesUser={setModalImagesUser}
            setFullScreenImage={setFullScreenImage}
            setImageTitle={setImageTitle}
          />
        </Accordion>
        {i !== usersList.length - 1 && <Box sx={{ width: '100%', height: '1px', bgcolor: border, mt: 0.5 }} />}
      </React.Fragment>
    ))
  );
};

export default UserAccordionList;
