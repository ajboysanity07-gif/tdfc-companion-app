import { Dialog, Fade, Slide, IconButton } from '@mui/material';
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
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={FadeSlide}
      PaperProps={{
        sx: {
          backgroundColor: "#ffffff",
          color: theme.palette.text.primary,
          boxShadow: '0 8px 44px 0 rgba(30,30,70,.15)',
          overflow: 'auto',
          zIndex: 39
        },
      }}
    >
      {/* Top bar with title and close */}
      <div style={{
        display: "flex",
        alignItems: "center",
        minHeight: 'clamp(56px, 10vw, 64px)',
        background: "#fff7d1",
        borderBottom: `2px solid #f5e399`,
        padding: '0 clamp(16px, 5vw, 32px)',
        position: 'sticky',
        top: 0,
        zIndex: 1100
      }}>
        <h1
          style={{
            fontWeight: 800,
            fontSize: "clamp(1.5rem, 5vw, 2rem)",
            color: "#4687e8",
            flex: 1,
            margin: 0,
            letterSpacing: "1px"
          }}
        >{product?.lntype?.toUpperCase() || 'LOAN'}</h1>
        <IconButton
          onClick={onClose}
          size="large"
          sx={{ color: "#f57373", mr: 1, mt: 0 }}
        >
          <CloseIcon fontSize="large"/>
        </IconButton>
      </div>
      <div style={{
        background: "#ffffff",
        overflowY: 'auto',
        maxHeight: "calc(100vh - 80px)",
        paddingBottom: 'clamp(80px, 15vh, 120px)'
      }}>
        <ProductDetailsInfo product={product} onChange={onSaved} />
      </div>
    </Dialog>
  );
}
