import type { Metadata } from 'next'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Election Timeline',
  description: "Key dates in Haiti's official 2026-2027 electoral calendar.",
}

const timelineItems = [
  {
    date: 'September-December 2024',
    title: 'Provisional Electoral Council Reconstituted',
    description:
      'Seven members of a new Provisional Electoral Council (CEP) were appointed in September and sworn in in October. The final two members joined in December, completing the nine-member body.',
    category: 'Institution',
  },
  {
    date: 'March 2-12, 2026',
    title: 'Political Parties Registered',
    description:
      'The CEP accepted political-party registrations. On July 9, it published its definitive review: 316 parties were approved and four were not approved.',
    category: 'Completed',
  },
  {
    date: 'June 2, 2026',
    title: 'Revised Electoral Decree Adopted',
    description:
      'A new electoral decree established the legal framework for the process. A decree adopted July 2 later amended some provisions.',
    category: 'Legal Framework',
  },
  {
    date: 'July 3-August 18, 2026',
    title: 'Observers and Journalists Accredited',
    description:
      'The official calendar sets this accreditation window. On August 11, the CEP invited media and election-observation organizations to submit applications.',
    category: 'In Progress',
  },
  {
    date: 'July 13-August 14, 2026',
    title: 'Political Alliances Registered',
    description:
      'The calendar provides for the registration of political groupings and regroupings. The CEP reported 18 groupings registered and approved 15 of them; registration of regroupings runs August 10-14.',
    category: 'In Progress',
  },
  {
    date: 'July 20-October 13, 2026',
    title: 'Voter Registration',
    description:
      "The CEP launched voter registration on July 20 and is progressively opening Centres d'inscription et de vote (CIV) across the country. Registration on the electoral roll is required to vote.",
    category: 'In Progress',
  },
  {
    date: 'July 27, 2026',
    title: 'New 2026-2027 Calendar Published',
    description:
      'The CEP replaced the earlier August and December election dates with a revised schedule extending through March 2027.',
    category: 'Official Update',
  },
  {
    date: 'August 20-October 2, 2026',
    title: 'Candidate Registration',
    description: 'Candidates for the upcoming elections are scheduled to file during this period.',
    category: 'Upcoming',
    pending: true,
  },
  {
    date: 'October 5-December 12, 2026',
    title: 'First-Round Campaign',
    description:
      'The campaign period for the first round of the presidential and legislative elections is scheduled to run for 69 days.',
    category: 'Upcoming',
    pending: true,
  },
  {
    date: 'November 13, 2026',
    title: 'Electoral Lists Published',
    description: 'The CEP is scheduled to publish the electoral lists 30 days before voting.',
    category: 'Upcoming',
    pending: true,
  },
  {
    date: 'December 13, 2026',
    title: 'First-Round Election',
    description:
      'The first round of the presidential and legislative elections is scheduled alongside a popular vote on proposed constitutional changes.',
    category: 'Election',
    pending: true,
  },
  {
    date: 'December 19, 2026-January 9, 2027',
    title: 'First-Round Results and Challenges',
    description:
      'Preliminary presidential and legislative results are scheduled for December 19, followed by a challenge period and final results on January 9.',
    category: 'Results',
    pending: true,
  },
  {
    date: 'January 10-February 20, 2027',
    title: 'Second-Round Campaign',
    description:
      'The campaign for any second-round presidential and legislative contests, as well as territorial elections, is scheduled during this period.',
    category: 'Upcoming',
    pending: true,
  },
  {
    date: 'February 21, 2027',
    title: 'Second Round and Territorial Elections',
    description:
      'The second round of the presidential and legislative elections, if required, and elections for territorial collectivities are scheduled for this date.',
    category: 'Election',
    pending: true,
  },
  {
    date: 'March 7-12, 2027',
    title: 'Final Results',
    description:
      'Final second-round presidential and legislative results are scheduled for March 7, followed by final territorial-election results on March 12.',
    category: 'Results',
    pending: true,
  },
]

const cepCalendarUrl =
  'https://cephaiti.ht/publication-officielle-du-calendrier-electoral-2026-2027/'
const cepUpdatesUrl = 'https://cephaiti.ht/notes-communiques/'

export default function TimelinePage() {
  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <div className="mb-10">
        <div className="mb-4 text-sm font-medium text-muted-foreground">
          Updated August 11, 2026
        </div>
        <h1 className="font-heading text-4xl font-bold">Election Timeline</h1>
        <p className="mt-3 text-muted-foreground">
          Key milestones in Haiti&apos;s official 2026-2027 electoral calendar, including operations
          already underway and dates announced by the Conseil électoral provisoire (CEP).
        </p>
      </div>

      <div className="mb-10 rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
        <h2 className="font-semibold">The schedule has changed</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The previously announced August 30 and December 6, 2026 election dates are no longer
          current. On July 27, the CEP scheduled the first round for December 13, 2026 and the
          second round for February 21, 2027. The CEP says meeting these dates depends on an
          acceptable security environment and sufficient funding.
        </p>
      </div>

      <div className="relative space-y-0 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
        {timelineItems.map((item) => (
          <div key={`${item.date}-${item.title}`} className="relative pb-10 pl-12">
            <div
              className={cn(
                'absolute left-2.5 top-1 size-3 -translate-x-1/2 rounded-full border-2 border-background',
                item.pending ? 'bg-muted-foreground/40' : 'bg-primary'
              )}
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-semibold">{item.title}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  item.pending ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                )}
              >
                {item.category}
              </span>
            </div>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">{item.date}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border p-4 text-sm text-muted-foreground">
        <p>
          This timeline is based primarily on the CEP&apos;s official calendar and public notices.
          Dates may change if the CEP issues a new calendar.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <a
            className="font-medium text-primary underline-offset-4 hover:underline"
            href={cepCalendarUrl}
          >
            Official 2026-2027 calendar
          </a>
          <a
            className="font-medium text-primary underline-offset-4 hover:underline"
            href={cepUpdatesUrl}
          >
            Latest CEP notices
          </a>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/eligibility" className={cn(buttonVariants(), 'w-fit')}>
          Check Eligibility
        </Link>
        <Link href="/resources" className={cn(buttonVariants({ variant: 'outline' }), 'w-fit')}>
          Resources
        </Link>
      </div>
    </div>
  )
}
