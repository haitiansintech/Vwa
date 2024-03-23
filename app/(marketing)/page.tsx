import Link from 'next/link'
import { Feather } from 'lucide-react'

import { env } from '@/env.mjs'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { FAQ } from '@/components/faq'
import { Icons } from '@/components/icons'

async function getGitHubStars(): Promise<string | null> {
  try {
    const response = await fetch('https://api.github.com/repos/shadcn/taxonomy', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${env.GITHUB_ACCESS_TOKEN}`,
      },
      next: { revalidate: 60 },
    })

    if (!response?.ok) {
      return null
    }

    const json = await response.json()

    return parseInt(json['stargazers_count']).toLocaleString()
  } catch (error) {
    return null
  }
}

export default async function IndexPage() {
  const stars = await getGitHubStars()

  return (
    <>
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <Link
            href={siteConfig.links.twitter}
            className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
            target="_blank"
          >
            Follow along on Twitter
          </Link>
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Tired of feeling fustrated and helpless about Haiti. Now... there's something you can do
            about it.
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            We're building tool's that empowers us all to have our voices heard on the decision
            impacting Haiti.
          </p>
          <div className="space-x-4">
            <Link href="/login" className={cn(buttonVariants({ size: 'lg' }))}>
              Call your local representative
              <Icons.call className="ml-2" />
            </Link>
            <Link
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              Learn more...
            </Link>
          </div>
        </div>
      </section>
      <section
        id="features"
        className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Take action and have your voice be <i className="text-red-400">actually&nbsp; </i>{' '}
            heard.
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Here we can add some more marketing copy that drives user further into guided paths,
            that will lead them to either take more action or be informed on things happening.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.laptop size={32} />
              <div className="space-y-2">
                <h3 className="font-bold">Civic Engagement</h3>
                <p className="text-sm text-muted-foreground">
                  There's alot about the civic process that isn't clear, we're making this more
                  accessible.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.page size={32} />
              <div className="space-y-2">
                <h3 className="font-bold">Information</h3>
                <p className="text-sm text-muted-foreground">
                  Get up to speed on the situation back home, changes happening, and how it affect
                  you.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.call size="32" />
              <div className="space-y-2">
                <h3 className="font-bold">Agency</h3>
                <p className="text-sm text-muted-foreground">
                  Become empowered to gring about change in Haiti. We have clear steps you can act
                  on.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto text-center md:max-w-[58rem]">
          <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            The above capabilities should be considered as the tip of the iceberg, when it comes to
            way Haitians can engage in civics. This project can always be expanded and we encourage
            you to submit your feedback and ideas on how we can expand.
          </p>
        </div>
      </section>
      <LearningCTA />
      <section id="open-source" className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Proudly Haitian 🇭🇹
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            This project came together thanks to a group of Haitians combining theri skillsets and
            their love for Haiti, to bring about actualy change to the situation at hand .{' '}
          </p>
          {stars && (
            <Link href={siteConfig.links.github} target="_blank" rel="noreferrer" className="flex">
              <div className="flex h-10 w-10 items-center justify-center space-x-2 rounded-md border border-muted bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-foreground"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 border-y-8 border-l-0 border-r-8 border-solid border-muted border-y-transparent"></div>
                <div className="flex h-10 items-center rounded-md border border-muted bg-muted px-4 font-medium">
                  {stars} stars on GitHub
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      <FAQ data={faqs} />
    </>
  )
}

function LearningCTA() {
  return (
    <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Understand what happening in Haiti and how you can take part.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
          Civic participation is the core duty of <i>all</i> Haitians. Incididunt sint fugiat
          pariatur cupidatat consectetur sit cillum anim id veniam aliqua proident excepteur commodo
          do ea.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="#"
            className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Learn more on how to do your part <span aria-hidden="true">→</span>
          </a>
        </div>
        <svg
          viewBox="0 0 1024 1024"
          className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          aria-hidden="true"
        >
          <circle
            cx={512}
            cy={512}
            r={512}
            fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
            fillOpacity="0.7"
          />
          <defs>
            <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

const faqs = [
  {
    question: "What's the best thing about Haiti?",
    answer: "Everything. If you didn't know....now you know.",
  },
]
