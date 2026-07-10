import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/supabase/profile"
import { EventsStaffClient } from "./EventsStaffClient"
import { EventsCandidateClient } from "./EventsCandidateClient"
import type { EventListItem, CandidateEventListItem } from "./types"

export const metadata = {
  title: "Events",
  description: "Campus Events & Activities",
}

interface SearchParams {
  page?: string
  size?: string
  search?: string
  tab?: string
}

async function fetchInstituteEvents(
  userId: string,
  page: number,
  size: number,
  search: string,
  tab: string
): Promise<{
  events: EventListItem[]
  count: number
  tabCounts: { all: number; published: number; draft: number; concluded: number }
  totalAttendeesCount: number
  totalCheckedInCount: number
}> {
  const supabase = await createClient()

  // Find institute ID of the staff user
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("institute_id")
    .eq("id", userId)
    .maybeSingle()

  const instituteId = profile?.institute_id
  if (!instituteId) {
    return {
      events: [],
      count: 0,
      tabCounts: { all: 0, published: 0, draft: 0, concluded: 0 },
      totalAttendeesCount: 0,
      totalCheckedInCount: 0,
    }
  }

  // Define search filter helper
  const searchFilter = (q: any) => {
    if (search.trim()) {
      const s = search.trim()
      return q.or(`title.ilike.%${s}%,description.ilike.%${s}%,venue.ilike.%${s}%`)
    }
    return q
  }

  // Count tab queries in parallel
  const [countAllRes, countPublishedRes, countDraftRes, countConcludedRes] = await Promise.all([
    searchFilter((supabase as any).from("events").select("id", { count: "exact", head: true }).eq("institute_id", instituteId)),
    searchFilter((supabase as any).from("events").select("id", { count: "exact", head: true }).eq("institute_id", instituteId).eq("status", "Published")),
    searchFilter((supabase as any).from("events").select("id", { count: "exact", head: true }).eq("institute_id", instituteId).eq("status", "Draft")),
    searchFilter((supabase as any).from("events").select("id", { count: "exact", head: true }).eq("institute_id", instituteId).eq("status", "Concluded")),
  ])

  // Get attendee stats
  const { data: allTickets } = await (supabase as any)
    .from("event_tickets")
    .select("status, attendance_status, events!inner(institute_id)")
    .eq("events.institute_id", instituteId)
    .neq("status", "Cancelled")

  const totalAttendeesCount = allTickets?.length ?? 0
  const totalCheckedInCount = allTickets?.filter((t: any) => t.attendance_status === "Present").length ?? 0

  const tabCounts = {
    all: countAllRes.count ?? 0,
    published: countPublishedRes.count ?? 0,
    draft: countDraftRes.count ?? 0,
    concluded: countConcludedRes.count ?? 0,
  }

  const activeTab = ["all", "published", "draft", "concluded"].includes(tab) ? tab : "all"

  // Main paginated query
  let query = (supabase as any)
    .from("events")
    .select(`
      *,
      event_tickets(id, status, attendance_status)
    `, { count: "exact" })
    .eq("institute_id", instituteId)

  if (activeTab === "published") {
    query = query.eq("status", "Published")
  } else if (activeTab === "draft") {
    query = query.eq("status", "Draft")
  } else if (activeTab === "concluded") {
    query = query.eq("status", "Concluded")
  }

  query = searchFilter(query)
  query = query.order("date", { ascending: false })

  const from = (page - 1) * size
  const to = page * size - 1

  const { data: rawEvents, count } = await query.range(from, to)

  const events = (rawEvents ?? []).map((event: any): EventListItem => {
    const tickets = event.event_tickets ?? []
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      venue: event.venue,
      capacity: event.capacity,
      status: event.status,
      targeting_rules: event.targeting_rules ?? { years: [], branches: [] },
      duration_minutes: event.duration_minutes ?? 120,
      event_banner: event.event_banner ?? null,
      created_at: event.created_at,
      updated_at: event.updated_at,
      tickets_confirmed: tickets.filter((t: any) => t.status === "Confirmed").length,
      tickets_waitlisted: tickets.filter((t: any) => t.status === "Waitlisted").length,
      tickets_present: tickets.filter((t: any) => t.attendance_status === "Present").length,
    }
  })

  return { events, count: count ?? 0, tabCounts, totalAttendeesCount, totalCheckedInCount }
}

async function fetchCandidateEvents(
  userId: string,
  page: number,
  size: number,
  search: string,
  tab: string
): Promise<{
  events: CandidateEventListItem[]
  count: number
  tabCounts: { upcoming: number; my: number; past: number }
}> {
  const supabase = await createClient()

  // 1. Resolve candidate profile details
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("institute_id")
    .eq("id", userId)
    .maybeSingle()

  const instituteId = profile?.institute_id
  if (!instituteId) {
    return { events: [], count: 0, tabCounts: { upcoming: 0, my: 0, past: 0 } }
  }

  // Get candidate academic details to enforce targeting rules
  const { data: academic } = await (supabase as any)
    .from("candidate_academic_details")
    .select("passout_year, course:institute_courses(course_name)")
    .eq("profile_id", userId)
    .maybeSingle()

  const candidateBranch = academic?.course?.course_name
  const candidateYear = academic?.passout_year

  // Query all published events for the institute, including all tickets
  const { data: rawEvents } = await (supabase as any)
    .from("events")
    .select(`
      id, title, description, date, venue, capacity, status, targeting_rules, duration_minutes, created_at,
      event_tickets(id, status, attendance_status, candidate_id)
    `)
    .eq("status", "Published")
    .eq("institute_id", instituteId)
    .order("date", { ascending: true })

  // 2. Filter using targeting rules in JS
  let filtered = (rawEvents ?? []).filter((event: any) => {
    const rules = event.targeting_rules ?? { years: [], branches: [] }
    if (rules.years && rules.years.length > 0 && (!candidateYear || !rules.years.includes(candidateYear))) {
      return false
    }
    if (rules.branches && rules.branches.length > 0 && (!candidateBranch || !rules.branches.includes(candidateBranch))) {
      return false
    }
    return true
  })

  // 3. Map to CandidateEventListItem
  const now = new Date()
  const candidateEvents: CandidateEventListItem[] = filtered.map((event: any) => {
    const allTickets = event.event_tickets ?? []
    const myTicket = allTickets.find((t: any) => t.candidate_id === userId && t.status !== "Cancelled")
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      venue: event.venue,
      capacity: event.capacity,
      status: event.status,
      duration_minutes: event.duration_minutes ?? 120,
      event_banner: event.event_banner ?? null,
      created_at: event.created_at,
      tickets_confirmed: allTickets.filter((t: any) => t.status === "Confirmed").length,
      my_ticket_id: myTicket?.id ?? null,
      my_ticket_status: myTicket?.status ?? null,
      my_attendance_status: myTicket?.attendance_status ?? null,
    }
  })

  // 4. Filter by search term
  let searched = candidateEvents
  if (search.trim()) {
    const s = search.toLowerCase().trim()
    searched = searched.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.venue.toLowerCase().includes(s) ||
        (e.description?.toLowerCase().includes(s) ?? false)
    )
  }

  // 5. Calculate tab counts (on all searched items matching current search)
  const tabCounts = {
    upcoming: searched.filter((e) => new Date(e.date) >= now).length,
    my: searched.filter((e) => e.my_ticket_status !== null).length,
    past: searched.filter((e) => new Date(e.date) < now).length,
  }

  // 6. Filter by active tab
  const activeTab = ["upcoming", "my", "past"].includes(tab) ? tab : "upcoming"
  let tabFiltered = searched
  if (activeTab === "upcoming") {
    tabFiltered = searched.filter((e) => new Date(e.date) >= now)
  } else if (activeTab === "my") {
    tabFiltered = searched.filter((e) => e.my_ticket_status !== null)
  } else if (activeTab === "past") {
    tabFiltered = searched.filter((e) => new Date(e.date) < now)
  }

  // 7. Paginate and return slice
  const count = tabFiltered.length
  const from = (page - 1) * size
  const to = page * size
  const paginatedEvents = tabFiltered.slice(from, to)

  return { events: paginatedEvents, count, tabCounts }
}

export default async function EventsPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const profile = await getUserProfile()
  if (!profile) redirect("/auth/login")

  const params = await props.searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10))
  const size = Math.max(1, parseInt(params.size || "10", 10))
  const search = params.search || ""
  const tab = params.tab || ""

  // ─── Staff / Institute View ──────────────────────────────────────────────
  if (profile.account_type !== "institute_candidate") {
    const {
      events,
      count,
      tabCounts,
      totalAttendeesCount,
      totalCheckedInCount,
    } = await fetchInstituteEvents(profile.id, page, size, search, tab)

    return (
      <EventsStaffClient
        events={events}
        initialPage={page}
        initialPageSize={size}
        initialSearch={search}
        initialTab={tab || "all"}
        totalCount={count}
        tabCounts={tabCounts}
        totalAttendeesCount={totalAttendeesCount}
        totalCheckedInCount={totalCheckedInCount}
      />
    )
  }

  // ─── Candidate View ──────────────────────────────────────────────────────
  const { events, count, tabCounts } = await fetchCandidateEvents(
    profile.id,
    page,
    size,
    search,
    tab
  )

  return (
    <EventsCandidateClient
      events={events}
      initialPage={page}
      initialPageSize={size}
      initialSearch={search}
      initialTab={tab || "upcoming"}
      totalCount={count}
      tabCounts={tabCounts}
    />
  )
}
