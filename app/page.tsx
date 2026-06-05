"use client"

import { useRouter } from "next/navigation"
import { ShieldCheckIcon, UserRoundIcon } from "lucide-react"

import { ShimmerButton } from "@/components/ui/shimmer-button"

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex min-h-svh flex-1 items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Choose your portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Select how you want to continue.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2">
          {/* Admin Dashboard */}
          <ShimmerButton
            className="h-11 gap-2 shadow-2xl"
            onClick={() => router.push("/admin-dashboard")}
          >
            <ShieldCheckIcon className="size-4" />
            <span className="text-sm font-medium">Admin</span>
          </ShimmerButton>

          {/* User's Dashboard */}
          <ShimmerButton
            className="h-11 gap-2 shadow-2xl"
            background="rgba(39, 39, 42, 1)"
            onClick={() => router.push("/dashboard")}
          >
            <UserRoundIcon className="size-4" />
            <span className="text-sm font-medium">User</span>
          </ShimmerButton>
        </div>
      </div>
    </main>
  )
}
