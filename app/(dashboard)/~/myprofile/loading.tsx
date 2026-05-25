import { Skeleton } from "@/components/ui/skeleton"

function Field({ labelW = "w-24" }: { labelW?: string }) {
  return (
    <div className="space-y-2">
      <Skeleton className={`h-4 ${labelW}`} />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  )
}

function Hr() {
  return <Skeleton className="h-px w-full" />
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card">
      {children}
    </div>
  )
}

function CardHead({ titleW = "w-36", descW = "w-56" }: { titleW?: string; descW?: string }) {
  return (
    <div className="flex flex-col space-y-1.5 p-6">
      <Skeleton className={`h-5 ${titleW}`} />
      <Skeleton className={`h-4 ${descW}`} />
    </div>
  )
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pt-0 space-y-4">{children}</div>
}

export default function ProfileLoading() {
  return (
    <div className="min-h-screen w-full">
      {/* Page Header */}
      <div className="px-4 pt-8 pb-0 md:px-8">
        <div className="space-y-0.5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Profile details stack */}
      <div className="px-4 py-6 md:px-8 md:py-8 space-y-6">
        <Card>
          <CardHead titleW="w-36" descW="w-72" />
          <CardBody>
            <div className="max-w-sm space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead titleW="w-28" descW="w-52" />
          <CardBody>
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-3.5 w-44" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead titleW="w-40" descW="w-56" />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field />
              <Field />
              <Field />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field />
              <Field />
              <Field />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
