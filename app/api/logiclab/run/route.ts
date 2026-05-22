import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { source_code, language_id, stdin, problem_id, mode } = body

    // If mode === "problem", we merge user code with the driver code
    let finalSource = source_code
    let finalStdin = stdin || ""

    if (mode === "problem" && problem_id) {
      const supabase = (await createClient()) as any

      // Fetch problem driver codes and test cases
      const { data: problems, error: problemError } = await supabase
        .from("coding_problems")
        .select("driver_codes, test_cases")
        .eq("id", problem_id)

      if (problemError || !problems || !problems.length) {
        throw new Error(problemError?.message || "Problem not found.")
      }

      let driverCodes: any = problems[0].driver_codes || {}
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

      if (driverCode) {
        if (langKey === "62") { // Java
          // Hoist imports to the very top, before the Solution class
          const lines = driverCode.split("\n")
          const imports = lines.filter((line: string) => line.trim().startsWith("import "))
          const nonImports = lines.filter((line: string) => !line.trim().startsWith("import "))
          finalSource = imports.join("\n") + "\n\n" + source_code + "\n\n" + nonImports.join("\n")
        } else if (langKey === "71") { // Python
          const merged = source_code + "\n\n" + driverCode
          if (merged.includes("json.") && !merged.includes("import json")) {
            finalSource = "import json\n" + merged
          } else {
            finalSource = merged
          }
        } else {
          finalSource = source_code + "\n\n" + driverCode
        }
      }

      // If no custom stdin provided, retrieve the first sample testcase in-memory
      if (!stdin) {
        let parsedTestCases: any[] = problems[0].test_cases || []
        if (typeof parsedTestCases === "string") {
          try {
            parsedTestCases = JSON.parse(parsedTestCases)
          } catch {
            parsedTestCases = []
          }
        }
        const sampleCase = parsedTestCases.find((tc: any) => tc.is_sample || tc.isSample)
        if (sampleCase) {
          finalStdin = sampleCase.input || ""
        }
      }
    }

    // Resolve Judge0 Endpoint
    const judge0Endpoint = process.env.NEXT_PUBLIC_JUDGE0_ENDPOINT || "http://187.127.171.46:2358"
    const submissionsUrl = `${judge0Endpoint}/submissions?wait=true&base64_encoded=true`

    // Base64 encode inputs safely
    const encodedSource = Buffer.from(finalSource || "").toString("base64")
    const encodedStdin = Buffer.from(finalStdin || "").toString("base64")

    // Send request to Judge0
    const response = await fetch(submissionsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        source_code: encodedSource,
        language_id: language_id,
        stdin: encodedStdin,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[LogicLab API Proxy] Judge0 error:", errorText)
      return NextResponse.json(
        { success: false, error: "Sandbox compiler service returned an error." },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Decode outputs returned from Judge0
    const decode = (str: string | null) => {
      if (!str) return ""
      try {
        return Buffer.from(str, "base64").toString("utf-8")
      } catch (e) {
        return str
      }
    }

    const result = {
      success: true,
      stdout: decode(data.stdout),
      stderr: decode(data.stderr),
      compile_output: decode(data.compile_output),
      message: decode(data.message),
      status: data.status || { id: 3, description: "Accepted" },
      time: data.time || "0.00",
      memory: data.memory || "0",
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[LogicLab API Proxy] Request failed:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error during compilation." },
      { status: 500 }
    )
  }
}
