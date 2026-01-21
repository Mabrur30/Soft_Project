export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-4 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                UL
              </div>
              <span className="font-semibold text-white">
                UIU Lab Inventory
              </span>
            </div>
            <p className="text-xs">
              Efficient hardware inventory management system for United
              International University.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Dashboard</li>
              <li>New Booking</li>
              <li>My Bookings</li>
              <li>Profile</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>Help Center</li>
              <li>Guidelines</li>
              <li>FAQs</li>
              <li>Contact Us</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
            <p className="text-xs">
              United International University
              <br />
              Dhaka, Bangladesh
            </p>
            <p className="text-xs mt-2">lab@uiu.ac.bd</p>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-[11px] text-center text-slate-500">
            © 2025 UIU Lab Inventory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
