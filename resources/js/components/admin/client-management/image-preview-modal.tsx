import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
    Box,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type PreviewImage = { src: string; label?: string };

type Props = {
    open: boolean;
    title?: string;
    images: PreviewImage[];
    onClose: () => void;
};

const ImagePreviewModal: React.FC<Props> = ({ open, title, images, onClose }) => {
    const theme = useTheme();
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(28,28,28,0.92)' : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(18px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
                <Typography variant="h6" fontWeight={800}>
                    {title || 'Preview'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 3 }}>
                <Stack spacing={2} alignItems="center" width="100%">
                    {images.map((img) => (
                        <Box
                            key={img.src}
                            component="img"
                            src={img.src}
                            alt={img.label || title}
                            sx={{
                                width: '100%',
                                maxHeight: 420,
                                objectFit: 'contain',
                                borderRadius: 2.5,
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
                                backgroundColor: 'background.paper',
                            }}
                        />
                    ))}
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default ImagePreviewModal;
