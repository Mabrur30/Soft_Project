// src/pages/BookingPage.jsx
import { useState, useEffect } from "react";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout.jsx";
import Card from "../components/common/Card.jsx";
import Button from "../components/common/Button.jsx";
import { bookingsAPI } from "../api/bookings";

export default function BookingPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [expectedReturn, setExpectedReturn] = useState("");
  const [course, setCourse] = useState("");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");

  // API state
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);

  // Load components via API
  useEffect(() => {
    bookingsAPI
      .getComponents()
      .then((res) => {
        // Map backend fields to frontend expected format
        const mapped = res.data.map((c) => ({
          id: c.components_id,
          name: c.component_name,
          code: c.component_code,
          available: c.available_quantity,
          hasImage: c.images !== null,
          image: c.images
            ? `http://localhost:3000/api/components/${c.components_id}/image`
            : `https://placehold.co/400x300?text=${encodeURIComponent(c.component_name)}`,
        }));
        setComponents(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load components:", err);
        setMessage("Failed to load components. Please try again.");
        setLoading(false);
      });
  }, []);

  const filtered = components.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const submit = (e) => {
    e.preventDefault();

    if (!selected || !expectedReturn || !course) {
      setMessage("Please select a component, return date and course/purpose.");
      return;
    }
    if (qty < 1 || qty > 5 || qty > selected.available) {
      setMessage("Quantity invalid for available stock / max 5 per student.");
      return;
    }

    // Build payload matching backend expected fields
    // user_id is automatically taken from the JWT token in the backend
    const payload = {
      components_id: selected.id,
      quantity: qty,
      expected_return_date: expectedReturn,
      reason: `${course}${details ? " - " + details : ""}`,
    };

    console.log("Booking payload:", payload);

    bookingsAPI
      .createBooking(payload)
      .then((res) => {
        console.log("Booking API success:", res.data);
        setMessage("Booking request submitted successfully!");
        setSelected(null);
        setQty(1);
        setExpectedReturn("");
        setCourse("");
        setDetails("");
        // Refresh components to update available quantity
        bookingsAPI.getComponents().then((res) => {
          const mapped = res.data.map((c) => ({
            id: c.components_id,
            name: c.component_name,
            code: c.component_code,
            available: c.available_quantity,
            category: c.category,
            description: c.description,
            hasImage: c.images !== null,
            image: c.images
              ? `http://localhost:3000/api/components/${c.components_id}/image`
              : `https://placehold.co/400x300?text=${encodeURIComponent(c.component_name)}`,
          }));
          setComponents(mapped);
        });
      })
      .catch((err) => {
        console.error("Booking API error:", err.response || err);
        setMessage(
          "Failed to submit booking. " +
            (err.response?.data?.message || "Please try again."),
        );
      });
  };

  return (
    <AuthenticatedLayout title="New Booking">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: product grid like shop UI */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              New booking
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Browse components and select one to create a booking request.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Search component
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or code (e.g. Arduino, COMP001)"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            {loading ? (
              <p className="text-sm text-slate-600 py-8 text-center">
                Loading components...
              </p>
            ) : components.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">
                No components available.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className={`border rounded-lg overflow-hidden bg-white flex flex-col ${
                      selected?.id === c.id
                        ? "border-primary-500 shadow-md"
                        : "border-slate-200 hover:shadow-sm"
                    }`}
                  >
                    {/* image */}
                    <div className="aspect-[4/3] bg-slate-100">
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* content */}
                    <div className="p-3 flex-1 flex flex-col">
                      <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Code: {c.code}
                      </p>

                      <div className="mt-auto space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">
                            Availability:{" "}
                            <span className="font-semibold text-primary-600">
                              {c.available}
                            </span>
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDetailsItem(c);
                              setDetailsOpen(true);
                            }}
                            className="flex-1 text-xs font-semibold border border-slate-300 text-slate-700 rounded-full py-1.5 hover:bg-slate-50"
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(c);
                              setQty(1);
                              setMessage("");
                            }}
                            className="flex-1 text-xs font-semibold border border-primary-500 text-white bg-primary-500 rounded-full py-1.5 hover:bg-primary-600"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filtered.length === 0 && (
                  <p className="text-sm text-slate-500 col-span-full">
                    No components match your search.
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right: form */}
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Component
              </label>
              <div className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50">
                {selected ? selected.name : "Select a component from the list"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Max 5 items per student
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Expected return
                </label>
                <input
                  type="date"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Course / purpose
              </label>
              <input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. CSE 311 final project"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Details (optional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Short description of your lab or project work"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            {message && (
              <div
                className={`text-xs rounded-md px-3 py-2 ${
                  message.includes("successfully")
                    ? "text-green-600 bg-green-50 border border-green-200"
                    : "text-red-600 bg-red-50 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <div className="bg-blue-50 text-[11px] text-blue-800 border border-blue-200 rounded-md px-3 py-2">
              Requests must be approved by a lab admin before you can pick up
              the components.
            </div>

            <Button type="submit" className="w-full">
              Submit request
            </Button>
          </form>
        </Card>

        {/* Details modal */}
        {detailsOpen && detailsItem && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
              <div className="flex justify-between items-center px-5 py-3 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">
                  {detailsItem.name}
                </h3>
                <button
                  onClick={() => setDetailsOpen(false)}
                  className="text-slate-500 text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 grid md:grid-cols-2 gap-4">
                <div className="bg-slate-100 rounded-md overflow-hidden">
                  <img
                    src={detailsItem.image}
                    alt={detailsItem.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-sm space-y-3">
                  <p className="text-slate-600">
                    Detailed information about this component will be shown here
                    later (datasheet link, specs, lab location, etc.).
                  </p>
                  <div>
                    <div className="text-xs text-slate-500">Code</div>
                    <div className="font-medium text-slate-900">
                      {detailsItem.code}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Availability</div>
                    <div className="font-medium text-slate-900">
                      {detailsItem.available} in stock
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(detailsItem);
                      setQty(1);
                      setDetailsOpen(false);
                    }}
                    className="mt-2 w-full px-4 py-2 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600"
                  >
                    Select for booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
