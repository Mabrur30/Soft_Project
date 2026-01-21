import Card from "../common/Card.jsx";

const FEATURES = [
  {
    title: "Easy Booking",
    desc: "Request lab equipment in seconds with our intuitive booking system. Track availability in real-time.",
    icon: "📦",
  },
  {
    title: "Real-time Tracking",
    desc: "Monitor bookings, due dates, and returns from a single dashboard.",
    icon: "📊",
  },
  {
    title: "Penalty Management",
    desc: "Keep track of penalties for late returns or damages in one place.",
    icon: "💳",
  },
  {
    title: "Smart Notifications",
    desc: "Get reminders for upcoming returns and booking updates.",
    icon: "🔔",
  },
  {
    title: "Personal Profile",
    desc: "View your booking history and manage account settings.",
    icon: "👤",
  },
  {
    title: "Secure & Reliable",
    desc: "Enterprise-grade security to keep your data safe.",
    icon: "🔒",
  },
];

export default function Features() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Powerful Features
          </h2>
          <p className="text-slate-600">
            Everything you need to manage lab hardware efficiently
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
