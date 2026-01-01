'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { useSocket } from '../hooks/useSocket';
const Page = () => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:4000';
    const { data, isLoading, isError } = useQuery({
        queryKey: ['health'],
        queryFn: async () => {
            const res = await fetch(`${serverUrl}/health`);
            if (!res.ok)
                throw new Error('Failed to fetch health');
            return (await res.json());
        },
        refetchInterval: 30000,
    });
    const lastEvent = useSocket(`${serverUrl}/events`, 'hype');
    return (_jsxs("main", { style: { padding: 24, fontFamily: 'system-ui, Arial, sans-serif' }, children: [_jsx("h1", { style: { marginBottom: 16 }, children: "Telemetry Dashboard" }), _jsxs("section", { style: { marginBottom: 24 }, children: [_jsx("h2", { children: "System Health" }), isLoading ? (_jsx("div", { className: "skeleton", style: { width: 320, height: 24 } })) : isError ? (_jsx("p", { style: { color: 'crimson' }, children: "Health check failed" })) : (_jsxs("ul", { children: [_jsxs("li", { children: ["Database: ", data?.database] }), _jsxs("li", { children: ["Redis: ", data?.redis] })] }))] }), _jsxs("section", { children: [_jsx("h2", { children: "Live Hype Events" }), _jsx("p", { children: "Listening on /events for \"hype\"\u2026" }), _jsx("pre", { style: {
                            background: '#111',
                            color: '#0f0',
                            padding: 12,
                            borderRadius: 8,
                            minHeight: 80,
                            maxWidth: 640,
                            overflowX: 'auto',
                        }, children: JSON.stringify(lastEvent ?? { waiting: true }, null, 2) })] })] }));
};
export default Page;
