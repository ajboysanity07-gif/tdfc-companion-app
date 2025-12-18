import React from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import type { RejectionReasonEntry } from '@/types/user';

type Props = {
    reasons: RejectionReasonEntry[];
    selected: string[];
    onToggle: (code: string) => void;
    emptyMessage?: string;
};

const RejectionReasons: React.FC<Props> = ({ reasons, selected, onToggle, emptyMessage = 'No reasons available.' }) => {
    if (!reasons || reasons.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                {emptyMessage}
            </Typography>
        );
    }

    return (
        <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
            {reasons.map((reason) => {
                const isSelected = selected.includes(reason.code);
                const label = reason.label ?? reason.code;
                return (
                    <Chip
                        key={reason.code}
                        label={label}
                        color={isSelected ? 'error' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        onClick={() => onToggle(reason.code)}
                        sx={{ fontWeight: 700 }}
                    />
                );
            })}
        </Stack>
    );
};

export default RejectionReasons;
