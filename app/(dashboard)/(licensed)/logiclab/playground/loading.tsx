import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function PlaygroundLoading() {
  return (
    <div className="flex flex-col gap-3 p-3 md:p-5 h-[calc(100svh-56px)] bg-background text-foreground overflow-hidden">
      {/* Toolbar */}
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card/60 border-border/60 shadow-2xs px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg shrink-0" />
          <Skeleton className="size-9 rounded-lg shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-2.5 w-40 rounded" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </Card>

      {/* Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Editor */}
        <Card className="lg:col-span-7 flex flex-col bg-card border-border/60 shadow-2xs overflow-hidden min-h-[300px]">
          <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-2.5 w-48 rounded" />
            </div>
            <Skeleton className="size-4 rounded" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 bg-card/40 p-10">
            <div className="size-8 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
        </Card>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
          {/* Stdin */}
          <Card className="flex flex-col bg-card border-border/60 shadow-2xs overflow-hidden shrink-0 h-[160px]">
            <div className="bg-muted/40 px-4 py-2.5 border-b border-border/40 shrink-0">
              <Skeleton className="h-2.5 w-32 rounded" />
            </div>
            <div className="flex-1 p-3">
              <Skeleton className="h-3.5 w-3/4 rounded mb-2" />
              <Skeleton className="h-3.5 w-1/2 rounded" />
            </div>
          </Card>

          {/* Console Output */}
          <Card className="flex-1 flex flex-col bg-card border-border/60 shadow-2xs overflow-hidden min-h-0">
            <div className="bg-muted/40 px-4 py-2.5 border-b border-border/40 shrink-0">
              <Skeleton className="h-2.5 w-32 rounded" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2.5 p-10">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-3 w-44 rounded" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
