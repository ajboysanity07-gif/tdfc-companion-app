import { Box, Stack } from '@mui/material';

export default function ClientDetailsSkeleton() {
    return (
        <>
            {/* Header section */}
            <Stack spacing={2}>
                <Box className="rounded bg-neutral-700 h-8 w-48 animate-pulse" />
                <Box className="rounded bg-neutral-700 h-4 w-64 animate-pulse" />
            </Stack>

            {/* Profile card section */}
            <Box className="rounded-2xl border border-neutral-700 p-4 space-y-4">
                {/* Status badge */}
                <Box className="rounded-full bg-neutral-700 h-6 w-24 animate-pulse" />

                {/* Form fields */}
                <Stack spacing={3}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Stack key={i} spacing={1}>
                            <Box className="rounded bg-neutral-700 h-4 w-20 animate-pulse" />
                            <Box className="rounded bg-neutral-700 h-10 w-full animate-pulse" />
                        </Stack>
                    ))}
                </Stack>
            </Box>

            {/* Action buttons */}
            <Stack direction="row" spacing={2}>
                <Box className="rounded-lg bg-neutral-700 h-10 flex-1 animate-pulse" />
                <Box className="rounded-lg bg-neutral-700 h-10 flex-1 animate-pulse" />
            </Stack>

            {/* Details section */}
            <Box className="space-y-3">
                <Box className="rounded bg-neutral-700 h-6 w-32 animate-pulse" />
                <Stack spacing={2}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Box key={i} className="rounded bg-neutral-700 h-16 w-full animate-pulse" />
                    ))}
                </Stack>
            </Box>
        </>
    );
}
