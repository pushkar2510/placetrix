"use client"

import { useState, useTransition, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { UserProfile } from "@/lib/supabase/profile"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput,
  ComboboxItem, ComboboxList,
} from "@/components/ui/combobox"
import { FloatingSaveBar } from "@/components/ui/floating-save-bar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Upload, Plus, Minus, Mail, Globe, Phone, Loader2, Camera,
  CheckCircle2, XCircle, AtSign,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const AFFILIATION_OPTIONS = [
  "SPPU - Savitribai Phule Pune University",
  "Mumbai University",
  "AICTE - All India Council for Technical Education",
  "UGC - University Grants Commission",
  "Autonomous",
  "Other",
]

const STATE_OPTIONS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

const COUNTRY_OPTIONS = ["India", "Other"]
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

// ─── Types ────────────────────────────────────────────────────────────────────

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "unchanged"

interface Props {
  userProfile: UserProfile
  initialData: Record<string, any> | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RequiredMark() {
  return <span className="text-destructive ml-0.5">*</span>
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive mt-1">{message}</p>
}

function getStorageUrl(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  path: string | null
): string | null {
  if (!path) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

function UsernameStatusIcon({ status }: { status: UsernameStatus }) {
  if (status === "checking") return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
  if (status === "available") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
  if (status === "taken" || status === "invalid") return <XCircle className="h-4 w-4 text-destructive" />
  return null
}

function usernameStatusMessage(status: UsernameStatus): { text: string; className: string } | null {
  if (status === "checking") return { text: "Checking availability…", className: "text-muted-foreground" }
  if (status === "available") return { text: "Username is available!", className: "text-emerald-600 dark:text-emerald-400" }
  if (status === "taken") return { text: "Username is already taken.", className: "text-destructive" }
  if (status === "invalid") return { text: "3–20 characters: letters, numbers, underscores only.", className: "text-destructive" }
  if (status === "unchanged") return { text: "This is your current username.", className: "text-muted-foreground" }
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InstituteProfileClient({ userProfile, initialData }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDirty, setIsDirty] = useState(false)

  // ── Username ──────────────────────────────────────────────────────────────
  const [username, setUsername] = useState(userProfile.username ?? "")
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle")
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialUsername = useRef(userProfile.username ?? "")

  // ── Logo ──────────────────────────────────────────────────────────────────
  const storedLogoPath = useRef<string | null>(initialData?.logo_path ?? null)
  const [logoSrc, setLogoSrc] = useState<string | null>(() =>
    getStorageUrl(supabase, "avatars", storedLogoPath.current)
  )
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // ── Institute fields ──────────────────────────────────────────────────────
  const [instituteName, setInstituteName] = useState(initialData?.institute_name ?? "")
  const [instituteCode, setInstituteCode] = useState(initialData?.institute_code ?? "")
  const [establishedYear, setEstablishedYear] = useState(
    initialData?.established_year ? String(initialData.established_year) : ""
  )
  const [affiliation, setAffiliation] = useState(initialData?.affiliation ?? "")
  const [address, setAddress] = useState(initialData?.address ?? "")
  const [city, setCity] = useState(initialData?.city ?? "")
  const [stateVal, setStateVal] = useState(initialData?.state ?? "")
  const [pincode, setPincode] = useState(initialData?.pincode ?? "")
  const [country, setCountry] = useState(initialData?.country ?? "India")
  const [instPhone, setInstPhone] = useState(initialData?.phone_number ?? "")
  const [instEmail, setInstEmail] = useState(initialData?.email ?? "")
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.website_url ?? "")
  const [principalName, setPrincipalName] = useState(initialData?.principal_name ?? "")
  const [principalEmail, setPrincipalEmail] = useState(initialData?.principal_email ?? "")
  const [principalPhone, setPrincipalPhone] = useState(initialData?.principal_phone ?? "")
  const [courses, setCourses] = useState<string[]>(
    initialData?.courses?.length ? initialData.courses : [""]
  )
  const [socialLinks, setSocialLinks] = useState<string[]>(
    initialData?.social_links?.length ? initialData.social_links : [""]
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Dirty tracking ────────────────────────────────────────────────────────

  const markDirty = useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
      (value: T | ((prev: T) => T)) => {
        setter(value as any)
        setIsDirty(true)
      },
    []
  )

  const handleInstituteName = markDirty(setInstituteName)
  const handleInstituteCode = markDirty(setInstituteCode)
  const handleEstablishedYear = markDirty(setEstablishedYear)
  const handleAffiliation = markDirty(setAffiliation)
  const handleAddress = markDirty(setAddress)
  const handleCity = markDirty(setCity)
  const handleStateVal = markDirty(setStateVal)
  const handlePincode = markDirty(setPincode)
  const handleCountry = markDirty(setCountry)
  const handleInstPhone = markDirty(setInstPhone)
  const handleInstEmail = markDirty(setInstEmail)
  const handleWebsiteUrl = markDirty(setWebsiteUrl)
  const handlePrincipalName = markDirty(setPrincipalName)
  const handlePrincipalEmail = markDirty(setPrincipalEmail)
  const handlePrincipalPhone = markDirty(setPrincipalPhone)
  const handleCourses = markDirty(setCourses)
  const handleSocialLinks = markDirty(setSocialLinks)

  // ── Username debounce ─────────────────────────────────────────────────────

  function handleUsernameChange(value: string) {
    const trimmed = value.trim()
    setUsername(trimmed)
    setIsDirty(true)
    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current)
    if (!trimmed) { setUsernameStatus("idle"); return }
    if (trimmed === initialUsername.current) { setUsernameStatus("unchanged"); return }
    if (!USERNAME_REGEX.test(trimmed)) { setUsernameStatus("invalid"); return }
    setUsernameStatus("checking")
    usernameDebounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase.rpc("check_username_available", {
        p_username: trimmed,
        p_user_id: userProfile.id,
      })
      if (error) { setUsernameStatus("idle"); return }
      setUsernameStatus(data === true ? "available" : "taken")
    }, 500)
  }

  useEffect(() => {
    return () => { if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current) }
  }, [])

  // ── Warn on unsaved changes ───────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = "" }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  // ── Logo upload ───────────────────────────────────────────────────────────

  async function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WEBP image.")
      return
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image must be smaller than 2 MB.")
      return
    }
    const blobUrl = URL.createObjectURL(file)
    setLogoSrc(blobUrl)
    setIsUploadingLogo(true)
    try {
      const oldPath = storedLogoPath.current
      if (oldPath) {
        await supabase.storage.from("avatars").remove([oldPath])
      }
      const ext = file.name.split(".").pop() ?? "jpg"
      const timestamp = Date.now()
      const newPath = `institutes/${userProfile.id}/logo/${timestamp}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(newPath, file, { upsert: false, contentType: file.type })
      if (uploadError) throw uploadError
      const { error: dbError } = await supabase
        .from("institute_profiles")
        .update({ logo_path: newPath })
        .eq("profile_id", userProfile.id);
      if (dbError) throw dbError

      // Sync with global profiles table and Auth metadata
      await supabase.from("profiles").update({ avatar_path: newPath }).eq("id", userProfile.id)
      await supabase.auth.updateUser({ data: { avatar_path: newPath } })

      storedLogoPath.current = newPath
      const newPublicUrl = getStorageUrl(supabase, "avatars", newPath)
      setLogoSrc(`${newPublicUrl}?v=${timestamp}`)
      URL.revokeObjectURL(blobUrl)
      toast.success("Logo updated!")
      router.refresh() // Update sidebar/layout
    } catch (err) {
      console.error(err)
      toast.error("Failed to upload logo. Please try again.")
      setLogoSrc(getStorageUrl(supabase, "avatars", storedLogoPath.current))
      URL.revokeObjectURL(blobUrl)
    } finally {
      setIsUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ""
    }
  }

  // ── Course management ─────────────────────────────────────────────────────

  function addCourse() { handleCourses((prev) => [...prev, ""]) }

  function handleCourseChange(index: number, value: string) {
    handleCourses((prev) => { const u = [...prev]; u[index] = value; return u })
  }

  function removeCourse(index: number) {
    handleCourses((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Social links ──────────────────────────────────────────────────────────

  function addSocialLink() { handleSocialLinks((prev) => [...prev, ""]) }

  function handleSocialLinkChange(index: number, value: string) {
    handleSocialLinks((prev) => { const u = [...prev]; u[index] = value; return u })
  }

  function removeSocialLink(index: number) {
    handleSocialLinks((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): Record<string, string> {
    const e: Record<string, string> = {}
    if (username && !USERNAME_REGEX.test(username))
      e.username = "3–20 characters: letters, numbers, and underscores only."
    if (usernameStatus === "taken") e.username = "This username is already taken."
    if (usernameStatus === "checking") e.username = "Please wait for username availability check."
    if (!instituteName.trim()) e.instituteName = "College name is required."
    if (!affiliation) e.affiliation = "Affiliation is required."
    if (!address.trim()) e.address = "Address is required."
    if (!city.trim()) e.city = "City is required."
    if (!stateVal) e.state = "State is required."
    if (!pincode.trim()) e.pincode = "Pincode is required."
    else if (!/^[0-9]{6}$/.test(pincode)) e.pincode = "Must be exactly 6 digits."
    if (!country) e.country = "Country is required."
    if (!instPhone.trim()) e.instPhone = "Contact number is required."
    if (!instEmail.trim()) e.instEmail = "Email address is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(instEmail)) e.instEmail = "Enter a valid email address."
    if (!principalName.trim()) e.principalName = "Principal name is required."
    if (!principalEmail.trim()) e.principalEmail = "Principal email is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(principalEmail)) e.principalEmail = "Enter a valid email address."
    if (!principalPhone.trim()) e.principalPhone = "Principal phone is required."
    return e
  }

  // ── Discard ───────────────────────────────────────────────────────────────

  function handleDiscard() {
    setUsername(userProfile.username ?? "")
    setUsernameStatus("idle")
    setInstituteName(initialData?.institute_name ?? "")
    setInstituteCode(initialData?.institute_code ?? "")
    setEstablishedYear(initialData?.established_year ? String(initialData.established_year) : "")
    setAffiliation(initialData?.affiliation ?? "")
    setAddress(initialData?.address ?? "")
    setCity(initialData?.city ?? "")
    setStateVal(initialData?.state ?? "")
    setPincode(initialData?.pincode ?? "")
    setCountry(initialData?.country ?? "India")
    setInstPhone(initialData?.phone_number ?? "")
    setInstEmail(initialData?.email ?? "")
    setWebsiteUrl(initialData?.website_url ?? "")
    setPrincipalName(initialData?.principal_name ?? "")
    setPrincipalEmail(initialData?.principal_email ?? "")
    setPrincipalPhone(initialData?.principal_phone ?? "")
    setCourses(initialData?.courses?.length ? initialData.courses : [""])
    setSocialLinks(initialData?.social_links?.length ? initialData.social_links : [""])
    setErrors({})
    setIsDirty(false)
    toast.info("Changes discarded.")
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  function handleSave() {
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the validation errors before saving.")
      return
    }

    startTransition(async () => {
      const trimmedUsername = username.trim() || null

      // 1. Update main `profiles` table (username only)
      if (trimmedUsername !== (userProfile.username ?? null)) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ username: trimmedUsername })
          .eq("id", userProfile.id)

        if (profileError) {
          if (profileError.code === "23505") {
            setErrors((prev) => ({ ...prev, username: "This username is already taken." }))
            setUsernameStatus("taken")
          } else {
            toast.error("Failed to update account settings. Please try again.")
          }
          return
        }
      }

      // 2. Prepare payload for `institute_profiles`
      const payload = {
        profile_id: userProfile.id,
        institute_name: instituteName.trim() || null,
        institute_code: instituteCode.trim() || null,
        established_year: establishedYear ? Number(establishedYear) : null,
        affiliation: affiliation || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: stateVal || null,
        pincode: pincode.trim() || null,
        country: country || null,
        phone_number: instPhone.trim() || null,
        email: instEmail.trim() || null,
        website_url: websiteUrl.trim() || null,
        principal_name: principalName.trim() || null,
        principal_email: principalEmail.trim() || null,
        principal_phone: principalPhone.trim() || null,
        courses: courses.filter((c) => c.trim()),
        social_links: socialLinks.filter((l) => l.trim()),
        profile_updated: true,
      }

      // 3. Save Institute Profile
      const { error } = initialData
        ? await supabase.from("institute_profiles").update(payload).eq("profile_id", userProfile.id)
        : await supabase.from("institute_profiles").insert(payload)

      if (error) {
        console.error("Supabase Save Error:", error)
        toast.error(error.message || "Failed to save profile. Please try again.")
      } else {
        // Sync with global profiles table and Auth metadata
        const newDisplayName = instituteName.trim() || userProfile.display_name

        await supabase.from("profiles").update({ 
          display_name: newDisplayName,
          username: trimmedUsername,
        }).eq("id", userProfile.id)

        await supabase.auth.updateUser({
          data: { 
            display_name: newDisplayName,
            username: trimmedUsername 
          }
        })

        toast.success("Profile saved successfully!")
        setIsDirty(false)
        if (trimmedUsername) {
          initialUsername.current = trimmedUsername
          setUsernameStatus("unchanged")
        }
        router.refresh() // Update sidebar/layout
      }
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const usernameMsg = usernameStatusMessage(usernameStatus)

  return (
    <div className="min-h-screen w-full">

      {/* Page Header */}
      <div className="px-4 pt-8 pb-0 md:px-8">
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your institution profile details</p>
        </div>
      </div>

      <div className="px-4 py-6 md:px-8 md:py-8 space-y-6">

        {/* Account Settings (Username) */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Your unique username identifies your institution on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="your_institution"
                  className={cn(
                    "pl-9 pr-9",
                    !!initialUsername.current && "cursor-not-allowed opacity-60",
                    errors.username && "border-destructive focus-visible:ring-destructive"
                  )}
                  value={username}
                  maxLength={20}
                  readOnly={!!initialUsername.current}
                  disabled={!!initialUsername.current}
                  onChange={(e) => handleUsernameChange(e.target.value.replace(/\s/g, ""))}
                  autoComplete="username"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {initialUsername.current ? null : <UsernameStatusIcon status={usernameStatus} />}
                </span>
              </div>
              {initialUsername.current ? (
                <p className="text-xs text-muted-foreground">Username cannot be changed once set.</p>
              ) : errors.username ? (
                <FieldError message={errors.username} />
              ) : usernameMsg ? (
                <p className={cn("text-xs", usernameMsg.className)}>{usernameMsg.text}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  3–20 characters · letters, numbers, and underscores only · cannot be changed after saving
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>College Logo</CardTitle>
            <CardDescription>JPEG, PNG or WEBP · max 2 MB · square recommended</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={logoSrc ?? undefined} alt="Institution logo" className="object-cover" />
                  <AvatarFallback className="text-xl font-semibold">
                    {instituteName ? instituteName[0].toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  aria-label="Change institution logo"
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isUploadingLogo
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Camera className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="space-y-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleLogoFileChange}
                />
                <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo}>
                  {isUploadingLogo
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading…</>
                    : <><Upload className="h-4 w-4 mr-2" />Upload Logo</>}
                </Button>
                <p className="text-xs text-muted-foreground">Square image recommended · max 2 MB</p>
                {!initialData?.institute_name && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Save institution details first, then upload the logo.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about your institution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>College Name<RequiredMark /></Label>
                <Input
                  placeholder="Enter college name"
                  value={instituteName}
                  onChange={(e) => handleInstituteName(e.target.value)}
                />
                <FieldError message={errors.instituteName} />
              </div>
              <div className="space-y-2">
                <Label>College Code</Label>
                <Input
                  placeholder="College code (optional)"
                  value={instituteCode}
                  onChange={(e) => handleInstituteCode(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Established Year</Label>
                <Input
                  placeholder="e.g. 1990"
                  type="number"
                  min={1800}
                  max={2026}
                  value={establishedYear}
                  onChange={(e) => handleEstablishedYear(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Affiliation<RequiredMark /></Label>
                <Combobox items={AFFILIATION_OPTIONS} value={affiliation} onValueChange={(v) => handleAffiliation(v || "")}>
                  <ComboboxInput placeholder="Select affiliation" />
                  <ComboboxContent>
                    <ComboboxEmpty>No affiliation found.</ComboboxEmpty>
                    <ComboboxList>
                      {AFFILIATION_OPTIONS.map((item) => (
                        <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <FieldError message={errors.affiliation} />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Address<RequiredMark /></Label>
              <Textarea
                placeholder="Complete address"
                rows={3}
                value={address}
                onChange={(e) => handleAddress(e.target.value)}
              />
              <FieldError message={errors.address} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City<RequiredMark /></Label>
                <Input placeholder="City" value={city} onChange={(e) => handleCity(e.target.value)} />
                <FieldError message={errors.city} />
              </div>
              <div className="space-y-2">
                <Label>State<RequiredMark /></Label>
                <Combobox items={STATE_OPTIONS} value={stateVal} onValueChange={(v) => handleStateVal(v || "")}>
                  <ComboboxInput placeholder="Select state" />
                  <ComboboxContent>
                    <ComboboxEmpty>No state found.</ComboboxEmpty>
                    <ComboboxList>
                      {STATE_OPTIONS.map((item) => (
                        <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <FieldError message={errors.state} />
              </div>
              <div className="space-y-2">
                <Label>Pincode<RequiredMark /></Label>
                <Input
                  placeholder="6-digit pincode"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => handlePincode(e.target.value.replace(/\D/g, ""))}
                />
                <FieldError message={errors.pincode} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Country<RequiredMark /></Label>
              <Combobox items={COUNTRY_OPTIONS} value={country} onValueChange={(v) => handleCountry(v || "India")}>
                <ComboboxInput placeholder="Select country" />
                <ComboboxContent>
                  <ComboboxEmpty>No country found.</ComboboxEmpty>
                  <ComboboxList>
                    {COUNTRY_OPTIONS.map((item) => (
                      <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <FieldError message={errors.country} />
            </div>

          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Primary contact details for the institution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Contact Number<RequiredMark />
                </Label>
                <Input
                  placeholder="Institution contact number"
                  type="tel"
                  value={instPhone}
                  onChange={(e) => handleInstPhone(e.target.value)}
                />
                <FieldError message={errors.instPhone} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address<RequiredMark />
                </Label>
                <Input
                  placeholder="college@example.com"
                  type="email"
                  value={instEmail}
                  onChange={(e) => handleInstEmail(e.target.value)}
                />
                <FieldError message={errors.instEmail} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                Website URL
              </Label>
              <Input
                placeholder="https://www.yourcollege.edu"
                type="url"
                value={websiteUrl}
                onChange={(e) => handleWebsiteUrl(e.target.value)}
              />
            </div>

          </CardContent>
        </Card>

        {/* Administrative Contacts */}
        <Card>
          <CardHeader>
            <CardTitle>Administrative Contacts</CardTitle>
            <CardDescription>Key personnel contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium">Principal Details</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name<RequiredMark /></Label>
                <Input
                  placeholder="Principal name"
                  value={principalName}
                  onChange={(e) => handlePrincipalName(e.target.value)}
                />
                <FieldError message={errors.principalName} />
              </div>
              <div className="space-y-2">
                <Label>Email<RequiredMark /></Label>
                <Input
                  placeholder="principal@example.com"
                  type="email"
                  value={principalEmail}
                  onChange={(e) => handlePrincipalEmail(e.target.value)}
                />
                <FieldError message={errors.principalEmail} />
              </div>
              <div className="space-y-2">
                <Label>Contact Number<RequiredMark /></Label>
                <Input
                  placeholder="Contact number"
                  type="tel"
                  value={principalPhone}
                  onChange={(e) => handlePrincipalPhone(e.target.value)}
                />
                <FieldError message={errors.principalPhone} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Offered */}
        <Card>
          <CardHeader>
            <CardTitle>Courses Offered</CardTitle>
            <CardDescription>Departments / courses available at your institution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {courses.map((course, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="e.g. Computer Science"
                  value={course}
                  onChange={(e) => handleCourseChange(index, e.target.value)}
                />
                {courses.length > 1 && (
                  <Button variant="ghost" size="icon" type="button" onClick={() => removeCourse(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCourse} type="button">
              <Plus className="h-4 w-4 mr-2" />Add course
            </Button>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media &amp; Links</CardTitle>
            <CardDescription>Connect your institution's social presence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={link}
                  onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                  placeholder="https://facebook.com/yourcollegepage"
                  type="url"
                />
                <Button variant="ghost" size="icon" type="button" onClick={() => removeSocialLink(index)}>
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addSocialLink} type="button">
              <Plus className="h-4 w-4 mr-2" />Add link
            </Button>
          </CardContent>
        </Card>

      </div>

      <FloatingSaveBar
        isDirty={isDirty}
        isPending={isPending}
        onSave={handleSave}
        onDiscard={handleDiscard}
        message="You have unsaved changes"
      />
    </div>
  )
}
