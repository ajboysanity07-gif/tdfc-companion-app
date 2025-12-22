//resources/js/hooks/use-product-management.ts
import axiosClient, { getCsrfCookie } from '@/api/axios-client';
import type {
    AmortschedDisplayEntry,
    AmortschedDisplayResponse,
    Client,
    RejectionReasonEntry,
    RejectPayload,
    SalaryPayload,
    WlnMasterRecord,
    WlnMasterResponse,
    WlnLedEntry,
    WlnLedResponse,
} from '@/types/user';
import axios, { AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';

type ApiListResponse<T> = { data: T[] };
type ApiErrorPayload = { message?: string };

export const useClientManagement = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [rejectionReasons, setRejectionReasons] = useState<RejectionReasonEntry[]>([]);
    const [success, setSuccess] = useState<string | null>(null);
    const [wlnMasterByAcctno, setWlnMasterByAcctno] = useState<Record<string, WlnMasterRecord[]>>({});
    const [wlnMasterLoading, setWlnMasterLoading] = useState<Record<string, boolean>>({});
    const [amortschedByLnnumber, setAmortschedByLnnumber] = useState<Record<string, AmortschedDisplayEntry[]>>({});
    const [amortschedLoading, setAmortschedLoading] = useState<Record<string, boolean>>({});
    const [wlnLedByLnnumber, setWlnLedByLnnumber] = useState<Record<string, WlnLedEntry[]>>({});
    const [wlnLedLoading, setWlnLedLoading] = useState<Record<string, boolean>>({});

    // Auto-clear success after a short delay so the banner fades out
    useEffect(() => {
        if (!success) return;
        const t = setTimeout(() => setSuccess(null), 3000);
        return () => clearTimeout(t);
    }, [success]);

    const errorMessage = (err: unknown) => {
        if (axios.isAxiosError(err)) {
            const data = err.response?.data as ApiErrorPayload | undefined;
            return data?.message ?? 'Request failed';
        }
        return 'Request failed';
    };

    const toList = (res: AxiosResponse<Client[] | ApiListResponse<Client>>) => {
        const body = res.data;
        return Array.isArray(body) ? body : body?.data ?? [];
    };

    // GET /api/rejection-reasons
    const fetchRejectionReasons = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await getCsrfCookie();
            const res = await axiosClient.get<
                RejectionReasonEntry[] | ApiListResponse<RejectionReasonEntry> | { reasons: RejectionReasonEntry[] }
            >('/rejection-reasons');
            const body = res.data;
            let list: RejectionReasonEntry[] = [];
            if (Array.isArray(body)) {
                list = body;
            } else if (body && typeof body === 'object') {
                const maybe = body as { data?: unknown; reasons?: unknown };
                if (Array.isArray(maybe.reasons)) {
                    list = maybe.reasons;
                } else if (Array.isArray(maybe.data)) {
                    list = maybe.data as RejectionReasonEntry[];
                } else if (maybe.data && typeof maybe.data === 'object' && Array.isArray((maybe.data as { data?: unknown }).data)) {
                    list = (maybe.data as { data: RejectionReasonEntry[] }).data;
                }
            }
            setRejectionReasons(list);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch products: GET /api/clients
    const fetchClients = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await getCsrfCookie();
            const response = await axiosClient.get<Client[] | ApiListResponse<Client>>('/clients');
            // Supports both paginated ({ data: [...] }) and plain array responses
            const list = toList(response);
            setClients(list);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    // Approve Clients: POST /clients/${userId}/approve
    const approveClient = useCallback(
        async (userId: number) => {
            setError(null);
            setSuccess(null);
            try {
                await getCsrfCookie();
                await axiosClient.post(`/clients/${userId}/approve`);
                await fetchClients();
                setSuccess('Client approved successfully');
            } catch (err) {
                setError(errorMessage(err));
                throw err;
            }
        },
        [fetchClients],
    );

    // POST to /clients/{userId}/reject
    const rejectClient = useCallback(
        async (userId: number, reasons: string[]) => {
            setError(null);
            setSuccess(null);
            try {
                await getCsrfCookie();
                const payload: RejectPayload = { reasons };
                await axiosClient.post(`/clients/${userId}/reject`, payload);
                await fetchClients();
                setSuccess('Client rejected successfully');
            } catch (err) {
                setError(errorMessage(err));
                throw err;
            }
        },
        [fetchClients],
    );

    // Update Salary POST to /clients/${acctno}/salary
    const updateSalary = useCallback(
        async (acctno: string, payload: SalaryPayload) => {
            setError(null);
            setSuccess(null);
            try {
                await getCsrfCookie();
                await axiosClient.post(`/clients/${acctno}/salary`, payload);
                await fetchClients();
                setSuccess('Salary saved successfully');
            } catch (err) {
                setError(errorMessage(err));
                throw err;
            }
        },
        [fetchClients],
    );

    // GET /api/clients/{acctno}/wlnmaster
    const fetchWlnMaster = useCallback(
        async (acctno: string): Promise<WlnMasterResponse | null> => {
            setWlnMasterLoading((prev) => ({ ...prev, [acctno]: true }));
            setError(null);
            try {
                await getCsrfCookie();
                const res = await axiosClient.get<WlnMasterResponse>(`/clients/${acctno}/wlnmaster`);
                setWlnMasterByAcctno((prev) => ({
                    ...prev,
                    [acctno]: res.data?.records ?? [],
                }));
                return res.data;
            } catch (err) {
                setError(errorMessage(err));
                setWlnMasterByAcctno((prev) => ({
                    ...prev,
                    [acctno]: prev[acctno] ?? [],
                }));
                return null;
            } finally {
                setWlnMasterLoading((prev) => ({ ...prev, [acctno]: false }));
            }
        },
        [],
    );

    // GET /api/clients/loans/{lnnumber}/amortsched
    const fetchAmortsched = useCallback(
        async (lnnumber: string): Promise<AmortschedDisplayResponse | null> => {
            setAmortschedLoading((prev) => ({ ...prev, [lnnumber]: true }));
            setError(null);
            try {
                await getCsrfCookie();
                const res = await axiosClient.get<AmortschedDisplayResponse>(`/clients/loans/${lnnumber}/amortsched`);
                setAmortschedByLnnumber((prev) => ({
                    ...prev,
                    [lnnumber]: res.data?.schedule ?? [],
                }));
                return res.data;
            } catch (err) {
                setError(errorMessage(err));
                setAmortschedByLnnumber((prev) => ({
                    ...prev,
                    [lnnumber]: prev[lnnumber] ?? [],
                }));
                return null;
            } finally {
                setAmortschedLoading((prev) => ({ ...prev, [lnnumber]: false }));
            }
        },
        [],
    );

    // GET /api/clients/loans/{lnnumber}/wlnled
    const fetchWlnLed = useCallback(
        async (lnnumber: string): Promise<WlnLedResponse | null> => {
            setWlnLedLoading((prev) => ({ ...prev, [lnnumber]: true }));
            setError(null);
            try {
                await getCsrfCookie();
                const res = await axiosClient.get<WlnLedResponse>(`/clients/loans/${lnnumber}/wlnled`);
                setWlnLedByLnnumber((prev) => ({
                    ...prev,
                    [lnnumber]: res.data?.ledger ?? [],
                }));
                return res.data;
            } catch (err) {
                setError(errorMessage(err));
                setWlnLedByLnnumber((prev) => ({
                    ...prev,
                    [lnnumber]: prev[lnnumber] ?? [],
                }));
                return null;
            } finally {
                setWlnLedLoading((prev) => ({ ...prev, [lnnumber]: false }));
            }
        },
        [],
    );

    return {
        clients,
        rejectionReasons,
        loading,
        error,
        success,
        wlnMasterByAcctno,
        wlnMasterLoading,
        amortschedByLnnumber,
        amortschedLoading,
        wlnLedByLnnumber,
        wlnLedLoading,
        fetchRejectionReasons,
        fetchClients,
        approveClient,
        rejectClient,
        updateSalary,
        fetchWlnMaster,
        fetchAmortsched,
        fetchWlnLed,
    };
};
