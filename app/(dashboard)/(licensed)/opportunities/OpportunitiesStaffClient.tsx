// app/(dashboard)/(licensed)/opportunities/OpportunitiesStaffClient.tsx
"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Briefcase, Plus, Search, MapPin, DollarSign, Calendar, Users, 
  Trash2, Edit3, X, ChevronRight, Download, FileText, CheckCircle2 
} from "lucide-react"
import { toast } from "sonner"
import { 
  createOpportunityAction, 
  updateOpportunityAction, 
  deleteOpportunityAction, 
  updateApplicationStatusAction 
} from "./actions"
import type { 
  OpportunityListItem, 
  OpportunityApplication, 
  OpportunityFormData, 
  OpportunityStatus, 
  OpportunityType,
  ApplicationStatus
} from "./types"

interface OpportunitiesStaffClientProps {
  opportunities: OpportunityListItem[]
  applications: Record<string, OpportunityApplication[]>
  courses: { id: string; course_name: string }[]
}

const OPPORTUNITY_TYPES: { value: OpportunityType; label: string }[] = [
  { value: "on_campus", label: "On-Campus Drive" },
  { value: "off_campus", label: "Off-Campus Drive" },
  { value: "internship", label: "Internship" },
  { value: "ppo", label: "Pre-Placement Offer (PPO)" },
  { value: "freelance", label: "Freelance Opportunity" }
]

const APPLICATION_STAGES: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "Applied", label: "Applied", color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
  { value: "Shortlisted", label: "Shortlisted", color: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20" },
  { value: "Interviewing", label: "Interviewing", color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20" },
  { value: "Offered", label: "Offered (Placed)", color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" },
  { value: "Rejected", label: "Rejected", color: "bg-red-500/10 text-red-500 hover:bg-red-500/20" }
]

export function OpportunitiesStaffClient({
  opportunities,
  applications,
  courses
}: OpportunitiesStaffClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<OpportunityStatus | "all">("all")

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingOpp, setEditingOpp] = useState<OpportunityListItem | null>(null)
  const [selectedOpp, setSelectedOpp] = useState<OpportunityListItem | null>(null) // For viewing applicants

  // Form state
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: "",
    company_name: "",
    company_logo_url: "",
    job_role: "",
    job_description: "",
    type: "on_campus",
    location: "",
    ctc: null,
    application_link: "",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    status: "Draft",
    targeting_rules: {
      courses: [],
      passout_years: [new Date().getFullYear()],
      min_cgpa: 0,
      max_backlogs: 0
    }
  })

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingOpp(null)
    setFormData({
      title: "",
      company_name: "",
      company_logo_url: "",
      job_role: "",
      job_description: "",
      type: "on_campus",
      location: "",
      ctc: null,
      application_link: "",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      status: "Draft",
      targeting_rules: {
        courses: [],
        passout_years: [new Date().getFullYear()],
        min_cgpa: 0,
        max_backlogs: 0
      }
    })
    setIsCreateOpen(true)
  }

  // Open Form for Edit
  const handleOpenEdit = (opp: OpportunityListItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingOpp(opp)
    setFormData({
      title: opp.title,
      company_name: opp.company_name,
      company_logo_url: opp.company_logo_url || "",
      job_role: opp.job_role,
      job_description: opp.job_description || "",
      type: opp.type,
      location: opp.location || "",
      ctc: opp.ctc,
      application_link: opp.application_link || "",
      deadline: new Date(opp.deadline).toISOString().slice(0, 16),
      status: opp.status,
      targeting_rules: opp.targeting_rules || {
        courses: [],
        passout_years: [new Date().getFullYear()],
        min_cgpa: 0,
        max_backlogs: 0
      }
    })
    setIsCreateOpen(true)
  }

  // Form Submit Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.company_name || !formData.job_role || !formData.deadline) {
      toast.error("Please fill in all required fields.")
      return
    }

    startTransition(async () => {
      try {
        if (editingOpp) {
          const res = await updateOpportunityAction(editingOpp.id, formData)
          if (res.success) {
            toast.success("Opportunity updated successfully!")
            setIsCreateOpen(false)
            router.refresh()
          }
        } else {
          const res = await createOpportunityAction(formData)
          if (res.success) {
            toast.success("Opportunity created successfully!")
            setIsCreateOpen(false)
            router.refresh()
          }
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save opportunity")
      }
    })
  }

  // Delete Action
  const handleDelete = async (oppId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this opportunity? This will delete all applications too.")) return

    startTransition(async () => {
      try {
        const res = await deleteOpportunityAction(oppId)
        if (res.success) {
          toast.success("Opportunity deleted successfully.")
          router.refresh()
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete opportunity")
      }
    })
  }

  // Stage Change Action
  const handleStageChange = async (appId: string, oppId: string, newStatus: ApplicationStatus) => {
    startTransition(async () => {
      try {
        const res = await updateApplicationStatusAction(appId, newStatus)
        if (res.success) {
          toast.success(`Candidate status updated to ${newStatus}`)
          router.refresh()
          // Update selectedOpp local counts if sheet is open
          if (selectedOpp && selectedOpp.id === oppId) {
            // Force rerender sheet details by fetching fresh data
            setSelectedOpp({ ...selectedOpp })
          }
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update candidate status")
      }
    })
  }

  // Filter & Search Logic
  const filteredOpps = useMemo(() => {
    return opportunities.filter((opp: OpportunityListItem) => {
      const matchSearch = 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.job_role.toLowerCase().includes(searchQuery.toLowerCase())

      const matchTab = activeTab === "all" || opp.status === activeTab

      return matchSearch && matchTab
    })
  }, [opportunities, searchQuery, activeTab])

  // Count tab numbers
  const counts = useMemo(() => {
    return {
      all: opportunities.length,
      published: opportunities.filter((o: OpportunityListItem) => o.status === "Published").length,
      draft: opportunities.filter((o: OpportunityListItem) => o.status === "Draft").length,
      concluded: opportunities.filter((o: OpportunityListItem) => o.status === "Concluded").length
    }
  }, [opportunities])

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities & Drives</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish jobs, configure eligibility screening, and track candidate applications.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Post Opportunity
        </Button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-primary/10 bg-primary/[0.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.all}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Opportunities created</p>
          </CardContent>
        </Card>
        <Card className="border border-emerald-500/10 bg-emerald-500/[0.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Published</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{counts.published}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Active & receiving applications</p>
          </CardContent>
        </Card>
        <Card className="border border-yellow-500/10 bg-yellow-500/[0.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{counts.draft}</div>
            <p className="text-xs text-muted-foreground mt-0.5">In preparation</p>
          </CardContent>
        </Card>
        <Card className="border border-purple-500/10 bg-purple-500/[0.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(applications).reduce((acc, list) => acc + list.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Across all drives</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search Filter */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drives, roles, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="all" className="text-xs font-medium cursor-pointer">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="Published" className="text-xs font-medium cursor-pointer">
              Published ({counts.published})
            </TabsTrigger>
            <TabsTrigger value="Draft" className="text-xs font-medium cursor-pointer">
              Drafts ({counts.draft})
            </TabsTrigger>
            <TabsTrigger value="Concluded" className="text-xs font-medium cursor-pointer">
              Concluded ({counts.concluded})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Listings Display */}
        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {filteredOpps.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Briefcase className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">No opportunities found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                No matching opportunities were found. Try adjusting your search query or post a new one.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOpps.map((opp: OpportunityListItem) => {
                const deadlineDate = new Date(opp.deadline)
                const isExpired = deadlineDate < new Date()

                return (
                  <Card 
                    key={opp.id} 
                    onClick={() => setSelectedOpp(opp)}
                    className="hover:shadow-md cursor-pointer transition-all duration-200 border hover:border-primary/20 flex flex-col justify-between"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Badge variant="outline" className="mb-2 uppercase text-[10px]">
                            {opp.type.replace("_", " ")}
                          </Badge>
                          <h2 className="font-semibold text-lg line-clamp-1">{opp.title}</h2>
                          <p className="text-sm font-medium text-muted-foreground line-clamp-1">
                            {opp.company_name} • {opp.job_role}
                          </p>
                        </div>
                        <Badge 
                          className={cn(
                            opp.status === "Published" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            opp.status === "Draft" && "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                            opp.status === "Concluded" && "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          )}
                          variant="secondary"
                        >
                          {opp.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{opp.location || "Remote"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>{opp.ctc ? `${opp.ctc} LPA` : "Not Disclosed"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className={cn(isExpired && "text-red-500 font-medium")}>
                            Deadline: {deadlineDate.toLocaleDateString("en-IN", { dateStyle: "medium" })} at {deadlineDate.toLocaleTimeString("en-IN", { timeStyle: "short" })}
                            {isExpired && " (Expired)"}
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="border-t pt-3 flex items-center justify-between text-xs mt-2">
                        <div className="flex items-center gap-1.5 text-primary font-medium">
                          <Users className="h-4 w-4" />
                          <span>{opp.applications_count || 0} applicants</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleOpenEdit(opp, e)}
                            className="h-8 w-8 hover:bg-muted"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleDelete(opp.id, e)}
                            className="h-8 w-8 hover:bg-red-500/10 group"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sheet: Create / Edit Opportunity Form */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto" side="right">
          <SheetHeader className="pb-6">
            <SheetTitle>{editingOpp ? "Edit Opportunity" : "Create Opportunity"}</SheetTitle>
            <SheetDescription>
              Enter the job specifications and configure eligibility parameters for students.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input 
                    id="company_name" 
                    value={formData.company_name} 
                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job_role">Job Role / Position *</Label>
                  <Input 
                    id="job_role" 
                    value={formData.job_role} 
                    onChange={e => setFormData({ ...formData, job_role: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">Opportunity Title (Visible to Students) *</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  placeholder="e.g., Google Step Internship 2026"
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="type">Opportunity Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={v => setFormData({ ...formData, type: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPPORTUNITY_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status">Publish Status *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={v => setFormData({ ...formData, status: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Concluded">Concluded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ctc">CTC / Package (LPA)</Label>
                  <Input 
                    id="ctc" 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 12.5"
                    value={formData.ctc ?? ""} 
                    onChange={e => setFormData({ ...formData, ctc: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g., Bangalore, Hybrid"
                    value={formData.location || ""} 
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="deadline">Application Deadline *</Label>
                  <Input 
                    id="deadline" 
                    type="datetime-local" 
                    value={formData.deadline} 
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="application_link">External Apply URL (Optional)</Label>
                  <Input 
                    id="application_link" 
                    placeholder="e.g., https://careers.company.com/..."
                    value={formData.application_link || ""} 
                    onChange={e => setFormData({ ...formData, application_link: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job_description">Job Description & Details</Label>
                <Textarea 
                  id="job_description" 
                  rows={4}
                  placeholder="Enter details about responsibilities, qualifications, CTC structure, bond etc."
                  value={formData.job_description || ""} 
                  onChange={e => setFormData({ ...formData, job_description: e.target.value })}
                />
              </div>

              {/* Targeting Rules */}
              <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
                <h4 className="font-semibold text-sm">Targeting & Eligibility Screening</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="min_cgpa">Minimum CGPA required</Label>
                    <Input 
                      id="min_cgpa" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      max="10"
                      value={formData.targeting_rules.min_cgpa || ""} 
                      placeholder="e.g., 7.5 (0 for none)"
                      onChange={e => setFormData({
                        ...formData,
                        targeting_rules: {
                          ...formData.targeting_rules,
                          min_cgpa: e.target.value ? parseFloat(e.target.value) : 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="passout_years">Eligible Graduation Years</Label>
                    <Input 
                      id="passout_years" 
                      placeholder="e.g. 2025, 2026"
                      value={formData.targeting_rules.passout_years.join(", ")}
                      onChange={e => setFormData({
                        ...formData,
                        targeting_rules: {
                          ...formData.targeting_rules,
                          passout_years: e.target.value.split(",").map(v => parseInt(v.trim())).filter(Number)
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Eligible Courses (Select none to allow all courses)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1 border rounded bg-background">
                    {courses.map(course => {
                      const isChecked = formData.targeting_rules.courses.includes(course.id)
                      return (
                        <div key={course.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`course-${course.id}`} 
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const list = [...formData.targeting_rules.courses]
                              if (checked) {
                                list.push(course.id)
                              } else {
                                const idx = list.indexOf(course.id)
                                if (idx > -1) list.splice(idx, 1)
                              }
                              setFormData({
                                ...formData,
                                targeting_rules: {
                                  ...formData.targeting_rules,
                                  courses: list
                                }
                              })
                            }}
                          />
                          <Label 
                            htmlFor={`course-${course.id}`}
                            className="text-xs font-normal cursor-pointer text-muted-foreground truncate"
                          >
                            {course.course_name}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : editingOpp ? "Save Changes" : "Post Opportunity"}
              </Button>
            </DialogFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Dialog: Applications / Candidate list */}
      <Dialog open={!!selectedOpp} onOpenChange={(open) => !open && setSelectedOpp(null)}>
        <DialogContent className="w-full sm:max-w-4xl max-h-[85vh] flex flex-col p-6">
          {selectedOpp && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <DialogTitle className="text-xl">{selectedOpp.title} Candidates</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedOpp.company_name} • {selectedOpp.job_role}
                    </DialogDescription>
                  </div>
                  <Badge variant="outline" className="uppercase">{selectedOpp.status}</Badge>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto py-4">
                {!applications[selectedOpp.id] || applications[selectedOpp.id].length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="h-10 w-10 text-muted-foreground/35 mx-auto mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">No applications yet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Once candidates apply, their resumes and academic scores will show up here.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y text-left text-xs">
                      <thead className="bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Candidate</th>
                          <th className="p-3">Course / Year</th>
                          <th className="p-3 text-center">CGPA</th>
                          <th className="p-3 text-center">Resume</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {applications[selectedOpp.id].map((app) => (
                          <tr key={app.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-3">
                              <div className="font-semibold text-sm">{app.candidate_name}</div>
                              <div className="text-muted-foreground text-[10px]">{app.candidate_email}</div>
                              {app.candidate_phone && (
                                <div className="text-muted-foreground text-[10px]">{app.candidate_phone}</div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="font-medium text-muted-foreground">{app.candidate_course || "N/A"}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">Year: {app.candidate_passout_year || "N/A"}</div>
                            </td>
                            <td className="p-3 text-center font-bold text-sm">
                              {app.candidate_cgpa != null ? app.candidate_cgpa.toFixed(2) : "—"}
                            </td>
                            <td className="p-3 text-center">
                              <a 
                                href={app.resume_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                              >
                                <Download className="h-3 w-3" /> PDF
                              </a>
                            </td>
                            <td className="p-3 text-center">
                              <span className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                                app.status === "Applied" && "bg-blue-500/10 text-blue-600",
                                app.status === "Shortlisted" && "bg-yellow-500/10 text-yellow-600",
                                app.status === "Interviewing" && "bg-purple-500/10 text-purple-600",
                                app.status === "Offered" && "bg-emerald-500/10 text-emerald-600",
                                app.status === "Rejected" && "bg-red-500/10 text-red-600"
                              )}>
                                {app.status === "Offered" ? "Offered (Placed)" : app.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <Select 
                                value={app.status}
                                onValueChange={(val) => handleStageChange(app.id, selectedOpp.id, val as any)}
                                disabled={isPending}
                              >
                                <SelectTrigger className="w-[120px] h-7 text-[10px]">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {APPLICATION_STAGES.map(stage => (
                                    <SelectItem key={stage.value} value={stage.value} className="text-xs">
                                      {stage.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
