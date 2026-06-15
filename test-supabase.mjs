import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

console.log("URL:", supabaseUrl)
console.log("Key defined:", !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase
    .from('logiclab_problem_notes')
    .select(`
      id,
      is_public,
      user_id,
      problem_id,
      profiles ( display_name, avatar_path )
    `)
    .limit(1)

  console.log("Data:", JSON.stringify(data, null, 2))
  console.log("Error:", error)
}

test()
