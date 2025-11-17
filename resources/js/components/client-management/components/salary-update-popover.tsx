import { Box, Button, Popover, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { NumericFormat } from 'react-number-format';

interface Props {
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    onSave: (salary: string, note: string) => void;
    latestSalary?: string;
    latestNote?: string;
    acctno: string;
}

const SalaryUpdatePopover: React.FC<Props> = ({
    open,
    anchorEl,
    onClose,
    onSave,
    latestSalary,
    latestNote,
    acctno
}) => {
    React.useEffect(() => {
        // Make sure we update salary and note on popover open
        if (open) {
            setSalary(latestSalary || '');
            setNote(latestNote || '');
        }
    }, [open, latestSalary, latestNote]);

    const [salary, setSalary] = React.useState<string>(latestSalary || '');
    const [notes, setNote] = React.useState<string>(latestNote || '');
    const [saving, setSaving] = React.useState(false);

    const isDisabled = saving || !salary || Number(salary) <= 0;

    function getCsrfToken(): string {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/admin/clients/${acctno}/salary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    salary_amount: salary,
                    notes: notes,
                }),
            });
            if (!res.ok) throw new Error('Failed to save salary');
            await res.json();
            onSave(salary, notes);
            onClose();
        } catch (error) {
            console.error('Error saving salary:', error);
            alert('Failed to save salary.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            disableRestoreFocus
            PaperProps={{ sx: { minWidth: 220, maxWidth: 260 } }}
        >
            <Box sx={{ p: 1.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, fontSize: 15 }}>
                    Please input the customer salary indicated in the payslip photo.
                </Typography>
                <Stack spacing={1.2}>
                    <NumericFormat
                        value={salary}
                        valueIsNumericString
                        onValueChange={(values) => setSalary(values.value)}
                        customInput={TextField}
                        label="Salary Amount"
                        variant="outlined"
                        thousandSeparator
                        decimalScale={2}
                        fixedDecimalScale
                        prefix="₱"
                        multiline
                        minRows={1}
                        fullWidth
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <TextField
                        label="Note"
                        variant="outlined"
                        value={notes}
                        onChange={(e) => setNote(e.target.value)}
                        multiline
                        minRows={1}
                        fullWidth
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                        <Button variant="outlined" color="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleSave} disabled={isDisabled}>
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Popover>
    );
};

export default SalaryUpdatePopover;
