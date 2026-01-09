-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR TO FIX THE 403 ERROR
-- The app uses 'upsert' which requires both INSERT and UPDATE permissions.
-- If you are seeing a 403, you likely are missing the UPDATE policy.

create policy "Users can modify their own progress"
on user_tricks for update
to authenticated
using (auth.uid() = user_id);
