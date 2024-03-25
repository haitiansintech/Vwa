import Link from "next/link"
import { faker } from "@faker-js/faker"

export const metadata = { title: "About" }

export default function AboutPage() {
  return (
    <section className="container flex flex-col  gap-6 py-8 md:max-w-5xl md:py-12 lg:py-24">
      <div className="mx-auto flex w-full flex-col gap-4 md:max-w-[58rem]">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Stonger together
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          We&apos; re a passionate group of Haitian technologosits and professionals
          that love Haiti and are dedicated to helping bring about change in the
          Motherland 🇭🇹.
          {/* TODO: get input from marketing */}
        </p>
      </div>
      {/* <div className="grid w-full items-start gap-10 rounded-lg border p-10 md:grid-cols-[1fr_200px]">
        <div className="grid gap-6">
          <h3 className="text-xl font-bold sm:text-2xl">
            What&apos;s included in the PRO plan
          </h3>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Unlimited Posts
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Unlimited Users
            </li>

            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Custom domain
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Dashboard Analytics
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Access to Discord
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Premium Support
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-center">
          <div>
            <h4 className="text-7xl font-bold">$19</h4>
            <p className="text-sm font-medium text-muted-foreground">
              Billed Monthly
            </p>
          </div>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            Get Started
          </Link>
        </div>
      </div> */}

      {/* <div className="mx-auto flex w-full max-w-[58rem] flex-col gap-4">
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:leading-7">
          Taxonomy is a demo app.{" "}
          <strong>You can test the upgrade and won&apos;t be charged.</strong>
        </p>
      </div> */}
      <TeamSection />
    </section>
  )
}

const people = [
  {
    name: "Ashley Narcisse",
    role: "Engineering",
    imageUrl: faker.image.urlPicsumPhotos(),
  },
  {
    name: "JGB",
    role: "Engineering",
    imageUrl: faker.image.urlPicsumPhotos(),
  },
  {
    name: "Arielle Duperval",
    role: "UI/UX",
    imageUrl: faker.image.urlPicsumPhotos(),
  },
  {
    name: "Chelsea Isaac",
    role: "UI/UX",
    imageUrl: faker.image.urlPicsumPhotos(),
  },
  {
    name: "Nita Saint-Hilaire",
    role: "PM",
    imageUrl: faker.image.urlPicsumPhotos(),
  },
  {
    name: "Whitney Lubin",
    role: "PM",
    imageUrl: faker.image.urlPicsumPhotos(),
  },
  {
    name: "Shirley Dor",
    role: "Marketing",
    imageUrl: faker.image.urlPicsumPhotos(),
  },
]

function TeamSection() {
  return (
    <ul
      role="list"
      className="mx-auto mt-20 grid max-w-2xl grid-cols-2 justify-around gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
    >
      {people.map((person) => (
        <li key={person.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="mx-auto size-24 rounded-full"
            src={person.imageUrl}
            alt=""
          />
          <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight">
            {person.name}
          </h3>
          <p className="text-sm leading-6 text-gray-600">{person.role}</p>
        </li>
      ))}
    </ul>
  )
}
