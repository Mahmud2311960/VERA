import Link from "next/link";

const features = [
  { title: "Emergency Requests", description: "Medical, rescue, shelter, transport, and missing person reports." },
  { title: "Blood Donor Matching", description: "Urgent blood requests with automated donor notifications." },
  { title: "Volunteer Verification", description: "NID/Passport verification and certificate programs." },
  { title: "NGO Coordination", description: "Organizations request support and deploy volunteer teams." },
  { title: "Resource Tracking", description: "Track food, medicine, clothing, and relief equipment." },
  { title: "Donations & Campaigns", description: "Transparent fundraising and resource donations." },
  { title: "Shelter Management", description: "Manage available emergency shelters and bed capacity." },
  { title: "Disaster Coverage", description: "Monitor underserved areas and relief operations." },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-orange-500 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-100">
              Volunteer Emergency Response Alliance
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Help reaches faster when everyone is connected.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-red-50">
              VERA centralizes emergency assistance and resource coordination across
              Bangladesh — linking citizens, volunteers, hospitals, NGOs, and donors.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold">Built for real emergencies</h2>
            <ul className="mt-4 space-y-3 text-sm text-red-50">
              <li>• Road accidents, floods, fires, and medical crises</li>
              <li>• Blood requests routed to matching donors</li>
              <li>• NGOs and hospitals coordinate on one platform</li>
              <li>• Transparent donation and volunteer programs</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900">Platform capabilities</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
