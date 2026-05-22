import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { source_code, language_id, stdin } = await req.json()

    // 1. Resolve Judge0 Endpoint from Env (fallback to your Hostinger VPS)
    const judge0Endpoint = process.env.NEXT_PUBLIC_JUDGE0_ENDPOINT || "http://187.127.171.46:2358"
    const submissionsUrl = `${judge0Endpoint}/submissions?wait=true&base64_encoded=true`

    // 2. Base64 encode inputs safely
    const encodedSource = Buffer.from(source_code || "").toString("base64")
    const encodedStdin = Buffer.from(stdin || "").toString("base64")

    // 3. Send request to Judge0
    const response = await fetch(submissionsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
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

    // 4. Decode outputs returned from Judge0
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
