"use client"

import React, { useState } from "react"
import Editor from "@monaco-editor/react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconPlayerPlay,
  IconUpload,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconCpu,
  IconTerminal2,
  IconCheck,
  IconCopy,
  IconAlertTriangle,
  IconInfoCircle,
  IconHistory,
} from "@tabler/icons-react"
import { toast } from "sonner"

const LANGUAGES = [
  { id: 71, name: "Python 3", value: "python", extension: "py" },
  { id: 63, name: "JavaScript (Node.js)", value: "javascript", extension: "js" },
  { id: 54, name: "C++ (GCC 9.2)", value: "cpp", extension: "cpp" },
  { id: 62, name: "Java (OpenJDK 13)", value: "java", extension: "java" },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
}

interface SampleTestCase {
  id: string
  input: string
  expected_output: string
}

interface Submission {
  id: string
  status: string
  language_id: number
  runtime: number | null
  memory: number | null
  passed_count: number
  total_count: number
  created_at: string
}

interface Problem {
  id: string
  title: string
  description: string
  difficulty: string
  tags: string[]
  time_limit: number
  memory_limit: number
  boilerplates: Record<string, string>
  driver_codes: Record<string, string>
}

export function ProblemIDEClient({
  problem,
  sampleTestCases,
  totalTestCases,
  submissions: initialSubmissions,
  userId,
}: {
  problem: Problem
  sampleTestCases: SampleTestCase[]
  totalTestCases: number
  submissions: Submission[]
  userId: string
}) {
  // Safely parse boilerplates if it is returned as a double-serialized string
  let parsedBoilerplates: any = problem.boilerplates || {}
  if (typeof parsedBoilerplates === "string") {
    try {
      parsedBoilerplates = JSON.parse(parsedBoilerplates)
    } catch (e) {
      console.error("Failed to parse problem.boilerplates:", e)
      parsedBoilerplates = {}
    }
  }

  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0])
  const [code, setCode] = useState(
    parsedBoilerplates[String(LANGUAGES[0].id)] || "# Write your solution here\n"
  )
  const [activeTab, setActiveTab] = useState<"description" | "submissions">("description")
  const [activeOutputTab, setActiveOutputTab] = useState<"testcases" | "result">("testcases")
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [runResult, setRunResult] = useState<any>(null)
  const [submitResult, setSubmitResult] = useState<any>(null)

  const handleLangChange = (langVal: string) => {
    const lang = LANGUAGES.find((l) => l.value === langVal)
    if (lang) {
      setSelectedLang(lang)
      setCode(parsedBoilerplates[String(lang.id)] || `// Write your ${lang.name} solution here\n`)
    }
  }

  const handleRunCode = async () => {
    setRunning(true)
    setRunResult(null)
    setActiveOutputTab("result")
    try {
      const res = await fetch("/api/logiclab/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: selectedLang.id,
          stdin: sampleTestCases[0]?.input || "",
          problem_id: problem.id,
          mode: "problem",
        }),
      })
      if (!res.ok) throw new Error("Execution failed.")
      const data = await res.json()
      setRunResult({
        ...data,
        expected: sampleTestCases[0]?.expected_output?.trim() || "",
        matched: data.stdout?.trim() === sampleTestCases[0]?.expected_output?.trim(),
      })
      if (data.status?.id === 3) {
        if (data.stdout?.trim() === sampleTestCases[0]?.expected_output?.trim()) {
          toast.success("Sample test passed!")
        } else {
          toast.error("Output mismatch with expected.")
        }
      } else {
        toast.error(`${data.status?.description || "Error"}`)
      }
    } catch (err: any) {
      setRunResult({ success: false, error: err?.message || "Execution failed." })
      toast.error("Execution failed.")
    } finally {
      setRunning(false)
    }
  }

  const handleSubmitCode = async () => {
    setSubmitting(true)
    setSubmitResult(null)
    setActiveOutputTab("result")
    try {
      const res = await fetch("/api/logiclab/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: problem.id,
          code,
          language_id: selectedLang.id,
          user_id: userId,
        }),
      })
      if (!res.ok) throw new Error("Submission failed.")
      const data = await res.json()
      setSubmitResult(data)

      if (data.status === "Accepted") {
        toast.success(`Accepted! ${data.passed_count}/${data.total_count} test cases passed.`)
      } else {
        toast.error(`${data.status}: ${data.passed_count}/${data.total_count} passed.`)
      }

      // Add or update local submissions list to match database upsert behavior
      if (data.submission_id) {
        setSubmissions((prev) => {
          const filtered = prev.filter((sub) => sub.language_id !== selectedLang.id)
          return [
            {
              id: data.submission_id,
              status: data.status,
              language_id: selectedLang.id,
              runtime: data.runtime,
              memory: data.memory,
              passed_count: data.passed_count,
              total_count: data.total_count,
              created_at: new Date().toISOString(),
            },
            ...filtered,
          ]
        })
      }
    } catch (err: any) {
      setSubmitResult({ success: false, error: err?.message || "Submission failed." })
      toast.error("Submission failed.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyOutput = () => {
    const text = runResult?.stdout || submitResult?.error || ""
    if (text) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Copied!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const langForDisplay = LANGUAGES.find((l) => l.id === selectedLang.id)

  return (
    <div className="flex flex-col h-[calc(100svh-56px)] bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3 bg-zinc-900/60 border-b border-zinc-800 px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/~/logiclab"
            className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            <IconArrowLeft className="h-4 w-4 text-zinc-400" />
          </Link>
          <div>
            <p className="text-sm font-bold tracking-tight text-white truncate max-w-[300px]">
              {problem.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-block px-1.5 py-0 rounded text-[9px] font-bold uppercase tracking-wider border ${DIFFICULTY_COLORS[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
              <span className="text-[10px] text-zinc-600">
                {totalTestCases} test cases · {problem.time_limit}s · {problem.memory_limit}MB
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedLang.value}
            onChange={(e) => handleLangChange(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-200 focus:outline-none cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.value}>{l.name}</option>
            ))}
          </select>

          <button
            onClick={handleRunCode}
            disabled={running || submitting}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
          >
            {running ? (
              <><div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" /> Running...</>
            ) : (
              <><IconPlayerPlay className="h-3.5 w-3.5" /> Run</>
            )}
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={running || submitting}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black px-4 py-1.5 rounded-lg text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:shadow-[0_0_18px_rgba(16,185,129,0.4)] disabled:shadow-none transition-all cursor-pointer"
          >
            {submitting ? (
              <><div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" /> Judging...</>
            ) : (
              <><IconUpload className="h-3.5 w-3.5" /> Submit</>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
        {/* LEFT PANEL: Description / Submissions */}
        <div className="flex flex-col border-r border-zinc-800 min-h-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex bg-zinc-900 border-b border-zinc-800 shrink-0">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${activeTab === "description" ? "text-white border-b-2 border-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === "submissions" ? "text-white border-b-2 border-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <IconHistory className="h-3 w-3" /> Submissions ({submissions.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            {activeTab === "description" ? (
              <div className="space-y-5">
                {/* Description */}
                <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </div>

                {/* Tags */}
                {problem.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-400 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sample Test Cases */}
                {sampleTestCases.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Sample Test Cases</p>
                    {sampleTestCases.map((tc, idx) => (
                      <div key={tc.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                        <div className="bg-zinc-950 px-3 py-1.5 border-b border-zinc-800">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                            Example {idx + 1}
                          </span>
                        </div>
                        <div className="p-3 space-y-2">
                          <div>
                            <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Input</span>
                            <pre className="mt-1 p-2 bg-zinc-950 rounded text-xs text-zinc-300 font-mono whitespace-pre-wrap">{tc.input}</pre>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Expected Output</span>
                            <pre className="mt-1 p-2 bg-zinc-950 rounded text-xs text-zinc-300 font-mono whitespace-pre-wrap">{tc.expected_output}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Constraints</p>
                  <div className="space-y-1 text-xs text-zinc-400">
                    <p>• Time Limit: {problem.time_limit}s</p>
                    <p>• Memory Limit: {problem.memory_limit}MB</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Submissions History */
              <div className="space-y-2">
                {submissions.length > 0 ? (
                  submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${sub.status === "Accepted" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-900 border-zinc-800"}`}
                    >
                      <div className="flex items-center gap-3">
                        {sub.status === "Accepted" ? (
                          <IconCircleCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <IconCircleX className="h-4 w-4 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <p className={`text-xs font-bold ${sub.status === "Accepted" ? "text-emerald-400" : "text-rose-400"}`}>
                            {sub.status}
                          </p>
                          <p className="text-[10px] text-zinc-600">
                            {sub.passed_count}/{sub.total_count} passed · {LANGUAGES.find((l) => l.id === sub.language_id)?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                          {sub.runtime !== null && (
                            <span className="flex items-center gap-0.5"><IconClock className="h-3 w-3" />{sub.runtime}s</span>
                          )}
                          {sub.memory !== null && (
                            <span className="flex items-center gap-0.5"><IconCpu className="h-3 w-3" />{sub.memory}MB</span>
                          )}
                        </div>
                        <p className="text-[9px] text-zinc-700 mt-0.5">
                          {new Date(sub.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 select-none">
                    <IconHistory className="h-8 w-8 text-zinc-800" />
                    <p className="text-[10px] text-zinc-700 uppercase font-bold tracking-widest">No submissions yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Editor + Output */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 border-b border-zinc-800 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {langForDisplay?.name} (.{langForDisplay?.extension})
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={selectedLang.value}
                value={code}
                onChange={(v) => setCode(v || "")}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                  padding: { top: 10, bottom: 10 },
                  lineNumbersMinChars: 3,
                }}
                loading={
                  <div className="flex flex-col items-center justify-center h-full gap-2 bg-zinc-950">
                    <div className="h-6 w-6 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Loading...</span>
                  </div>
                }
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="h-[220px] flex flex-col border-t border-zinc-800 shrink-0 overflow-hidden">
            {/* Output tabs */}
            <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-3 shrink-0">
              <div className="flex">
                <button
                  onClick={() => setActiveOutputTab("testcases")}
                  className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${activeOutputTab === "testcases" ? "text-white border-b-2 border-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Test Cases
                </button>
                <button
                  onClick={() => setActiveOutputTab("result")}
                  className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${activeOutputTab === "result" ? "text-white border-b-2 border-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Result
                </button>
              </div>
              {(runResult || submitResult) && (
                <button onClick={handleCopyOutput} className="p-1 hover:bg-zinc-800 rounded transition-all cursor-pointer text-zinc-500 hover:text-white">
                  {copied ? <IconCheck className="h-3 w-3 text-emerald-400" /> : <IconCopy className="h-3 w-3" />}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
              {activeOutputTab === "testcases" ? (
                sampleTestCases.length > 0 ? (
                  <div className="space-y-2">
                    {sampleTestCases.map((tc, idx) => (
                      <div key={tc.id} className="flex gap-4">
                        <div className="flex-1">
                          <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-0.5">Input {idx + 1}</p>
                          <pre className="p-1.5 bg-zinc-900 rounded text-zinc-400 text-[11px]">{tc.input}</pre>
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-0.5">Expected</p>
                          <pre className="p-1.5 bg-zinc-900 rounded text-zinc-400 text-[11px]">{tc.expected_output}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-700 text-[10px]">No sample test cases available.</p>
                )
              ) : (
                /* Result tab */
                <div className="space-y-2">
                  {submitResult ? (
                    <>
                      <div className={`p-2.5 rounded-lg flex items-center justify-between border ${submitResult.status === "Accepted" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-rose-500/5 border-rose-500/20 text-rose-400"}`}>
                        <div className="flex items-center gap-2">
                          {submitResult.status === "Accepted" ? <IconCircleCheck className="h-4 w-4" /> : <IconCircleX className="h-4 w-4" />}
                          <span className="font-bold uppercase tracking-wider text-[10px]">{submitResult.status}</span>
                          <span className="text-zinc-500 text-[10px]">{submitResult.passed_count}/{submitResult.total_count} passed</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-400 text-[10px]">
                          <span className="flex items-center gap-1"><IconClock className="h-3 w-3" />{submitResult.runtime}s</span>
                          <span className="flex items-center gap-1"><IconCpu className="h-3 w-3" />{submitResult.memory}MB</span>
                        </div>
                      </div>
                      {submitResult.failed_test_case_info && (
                        <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg space-y-1.5">
                          <p className="text-[9px] text-rose-400 uppercase tracking-widest font-bold flex items-center gap-1"><IconAlertTriangle className="h-3 w-3" /> Failed at Test Case #{submitResult.failed_test_case_info.index}</p>
                          <div className="grid grid-cols-3 gap-2 text-[10px]">
                            <div>
                              <p className="text-zinc-600">Input</p>
                              <pre className="text-zinc-400 mt-0.5">{submitResult.failed_test_case_info.input}</pre>
                            </div>
                            <div>
                              <p className="text-zinc-600">Expected</p>
                              <pre className="text-zinc-400 mt-0.5">{submitResult.failed_test_case_info.expected}</pre>
                            </div>
                            <div>
                              <p className="text-zinc-600">Your Output</p>
                              <pre className="text-rose-400 mt-0.5">{submitResult.failed_test_case_info.actual}</pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : runResult ? (
                    <>
                      <div className={`p-2.5 rounded-lg flex items-center justify-between border ${runResult.status?.id === 3 && runResult.matched ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-rose-500/5 border-rose-500/20 text-rose-400"}`}>
                        <div className="flex items-center gap-2">
                          {runResult.status?.id === 3 && runResult.matched ? <IconCircleCheck className="h-4 w-4" /> : <IconCircleX className="h-4 w-4" />}
                          <span className="font-bold uppercase tracking-wider text-[10px]">
                            {runResult.status?.id === 3 ? (runResult.matched ? "Sample Passed" : "Wrong Answer") : (runResult.status?.description || "Error")}
                          </span>
                        </div>
                        {runResult.status?.id === 3 && (
                          <div className="flex items-center gap-3 text-zinc-400 text-[10px]">
                            <span className="flex items-center gap-1"><IconClock className="h-3 w-3" />{runResult.time}s</span>
                            <span className="flex items-center gap-1"><IconCpu className="h-3 w-3" />{(parseInt(runResult.memory || "0") / 1024).toFixed(1)}MB</span>
                          </div>
                        )}
                      </div>

                      {runResult.compile_output && (
                        <div>
                          <p className="text-[9px] text-rose-400 uppercase tracking-widest mb-1"><IconAlertTriangle className="h-3 w-3 inline" /> Compile Error</p>
                          <pre className="p-2 bg-zinc-900 border border-zinc-800 rounded text-rose-400/90 whitespace-pre-wrap text-[11px]">{runResult.compile_output}</pre>
                        </div>
                      )}

                      {runResult.stderr && (
                        <div>
                          <p className="text-[9px] text-rose-400 uppercase tracking-widest mb-1"><IconAlertTriangle className="h-3 w-3 inline" /> Runtime Error</p>
                          <pre className="p-2 bg-zinc-900 border border-zinc-800 rounded text-rose-400/90 whitespace-pre-wrap text-[11px]">{runResult.stderr}</pre>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-0.5">Your Output</p>
                          <pre className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 text-[11px] whitespace-pre-wrap">{runResult.stdout || "(empty)"}</pre>
                        </div>
                        <div>
                          <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-0.5">Expected</p>
                          <pre className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 text-[11px] whitespace-pre-wrap">{runResult.expected || "(none)"}</pre>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-1.5 select-none">
                      <IconTerminal2 className="h-6 w-6 text-zinc-800" />
                      <p className="text-[10px] text-zinc-700 uppercase font-bold tracking-widest">Run or Submit to see results</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
