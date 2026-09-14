// Exact publisher hosts only. Adding a host requires an ownership/security review.
export const IMPORT_HOSTS = [
  "iebc.or.ke",
  "www.iebc.or.ke",
  "kenyalaw.org",
  "www.kenyalaw.org",
  "new.kenyalaw.org",
  "africacheck.org",
  "www.africacheck.org",
  "pesacheck.org",
  "www.pesacheck.org",
  "anthropic.com",
  "www.anthropic.com",
  "about.fb.com",
  "pbs.twimg.com",
  "upload.wikimedia.org",
] as const;

export function publicImportURL(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a complete public HTTPS link.");
  }
  if (
    value.length > 2048 ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !IMPORT_HOSTS.some((host) => host === url.hostname)
  ) {
    throw new Error(
      "This link is not supported. Use a listed public source, or paste the claim/upload the image yourself.",
    );
  }
  url.hash = "";
  return url;
}

export type ImportedSource = {
  requested_url: string;
  final_url: string;
  retrieved_at: string;
} & (
  | { kind: "text"; title: string; text: string; truncated: boolean }
  | { kind: "image"; data_url: string }
);
