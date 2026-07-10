"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Clock,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createEventAction, updateEventAction } from "../../actions"
import type { EventFormData, EventStatus, EventTargetingRules } from "../../types"

const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics & Telecom",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "Other",
]

const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030]

interface Props {
  eventId?: string
  initialData?: EventFormData
}

const toLocalDatetimeString = (isoStr?: string) => {
  if (!isoStr) return ""
  try {
    const date = new Date(isoStr)
    const pad = (num: number) => String(num).padStart(2, '0')
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ""
  }
}

export function CreateEventClient({ eventId, initialData }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState<EventFormData>(
    initialData
      ? {
          ...initialData,
          date: toLocalDatetimeString(initialData.date),
        }
      : {
          title: "",
          description: "",
          date: "",
          venue: "",
          capacity: 100,
          status: "Draft",
          duration_minutes: 120,
          targeting_rules: { years: [], branches: [] },
        }
  )

  const handleSave = (status: EventStatus) => {
    if (!formData.title.trim()) {
      toast.error("Please enter a Title.")
      return
    }
    if (!formData.date) {
      toast.error("Please select a Date and Time.")
      return
    }
    if (!formData.venue.trim()) {
      toast.error("Please enter a Venue.")
      return
    }

    // Convert local datetime to UTC ISO string before saving
    let utcIsoDate = ""
    try {
      utcIsoDate = new Date(formData.date).toISOString()
    } catch {
      toast.error("Invalid Date format.")
      return
    }

    const payload = { ...formData, date: utcIsoDate, status }

    startTransition(async () => {
      try {
        if (eventId) {
          await updateEventAction(eventId, payload)
          toast.success("Event updated successfully!")
        } else {
          await createEventAction(payload)
          toast.success("Event created successfully!")
        }
        router.push("/events")
        router.refresh()
      } catch (err: any) {
        toast.error(err.message || "Failed to save event.")
      }
    })
  }

  const toggleYear = (year: number) => {
    setFormData((prev) => ({
      ...prev,
      targeting_rules: {
        ...prev.targeting_rules,
        years: prev.targeting_rules.years.includes(year)
          ? prev.targeting_rules.years.filter((y) => y !== year)
          : [...prev.targeting_rules.years, year],
      },
    }))
  }

  const toggleBranch = (branch: string) => {
    setFormData((prev) => ({
      ...prev,
      targeting_rules: {
        ...prev.targeting_rules,
        branches: prev.targeting_rules.branches.includes(branch)
          ? prev.targeting_rules.branches.filter((b) => b !== branch)
          : [...prev.targeting_rules.branches, branch],
      },
    }))
  }

  // Helper to format date for live preview
  const formatPreviewDate = (dtStr: string) => {
    if (!dtStr) return "Select date & time"
    try {
      return new Date(dtStr).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    } catch {
      return "Invalid date"
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <Link href="/events">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-cirka tracking-tight">
              {eventId ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Define schedules, capacities, and target cohorts for campus drives or sessions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/events">
            <Button variant="outline" size="sm" disabled={isPending}>
              Cancel
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSave("Draft")}
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSave("Published")}
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Publish Event
          </Button>
        </div>
      </div>

      {/* Form Panel (Full width, no grid) */}
      <div className="space-y-6 w-full">
        {/* General Details */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2 mb-2 text-foreground/90">
              General Details
            </h3>
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Campus Placement Drive 2026"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the event details, guest speakers, or guidelines..."
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Venue */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2 mb-2 text-foreground/90">
              Schedule & Venue
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Start Date & Time *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (Minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      duration_minutes: parseInt(e.target.value) || 120,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="venue">Venue *</Label>
              <Input
                id="venue"
                placeholder="e.g. Seminar Hall 3 / Placement Cell Library"
                value={formData.venue}
                onChange={(e) => setFormData((p) => ({ ...p, venue: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Audience & Capacity */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2 mb-2 text-foreground/90">
              Audience & Capacity
            </h3>
            <div className="grid gap-2 max-w-xs">
              <Label htmlFor="capacity">Seating Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                value={formData.capacity}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    capacity: parseInt(e.target.value) || 10,
                  }))
                }
              />
            </div>

            {/* Targeting Rules */}
            <div className="grid gap-4 border rounded-lg p-4 bg-muted/20">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Cohort Restrictions
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Leave empty to show to all candidates. Select specific cohorts to restrict event access.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-foreground/80">Passout Graduation Years</Label>
                <div className="flex flex-wrap gap-1.5">
                  {YEARS.map((year) => {
                    const isSelected = formData.targeting_rules.years.includes(year)
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => toggleYear(year)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer font-medium",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-background hover:bg-accent border-border/80"
                        )}
                      >
                        {year}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-foreground/80">Branches / Fields of Study</Label>
                <div className="flex flex-wrap gap-1.5">
                  {BRANCHES.map((branch) => {
                    const isSelected = formData.targeting_rules.branches.includes(branch)
                    return (
                      <button
                        key={branch}
                        type="button"
                        onClick={() => toggleBranch(branch)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer font-medium",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-background hover:bg-accent border-border/80"
                        )}
                      >
                        {branch}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
