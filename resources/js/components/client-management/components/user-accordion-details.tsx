import { PendingUser } from '@/types';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import InfoIcon from '@mui/icons-material/Info';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { AccordionDetails, Box, Chip, Tooltip, Typography, useTheme } from '@mui/material';
import React from 'react';
import SalaryUpdatePopover from './salary-update-popover';

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
}) => {
    const theme = useTheme();
    const accent = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;
    const thirtiary = theme.palette.warning.main;
    const border = theme.palette.divider;
    const text = theme.palette.text.primary;
    const mutedText = theme.palette.text.secondary;
    const panelBg = theme.palette.background.paper;
    const aroundPanelBg = theme.palette.mode === 'light' ? '#f8f8fa' : '#3a3a3a';

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

    return (
        <AccordionDetails
            sx={{
                px: { xs: 0, sm: 0, md: 1 },
                py: { xs: 0.75, sm: 1, md: 1.2 },
                bgcolor: aroundPanelBg,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
                transition: 'background 0.4s',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
            }}
        >
            <Box
                sx={{
                    border: `1.5px solid ${accent}`,
                    borderRadius: 2,
                    bgcolor: panelBg,
                    px: { xs: 2, sm: 2.5, md: 3.5 },
                    py: { xs: 2, sm: 2.5, md: 3 },
                    width: '100%',
                    maxWidth: '700px',
                    boxSizing: 'border-box',
                    boxShadow: theme.palette.mode === 'light' ? '0 2px 8px rgba(0,0,0,0.05)' : '0 2px 8px rgba(0,0,0,0.32)',
                    transition: 'background 0.3s, box-shadow 0.3s',
                }}
            >
                {/* Heading */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InfoIcon sx={{ mr: 1, width: { xs: 18, sm: 20, md: 22 }, height: { xs: 18, sm: 20, md: 22 }, color: secondary }} />
                    <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' }, color: secondary, flex: 1 }}>
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
                {/* Client Details - icons/labels */}
                {/* Client Details - icons/labels */}
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1.1 }}>
                    {/* ACCOUNT NO */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'center', sm: 'center' },
                            justifyContent: { xs: 'center', sm: 'space-between' },
                            width: '100%',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                            <AccountBalanceWalletOutlinedIcon
                                sx={{
                                    width: { xs: 16, sm: 18, md: 22 },
                                    height: { xs: 16, sm: 18, md: 22 },
                                    color: accent,
                                    mr: 0.6,
                                    display: { xs: 'none', sm: 'block' },
                                }}
                            />
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: text,
                                    fontSize: { xs: '0.95rem', sm: '1.04rem', md: '1.11rem' },
                                }}
                            >
                                Account No
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontWeight: 500,
                                color: mutedText,
                                fontSize: { xs: '1.08rem', sm: '1.16rem', md: '1.28rem' },
                                textAlign: { xs: 'center', sm: 'right' },
                                ml: { xs: 0, sm: 0 },
                                mt: { xs: 0.5, sm: 0 },
                                wordBreak: 'break-word',
                            }}
                        >
                            {user.acctno}
                        </Typography>
                    </Box>
                    {/* EMAIL */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'center', sm: 'center' },
                            justifyContent: { xs: 'center', sm: 'space-between' },
                            width: '100%',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                            <MailOutlineIcon
                                sx={{
                                    width: { xs: 16, sm: 18, md: 22 },
                                    height: { xs: 16, sm: 18, md: 22 },
                                    color: accent,
                                    mr: 0.6,
                                    display: { xs: 'none', sm: 'block' },
                                }}
                            />
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: text,
                                    fontSize: { xs: '0.95rem', sm: '1.04rem', md: '1.11rem' },
                                }}
                            >
                                Email
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontWeight: 500,
                                color: mutedText,
                                fontSize: { xs: '1.08rem', sm: '1.16rem', md: '1.28rem' },
                                textAlign: { xs: 'center', sm: 'right' },
                                ml: { xs: 0, sm: 0 },
                                mt: { xs: 0.5, sm: 0 },
                                wordBreak: 'break-word',
                            }}
                            title={user.email}
                        >
                            {user.email}
                        </Typography>
                    </Box>
                    {/* PHONE */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'center', sm: 'center' },
                            justifyContent: { xs: 'center', sm: 'space-between' },
                            width: '100%',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                            <PhoneIcon
                                sx={{
                                    width: { xs: 16, sm: 18, md: 22 },
                                    height: { xs: 16, sm: 18, md: 22 },
                                    color: accent,
                                    mr: 0.6,
                                    display: { xs: 'none', sm: 'block' },
                                }}
                            />
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: text,
                                    fontSize: { xs: '0.95rem', sm: '1.04rem', md: '1.11rem' },
                                }}
                            >
                                Phone No
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontWeight: 500,
                                color: mutedText,
                                fontSize: { xs: '1.08rem', sm: '1.16rem', md: '1.28rem' },
                                textAlign: { xs: 'center', sm: 'right' },
                                ml: { xs: 0, sm: 0 },
                                mt: { xs: 0.5, sm: 0 },
                                wordBreak: 'break-word',
                            }}
                        >
                            {user.phone_no}
                        </Typography>
                    </Box>
                    {/* SUBMITTED */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'center', sm: 'center' },
                            justifyContent: { xs: 'center', sm: 'space-between' },
                            width: '100%',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                            <CalendarTodayOutlinedIcon
                                sx={{
                                    width: { xs: 16, sm: 18, md: 22 },
                                    height: { xs: 16, sm: 18, md: 22 },
                                    color: accent,
                                    mr: 0.6,
                                    display: { xs: 'none', sm: 'block' },
                                }}
                            />
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: text,
                                    fontSize: { xs: '0.95rem', sm: '1.04rem', md: '1.11rem' },
                                }}
                            >
                                Submitted
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontWeight: 500,
                                color: mutedText,
                                fontSize: { xs: '1.08rem', sm: '1.16rem', md: '1.28rem' },
                                textAlign: { xs: 'center', sm: 'right' },
                                ml: { xs: 0, sm: 0 },
                                mt: { xs: 0.5, sm: 0 },
                                wordBreak: 'break-word',
                            }}
                        >
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
                        flexDirection: 'row', // Changed from { xs: 'column', sm: 'row' } to always 'row'
                        gap: { xs: 1.5, sm: 2, md: 2.5 },
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 3,
                        mt: 2,
                        flexWrap: 'wrap',
                        width: '100%',
                    }}
                >
                    {(user.prc_id_photo_front || user.prc_id_photo_back) && (
                        <Box>
                            <Box
                                sx={{
                                    width: { xs: 100, sm: 115, md: 130 },
                                    height: { xs: 55, sm: 65, md: 72 },
                                    bgcolor: thirtiary,
                                    borderRadius: 2,
                                    boxShadow: 2,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s, transform 0.14s',
                                    '&:hover': { boxShadow: 3, transform: 'scale(1.04)' },
                                }}
                                onClick={(e) => {
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
                                            style={{
                                                width: user.prc_id_photo_back ? '50%' : '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: user.prc_id_photo_back ? '6px 0 0 6px' : '6px',
                                                background: thirtiary,
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/placeholder-document.png';
                                            }}
                                        />
                                    )}
                                    {user.prc_id_photo_back && (
                                        <img
                                            src={`/storage/${user.prc_id_photo_back}`}
                                            alt="PRC ID Back"
                                            style={{
                                                width: '50%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '0 6px 6px 0',
                                                background: thirtiary,
                                            }}
                                            onError={(e) => {
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
                                            width: { xs: 20, sm: 24, md: 28 },
                                            height: { xs: 20, sm: 24, md: 28 },
                                            mb: 0.3,
                                            color: secondary,
                                            zIndex: 1,
                                            mx: 'auto',
                                            textAlign: 'center',
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' },
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
                                    width: { xs: 100, sm: 115, md: 130 },
                                    height: { xs: 55, sm: 65, md: 72 },
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
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        background: thirtiary,
                                    }}
                                    onError={(e) => {
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
                                            width: { xs: 20, sm: 24, md: 28 },
                                            height: { xs: 20, sm: 24, md: 28 },
                                            mb: 0.3,
                                            color: secondary,
                                            zIndex: 1,
                                            mx: 'auto',
                                            textAlign: 'center',
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' },
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

                {/* Customer Class Chip with label */}
                <Box sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
                    {user.class && (
                        <>
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: '#f57979', // match 'Client Details:' label color
                                    fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                                    mb: 0.5,
                                }}
                            >
                                Customer Class:
                            </Typography>
                            <Chip
                                label={
                                    <span
                                        style={{
                                            fontWeight: 800,
                                            fontSize: '0.95em',
                                            letterSpacing: '0.07em',
                                        }}
                                    >
                                        {`Class ${user.class}`}
                                    </span>
                                }
                                sx={{
                                    px: { xs: 1.8, sm: 2.2, md: 2.6 },
                                    height: { xs: 32, sm: 36, md: 40 },
                                    fontWeight: 800,
                                    fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                                    display: 'inline-flex',
                                    borderRadius: '9999px',
                                    ...(user.class === 'A' && {
                                        bgcolor: 'transparent',
                                        color: '#1976d2',
                                        border: '2px solid #1976d2',
                                    }),
                                    ...(user.class === 'B' && {
                                        bgcolor: 'transparent',
                                        color: '#9C27B0',
                                        border: '2px solid #9C27B0',
                                    }),
                                    ...(user.class === 'C' && {
                                        bgcolor: 'transparent',
                                        color: '#B98400',
                                        border: '2px solid #FFBF00',
                                    }),
                                    ...(user.class === 'D' && {
                                        bgcolor: 'transparent',
                                        color: '#757575',
                                        border: '2px solid #757575',
                                    }),
                                }}
                                variant="outlined"
                            />
                        </>
                    )}
                </Box>

                {/* Client Salary Details - only show for Registered tab */}
                {groupTab === 0 && (
                    <Box sx={{ mt: 3, mb: 3, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, marginLeft:'20px'}}>
                            <Tooltip title="Click to edit or set the basic salary" arrow placement="top">
                                <button
                                    onClick={handleSalaryClick}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        color: '#f57979',
                                        fontSize: 'clamp(1.1rem, 3vw, 1.25rem)',
                                        padding: 0,
                                        textDecoration: 'underline',
                                        transition: 'all 0.2s ease',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.3em',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#d32f2f';
                                        e.currentTarget.style.fontSize = 'clamp(1.15rem, 3.2vw, 1.3rem)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = '#f57979';
                                        e.currentTarget.style.fontSize = 'clamp(1.1rem, 3vw, 1.25rem)';
                                    }}
                                >
                                    <span>Set Basic Salary:</span>
                                    <EditSquareIcon sx={{ width: '0.5em', height: '0.5em', position: 'relative', top: '-0.25em' }} />
                                </button>
                            </Tooltip>
                        </Box>
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 900,
                                color: '#1976d2',
                                textAlign: 'center',
                                fontSize: { xs: '1.08rem', sm: '1.16rem', md: '1.28rem' },
                                mt: 0.8,
                            }}
                        >
                            {latestSalary
                                ? `Php ${Number(latestSalary).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  })}`
                                : 'Not yet set'}
                        </Typography>
                        {latestNote && (
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 1,
                                    color: mutedText,
                                    fontStyle: 'italic',
                                    fontWeight: 400,
                                    fontSize: { xs: '0.93rem', sm: '0.97rem', md: '1.02rem' },
                                }}
                            >
                                <span style={{ fontWeight: 700, color: mutedText, fontSize: '0.95em', marginRight: 4 }}>Note:</span>
                                {user.notes}
                            </Typography>
                        )}
                        <SalaryUpdatePopover
                            open={Boolean(salaryPopoverAnchor)}
                            anchorEl={salaryPopoverAnchor}
                            onClose={handleSalaryPopoverClose}
                            onSave={handleSalarySave}
                            latestSalary={latestSalary}
                            latestNote={latestNote}
                            acctno={user.acctno}
                        />
                    </Box>
                )}
                {groupTab === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ width: '100%' }}>
                            <button
                                type="button"
                                onClick={(e) => handleApprove(e, user)}
                                disabled={processing}
                                className="flex items-center justify-center gap-1.5 rounded-full"
                                style={{
                                    minHeight: window.innerWidth < 640 ? 36 : window.innerWidth < 1024 ? 38 : 42,
                                    fontSize: window.innerWidth < 640 ? '0.95rem' : window.innerWidth < 1024 ? '1rem' : '1.05rem',
                                    borderRadius: 13,
                                    width: '100%',
                                    background: secondary,
                                    color: '#fff',
                                    border: `2px solid ${border}`,
                                }}
                            >
                                <CheckCircleIcon sx={{ width: { xs: 16, sm: 17, md: 18 }, height: { xs: 16, sm: 17, md: 18 } }} />
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
                                    minHeight: window.innerWidth < 640 ? 36 : window.innerWidth < 1024 ? 38 : 42,
                                    fontSize: window.innerWidth < 640 ? '0.95rem' : window.innerWidth < 1024 ? '1rem' : '1.05rem',
                                    borderRadius: 13,
                                    width: '100%',
                                    background: accent,
                                    color: '#fff',
                                    border: `2px solid ${border}`,
                                }}
                            >
                                <CancelIcon sx={{ width: { xs: 16, sm: 17, md: 18 }, height: { xs: 16, sm: 17, md: 18 } }} /> Reject
                            </button>
                        </Box>
                    </Box>
                )}
            </Box>
        </AccordionDetails>
    );
};

export default UserAccordionDetails;
