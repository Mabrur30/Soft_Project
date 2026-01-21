const STATS = [
  { label: "Components", value: "150+" },
  { label: "Active Users", value: "500+" },
  { label: "Bookings", value: "1000+" },
  { label: "Uptime", value: "99%" },
];

export default function Stats() {
  return (
    <section className="bg-slate-900 text-white py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-1">
              {s.value}
            </div>
            <div className="text-xs md:text-sm tracking-wide uppercase text-slate-300">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
