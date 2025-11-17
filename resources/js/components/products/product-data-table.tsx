import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Switch, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

type ProductSettings = {
  ln_isActive?: boolean;
  [key: string]: unknown;
};

type ProductRow = {
  typecode: string;
  lntype?: string;
  settings?: ProductSettings;
};

interface ProductDataTableProps {
  data: ProductRow[];
  loading: boolean;
  onRowSelect: (row: ProductRow) => void;
  onAddClick: () => void;
  selectedTypecode?: string;
  search: string;
  setSearch: (val: string) => void;
}

const columns: GridColDef[] = [
  {
    field: 'active',
    headerName: 'Active',
    width: 110,
    renderCell: (params) => (
      <Switch checked={!!params.row.settings?.ln_isActive} disabled color="primary" />
    ),
    sortable: false,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'lntype',
    headerName: 'Loan Type',
    minWidth: 170,
    flex: 1,
    sortable: true,
  },
];

export default function ProductDataTable({
  data,
  loading,
  onRowSelect,
  onAddClick,
  search,
  setSearch,
}: ProductDataTableProps) {
  const theme = useTheme();

  // Map typecode as grid row id
  const rows = data.map((row) => ({
    id: row.typecode,
    ...row,
  }))
    .filter(row =>
      row.lntype?.toLowerCase().includes(search.toLowerCase()) ||
      row.typecode?.toLowerCase().includes(search.toLowerCase())
    );

  // Handle single selection only
  const handleRowClick = (params: GridRowParams) => {
    onRowSelect(params.row);
  };

  return (
    <div className="w-full h-full">
      {/* Header: Add Loan and Search Bar */}
      <div className="flex gap-3 items-center mb-4 w-full">
        <Button
          variant="contained"
          onClick={onAddClick}
          startIcon={<AddIcon />}
          sx={{
            bgcolor: "#f57373",
            "&:hover": { bgcolor: "#f25d5d" },
            fontWeight: 700,
            fontSize: "1rem",
            boxShadow: 2,
            borderRadius: 2,
            px: 3,
            py: 1.5,
          }}
        >
          Add Loan
        </Button>
        <div className="relative flex-1">
          <span className="absolute left-3 top-2 text-gray-400 pointer-events-none">
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10A7 7 0 1 1 3 10a7 7 0 0 1 14 0z" />
            </svg>
          </span>
          <input
            className="w-full border border-gray-300 text-gray-700 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#f57373] bg-[#fafafb]"
            placeholder="Search loan type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {/* DataGrid Table */}
      <div className="w-full" style={{ height: 400 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          disableColumnMenu
          disableRowSelectionOnClick
          loading={loading}
          sx={{
            // Colors to match your design!
            borderRadius: 3,
            boxShadow: 1,
            bgcolor: theme.palette.background.paper,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: "#fff4f4",
              color: "#f57373",
              fontWeight: 600,
              fontSize: "1.08rem",
              borderRadius: 0,
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              fontSize: "1rem",
              borderBottom: "1px solid #f5e8e8",
            },
            '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover': {
              backgroundColor: "#fff0f0",
              color: theme.palette.primary.main,
            },
            '& .MuiDataGrid-root': {
              backgroundColor: "transparent",
            },
          }}
          isRowSelectable={() => false} // disables checkboxes
          onRowClick={handleRowClick}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
