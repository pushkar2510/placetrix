"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  Briefcase,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react"
import type { StaffMember } from "./actions"
import {
  createStaffAccount,
  updateStaffRole,
  toggleStaffActive,
} from "./actions"

// ─── Subtype badge ────────────────────────────────────────────────────────────

function SubtypeBadge({ subtype }: { subtype: string | null }) {
  if (subtype === "staff") {
    return (
      <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 gap-1">
        <BarChart3 className="h-3 w-3" />
        Staff
      </Badge>
    )
  }
  if (subtype === "tpo") {
    return (
      <Badge variant="secondary" className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 gap-1">
        <Briefcase className="h-3 w-3" />
        TPO
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Shield className="h-3 w-3" />
      Unknown
    </Badge>
  )
}

// ─── Create Staff Dialog ──────────────────────────────────────────────────────

function CreateStaffDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [password, setPassword] = useState("")
  const [subtype, setSubtype] = useState<"staff" | "tpo">("staff")

  const handleCreate = () => {
    if (!email.trim() || !displayName.trim() || !password.trim()) {
      toast.error("All fields are required.")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }

    startTransition(async () => {
      const result = await createStaffAccount({
        email: email.trim(),
        displayName: displayName.trim(),
        subtype,
        password: password.trim(),
      })
      if (result.success) {
        toast.success("Account created successfully!")
        setOpen(false)
        setEmail("")
        setDisplayName("")
        setPassword("")
        setSubtype("staff")
      } else {
        toast.error(result.error || "Failed to create account.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Display Name</label>
            <Input
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <Input
              type="email"
              placeholder="staff@institute.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <Input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <Select value={subtype} onValueChange={(v) => setSubtype(v as "staff" | "tpo")} disabled={isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
                    Staff — Tests, Courses
                  </div>
                </SelectItem>
                <SelectItem value="tpo">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-teal-600" />
                    TPO — Placements, Drives
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? "Creating…" : "Create Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Staff Row ────────────────────────────────────────────────────────────────

function StaffRow({ member }: { member: StaffMember }) {
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (newRole: "staff" | "tpo") => {
    startTransition(async () => {
      const result = await updateStaffRole(member.id, newRole)
      if (result.success) {
        toast.success(`Role updated to ${newRole.toUpperCase()}.`)
      } else {
        toast.error(result.error || "Failed to update role.")
      }
    })
  }

  const handleToggleActive = () => {
    startTransition(async () => {
      const result = await toggleStaffActive(member.id, !member.is_active)
      if (result.success) {
        toast.success(member.is_active ? "Account deactivated." : "Account activated.")
      } else {
        toast.error(result.error || "Failed to update status.")
      }
    })
  }

  return (
    <div className={`flex items-center justify-between gap-4 rounded-lg border bg-card p-4 transition-opacity ${!member.is_active ? "opacity-60" : ""}`}>
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{member.display_name || "No name"}</span>
          <SubtypeBadge subtype={member.account_subtype} />
          {!member.is_active && (
            <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
              <EyeOff className="h-3 w-3" />
              Inactive
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate">{member.email}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {member.account_subtype !== "staff" && (
            <DropdownMenuItem onClick={() => handleRoleChange("staff")} disabled={isPending}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Change to Staff
            </DropdownMenuItem>
          )}
          {member.account_subtype !== "tpo" && (
            <DropdownMenuItem onClick={() => handleRoleChange("tpo")} disabled={isPending}>
              <Briefcase className="h-4 w-4 mr-2" />
              Change to TPO
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleToggleActive} disabled={isPending}>
            {member.is_active ? (
              <>
                <UserX className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export function StaffManagementClient({
  initialMembers,
}: {
  initialMembers: StaffMember[]
}) {
  return (
    <div className="flex flex-col gap-4">
      {initialMembers.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No staff members yet. Click "Add Staff" to create one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {initialMembers.map((member) => (
            <StaffRow key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  )
}

export { CreateStaffDialog }
