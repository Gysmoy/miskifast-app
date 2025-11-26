import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { APP_CORRELATIVE, APP_ENV, EVENTS_URL } from '@/constants/settings'

const useSocket = (filters) => {
    const socketRef = useRef(null)

    useEffect(() => {
        // Evitar múltiples conexiones
        if (!socketRef.current) {
            socketRef.current = io(`${EVENTS_URL}/${APP_CORRELATIVE}`, {
                transports: ['websocket', 'polling']
            })

            const socket = socketRef.current

            socket.on('connect', () => {
                console.log('🟢 Conectado a', socket.io.uri)
                socket.emit('register_filters', {
                    environment: APP_ENV,
                    ...filters
                })
            })

            socket.on('filters_registered', ({ service, filters }) => {
                const filtersArray = Object.entries(filters).map(
                    ([key, value]) => `${key}: ${value}`
                )
                console.log('Filtros actualizados:', filtersArray.join('\n'))
            })

            socket.on('disconnect', () => {
                console.log('🔴 Desconectado de', socket.io.uri)
            })

            socket.on('error', (err) => console.error('❌ Error socket:', err))
        }

        return () => {
            if (socketRef.current) {
                console.log('🔴 Cerrando conexión...')
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }, [])

    return socketRef
}

export default useSocket