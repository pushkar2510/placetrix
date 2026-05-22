"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  IconCode,
  IconTerminal2,
  IconPlus,
  IconSearch,
  IconCircleCheck,
  IconCircleDot,
  IconFilter,
  IconChevronRight,
} from "@tabler/icons-react"

interface Problem {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  tags: string[]
  created_at: string
  solved_status: string | null
  acceptance_rate: number | null
  total_submissions: number
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
}

export function ProblemsDirectoryClient({
  problems,
  isAdmin,
}: {
  problems: Problem[]
  isAdmin: boolean
}) {
  const [search, setSearch] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All")
  const [statusFilter, setStatusFilter] = useState<string>("All")

  const filtered = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchesDifficulty = difficultyFilter === "All" || p.difficulty === difficultyFilter
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Solved" && p.solved_status === "Accepted") ||
      (statusFilter === "Attempted" && p.solved_status && p.solved_status !== "Accepted") ||
      (statusFilter === "Unsolved" && !p.solved_status)
    return matchesSearch && matchesDifficulty && matchesStatus
  })

  const counts = {
    total: problems.length,
    easy: problems.filter((p) => p.difficulty === "Easy").length,
    medium: problems.filter((p) => p.difficulty === "Medium").length,
    hard: problems.filter((p) => p.difficulty === "Hard").length,
    solved: problems.filter((p) => p.solved_status === "Accepted").length,
  }

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 min-h-[calc(100svh-56px)] bg-zinc-950 text-zinc-100">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
            <IconCode className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">LogicLab</h1>
            <p className="text-xs text-zinc-500">
              {counts.total} problems · {counts.solved} solved
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/~/logiclab/playground"
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg text-xs font-semibold border border-zinc-700 transition-all"
          >
            <IconTerminal2 className="h-3.5 w-3.5" /> Free Playground
          </Link>
          {isAdmin && (
            <Link
              href="/~/logiclab/admin"
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 py-2 rounded-lg text-xs font-bold shadow-[0_0_16px_rgba(16,185,129,0.25)] hover:shadow-[0_0_22px_rgba(16,185,129,0.4)] transition-all"
            >
              <IconPlus className="h-3.5 w-3.5" /> Create Problem
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total, color: "text-zinc-300" },
          { label: "Easy", value: counts.easy, color: "text-emerald-400" },
          { label: "Medium", value: counts.medium, color: "text-amber-400" },
          { label: "Hard", value: counts.hard, color: "text-rose-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{s.label}</span>
            <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-zinc-900/40 border border-zinc-800/50 rounded-xl px-4 py-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
          <input
            type="text"
            placeholder="Search problems or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <IconFilter className="h-3.5 w-3.5 text-zinc-600" />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Solved">Solved</option>
            <option value="Attempted">Attempted</option>
            <option value="Unsolved">Unsolved</option>
          </select>
        </div>
      </div>

      {/* ── Problems Table ── */}
      <div className="flex-1 bg-zinc-900/40 border border-zinc-800/50 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          <div className="col-span-1">Status</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Acceptance</div>
          <div className="col-span-2 text-right">Tags</div>
        </div>

        {/* Rows */}
        {filtered.length > 0 ? (
          <div className="divide-y divide-zinc-800/50">
            {filtered.map((problem, idx) => (
              <Link
                key={problem.id}
                href={`/~/logiclab/problems/${problem.id}`}
                className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-zinc-800/30 transition-colors group cursor-pointer"
              >
                {/* Status */}
                <div className="col-span-1">
                  {problem.solved_status === "Accepted" ? (
                    <IconCircleCheck className="h-4 w-4 text-emerald-400" />
                  ) : problem.solved_status ? (
                    <IconCircleDot className="h-4 w-4 text-amber-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>

                {/* Title */}
                <div className="col-span-5 flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-mono w-6 shrink-0">{idx + 1}.</span>
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                    {problem.title}
                  </span>
                  <IconChevronRight className="h-3 w-3 text-zinc-700 group-hover:text-zinc-400 transition-colors ml-auto shrink-0 opacity-0 group-hover:opacity-100" />
                </div>

                {/* Difficulty */}
                <div className="col-span-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${DIFFICULTY_COLORS[problem.difficulty]}`}>
                    {problem.difficulty}
                  </span>
                </div>

                {/* Acceptance Rate */}
                <div className="col-span-2">
                  <span className="text-xs text-zinc-400">
                    {problem.acceptance_rate !== null
                      ? `${problem.acceptance_rate}%`
                      : "—"}
                  </span>
                  {problem.total_submissions > 0 && (
                    <span className="text-[10px] text-zinc-600 ml-1">
                      ({problem.total_submissions})
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div className="col-span-2 flex flex-wrap gap-1 justify-end">
                  {(problem.tags || []).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[9px] text-zinc-500 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3 select-none">
            <IconCode className="h-10 w-10 text-zinc-800 stroke-[1.5]" />
            <p className="text-xs text-zinc-600 font-semibold uppercase tracking-widest">
              {problems.length === 0 ? "No problems yet" : "No matching problems"}
            </p>
            {isAdmin && problems.length === 0 && (
              <Link
                href="/~/logiclab/admin"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold mt-1"
              >
                Create your first problem →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
