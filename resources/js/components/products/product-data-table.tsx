import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import IOSSwitch from '@/components/common/ios-switch';

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
  onToggleActive: (row: ProductRow, active: boolean) => Promise<void> | void;
  onAddClick: () => void;
  selectedTypecode?: string;
  search: string;
  setSearch: (val: string) => void;
}

export default function ProductDataTable({
  data,
  loading,
  onRowSelect,
  onToggleActive,
  onAddClick,
  search,
  setSearch,
}: ProductDataTableProps) {
  const theme = useTheme();
  const [pendingActive, setPendingActive] = useState<Record<string, boolean | undefined>>({});
  const [updatingRows, setUpdatingRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPendingActive((prev) => {
      let changed = false;
      const next = { ...prev };
      data.forEach((row) => {
        const pendingValue = next[row.typecode];
        if (typeof pendingValue !== 'undefined' && pendingValue === !!row.settings?.ln_isActive) {
          delete next[row.typecode];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [data]);

  const handleToggleActive = useCallback((row: ProductRow, nextValue: boolean) => {
    const previousValue = !!row.settings?.ln_isActive;
    setPendingActive((prev) => ({ ...prev, [row.typecode]: nextValue }));
    setUpdatingRows((prev) => ({ ...prev, [row.typecode]: true }));
    Promise.resolve(onToggleActive(row, nextValue))
      .catch(() => {
        setPendingActive((prev) => ({ ...prev, [row.typecode]: previousValue }));
      })
      .finally(() => {
        setUpdatingRows((prev) => {
          const next = { ...prev };
          delete next[row.typecode];
          return next;
        });
      });
  }, [onToggleActive]);
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'active',
      headerName: 'Active',
      width: 110,
      renderCell: (params) => (
        <IOSSwitch
          checked={pendingActive[params.row.typecode] ?? !!params.row.settings?.ln_isActive}
          disabled={!!updatingRows[params.row.typecode]}
          onClick={(event) => event.stopPropagation()}
          onChange={(event, value) => {
            event.stopPropagation();
            handleToggleActive(params.row, value);
          }}
        />
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
    {
      field: 'action',
      headerName: '',
      width: 100,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton
          aria-label="View details"
          onClick={(event) => {
            event.stopPropagation();
            onRowSelect(params.row);
          }}
          sx={{
            bgcolor: "#f57979",
            color: "#fff",
            border: "1px solid #f57373",
            '&:hover': {
              bgcolor: "#f46464",
            },
          }}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      ),
    },
  ], [onRowSelect, pendingActive, updatingRows, handleToggleActive]);

  // Map typecode as grid row id
  const rows = data.map((row) => ({
    id: row.typecode,
    ...row,
  }))
    .filter(row =>
      row.lntype?.toLowerCase().includes(search.toLowerCase()) ||
      row.typecode?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="w-full h-full flex flex-col">
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
      <div className="w-full flex-1" style={{ minHeight: 0 }}>
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
            height: '100%',
            borderRadius: 0,
            boxShadow: 'none',
            border: 'none',
            bgcolor: theme.palette.background.paper,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: "#fff4f4",
              color: "#f57373",
              fontWeight: 600,
              fontSize: "1.08rem",
              borderRadius: 0,
            },
            '& .MuiDataGrid-row': {
              cursor: 'default',
              fontSize: "1rem",
              borderBottom: "1px solid #f5e8e8",
            },
            '& .MuiDataGrid-root': {
              backgroundColor: "transparent",
            },
          }}
          isRowSelectable={() => false} // disables checkboxes
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
