"use client"

import React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface SiteHeaderProps {
    onManualToggle: () => void
}

export function SiteHeader({ onManualToggle }: SiteHeaderProps) {
    return (
        <header className="flex h-10 w-full min-w-0 items-center gap-2 transition-[width,height] ease-linear md:hidden">
            <div className="flex w-full min-w-0 items-center gap-1 px-4">
                <SidebarTrigger className="-ml-1" onClick={onManualToggle} />
            </div>
        </header>
    )
}
