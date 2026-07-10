// app/(dashboard)/(licensed)/opportunities/OpportunitiesCandidateClient.tsx
"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  Briefcase, Search, MapPin, DollarSign, Calendar, CheckCircle2, 
  XCircle, FileText, ChevronRight, Upload, Info, Loader2 
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { buildStorageUrl } from "@/lib/storage"
import { applyToOpportunityAction } from "./actions"
import type { CandidateOpportunityListItem } from "./types"

interface OpportunitiesCandidateClientProps {
  opportunities: CandidateOpportunityListItem[]
  candidateAcademic: {
    course_id: string | null
    course_name: string | null
    passout_year: number | null
    cgpa: number | null
  }
  profileId: string
}

export function OpportunitiesCandidateClient({
  opportunities,
  candidateAcademic,
  profileId
}: OpportunitiesCandidateClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [supabase] = useState(() => createClient())

  // Filters state
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilterTab, setActiveFilterTab] = useState<"all" | "eligible" | "applied">("all")

  // Drawer / Application dialog states
  const [selectedOpp, setSelectedOpp] = useState<CandidateOpportunityListItem | null>(null)
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const totalCount = opportunities.length
    
    // Check eligibility logic
    const eligibleCount = opportunities.filter(opp => {
      const rules = opp.targeting_rules ?? { courses: [], passout_years: [], min_cgpa: 0 }
      
      const courseMatch = !rules.courses?.length || (candidateAcademic.course_id && rules.courses.includes(candidateAcademic.course_id))
      const yearMatch = !rules.passout_years?.length || (candidateAcademic.passout_year && rules.passout_years.includes(candidateAcademic.passout_year))
      const cgpaMatch = !rules.min_cgpa || (candidateAcademic.cgpa != null && candidateAcademic.cgpa >= rules.min_cgpa)
      
      return courseMatch && yearMatch && cgpaMatch
    }).length

    const appliedCount = opportunities.filter(opp => opp.my_application_id !== null).length

    return { totalCount, eligibleCount, appliedCount }
  }, [opportunities, candidateAcademic])

  // Get specific eligibility detailed check for an opportunity
  const checkEligibility = (opp: CandidateOpportunityListItem) => {
    const rules = opp.targeting_rules ?? { courses: [], passout_years: [], min_cgpa: 0 }
    
    const courseOk = !rules.courses?.length || (candidateAcademic.course_id && rules.courses.includes(candidateAcademic.course_id))
    const yearOk = !rules.passout_years?.length || (candidateAcademic.passout_year && rules.passout_years.includes(candidateAcademic.passout_year))
    const cgpaOk = !rules.min_cgpa || (candidateAcademic.cgpa != null && candidateAcademic.cgpa >= rules.min_cgpa)
    
    return {
      course: { ok: !!courseOk, label: `Course: ${candidateAcademic.course_name || "N/A"}` },
      year: { ok: !!yearOk, label: `Graduation Year: ${candidateAcademic.passout_year || "N/A"}` },
      cgpa: { 
        ok: !!cgpaOk, 
        label: `CGPA: ${candidateAcademic.cgpa != null ? candidateAcademic.cgpa.toFixed(2) : "N/A"} (Min required: ${rules.min_cgpa})` 
      },
      isEligible: !!(courseOk && yearOk && cgpaOk)
    }
  }

  // Handle Apply Submission (File Upload + database insertion)
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOpp) return
    if (!selectedFile) {
      toast.error("Please upload a resume file.")
      return
    }

    setUploading(true)
    try {
      // 1. Upload PDF file to Supabase Storage resumes bucket
      const fileExt = selectedFile.name.split(".").pop()
      const fileName = `${Date.now()}_resume.${fileExt}`
      const filePath = `${profileId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true
        })

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload resume file.")
      }

      // 2. Build final resume URL
      const finalResumeUrl = buildStorageUrl("resumes", filePath)
      if (!finalResumeUrl) {
        throw new Error("Failed to resolve uploaded resume URL.")
      }

      // 3. Submit database application record via server action
      startTransition(async () => {
        try {
          const res = await applyToOpportunityAction(selectedOpp.id, finalResumeUrl)
          if (res.success) {
            toast.success("Applied successfully!")
            setIsApplyOpen(false)
            setSelectedOpp(null)
            setSelectedFile(null)
            router.refresh()
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to submit application.")
        }
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload resume.")
    } finally {
      setUploading(false)
    }
  }

  // Search filter and tab logic
  const filteredOpps = useMemo(() => {
    return opportunities.filter(opp => {
      const matchSearch = 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.job_role.toLowerCase().includes(searchQuery.toLowerCase())

      const elg = checkEligibility(opp)
      const matchTab = 
        activeFilterTab === "all" ||
        (activeFilterTab === "eligible" && elg.isEligible) ||
        (activeFilterTab === "applied" && opp.my_application_id !== null)

      return matchSearch && matchTab
    })
  }, [opportunities, searchQuery, activeFilterTab, candidateAcademic])

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore on-campus placement drives, internships, and external openings tailored for you.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-primary/10 bg-primary/[0.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Open Roles</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Currently active drives</p>
          </CardContent>
        </Card>
        <Card className="border border-emerald-500/10 bg-emerald-500/[0.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Eligible Roles</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.eligibleCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">You meet all eligibility criteria</p>
          </CardContent>
        </Card>
        <Card className="border border-blue-500/10 bg-blue-500/[0.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Applied</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.appliedCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Applications submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search Filter */}
      <Tabs value={activeFilterTab} onValueChange={(v) => setActiveFilterTab(v as any)}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies, roles, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="all" className="text-xs font-medium cursor-pointer">
              All Job Postings
            </TabsTrigger>
            <TabsTrigger value="eligible" className="text-xs font-medium cursor-pointer">
              Eligible Only
            </TabsTrigger>
            <TabsTrigger value="applied" className="text-xs font-medium cursor-pointer">
              My Applications
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Listings Display */}
        <TabsContent value={activeFilterTab} className="mt-6 space-y-4">
          {filteredOpps.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Briefcase className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">No opportunities found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                There are no jobs listed under this category at the moment. Please check back later.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOpps.map((opp) => {
                const elg = checkEligibility(opp)
                const isExpired = new Date(opp.deadline) < new Date()

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
                        {opp.my_application_id ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none uppercase text-[10px]">
                            Applied
                          </Badge>
                        ) : elg.isEligible ? (
                          <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 text-[10px]">
                            Eligible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/5 text-red-500 border-red-500/20 text-[10px]">
                            Not Eligible
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{opp.location || "Remote"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>{opp.ctc ? `${opp.ctc} LPA` : "Not Disclosed"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className={cn(isExpired && "text-red-500 font-medium")}>
                            Deadline: {new Date(opp.deadline).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                            {isExpired && " (Expired)"}
                          </span>
                        </div>
                      </div>

                      {/* Application Info Footer */}
                      {opp.my_application_id && (
                        <div className="border-t pt-3 flex items-center justify-between text-xs mt-2">
                          <span className="text-muted-foreground">Application Status:</span>
                          <span className={cn(
                            "font-semibold uppercase text-[10px] rounded-full px-2 py-0.5",
                            opp.my_application_status === "Applied" && "bg-blue-500/10 text-blue-600",
                            opp.my_application_status === "Shortlisted" && "bg-yellow-500/10 text-yellow-600",
                            opp.my_application_status === "Interviewing" && "bg-purple-500/10 text-purple-600",
                            opp.my_application_status === "Offered" && "bg-emerald-500/10 text-emerald-600",
                            opp.my_application_status === "Rejected" && "bg-red-500/10 text-red-600"
                          )}>
                            {opp.my_application_status === "Offered" ? "Offered (Placed)" : opp.my_application_status}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sheet: Job Details Drawer */}
      <Sheet open={!!selectedOpp} onOpenChange={(open) => !open && setSelectedOpp(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto" side="right">
          {selectedOpp && (() => {
            const elg = checkEligibility(selectedOpp)
            const isExpired = new Date(selectedOpp.deadline) < new Date()

            return (
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-6 pb-8">
                  <SheetHeader className="pb-4 border-b">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="uppercase text-[10px]">
                        {selectedOpp.type.replace("_", " ")}
                      </Badge>
                      {selectedOpp.my_application_id && (
                        <Badge className="bg-emerald-500/15 text-emerald-600 text-[10px] border-none uppercase">
                          Applied
                        </Badge>
                      )}
                    </div>
                    <SheetTitle className="text-xl font-bold">{selectedOpp.title}</SheetTitle>
                    <SheetDescription className="text-sm font-medium text-muted-foreground">
                      {selectedOpp.company_name} • {selectedOpp.job_role}
                    </SheetDescription>
                  </SheetHeader>

                  {/* Core Details grid */}
                  <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/10 text-xs">
                    <div>
                      <p className="text-muted-foreground font-medium uppercase text-[9px] tracking-wider mb-0.5">Location</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" /> {selectedOpp.location || "Remote"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium uppercase text-[9px] tracking-wider mb-0.5">Package / CTC</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-primary" /> {selectedOpp.ctc ? `${selectedOpp.ctc} LPA` : "Not Disclosed"}
                      </p>
                    </div>
                    <div className="col-span-2 border-t pt-3 mt-1">
                      <p className="text-muted-foreground font-medium uppercase text-[9px] tracking-wider mb-0.5">Apply Before</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" /> 
                        {new Date(selectedOpp.deadline).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Eligibility Screening widget */}
                  <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-primary" /> Eligibility Status
                    </h4>

                    <div className="space-y-2 text-xs">
                      {/* Course verification */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{elg.course.label}</span>
                        {elg.course.ok ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-0.5"><CheckCircle2 className="h-3.5 w-3.5" /> Ok</span>
                        ) : (
                          <span className="text-red-500 font-semibold flex items-center gap-0.5"><XCircle className="h-3.5 w-3.5" /> Ineligible</span>
                        )}
                      </div>

                      {/* Year verification */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{elg.year.label}</span>
                        {elg.year.ok ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-0.5"><CheckCircle2 className="h-3.5 w-3.5" /> Ok</span>
                        ) : (
                          <span className="text-red-500 font-semibold flex items-center gap-0.5"><XCircle className="h-3.5 w-3.5" /> Ineligible</span>
                        )}
                      </div>

                      {/* CGPA verification */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{elg.cgpa.label}</span>
                        {elg.cgpa.ok ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-0.5"><CheckCircle2 className="h-3.5 w-3.5" /> Ok</span>
                        ) : (
                          <span className="text-red-500 font-semibold flex items-center gap-0.5"><XCircle className="h-3.5 w-3.5" /> Ineligible</span>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-3 mt-2 text-center">
                      {elg.isEligible ? (
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> You meet all eligibility criteria for this posting!
                        </p>
                      ) : (
                        <p className="text-red-500 dark:text-red-400 font-semibold text-xs flex items-center justify-center gap-1">
                          <XCircle className="h-4 w-4" /> You do not meet some eligibility requirements.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Job Description details */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Job Description & Details</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed border rounded-lg p-4 bg-background">
                      {selectedOpp.job_description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Footer apply buttons */}
                <SheetFooter className="border-t pt-4">
                  {selectedOpp.my_application_id ? (
                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between border rounded-lg p-3 bg-emerald-500/5 text-xs">
                        <span className="font-medium text-muted-foreground">Application Status:</span>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold">
                          {selectedOpp.my_application_status === "Offered" ? "Offered (Placed)" : selectedOpp.my_application_status}
                        </Badge>
                      </div>
                      <a 
                        href={selectedOpp.my_application_resume_url || "#"} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full block"
                      >
                        <Button className="w-full gap-2" variant="outline">
                          <FileText className="h-4 w-4" /> View Submitted Resume
                        </Button>
                      </a>
                    </div>
                  ) : selectedOpp.application_link ? (
                    <a 
                      href={selectedOpp.application_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full gap-1.5" disabled={!elg.isEligible || isExpired}>
                        Apply Externally <ChevronRight className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : (
                    <Button 
                      onClick={() => setIsApplyOpen(true)}
                      className="w-full gap-1.5" 
                      disabled={!elg.isEligible || isExpired}
                    >
                      {isExpired ? "Application Closed" : "Apply for Job"} <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </SheetFooter>
              </div>
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* Dialog: PDF Resume Uploader */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Opportunity</DialogTitle>
            <DialogDescription>
              Upload your resume as a PDF file to submit your application.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplySubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="resume">Resume PDF File *</Label>
              <div className="border border-dashed rounded-lg p-6 text-center hover:bg-muted/10 cursor-pointer relative group transition-colors">
                <input 
                  type="file" 
                  id="resume"
                  accept=".pdf"
                  required
                  disabled={uploading || isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.type !== "application/pdf") {
                        toast.error("Please select a PDF file.")
                        setSelectedFile(null)
                      } else {
                        setSelectedFile(file)
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2 group-hover:text-primary transition-colors" />
                <p className="text-xs font-semibold text-foreground">
                  {selectedFile ? selectedFile.name : "Click to select PDF resume"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Only PDF file format is allowed."}
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsApplyOpen(false)}
                disabled={uploading || isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading || isPending || !selectedFile}>
                {uploading || isPending ? (
                  <span className="flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</span>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
