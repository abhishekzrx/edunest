import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://baftdvuyabxgbvtpoups.supabase.co"
const supabaseKey = "sb_publishable_Nr-Q_xV7F2aGZq03N561yA_FWzU_wGm"

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase