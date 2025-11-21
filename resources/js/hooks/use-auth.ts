import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export function useAuth() {
    const [user, setUser] = useState<unknown | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user on mount
    useEffect(() => {
        axios
            .get('/api/user')
            .then((res) => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);
    const login = useCallback(
  async (email: string, password: string, remember: boolean = false) => {
    await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

    const res = await axios.post("/login", { email, password, remember }, { withCredentials: true });
    await axios.get("/api/user", { withCredentials: true }); // optional: update user context
    return res.data;
  },
  []
);

    const logout = useCallback(async () => {
        await axios.post('/logout');
        setUser(null);
    }, []);

    return { user, loading, login, logout };
}
