import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface TestCaseResult {
  index: number
  passed: boolean
  input: string
  expected: string
  actual: string
  status: { id: number; description: string }
  time: string
  memory: string
}

export async function POST(req: NextRequest) {
  try {
    const { problem_id, code, language_id, user_id } = await req.json()

    if (!problem_id || !code || !language_id || !user_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: problem_id, code, language_id, user_id" },
        { status: 400 }
      )
    }

    const judge0Endpoint = process.env.NEXT_PUBLIC_JUDGE0_ENDPOINT || "http://187.127.171.46:2358"

    const supabase = (await createClient()) as any

    // 1. Fetch problem data (driver code + time/memory limits + test cases)
    const { data: problems, error: problemError } = await supabase
      .from("coding_problems")
      .select("driver_codes, time_limit, memory_limit, test_cases")
      .eq("id", problem_id)

    if (problemError || !problems || !problems.length) {
      throw new Error(problemError?.message || "Problem not found.")
    }

    const problem = problems[0]
    let driverCodes: any = problem.driver_codes || {}
    if (typeof driverCodes === "string") {
      try {
        driverCodes = JSON.parse(driverCodes)
      } catch (e) {
        console.error("Failed to parse driver_codes as JSON:", e)
        driverCodes = {}
      }
    }
    const langKey = String(language_id)
    const driverCode = driverCodes[langKey] || ""
    const timeLimit = problem.time_limit || 2.0
    const memoryLimit = (problem.memory_limit || 256) * 1024 // Convert MB to KB for Judge0

    // 2. Load test cases from embedded JSONB array
    let testCases: any[] = problem.test_cases || []
    if (typeof testCases === "string") {
      try {
        testCases = JSON.parse(testCases)
      } catch (e) {
        testCases = []
      }
    }

    if (!testCases.length) {
      return NextResponse.json(
        { success: false, error: "No test cases found for this problem." },
        { status: 400 }
      )
    }

    // 3. Merge user code with driver code
    let finalSource = code
    if (driverCode) {
      if (langKey === "62") { // Java
        // Hoist imports to the very top, before the Solution class
        const lines = driverCode.split("\n")
        const imports = lines.filter((line: string) => line.trim().startsWith("import "))
        const nonImports = lines.filter((line: string) => !line.trim().startsWith("import "))
        finalSource = imports.join("\n") + "\n\n" + code + "\n\n" + nonImports.join("\n")
      } else if (langKey === "71") { // Python
        const merged = code + "\n\n" + driverCode
        if (merged.includes("json.") && !merged.includes("import json")) {
          finalSource = "import json\n" + merged
        } else {
          finalSource = merged
        }
      } else {
        finalSource = code + "\n\n" + driverCode
      }
    }
    const encodedSource = Buffer.from(finalSource).toString("base64")

    // 4. Execute against each test case
    const results: TestCaseResult[] = []
    let overallStatus = "Accepted"
    let totalTime = 0
    let maxMemory = 0
    let passedCount = 0
    let failedInfo: any = null

    const decode = (str: string | null) => {
      if (!str) return ""
      try {
        return Buffer.from(str, "base64").toString("utf-8")
      } catch {
        return str
      }
    }

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i]
      const encodedStdin = Buffer.from(tc.input || "").toString("base64")

      const response = await fetch(
        `${judge0Endpoint}/submissions?wait=true&base64_encoded=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            source_code: encodedSource,
            language_id,
            stdin: encodedStdin,
            cpu_time_limit: timeLimit,
            memory_limit: memoryLimit,
          }),
        }
      )

      if (!response.ok) {
        overallStatus = "Runtime Error"
        failedInfo = { index: i + 1, input: tc.input, expected: tc.expected_output, actual: "Judge0 service error" }
        break
      }

      const data = await response.json()
      const stdout = decode(data.stdout).trim()
      const expectedTrimmed = tc.expected_output.trim()
      const statusId = data.status?.id || 0
      const statusDesc = data.status?.description || "Unknown"

      const tcResult: TestCaseResult = {
        index: i + 1,
        passed: false,
        input: tc.input,
        expected: expectedTrimmed,
        actual: stdout,
        status: { id: statusId, description: statusDesc },
        time: data.time || "0.00",
        memory: data.memory ? String(data.memory) : "0",
      }

      // Check status
      if (statusId === 3) {
        // Accepted by Judge0 — compare output
        if (stdout === expectedTrimmed) {
          tcResult.passed = true
          passedCount++
        } else {
          tcResult.passed = false
          overallStatus = "Wrong Answer"
          if (!failedInfo) {
            failedInfo = {
              index: i + 1,
              input: tc.is_sample ? tc.input : "(hidden)",
              expected: tc.is_sample ? expectedTrimmed : "(hidden)",
              actual: tc.is_sample ? stdout : "(hidden)",
            }
          }
        }
      } else if (statusId === 5) {
        overallStatus = "Time Limit Exceeded"
        if (!failedInfo) failedInfo = { index: i + 1, input: tc.is_sample ? tc.input : "(hidden)", expected: tc.is_sample ? expectedTrimmed : "(hidden)", actual: `TLE (${statusDesc})` }
      } else if (statusId === 6) {
        overallStatus = "Compile Error"
        if (!failedInfo) failedInfo = { index: i + 1, input: tc.input, expected: expectedTrimmed, actual: decode(data.compile_output) }
        break // No point continuing on compile error
      } else {
        overallStatus = "Runtime Error"
        if (!failedInfo) failedInfo = { index: i + 1, input: tc.is_sample ? tc.input : "(hidden)", expected: tc.is_sample ? expectedTrimmed : "(hidden)", actual: decode(data.stderr) || statusDesc }
      }

      totalTime += parseFloat(data.time || "0")
      maxMemory = Math.max(maxMemory, parseInt(data.memory || "0", 10))

      results.push(tcResult)

      // If compile error, stop immediately
      if (statusId === 6) break
    }

    // If all passed
    if (passedCount === testCases.length) {
      overallStatus = "Accepted"
    }

    // 5. Save submission to database
    const submission = {
      problem_id,
      user_id,
      code,
      language_id,
      status: overallStatus,
      runtime: parseFloat(totalTime.toFixed(3)),
      memory: parseFloat((maxMemory / 1024).toFixed(1)),
      passed_count: passedCount,
      total_count: testCases.length,
      failed_test_case_info: failedInfo,
    }

    const { data: saved, error: saveError } = await supabase
      .from("coding_submissions")
      .upsert(submission, { onConflict: "user_id,problem_id,language_id" })
      .select("id")
      .single()

    let savedSubmission = saved || null
    if (saveError) {
      console.error("[LogicLab Submit] Failed to save submission:", saveError.message)
    }

    return NextResponse.json({
      success: overallStatus === "Accepted",
      status: overallStatus,
      passed_count: passedCount,
      total_count: testCases.length,
      runtime: parseFloat(totalTime.toFixed(3)),
      memory: parseFloat((maxMemory / 1024).toFixed(1)),
      failed_test_case_info: failedInfo,
      submission_id: savedSubmission?.id || null,
    })
  } catch (error: any) {
    console.error("[LogicLab Submit] Request failed:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error during submission." },
      { status: 500 }
    )
  }
}
