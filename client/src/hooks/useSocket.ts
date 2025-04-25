"use client"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_BACKEND_URL as string)
    setSocket(s)
    return () => {
      s.disconnect()
    }
  }, [])
  return socket
}
