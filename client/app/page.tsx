"use client";

import { useQuery } from "@tanstack/react-query";
import { useSocket } from "../hooks/useSocket";

const Page = () => {
	const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:4000";

	const { data, isLoading, isError } = useQuery({
		queryKey: ["health"],
		queryFn: async () => {
			const res = await fetch(`${serverUrl}/health`);
			if (!res.ok) throw new Error("Failed to fetch health");
			return (await res.json()) as {
				ok: boolean;
				database: string;
				redis: string;
			};
		},
		refetchInterval: 30000
	});

	const lastEvent = useSocket(`${serverUrl}/events`, "hype");

	return (
		<main style={{ padding: 24, fontFamily: "system-ui, Arial, sans-serif" }}>
			<h1 style={{ marginBottom: 16 }}>Telemetry Dashboard</h1>

			<section style={{ marginBottom: 24 }}>
				<h2>System Health</h2>
				{isLoading ? (
					<div className="skeleton" style={{ width: 320, height: 24 }} />
				) : isError ? (
					<p style={{ color: "crimson" }}>Health check failed</p>
				) : (
					<ul>
						<li>Database: {data?.database}</li>
						<li>Redis: {data?.redis}</li>
					</ul>
				)}
			</section>

			<section>
				<h2>Live Hype Events</h2>
				<p>Listening on /events for "hype"…</p>
				<pre
					style={{
						background: "#111",
						color: "#0f0",
						padding: 12,
						borderRadius: 8,
						minHeight: 80,
						maxWidth: 640,
						overflowX: "auto"
					}}
				>
{JSON.stringify(lastEvent ?? { waiting: true }, null, 2)}
				</pre>
			</section>
		</main>
	);
};

export default Page;


