'use client'

import { useEffect, useMemo, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export const useSocket = <T = unknown>(endpoint: string, eventName: string) => {
	const [lastEvent, setLastEvent] = useState<T | null>(null)

	const socket: Socket | null = useMemo(() => {
		try {
			// @TODO Add connection strategy options:
			//       - Exponential backoff on reconnect
			//       - Heartbeat/keepalive and connection status exposure to the UI
			//       - Versioned event contracts and runtime validation (e.g., zod) before setLastEvent
			return io(endpoint, { transports: ['websocket'] })
		} catch {
			return null
		}
	}, [endpoint])

	useEffect(() => {
		if (!socket) return
		const onEvent = (data: T) => {
			// @TODO Validate incoming payload shape; consider discarding unexpected versions
			setLastEvent(data)
		}
		socket.on(eventName, onEvent)
		return () => {
			socket.off(eventName, onEvent)
			// @TODO Consider leaving socket open for shared subscriptions across components
			socket.close()
		}
	}, [socket, eventName])

	return lastEvent
}
