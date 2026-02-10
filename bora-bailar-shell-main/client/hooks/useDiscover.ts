/**
 * Hook for fetching discover data from API
 * Provides loading, error, and data states
 */
import { useState, useEffect, useCallback } from "react";
import { realApi, DiscoverResponse } from "../services/realApi";

interface UseDiscoverResult {
    data: DiscoverResponse | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDiscover(): UseDiscoverResult {
    const [data, setData] = useState<DiscoverResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await realApi.discover();
            setData(response);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar dados";
            setError(message);
            console.error("[useDiscover] Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}
