import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service Role 클라이언트: 서버(API Route)에서만 사용. 빌드 시점에는 placeholder로 생성됨.
export const supabaseAdmin = supabaseServiceRoleKey !== 'placeholder'
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null as any;
