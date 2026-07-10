"use client"

// ─────────────────────────────────────────────────────────────────────────────
// app/(dashboard)/(licensed)/events/[eventId]/EventDetailCandidateClient.tsx
// Candidate view: QR ticket, event info, live Q&A
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react"
import Link from "next/link"
import QRCode from "qrcode"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  Hourglass,
  QrCode,
  Ticket,
  UserCheck,
} from "lucide-react"
import type { EventStatus, TicketStatus, AttendanceStatus } from "../types"


// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dt: string): string {
  return new Date(dt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
}


// ─── Types ────────────────────────────────────────────────────────────────────

interface EventInfo {
  id: string
  title: string
  description: string | null
  date: string
  venue: string
  capacity: number
  status: EventStatus
  duration_minutes: number
}

interface TicketInfo {
  id: string
  status: TicketStatus
  attendance_status: AttendanceStatus
}

interface Question {
  id: string
  candidate_id: string
  question: string
  upvotes_count: number
  is_answered: boolean
  created_at: string
}


// ─── QR Ticket Card ──────────────────────────────────────────────────────────

function QRTicketCard({
  ticket,
  candidateName,
  eventTitle,
}: {
  ticket: TicketInfo
  candidateName: string
  eventTitle: string
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    QRCode.toDataURL(ticket.id, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setQrDataUrl)
  }, [ticket.id])

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col items-center text-center">
          {/* Status */}
          <div className="flex items-center gap-2 mb-3">
            {ticket.status === "Confirmed" ? (
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Confirmed
              </Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                <Hourglass className="mr-1 h-3 w-3" /> Waitlisted
              </Badge>
            )}
            {ticket.attendance_status === "Present" && (
              <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30">
                <UserCheck className="mr-1 h-3 w-3" /> Checked In
              </Badge>
            )}
          </div>

          {/* QR Code */}
          {ticket.status === "Confirmed" && qrDataUrl && (
            <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
              <img src={qrDataUrl} alt="QR Ticket" className="w-48 h-48" />
            </div>
          )}

          {ticket.status === "Waitlisted" && (
            <div className="bg-muted rounded-xl p-8 mb-3 flex flex-col items-center gap-2">
              <Hourglass className="h-10 w-10 text-amber-500" />
              <p className="text-sm text-muted-foreground">
                Your QR ticket will appear here once you're confirmed.
              </p>
            </div>
          )}

          {/* Details */}
          <p className="font-semibold text-sm">{candidateName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{eventTitle}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono break-all">
            Ticket: {ticket.id}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}


// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  event: EventInfo
  ticket: TicketInfo | null
  candidateName: string
}

export function EventDetailCandidateClient({ event, ticket, candidateName }: Props) {
  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 max-w-3xl mx-auto w-full">
      {/* Back */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      {/* Event Info */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
        {event.description && (
          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
        )}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mt-3">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {formatDateTime(event.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {event.venue}
          </span>
        </div>
      </div>

      {/* Ticket */}
      {ticket ? (
        <QRTicketCard
          ticket={ticket}
          candidateName={candidateName}
          eventTitle={event.title}
        />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Ticket className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-medium text-muted-foreground">No ticket yet</p>
            <p className="text-sm text-muted-foreground/80 mt-1">
              RSVP from the Events page to get your QR ticket.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
