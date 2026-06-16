import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// ─── Header Primitives ────────────────────────────────────────────────────────
interface DashboardPageHeaderProps {
  title?: string
  titleWidth?: string
  descWidth?: string
  hasButton?: boolean
  buttonWidth?: string
}

export function DashboardPageHeader({
  title,
  titleWidth = "w-48",
  descWidth = "w-80",
  hasButton = false,
  buttonWidth = "w-24",
}: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
      <div className="flex flex-col gap-1.5">
        {title ? (
          <h1 className="text-3xl font-bold font-cirka tracking-tight text-foreground">{title}</h1>
        ) : (
          <Skeleton className={`h-9 ${titleWidth} rounded-lg`} />
        )}
        <Skeleton className={`h-4 ${descWidth} rounded`} />
      </div>
      {hasButton && <Skeleton className={`h-10 ${buttonWidth} rounded-md shrink-0`} />}
    </div>
  )
}

// ─── Dashboard Page Layout Wrapper ────────────────────────────────────────────
interface DashboardPageLayoutProps {
  children: React.ReactNode
  title?: string
  titleWidth?: string
  descWidth?: string
  hasButton?: boolean
  buttonWidth?: string
  hasTabs?: boolean
  tabCount?: number
}

export function DashboardPageLayout({
  children,
  title,
  titleWidth,
  descWidth,
  hasButton,
  buttonWidth,
  hasTabs = false,
  tabCount = 4,
}: DashboardPageLayoutProps) {
  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8 w-full min-h-0 overflow-y-auto">
      <DashboardPageHeader
        title={title}
        titleWidth={titleWidth}
        descWidth={descWidth}
        hasButton={hasButton}
        buttonWidth={buttonWidth}
      />

      {hasTabs && (
        <div className="overflow-x-auto shrink-0">
          <div className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-muted/40 p-1 border border-border/40">
            {Array.from({ length: tabCount }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 rounded-lg shrink-0"
                style={{ width: `${60 + (i % 3) * 20}px` }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-6">{children}</div>
    </div>
  )
}

// ─── Metric Cards Skeleton ─────────────────────────────────────────────────────
export function MetricCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border/60 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="size-4.5 rounded" />
          </CardHeader>
          <CardContent className="space-y-1">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Table Skeleton ───────────────────────────────────────────────────────────
interface TableSkeletonProps {
  rows?: number
  cols?: number
  colWidths?: string[]
}

export function TableSkeleton({ rows = 6, cols = 5, colWidths = [] }: TableSkeletonProps) {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden shadow-2xs bg-card">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10 h-11 border-b border-border/60">
            <TableRow className="hover:bg-transparent">
              {Array.from({ length: cols }).map((_, i) => (
                <TableHead key={i} className={i === 0 ? "pl-6" : ""}>
                  <Skeleton className={`h-4 ${colWidths[i] || "w-16"} rounded`} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <TableRow key={rowIdx} className="h-14 border-b border-border/60 hover:bg-transparent">
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <TableCell key={colIdx} className={colIdx === 0 ? "pl-6" : ""}>
                    {colIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-5 rounded-md shrink-0" />
                        <Skeleton className={`h-4.5 ${colWidths[colIdx] || "w-32"} rounded`} />
                      </div>
                    ) : (
                      <Skeleton className={`h-4 ${colWidths[colIdx] || "w-20"} rounded`} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination shell */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/60 bg-muted/5">
        <Skeleton className="h-4 w-40 rounded" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ─── Card Grid Skeleton ───────────────────────────────────────────────────────
export function CardGridSkeleton({ count = 6, columnsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" }: { count?: number, columnsClass?: string }) {
  return (
    <div className={`grid gap-4 ${columnsClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5 flex flex-col gap-4 border-border/60 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-3.5 w-1/2 rounded" />
            </div>
            <Skeleton className="h-5.5 w-14 rounded-full shrink-0" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-5/6 rounded" />
          </div>
          <div className="flex gap-2 pt-1 mt-auto">
            <Skeleton className="h-8.5 w-24 rounded-lg" />
            <Skeleton className="size-8.5 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── Form Skeleton ────────────────────────────────────────────────────────────
export function FormSkeleton({ sectionCount = 3 }: { sectionCount?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: sectionCount }).map((_, i) => (
        <Card key={i} className="border-border/60 shadow-2xs">
          <div className="flex flex-col gap-y-1.5 p-6 border-b border-border/40">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3.5 w-64 rounded" />
          </div>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {Array.from({ length: 3 + (i % 2) * 2 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-3.5 w-16 rounded" />
                  <Skeleton className="h-9.5 w-full rounded-lg" />
                </div>
              ))}
            </div>
            {i % 2 === 0 && (
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Workspace Split Skeleton ─────────────────────────────────────────────────
export function WorkspaceSplitSkeleton({ type = "ide" }: { type?: "ide" | "resume" }) {
  if (type === "ide") {
    return (
      <div className="flex flex-col h-[calc(100svh-56px)] bg-zinc-50 dark:bg-zinc-900/40 text-foreground overflow-hidden">
        {/* Navbar Mock */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border-b border-border/40 h-[48px] shrink-0 select-none">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-16 rounded-lg shrink-0" />
            <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-7 w-20 rounded-lg shrink-0" />
            <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
            <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
          </div>
        </div>

        {/* Main Workspace Panels Mock */}
        <div className="flex-1 pt-0 px-2 pb-2 min-h-0 overflow-hidden flex gap-2">
          {/* Left Panel: Description */}
          <div className="w-[45%] flex flex-col min-h-0 rounded-md border border-border/50 overflow-hidden bg-card shadow-xs">
            {/* Tab bar header */}
            <div className="flex bg-card shrink-0 justify-start h-[40px] px-2 border-b border-border/50 gap-2 items-center">
              <Skeleton className="h-5 w-24 rounded shrink-0" />
              <Skeleton className="h-5 w-28 rounded shrink-0" />
              <Skeleton className="h-5 w-16 rounded shrink-0" />
            </div>
            {/* Content */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
              {/* Title and difficulty */}
              <div className="space-y-3">
                <Skeleton className="h-7 w-48 rounded" />
                <div className="flex gap-2">
                  <Skeleton className="h-5.5 w-14 rounded-full" />
                  <Skeleton className="h-5.5 w-20 rounded-full" />
                </div>
              </div>
              {/* Paragraph lines */}
              <div className="space-y-2.5 pt-2">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-5/6 rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>
              <div className="space-y-2.5 pt-4">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-2/3 rounded" />
              </div>
            </div>
          </div>

          {/* Right Panel Group */}
          <div className="w-[55%] flex flex-col gap-2 min-h-0">
            {/* Editor Panel */}
            <div className="h-[55%] flex flex-col min-h-0 rounded-md border border-border/50 overflow-hidden bg-card shadow-xs">
              {/* Editor Header */}
              <div className="flex items-center justify-between bg-card shrink-0 h-[40px] border-b border-border/50 px-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <Skeleton className="h-6 w-6 rounded" />
              </div>
              {/* Editor Lines Mock */}
              <div className="flex-1 p-4 bg-card font-mono text-xs overflow-hidden flex flex-col gap-2.5">
                {Array.from({ length: 10 }).map((_, i) => {
                  const widths = ["w-1/3", "w-1/2", "w-2/3", "w-1/4", "w-3/4", "w-1/2", "w-5/6", "w-1/3", "w-2/3", "w-1/2"];
                  const indents = ["pl-0", "pl-4", "pl-4", "pl-8", "pl-8", "pl-8", "pl-4", "pl-0", "pl-4", "pl-0"];
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 text-right text-[10px] text-muted-foreground/30 select-none">
                        {i + 1}
                      </div>
                      <div className={`${indents[i]} flex-1`}>
                        <Skeleton className={`h-3.5 ${widths[i]} rounded`} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Console / Output Panel */}
            <div className="h-[45%] flex flex-col min-h-0 rounded-md border border-border/50 overflow-hidden bg-card shadow-xs">
              {/* Header tabs */}
              <div className="flex items-center justify-between bg-card shrink-0 h-[40px] border-b border-border/50 px-3">
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-20 rounded" />
                  <Skeleton className="h-5.5 w-24 rounded" />
                </div>
              </div>
              {/* Console Content */}
              <div className="flex-1 p-4 space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-16 rounded-lg" />
                  <Skeleton className="h-7 w-16 rounded-lg" />
                  <Skeleton className="h-7 w-16 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 items-start w-full">
      <div className="space-y-4">
        <Card className="p-5 space-y-4 border-border/60 shadow-2xs">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-4.5 w-32 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3.5 w-16 rounded" />
                <Skeleton className="h-9.5 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </Card>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 flex items-center justify-between border-border/60 shadow-2xs">
            <div className="flex items-center gap-3">
              <Skeleton className="size-5 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
            <Skeleton className="size-4 rounded" />
          </Card>
        ))}
      </div>
      <div className="hidden xl:block bg-muted/15 border border-border/40 rounded-2xl p-6 flex justify-center sticky top-6">
        <div className="bg-card shadow-md border border-border/50 rounded-xl w-full aspect-[1/1.4] p-8 space-y-6">
          <div className="text-center space-y-2.5">
            <Skeleton className="h-7 w-48 mx-auto rounded" />
            <Skeleton className="h-3.5 w-64 mx-auto rounded" />
            <Skeleton className="h-3 w-80 mx-auto rounded" />
          </div>
          <div className="h-px bg-border/60" />
          <div className="space-y-3.5">
            <Skeleton className="h-4 w-24 rounded" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-36 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-5/6 rounded" />
            </div>
          </div>
          <div className="space-y-3.5">
            <Skeleton className="h-4 w-24 rounded" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-40 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <Skeleton className="h-3 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Public Landing Page Skeleton ─────────────────────────────────────────────
interface PublicPageLayoutProps {
  children: React.ReactNode
}

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Floating Header */}
      <header className="fixed inset-x-0 top-0 z-50 w-full px-3 pt-3 md:px-4 shrink-0">
        <div className="mx-auto w-full max-w-6xl">
          <div className="w-full rounded-full border border-border bg-background/50 backdrop-blur-xl">
            <nav className="flex w-full items-center justify-between px-4 h-14 md:h-12">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4.5 w-20 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8.5 w-16 rounded-lg" />
                <Skeleton className="h-8.5 w-24 rounded-lg" />
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-24 md:pt-28 pb-16">{children}</main>

      {/* Footer */}
      <footer className="relative mt-auto border-t border-border/60 py-10 bg-card/20 shrink-0">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 md:col-span-4 space-y-4">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
              <div className="flex gap-2.5">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
              </div>
            </div>
            <div className="col-span-3 md:col-span-1 space-y-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
            <div className="col-span-3 md:col-span-1 space-y-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
