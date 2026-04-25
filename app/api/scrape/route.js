import { createClient } from "@supabase/supabase-js";
import { SOURCES, fetchHtml, parseJobs } from "@/lib/scraper";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  let count = 0;

  for (const source of SOURCES) {
    const html = await fetchHtml(source.url);
    const jobs = parseJobs(html, source);

    for (const job of jobs) {
      await supabase.from("vacancies").upsert(job, { onConflict: "source_url" });
      count++;
    }
  }

  return Response.json({ inserted: count });
}
