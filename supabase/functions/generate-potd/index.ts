// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // UPDATED: Determine the date to generate POTD for (Today in IST)
    const now = new Date()
    const istOffset = 5.5 * 60 * 60 * 1000
    const today = new Date(now.getTime() + istOffset)
    const todayStr = today.toISOString().split("T")[0]

    const { data: existingPotd } = await supabaseClient
      .from('logiclab_daily_challenges')
      .select('problem_id')
      .eq('date', todayStr)
      .single()

    if (existingPotd) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'POTD already exists for today.', 
        problem_id: existingPotd.problem_id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setUTCDate(today.getUTCDate() - 30)
    
    const { data: recentPotds } = await supabaseClient
      .from('logiclab_daily_challenges')
      .select('problem_id')
      .gte('date', thirtyDaysAgo.toISOString().split("T")[0])

    const recentProblemIds = recentPotds?.map(p => p.problem_id) || []

    const { data: allProblems, error: fetchErr } = await supabaseClient
      .from('logiclab_problems')
      .select('id')

    if (fetchErr || !allProblems || allProblems.length === 0) {
      throw new Error('Could not fetch coding problems.')
    }

    const availableProblems = allProblems.filter(p => !recentProblemIds.includes(p.id))
    const poolToPickFrom = availableProblems.length > 0 ? availableProblems : allProblems
    const selectedProblemId = poolToPickFrom[Math.floor(Math.random() * poolToPickFrom.length)].id

    const { error: insertErr } = await supabaseClient
      .from('logiclab_daily_challenges')
      .insert({
        date: todayStr,
        problem_id: selectedProblemId
      })

    if (insertErr) throw insertErr

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'New POTD generated successfully.',
      date: todayStr,
      problem_id: selectedProblemId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
