import type { MetadataRoute } from 'next'
import { supabasePublic } from '../lib/supabase'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medvacancy-india.vercel.app'

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 90)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/admin`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.2 },
    { url: `${SITE_URL}/country/india`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/country/uk`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/country/uae`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/country/saudi`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/country/australia`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 }
  ]

  const { data: jobs } = await supabasePublic
    .from('vacancies')
    .select('id,title,created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(500)

  const jobPages: MetadataRoute.Sitemap = (jobs || []).map((job: any) => ({
    url: `${SITE_URL}/job/${slugify(job.title)}-${job.id}`,
    lastModified: job.created_at ? new Date(job.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7
  }))

  return [...staticPages, ...jobPages]
}
