import Button from "../common/Button.jsx";
import Card from "../common/Card.jsx";

export default function Hero({ onGetStarted }) {
  const items = [
    { name: "Arduino Uno", available: 12 },
    { name: "ESP32 Dev Kit", available: 8 },
    { name: "Raspberry Pi 4", available: 5 },
  ];

  return (
    <section className="bg-gradient-to-b from-primary-50 to-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Manage Hardware{" "}
            <span className="text-primary-500">Efficiently & Easily</span>
          </h1>
          <p className="text-slate-600 text-lg mb-8">
            Streamline your lab equipment booking, tracking, and returns with
            UIU&apos;s comprehensive hardware inventory management system.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" onClick={onGetStarted}>
              Get Started
            </Button>
            <Button size="lg" variant="secondary">
              Learn More
            </Button>
          </div>
        </div>

        <Card className="shadow-lg animate-float">
          <p className="text-sm font-semibold text-slate-700 mb-4">
            Available Components
          </p>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium text-slate-800">
                    {item.name}
                  </span>
                  <span className="text-primary-600 font-semibold">
                    {item.available} available
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.available / 15) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
