import Button from "../common/Button.jsx";

export default function CTA({ onClick }) {
  return (
    <section className="bg-primary-50 py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-slate-600 mb-8">
          Join hundreds of students already using UIU Lab Inventory to manage
          their hardware needs efficiently.
        </p>
        <Button size="lg" onClick={onClick}>
          Access Student Portal
        </Button>
      </div>
    </section>
  );
}
