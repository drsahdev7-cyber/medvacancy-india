# MedVacancy India

Automatic medical vacancy platform for India.

## What this repo contains

- Public medical vacancy website
- Supabase database structure
- Admin approval/edit workflow
- Automatic public-source vacancy collector
- Premium plan page
- Deployment guide
- PWA/mobile app path

## Free stack

- Hosting: Vercel or Cloudflare Pages
- Database/Auth: Supabase
- Scheduler: Cloudflare Worker Cron or external cron calling `/api/collect`
- Monetization: AdSense, premium alerts, featured employer posts

## Important disclaimer

This is not a government website. Every vacancy must link to an official source. Do not copy full copyrighted notices or bypass login/CAPTCHA/paywalls.

## Setup

1. Create Supabase project.
2. Run `supabase/schema.sql`.
3. Add `.env.local` values from `.env.example`.
4. Deploy to Vercel/Cloudflare Pages.
5. Add official recruitment pages into the `sources` table.
6. Schedule `/api/collect?token=YOUR_SECRET` every 6 hours.
