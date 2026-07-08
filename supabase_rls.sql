-- 1. Enable RLS on the table
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any (to prevent conflicts)
DROP POLICY IF EXISTS "Allow public insert" ON attendance_logs;
DROP POLICY IF EXISTS "Allow public select" ON attendance_logs;

-- 3. Create SELECT policy
-- Everyone can read the logs, EXCEPT the hidden ___CONFIG rows (unless they are using the service role key)
CREATE POLICY "Public can view normal check-ins" 
ON attendance_logs 
FOR SELECT 
USING (nickname NOT LIKE '___CONFIG%');

-- 4. Create INSERT policy
-- We no longer allow public inserts from the browser. 
-- ALL inserts now happen through our secure /api/check-in and /api/generate routes using the Service Role Key.
-- The Service Role Key automatically bypasses RLS, so we don't need to write a policy for it.
-- Thus, we leave the INSERT policy empty for public, effectively blocking all public inserts.

-- 5. Block UPDATE and DELETE
-- By not creating policies for UPDATE and DELETE, they are automatically blocked for the public.
