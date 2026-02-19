import Link from "next/link";

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    href: "/register",
    priceMonthly: "$0",
    description: "Perfect for exploring the power of AI scheduling.",
    features: ["Up to 10 Teachers", "Up to 5 Classes", "Basic AI Generation", "PDF Export"],
    mostPopular: false,
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: "/register",
    priceMonthly: "$49",
    description: "Ideal for schools with up to 50 classes.",
    features: [
      "Unlimited Teachers",
      "Up to 50 Classes",
      "Advanced Constraints",
      "Priority AI Generation",
      "Excel & PDF Export",
      "Priority Support",
    ],
    mostPopular: true,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "/register",
    priceMonthly: "Custom",
    description: "For large universities and education chains.",
    features: [
      "Multiple Organizations",
      "Unlimited Everything",
      "Custom API Access",
      "SSO Integration",
      "Dedicated Account Manager",
    ],
    mostPopular: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function PricingPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-base font-semibold leading-7 text-blue-600">Pricing</h1>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for your institution
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Start for free and upgrade as you grow. All plans include our core conflict-resolution engine.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular ? "ring-2 ring-blue-600" : "ring-1 ring-gray-200",
                "rounded-3xl p-8 xl:p-10"
              )}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className={classNames(
                    tier.mostPopular ? "text-blue-600" : "text-gray-900",
                    "text-lg font-semibold leading-8"
                  )}
                >
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-600">
                    Most popular
                  </p>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.priceMonthly}</span>
                {tier.priceMonthly !== "Custom" && <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>}
              </p>
              <Link
                href={tier.href}
                aria-describedby={tier.id}
                className={classNames(
                  tier.mostPopular
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500"
                    : "text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300",
                  "mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                )}
              >
                Buy plan
              </Link>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <svg
                      className="h-6 w-5 flex-none text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.176a.75.75 0 01.143 1.06l-7.25 9.625a.75.75 0 01-1.121 0L4.223 9.077a.75.75 0 011.12-1.002l2.625 3.5 6.676-8.86a.75.75 0 011.06-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
