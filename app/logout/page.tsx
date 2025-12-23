"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    logout()
    window.dispatchEvent(new Event("storage"))
    router.push("/")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Logging out...</p>
    </div>
  )
}
