"use client";

import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = <T = unknown,>(endpoint: string, eventName: string) => {
	const [lastEvent, setLastEvent] = useState<T | null>(null);

	const socket: Socket | null = useMemo(() => {
		try {
			return io(endpoint, { transports: ["websocket"] });
		} catch {
			return null;
		}
	}, [endpoint]);

	useEffect(() => {
		if (!socket) return;
		const onEvent = (data: T) => {
			setLastEvent(data);
		};
		socket.on(eventName, onEvent);
		return () => {
			socket.off(eventName, onEvent);
			socket.close();
		};
	}, [socket, eventName]);

	return lastEvent;
};


