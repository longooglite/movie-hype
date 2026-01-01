'use client'
import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
export const useSocket = (endpoint, eventName) => {
	const [lastEvent, setLastEvent] = useState(null)
	const socket = useMemo(() => {
		try {
			return io(endpoint, { transports: ['websocket'] })
		} catch {
			return null
		}
	}, [endpoint])
	useEffect(() => {
		if (!socket) return
		const onEvent = (data) => {
			setLastEvent(data)
		}
		socket.on(eventName, onEvent)
		return () => {
			socket.off(eventName, onEvent)
			socket.close()
		}
	}, [socket, eventName])
	return lastEvent
}
