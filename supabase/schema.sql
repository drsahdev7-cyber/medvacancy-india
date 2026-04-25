create extension if not exists "uuid-ossp";

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
  updated_at timestamptz default now()
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

alter table vacancies enable row level security;
alter table sources enable row level security;
alter table collector_logs enable row level security;

create policy "read approved vacancies" on vacancies for select using (status = 'approved');
create policy "read active sources" on sources for select using (active = true);

insert into sources (name,url,state,category,active,auto_publish) values
('NHM Rajasthan','https://rajswasthya.nic.in/','Rajasthan','Government Medical',true,false),
('Medical Education Rajasthan','https://medicaleducation.rajasthan.gov.in/','Rajasthan','Medical College',true,false),
('AIIMS Exams','https://www.aiimsexams.ac.in/','India','Government Medical',true,false)
on conflict (url) do nothing;
