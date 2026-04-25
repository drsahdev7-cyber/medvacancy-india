create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table if not exists vacancies (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  institute text,
  state text,
  category text,
  source_url text unique not null,
  summary text,
  eligibility text,
  salary text,
  last_date date,
  status text default 'pending' check (status in ('pending','approved','rejected','hidden','expired')),
  is_premium boolean default false,
  confidence_score int default 0,
  collected_by text default 'manual',
  posted_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  featured_until timestamptz,
  fee_status text default 'free',
  location text,
  organization text,
  description text,
  deadline text
);

create table if not exists sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  url text not null unique,
  state text,
  category text,
  active boolean default true,
  auto_publish boolean default false,
  last_checked_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists collector_logs (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references sources(id),
  level text,
  message text,
  created_at timestamptz default now()
);

create table if not exists newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  source text default 'website',
  created_at timestamptz default now()
);

alter table vacancies enable row level security;
alter table sources enable row level security;
alter table collector_logs enable row level security;
alter table newsletter_subscribers enable row level security;

drop policy if exists "read approved vacancies" on vacancies;
drop policy if exists "read active sources" on sources;
drop policy if exists "insert newsletter subscribers" on newsletter_subscribers;

create policy "read approved vacancies" on vacancies for select using (status = 'approved');
create policy "read active sources" on sources for select using (active = true);
create policy "insert newsletter subscribers" on newsletter_subscribers for insert with check (true);

create index if not exists vacancies_status_idx on vacancies(status);
create index if not exists vacancies_source_url_idx on vacancies(source_url);
create index if not exists vacancies_category_idx on vacancies(category);
create index if not exists vacancies_is_premium_idx on vacancies(is_premium);

insert into sources (name,url,state,category,active,auto_publish) values
('AIIMS Exams Recruitments','https://aiimsexams.ac.in/landingpage/courses/68dbbb27b7b096817673976e','India','AIIMS',true,true),
('AIIMS Exams Notices','https://aiimsexams.ac.in/landingpage/notices','India','AIIMS',true,false),
('NHM Rajasthan','https://nhm.rajasthan.gov.in/','Rajasthan','NHM Rajasthan',true,true),
('Rajasthan Health','https://rajswasthya.nic.in/','Rajasthan','NHM Rajasthan',true,false),
('ESIC Recruitment','https://esic.gov.in/recruitments','India','ESIC',true,true),
('Medical Education Rajasthan','https://medicaleducation.rajasthan.gov.in/','Rajasthan','Medical College',true,false)
on conflict (url) do nothing;
