import { PendingUser } from '@/types/user';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import EditIcon from '@mui/icons-material/Edit';
import {
  AccordionDetails,
  Box,
  Container,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  Chip,
} from '@mui/material';
import React from 'react';
import SalaryUpdatePopover from './salary-update-popover';
import UserAccordionDetailsSkeleton from './skeletons/user-accordion-details-skeleton';

interface Props {
  user: PendingUser;
  groupTab: number;
  isMobile?: boolean;
  openFullScreenImage: (url: string, title: string) => void;
  handleApprove: (event: React.MouseEvent<HTMLElement>, user: PendingUser) => void;
  handleRejectClick: (user: PendingUser) => void;
  processing: boolean;
  setModalImagesUser: (user: PendingUser | null) => void;
  setFullScreenImage: (value: string) => void;
  setImageTitle: (title: string) => void;
  loading?: boolean;
}

const UserAccordionDetails: React.FC<Props> = ({
  user,
  groupTab,
  openFullScreenImage,
  handleApprove,
  handleRejectClick,
  processing,
  setModalImagesUser,
  setFullScreenImage,
  setImageTitle,
  loading = false,
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const thumbWidth = isXs ? 80 : 90;
  const thumbHeight = isXs ? 44 : 52;
  const accent = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const thirtiary = theme.palette.warning.main;
  const border = theme.palette.divider;
  const text = theme.palette.text.primary;
  const mutedText = theme.palette.text.secondary;
  const panelBg = theme.palette.background.paper;
  const aroundPanelBg = theme.palette.mode === 'light' ? '#f8f8fa' : '#282a36';
  const detailRowSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 1,
  };
  const detailLabelSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexShrink: 0,
  };
  const detailValueSx = {
    fontSize: 13,
    color: mutedText,
    wordBreak: 'break-word',
    textAlign: 'right',
    flex: 1,
    minWidth: 0,
  };


  // SalaryUpdatePopover integration:
  const [salaryPopoverAnchor, setSalaryPopoverAnchor] = React.useState<null | HTMLElement>(null);
  const [latestSalary, setLatestSalary] = React.useState(user?.salary_amount ? user.salary_amount.toString() : '');
  const [latestNote, setLatestNote] = React.useState(user?.notes || '');

  const handleSalaryClick = (e: React.MouseEvent<HTMLElement>) => {
    setSalaryPopoverAnchor(e.currentTarget);
  };

  const handleSalaryPopoverClose = () => {
    setSalaryPopoverAnchor(null);
  };

  const handleSalarySave = (salary: string, note: string) => {
    setLatestSalary(salary);
    setLatestNote(note);
    setSalaryPopoverAnchor(null);
  };

  // ----- SKELETON LOADING STATE -----
if (loading) {
  return (
    <UserAccordionDetailsSkeleton />
  );
}


  // ----- MAIN DETAILS STATE -----
  return (
    <AccordionDetails
      sx={{
        px: { xs: 0.5, sm: 2 },
        py: { xs: 0.5, sm: 1.2 },
        bgcolor: aroundPanelBg,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        transition: 'background 0.4s',
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ width: '100%' }}>
        <Box
          sx={{
            border: `1.5px solid ${accent}`,
            borderRadius: 2,
            bgcolor: panelBg,
            px: { xs: 1, sm: 2 },
            py: { xs: 1, sm: 2 },
            mx: 'auto',
            width: '100%',
            boxSizing: 'border-box',
            boxShadow: theme.palette.mode === 'light'
              ? '0 2px 8px rgba(0,0,0,0.05)'
              : '0 2px 8px rgba(0,0,0,0.32)',
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
        >
          {/* Heading */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <InfoIcon sx={{ mr: 1, width: 16, height: 16, color: secondary }} />
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: secondary, flex: 1 }}>
              Client Details:
            </Typography>
          </Box>
          <Box
            sx={{
              height: '1px',
              bgcolor: secondary,
              width: '100%',
              mb: 1,
              mt: -0.1,
              borderRadius: 1,
            }}
          />
          {/* Client Details - icons/labels */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7, mb: 2 }}>
            {/* EMAIL */}
            <Box sx={detailRowSx}>
              <Box sx={detailLabelSx}>
                <MailOutlineIcon sx={{ width: 14, height: 14, color: accent }} />
                <Typography sx={{ fontWeight: 700, color: text, fontSize: 12 }}>Email:</Typography>
              </Box>
              <Typography sx={detailValueSx}>{user.email}</Typography>
            </Box>
            {/* PHONE */}
            <Box sx={detailRowSx}>
              <Box sx={detailLabelSx}>
                <PhoneIcon sx={{ width: 14, height: 14, color: accent }} />
                <Typography sx={{ fontWeight: 700, color: text, fontSize: 12 }}>Phone No:</Typography>
              </Box>
              <Typography sx={detailValueSx}>{user.phone_no}</Typography>
            </Box>
            {/* ACCOUNT NO */}
            <Box sx={detailRowSx}>
              <Box sx={detailLabelSx}>
                <AccountBalanceWalletOutlinedIcon sx={{ width: 14, height: 14, color: accent }} />
                <Typography sx={{ fontWeight: 700, color: text, fontSize: 12 }}>Account No:</Typography>
              </Box>
              <Typography sx={detailValueSx}>{user.acctno}</Typography>
            </Box>
            {/* SUBMITTED */}
            <Box sx={detailRowSx}>
              <Box sx={detailLabelSx}>
                <CalendarTodayOutlinedIcon sx={{ width: 14, height: 14, color: accent }} />
                <Typography sx={{ fontWeight: 700, color: text, fontSize: 12 }}>Submitted:</Typography>
              </Box>
              <Typography sx={detailValueSx}>
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
          </Box>
          {/* Thumbnails */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: theme.spacing(1.5),
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
              mt: 1,
            }}
          >
            {(user.prc_id_photo_front || user.prc_id_photo_back) && (
              <Box>
                <Box
                  sx={{
                    width: thumbWidth,
                    height: thumbHeight,
                    bgcolor: thirtiary,
                    borderRadius: 2,
                    boxShadow: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, transform 0.14s',
                    '&:hover': { boxShadow: 3, transform: 'scale(1.04)' },
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    setFullScreenImage('prc-both');
                    setImageTitle('PRC Front & Back');
                    setModalImagesUser(user);
                  }}
                >
                  <Box sx={{ width: '100%', height: '100%', display: 'flex' }}>
                    {user.prc_id_photo_front && (
                      <img
                        src={`/storage/${user.prc_id_photo_front}`}
                        alt="PRC ID Front"
                        loading="lazy"
                        style={{
                          width: user.prc_id_photo_back ? '50%' : '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: user.prc_id_photo_back ? '6px 0 0 6px' : '6px',
                          background: thirtiary,
                        }}
                        onError={e => {
                          e.currentTarget.src = '/images/placeholder-document.png';
                        }}
                      />
                    )}
                    {user.prc_id_photo_back && (
                      <img
                        src={`/storage/${user.prc_id_photo_back}`}
                        alt="PRC ID Back"
                        loading="lazy"
                        style={{
                          width: '50%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '0 6px 6px 0',
                          background: thirtiary,
                        }}
                        onError={e => {
                          e.currentTarget.src = '/images/placeholder-document.png';
                        }}
                      />
                    )}
                  </Box>
                  <Box
                    sx={{
                      pointerEvents: 'none',
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 2,
                    }}
                  >
                    <ZoomInIcon
                      sx={{
                        width: 16,
                        height: 16,
                        mb: 0.1,
                        color: secondary,
                        zIndex: 1,
                        mx: 'auto',
                        textAlign: 'center',
                      }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        color: secondary,
                        zIndex: 1,
                        textAlign: 'center',
                      }}
                    >
                      View PRC ID
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            {user.payslip_photo_path && (
              <Box>
                <Box
                  sx={{
                    width: thumbWidth,
                    height: thumbHeight,
                    bgcolor: thirtiary,
                    borderRadius: 2,
                    boxShadow: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, transform 0.14s',
                    '&:hover': { boxShadow: 3, transform: 'scale(1.04)' },
                  }}
                  onClick={() => openFullScreenImage(`/storage/${user.payslip_photo_path}`, 'Payslip')}
                >
                  <img
                    src={`/storage/${user.payslip_photo_path}`}
                    alt="Payslip"
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 6,
                      background: thirtiary,
                    }}
                    onError={e => {
                      e.currentTarget.src = '/images/placeholder-document.png';
                    }}
                  />
                  <Box
                    sx={{
                      pointerEvents: 'none',
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 2,
                    }}
                  >
                    <ZoomInIcon
                      sx={{
                        width: 16,
                        height: 16,
                        mb: 0.1,
                        color: secondary,
                        zIndex: 1,
                        mx: 'auto',
                        textAlign: 'center',
                      }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        color: secondary,
                        zIndex: 1,
                        textAlign: 'center',
                      }}
                    >
                      View Payslip
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
          {/* Customer Class Chip */}
          <Box sx={{ mt: 1.5, mb: 1, textAlign: 'center' }}>
            {user.class && (
              <Chip
                label={`Class ${user.class}`}
                sx={{
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  fontSize: 15,
                  px: 2,
                  ...(user.class === 'A' && {
                    bgcolor: 'transparent',
                    color: '#1976d2',
                    border: '2.2px solid #1976d2',
                  }),
                  ...(user.class === 'B' && {
                    bgcolor: 'transparent',
                    color: '#9C27B0',
                    border: '2.2px solid #9C27B0',
                  }),
                  ...(user.class === 'C' && {
                    bgcolor: 'transparent',
                    color: '#B98400',
                    border: '2.2px solid #FFBF00',
                  }),
                  ...(user.class === 'D' && {
                    bgcolor: 'transparent',
                    color: '#757575',
                    border: '2.2px solid #757575',
                  }),
                }}
                variant="outlined"
              />
            )}
          </Box>
          {/* Client Salary Details - only show for Registered tab */}
          {groupTab === 0 && (
            <Box sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: '#1976d2', textAlign: 'center', mr: 0.5 }}
                >
                  {latestSalary
                    ? `₱${Number(latestSalary).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : 'Not yet set'}
                </Typography>
                <IconButton
                  size="small"
                  aria-label="Edit salary"
                  onClick={handleSalaryClick}
                  sx={{ p: 0.5, ml: 0.5, color: '#1976d2' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
              {/* SalaryUpdatePopover is called here */}
              <SalaryUpdatePopover
                open={Boolean(salaryPopoverAnchor)}
                anchorEl={salaryPopoverAnchor}
                onClose={handleSalaryPopoverClose}
                onSave={handleSalarySave}
                latestSalary={latestSalary}
                latestNote={latestNote}
                acctno={user.acctno}
              />
              {latestNote && (
                <Typography variant="body2" sx={{ mt: 1, color: '#757575', fontStyle: 'italic' }}>
                  {latestNote}
                </Typography>
              )}
            </Box>
          )}
          {groupTab === 1 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: theme.spacing(1.2),
                width: '100%',
              }}
            >
              <Box sx={{ width: '100%' }}>
                <button
                  type="button"
                  onClick={e => handleApprove(e, user)}
                  disabled={processing}
                  className="flex items-center justify-center gap-1.5 rounded-full"
                  style={{
                    minHeight: 36,
                    fontSize: '0.89rem',
                    borderRadius: 13,
                    width: '100%',
                    background: secondary,
                    color: '#fff',
                    border: `2px solid ${border}`,
                  }}
                >
                  <CheckCircleIcon sx={{ width: 15, height: 15 }} />
                  Approve
                </button>
              </Box>
              <Box sx={{ width: '100%' }}>
                <button
                  type="button"
                  onClick={() => handleRejectClick(user)}
                  disabled={processing}
                  className="flex items-center justify-center gap-1.5 rounded-full"
                  style={{
                    minHeight: 36,
                    fontSize: '0.89rem',
                    borderRadius: 13,
                    width: '100%',
                    background: accent,
                    color: '#fff',
                    border: `2px solid ${border}`,
                  }}
                >
                  <CancelIcon sx={{ width: 15, height: 15 }} />
                  Reject
                </button>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </AccordionDetails>
  );
};

export default UserAccordionDetails;
