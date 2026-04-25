-- RUN THIS IN SUPABASE SQL EDITOR

ALTER TABLE vacancies
ADD COLUMN IF NOT EXISTS collected_by text DEFAULT 'auto';

ALTER TABLE vacancies
ADD COLUMN IF NOT EXISTS eligibility text;

ALTER TABLE vacancies
ADD COLUMN IF NOT EXISTS salary text;

ALTER TABLE vacancies
ADD COLUMN IF NOT EXISTS last_date date;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
