# Political-party digital-presence monitor

## Architecture decision

Vwa uses a fully static, repository-backed publication workflow. No production
database, admin server, queue service, AI dependency, search API, or paid crawler is
required.

GitHub Actions performs bounded discovery and monitoring. Findings are written only to
a review branch and pull request. Public pages import only
`data/political-party-presence.json`, so crawling never occurs during builds or visitor
requests and pending findings cannot leak into the site.

## Data flow

- `data/political-party-presence.json` is the human-approved public dataset.
- `data/party-monitor/pending-updates.json` is the private review queue in the automation
  branch. It is never imported by public code.
- `data/party-monitor/source-state.json` stores CEP content hashes and HTTP metadata.
- `data/party-monitor/audit-log.json` records discovery, monitoring, and review actions.
- `.party-monitor-staging/` stores changed CEP PDFs temporarily for workflow artifacts.
- `.github/workflows/party-presence-monitor.yml` runs monitoring or reviewer-seeded
  discovery and opens or updates the review PR.

The public site remains functional if GitHub Actions, a party website, or every social
platform is unavailable.

## URL-seed discovery

No web-search provider is configured. A reviewer can seed a known or suspected URL
without editing JSON manually:

```sh
pnpm monitor:discover -- --party cep-248 --url https://ede.ht/ --dry-run
pnpm monitor:discover -- --party cep-248 --url https://ede.ht/
```

The command validates the CEP party, normalizes the URL, follows safe redirects,
checks `robots.txt`, visits at most ten relevant same-origin pages, and queues candidate
websites, social accounts, and platform pages/documents with evidence and explainable
confidence reasons. A platform lead is proposed with classification `unknown`; only a
reviewer may classify and publish it.

The GitHub Actions `workflow_dispatch` form exposes the same operation:

1. Select `discover_seed`.
2. Enter a stable party ID such as `cep-248`.
3. Enter the reviewer-provided seed URL.
4. Leave `dry_run` enabled to inspect logs only, or disable it to open/update the review
   PR.

Search results are never scraped. Unseeded broad discovery remains disabled until a
provider is explicitly approved.

## Monitoring and resumability

The scheduled workflow runs weekly and uses a concurrency group to prevent overlapping
runs. Monitoring checks allowlisted CEP sources and already published official URLs.
Manual inputs support one party and `resume_after` recovery, so hundreds of records do
not need to run as one unbounded request.

HTTP failures create review proposals; they never remove a published channel or change
official ownership automatically. Reruns are idempotent because pending proposals use
stable fingerprints.

## Human review and publication

Inspect the review PR and record each decision:

```sh
pnpm monitor:review -- --id proposal-0123456789abcdef --decision approved --reviewer "Name"
pnpm monitor:review -- --id proposal-0123456789abcdef --decision rejected --reviewer "Name"
pnpm monitor:review -- --id proposal-0123456789abcdef --decision needs_research --reviewer "Name"
```

Only `approved` can update `data/political-party-presence.json`. Rejected and
needs-research items remain private review history. Finish a reviewed audit with:

```sh
pnpm monitor:complete -- --reviewer "Name"
```

The production site changes only after the protected review PR is merged and the normal
static deployment runs.

## Deterministic crawler controls

- HTTP(S) only; credentials in URLs are rejected.
- Localhost, private/reserved ranges, link-local addresses, and cloud metadata targets
  are blocked.
- DNS and every redirect are revalidated.
- Redirects, timeouts, response bytes, pages, depth, and concurrency are bounded.
- Tracking parameters and fragments are removed.
- Only relevant same-origin pages are crawled.
- `robots.txt` rules are respected when available.
- HTML is treated as text; scripts are never executed.
- Evidence excerpts are sanitized and length-limited.
- Social feeds are not scraped, and a blocked social request is not treated as proof of
  inactivity.

`tests/fixtures/ede-home.html` provides the offline EDE acceptance case. Automated tests
never depend on the live EDE website.

## GitHub setup

No database or Vercel environment changes are required. In GitHub:

1. Allow Actions to create pull requests with `GITHUB_TOKEN`.
2. Optionally set `PARTY_MONITOR_ENABLED=false` as a kill switch.
3. Ensure the `data-review` and `automated-audit` labels exist, or remove the workflow
   label configuration.
4. Protect the production branch and require human review for automation PRs.

## Limitations

- Discovery requires a reviewer-provided seed until a search provider is approved.
- The static site cannot offer a private in-app review queue or persist public correction
  submissions without an external service.
- Reviewers must evaluate official ownership, reciprocal evidence, and platform
  classification themselves.
- DNS is validated before each request, but the built-in fetch implementation does not
  pin the resolved address to the outgoing socket.
