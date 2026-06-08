"use client"

import { useState, useEffect, useTransition, useRef, useCallback, useEffectEvent } from "react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Pencil,
  Building2,
  IndianRupee,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { upsertPlacementInfo } from "./actions"
import { toast } from "sonner"
import { useRouter, usePathname } from "next/navigation"


// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlacementRecord {
  profile_id: string
  display_name: string
  email: string | null
  phone_number: string | null
  course_name: string | null
  passout_year: number | null
  company_name: string | null
  ctc: number | null
  offer_letter_date: string | null
  job_role: string | null
  offer_type: string | null
  location: string | null
  profile_image_path: string | null
}

type SortColumn = "name" | "course" | "passout" | "company" | "ctc"

type OfferType = "on_campus" | "off_campus" | "internship" | "ppo" | "freelance"

interface Props {
  records: PlacementRecord[]
  totalCount: number
  initialPage: number
  initialPageSize: number
  initialSearch: string
  initialPlacedFilter: "all" | "placed" | "not_placed"
  initialPassoutYear: string
  initialCourse: string
  initialSortCol: SortColumn
  initialSortDir: "asc" | "desc"
  availableYears: number[]
  availableCourses: string[]
}


// ─── Constants ────────────────────────────────────────────────────────────────

const OFFER_TYPE_OPTIONS: { value: OfferType; label: string }[] = [
  { value: "on_campus", label: "On-Campus" },
  { value: "off_campus", label: "Off-Campus" },
  { value: "internship", label: "Internship" },
  { value: "ppo", label: "PPO" },
  { value: "freelance", label: "Freelance" },
]

const INDIAN_CITIES = [
  "Ahmedabad", "Bengaluru", "Bhopal", "Chandigarh", "Chennai",
  "Coimbatore", "Delhi", "Gurugram", "Hyderabad", "Indore",
  "Jaipur", "Kochi", "Kolkata", "Lucknow", "Mumbai",
  "Nagpur", "Nashik", "Noida", "Pune", "Surat",
  "Vadodara", "Visakhapatnam",
]


// ─── Offer Type Badge ─────────────────────────────────────────────────────────

function OfferTypeBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-sm text-muted-foreground">—</span>

  const config: Record<string, { label: string; className: string }> = {
    on_campus:  { label: "On-Campus",  className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
    off_campus: { label: "Off-Campus", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
    internship: { label: "Internship", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
    ppo:        { label: "PPO",        className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800" },
    freelance:  { label: "Freelance",  className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700" },
  }

  const c = config[type]
  if (!c) return <Badge variant="outline">{type}</Badge>

  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium px-2 py-0.5 whitespace-nowrap", c.className)}>
      {c.label}
    </Badge>
  )
}


// ─── Sortable Table Head ───────────────────────────────────────────────────────

function SortableHead<T extends string>({
  label,
  col,
  sortCol,
  sortDir,
  onSort,
  className,
}: {
  label: string
  col: T
  sortCol: T
  sortDir: "asc" | "desc"
  onSort: (col: T) => void
  className?: string
}) {
  return (
    <TableHead
      className={cn(
        "text-xs font-semibold select-none cursor-pointer hover:bg-muted/60 transition-colors",
        className
      )}
      onClick={() => onSort(col)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        {sortCol === col ? (
          sortDir === "asc" ? (
            <ArrowUp className="size-3.5 text-foreground" />
          ) : (
            <ArrowDown className="size-3.5 text-foreground" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 opacity-30 hover:opacity-100 transition-opacity" />
        )}
      </div>
    </TableHead>
  )
}


// ─── Student Detail Panel (Sheet) ─────────────────────────────────────────────

interface PanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: PlacementRecord | null
  onSaved: () => void
}

function StudentDetailPanel({ open, onOpenChange, record, onSaved }: PanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [companyName, setCompanyName] = useState("")
  const [ctc, setCtc] = useState("")
  const [offerLetterDate, setOfferLetterDate] = useState("")
  const [jobRole, setJobRole] = useState("")
  const [offerType, setOfferType] = useState<OfferType | "">("")
  const [location, setLocation] = useState("")

  // Reset state when record changes or panel opens
  useEffect(() => {
    if (record) {
      setCompanyName(record.company_name ?? "")
      setCtc(record.ctc != null ? String(record.ctc) : "")
      setOfferLetterDate(record.offer_letter_date ?? "")
      setJobRole(record.job_role ?? "")
      setOfferType((record.offer_type as OfferType) ?? "")
      setLocation(record.location ?? "")
    }
    setIsEditing(false)
  }, [record, open])

  const handleCancelEdit = () => {
    if (record) {
      setCompanyName(record.company_name ?? "")
      setCtc(record.ctc != null ? String(record.ctc) : "")
      setOfferLetterDate(record.offer_letter_date ?? "")
      setJobRole(record.job_role ?? "")
      setOfferType((record.offer_type as OfferType) ?? "")
      setLocation(record.location ?? "")
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!record) return
    const ctcNum = ctc.trim() === "" ? null : parseFloat(ctc)
    if (ctc.trim() !== "" && (isNaN(ctcNum!) || ctcNum! < 0)) {
      toast.error("Please enter a valid CTC value (e.g. 12.5)")
      return
    }
    try {
      setSaving(true)
      await upsertPlacementInfo({
        candidateUuid: record.profile_id,
        companyName: companyName.trim() || null,
        ctc: ctcNum,
        offerLetterDate: offerLetterDate || null,
        jobRole: jobRole.trim() || null,
        offerType: (offerType as OfferType) || null,
        location: location.trim() || null,
      })
      toast.success("Placement info updated")
      onSaved()
      setIsEditing(false)
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const formatCtc = (val: number | null) => {
    if (val == null) return "—"
    return `₹${val.toFixed(1)} LPA`
  }

  const formatDate = (val: string | null) => {
    if (!val) return "—"
    return new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  const offerTypeLabel = (val: string | null) => {
    if (!val) return "—"
    return OFFER_TYPE_OPTIONS.find((o) => o.value === val)?.label ?? val
  }

  if (!record) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-y-auto"
      >
        {/* ── Header ── */}
        <SheetHeader className="p-6 pb-5 border-b bg-muted/30">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 shrink-0 ring-2 ring-background shadow-sm">
              <AvatarImage src={record.profile_image_path || undefined} />
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {record.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <SheetTitle className="text-lg font-bold leading-tight truncate">
                {record.display_name}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-0.5">
                {record.course_name || "—"}{record.passout_year ? ` · ${record.passout_year}` : ""}
              </SheetDescription>
            </div>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-2 mt-4">
            {record.email && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="size-3.5 shrink-0 text-muted-foreground/70" />
                <span className="truncate">{record.email}</span>
              </div>
            )}
            {record.phone_number && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="size-3.5 shrink-0 text-muted-foreground/70" />
                <span>{record.phone_number}</span>
              </div>
            )}
            {!record.email && !record.phone_number && (
              <p className="text-xs text-muted-foreground italic">No contact info available</p>
            )}
          </div>
        </SheetHeader>

        {/* ── Placement Info ── */}
        <div className="flex flex-col flex-1 p-6 gap-6">
          {/* Section title + Edit toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Placement Details</p>
            {!isEditing && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            )}
          </div>

          {/* ── VIEW MODE ── */}
          {!isEditing && (
            <div className="grid grid-cols-1 gap-4">
              <InfoRow icon={<Building2 className="size-3.5" />} label="Company" value={record.company_name || "—"} />
              <InfoRow icon={<IndianRupee className="size-3.5" />} label="CTC" value={formatCtc(record.ctc)} highlight={record.ctc != null} />
              <InfoRow icon={<Calendar className="size-3.5" />} label="Offer Letter Date" value={formatDate(record.offer_letter_date)} />
              <InfoRow icon={<Briefcase className="size-3.5" />} label="Job Role / Designation" value={record.job_role || "—"} />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Offer Type</span>
                <OfferTypeBadge type={record.offer_type} />
              </div>
              <InfoRow icon={<MapPin className="size-3.5" />} label="Location" value={record.location || "—"} />
            </div>
          )}

          {/* ── EDIT MODE ── */}
          {isEditing && (
            <div className="flex flex-col gap-4">
              {/* Company */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="panel-company">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="panel-company"
                    className="pl-9"
                    placeholder="e.g. Google, Infosys…"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* CTC */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="panel-ctc">CTC (LPA)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="panel-ctc"
                    type="number"
                    min={0}
                    step={0.5}
                    className="pl-9"
                    placeholder="e.g. 12.5"
                    value={ctc}
                    onChange={(e) => setCtc(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Lakhs Per Annum</p>
              </div>

              {/* Offer Letter Date */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="panel-date">Offer Letter Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="panel-date"
                    type="date"
                    className="pl-9"
                    value={offerLetterDate}
                    onChange={(e) => setOfferLetterDate(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Job Role */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="panel-role">Job Role / Designation</Label>
                <div className="relative">
                  <Briefcase className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="panel-role"
                    className="pl-9"
                    placeholder="e.g. Software Engineer, Data Analyst…"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Offer Type */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="panel-offer-type">Offer Type</Label>
                <Select
                  value={offerType || "none"}
                  onValueChange={(val) => setOfferType(val === "none" ? "" : val as OfferType)}
                  disabled={saving}
                >
                  <SelectTrigger id="panel-offer-type">
                    <SelectValue placeholder="Select offer type…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {OFFER_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="panel-location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                  <input
                    id="panel-location"
                    list="city-suggestions"
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm",
                      "ring-offset-background placeholder:text-muted-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    placeholder="e.g. Bengaluru, Maharashtra…"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={saving}
                  />
                  <datalist id="city-suggestions">
                    {INDIAN_CITIES.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Small helper for view-mode rows
function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className={cn("text-sm font-medium", highlight && "text-emerald-600 dark:text-emerald-400")}>
        {value}
      </span>
    </div>
  )
}


// ─── Main Client Component ────────────────────────────────────────────────────

export function PlacementListClient({
  records,
  totalCount,
  initialPage,
  initialPageSize,
  initialSearch,
  initialPlacedFilter,
  initialPassoutYear,
  initialCourse,
  initialSortCol,
  initialSortDir,
  availableYears,
  availableCourses,
}: Props) {
  const { push } = useRouter()
  const pathname = usePathname()

  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(initialSearch)
  const isOwnUpdateRef = useRef(false)

  const [panelOpen, setPanelOpen] = useState(false)
  const [panelRecord, setPanelRecord] = useState<PlacementRecord | null>(null)

  // Sync search input on external navigation
  useEffect(() => {
    if (isOwnUpdateRef.current) {
      isOwnUpdateRef.current = false
      return
    }
    setSearchInput(initialSearch)
  }, [initialSearch])

  const updateParams = useCallback(
    (newParams: Partial<Record<string, string | number>>) => {
      const params = new URLSearchParams(window.location.search)
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === undefined || val === "" || val === null) {
          params.delete(key)
        } else {
          params.set(key, String(val))
        }
      })
      startTransition(() => {
        push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, push]
  )

  const onDebouncedSearch = useEffectEvent(() => {
    isOwnUpdateRef.current = true
    updateParams({ search: searchInput, page: 1 })
  })

  useEffect(() => {
    if (searchInput === initialSearch) return
    const timer = setTimeout(onDebouncedSearch, 400)
    return () => clearTimeout(timer)
  }, [searchInput, initialSearch])

  const handlePlacedFilterChange = (val: "all" | "placed" | "not_placed") => {
    updateParams({ placed: val, page: 1 })
  }

  const handlePassoutYearChange = (val: string) => {
    updateParams({ year: val === "all" ? "" : val, page: 1 })
  }

  const handleCourseChange = (val: string) => {
    updateParams({ course: val === "all" ? "" : val, page: 1 })
  }

  const handlePageSizeChange = (val: string) => {
    updateParams({ size: val, page: 1 })
  }

  const handleSort = (col: SortColumn) => {
    let nextDir: "asc" | "desc" = "desc"
    let nextCol = col
    if (initialSortCol === col) {
      if (initialSortDir === "asc") {
        nextDir = "desc"
      } else {
        nextCol = "name"
        nextDir = "asc"
      }
    } else {
      nextDir = col === "name" || col === "course" || col === "company" ? "asc" : "desc"
    }
    updateParams({ sortBy: nextCol, sortOrder: nextDir, page: 1 })
  }

  const totalPages = Math.ceil(totalCount / initialPageSize)
  const activePage = Math.min(initialPage, Math.max(1, totalPages))

  const openPanel = (record: PlacementRecord) => {
    setPanelRecord(record)
    setPanelOpen(true)
  }

  const formatCtc = (ctc: number | null) => {
    if (ctc == null) return "—"
    return `₹${ctc.toFixed(1)} LPA`
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          {isPending ? (
            <Loader2 className="absolute left-2.5 top-2.5 size-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          )}
          <Input
            placeholder="Search students…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                isOwnUpdateRef.current = true
                setSearchInput("")
                updateParams({ search: "", page: 1 })
              }}
              className="absolute right-2.5 top-2.5 size-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Placed / Not Placed */}
          <div className="flex items-center border rounded-md p-1 bg-muted/50">
            {(["all", "placed", "not_placed"] as const).map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => handlePlacedFilterChange(f)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                  initialPlacedFilter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f === "all" ? "All" : f === "placed" ? "Placed" : "Not Placed"}
              </button>
            ))}
          </div>

          {/* Passout Year */}
          <Select
            value={initialPassoutYear || "all"}
            onValueChange={handlePassoutYearChange}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Passout Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Years</SelectItem>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)} className="text-xs">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Course */}
          <Select
            value={initialCourse || "all"}
            onValueChange={handleCourseChange}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Courses</SelectItem>
              {availableCourses.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className={cn("flex flex-col gap-4 transition-opacity duration-200", isPending && "opacity-50 pointer-events-none")}>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-md border bg-card overflow-hidden">
          <Table className="table-fixed w-full min-w-[820px]">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[18%]" />
              <col className="w-[9%]" />
              <col className="w-[20%]" />
              <col className="w-[11%]" />
              <col className="w-[18%]" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <SortableHead label="Student" col="name" sortCol={initialSortCol} sortDir={initialSortDir} onSort={handleSort} />
                <SortableHead label="Course" col="course" sortCol={initialSortCol} sortDir={initialSortDir} onSort={handleSort} />
                <SortableHead label="Passout" col="passout" sortCol={initialSortCol} sortDir={initialSortDir} onSort={handleSort} />
                <SortableHead label="Company" col="company" sortCol={initialSortCol} sortDir={initialSortDir} onSort={handleSort} />
                <SortableHead label="CTC" col="ctc" sortCol={initialSortCol} sortDir={initialSortDir} onSort={handleSort} />
                <TableHead className="text-xs font-semibold select-none">Offer Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length > 0 ? (
                records.map((record) => (
                  <TableRow
                    key={record.profile_id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => openPanel(record)}
                  >
                    {/* Student */}
                    <TableCell className="overflow-hidden">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage src={record.profile_image_path || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {record.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{record.display_name}</span>
                      </div>
                    </TableCell>

                    {/* Course */}
                    <TableCell className="text-sm truncate overflow-hidden">
                      {record.course_name || "—"}
                    </TableCell>

                    {/* Passout */}
                    <TableCell className="text-sm truncate overflow-hidden">
                      {record.passout_year || "—"}
                    </TableCell>

                    {/* Company */}
                    <TableCell className="truncate overflow-hidden">
                      {record.company_name ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-sm truncate">{record.company_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* CTC */}
                    <TableCell className="truncate overflow-hidden">
                      <span className={cn("text-sm font-medium", record.ctc != null && "text-emerald-600 dark:text-emerald-400")}>
                        {formatCtc(record.ctc)}
                      </span>
                    </TableCell>

                    {/* Offer Type */}
                    <TableCell className="overflow-hidden">
                      <OfferTypeBadge type={record.offer_type} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        {records.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {records.map((record) => (
              <div
                key={record.profile_id}
                className="rounded-lg border bg-card p-4 shadow-sm flex flex-col gap-3 cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors"
                onClick={() => openPanel(record)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={record.profile_image_path || undefined} />
                    <AvatarFallback className="text-xs">
                      {record.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">{record.display_name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {record.course_name || "No course"} · {record.passout_year || "—"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t text-xs">
                  <div className="min-w-0">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold tracking-wider">Company</span>
                    <span className="font-medium text-foreground truncate block mt-0.5">
                      {record.company_name || "—"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold tracking-wider">CTC</span>
                    <span className={cn("font-medium block mt-0.5", record.ctc != null ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>
                      {formatCtc(record.ctc)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold tracking-wider mb-1">Offer Type</span>
                    <OfferTypeBadge type={record.offer_type} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="md:hidden rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
            No students found.
          </div>
        )}

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1">
            <div className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-medium">{Math.min(totalCount, (activePage - 1) * initialPageSize + 1)}</span>
              {" "}to{" "}
              <span className="font-medium">{Math.min(totalCount, activePage * initialPageSize)}</span>
              {" "}of{" "}
              <span className="font-medium">{totalCount}</span> students
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page</span>
                <Select
                  value={initialPageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="h-8 w-[70px] text-xs">
                    <SelectValue placeholder={initialPageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50, 100].map((size) => (
                      <SelectItem key={size} value={size.toString()} className="text-xs">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline" size="icon" className="size-8"
                  onClick={() => updateParams({ page: 1 })}
                  disabled={activePage === 1}
                >
                  <ChevronsLeft className="size-4" />
                  <span className="sr-only">First page</span>
                </Button>
                <Button
                  variant="outline" size="icon" className="size-8"
                  onClick={() => updateParams({ page: Math.max(1, activePage - 1) })}
                  disabled={activePage === 1}
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Previous page</span>
                </Button>

                <div className="flex items-center justify-center text-xs font-medium min-w-[80px]">
                  Page {activePage} of {totalPages}
                </div>

                <Button
                  variant="outline" size="icon" className="size-8"
                  onClick={() => updateParams({ page: Math.min(totalPages, activePage + 1) })}
                  disabled={activePage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Next page</span>
                </Button>
                <Button
                  variant="outline" size="icon" className="size-8"
                  onClick={() => updateParams({ page: totalPages })}
                  disabled={activePage === totalPages || totalPages === 0}
                >
                  <ChevronsRight className="size-4" />
                  <span className="sr-only">Last page</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Student Detail Panel ────────────────────────────────── */}
      <StudentDetailPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        record={panelRecord}
        onSaved={() => {
          // revalidatePath in the action refreshes the server data automatically
        }}
      />
    </div>
  )
}
