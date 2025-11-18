import { Dialog, Fade, Slide, IconButton, Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import ProductDetailsInfo from './product-details-info';

type Product = {
  typecode: string;
  lntype?: string;
  int_rate?: number;
  settings?: Record<string, unknown>;
  display?: Record<string, unknown>;
  tags?: { tag_name: string }[];
};

interface ProductDetailsModalProps {
  open: boolean;
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}

// Combined iOS-style: fade and slide (right)
const FadeSlide = (props: TransitionProps & { children: React.ReactElement }) => (
  <Fade timeout={250} in={props.in}>
    <div>
      <Slide direction="left" {...props} timeout={350}>
        {props.children}
      </Slide>
    </div>
  </Fade>
);

export default function ProductDetailsModal({
  open,
  product,
  onClose,
  onSaved
}: ProductDetailsModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      TransitionComponent={FadeSlide}
      PaperProps={{
        sx: {
          backgroundColor: "#ffffff",
          color: theme.palette.text.primary,
          boxShadow: isMobile ? '0 8px 44px 0 rgba(30,30,70,.15)' : '0 24px 60px rgba(30,30,70,.25)',
          overflow: 'hidden',
          zIndex: 39,
          borderRadius: isMobile ? 0 : 4,
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? '100%' : '90vh',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        {/* Top bar with title and close */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minHeight: 'clamp(56px, 10vw, 64px)',
            background: "#fff7d1",
            borderBottom: `2px solid #f5e399`,
            px: { xs: 2, sm: 4 },
            position: 'sticky',
            top: 0,
            zIndex: 2
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: "clamp(1.5rem, 5vw, 2rem)",
              color: "#4687e8",
              flex: 1,
              m: 0,
              letterSpacing: "1px"
            }}
          >
            {product?.lntype?.toUpperCase() || 'LOAN'}
          </Typography>
          <IconButton
            onClick={onClose}
            size="large"
            sx={{ color: "#f57373", mr: 1, mt: 0 }}
          >
            <CloseIcon fontSize="large"/>
          </IconButton>
        </Box>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            background: "#ffffff",
            px: { xs: 0, sm: 2, md: 4 },
            pt: { xs: 2, sm: 3 },
            pb: { xs: 14, sm: 10 }
          }}
        >
          <ProductDetailsInfo product={product} onChange={onSaved} />
        </Box>
      </Box>
    </Dialog>
  );
}
