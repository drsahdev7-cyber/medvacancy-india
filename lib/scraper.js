import * as cheerio from "cheerio";

export const SOURCES = [
  { name: "AIIMS Exams", url: "https://aiimsexams.ac.in/landingpage/courses/68dbbb27b7b096817673976e" },
  { name: "NHM Rajasthan", url: "https://nhm.rajasthan.gov.in/" },
  { name: "ESIC Recruitment", url: "https://esic.gov.in/recruitments" }
];

export async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/html"
    }
  });
  return await res.text();
}

export function parseJobs(html, source) {
  const $ = cheerio.load(html);
  const jobs = [];

  $("a").each((_, el) => {
    const title = $(el).text().trim();
    const href = $(el).attr("href");

    if (/job|recruit|vacancy|apply|notice|भर्ती/i.test(title) && href) {
      jobs.push({
        title,
        source_url: href.startsWith("http") ? href : source.url,
        institute: source.name,
        state: "India",
        category: "Medical",
        summary: title,
        status: "approved",
        collected_by: "auto_scraper"
      });
    }
  });

  return jobs;
}
