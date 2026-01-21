import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import { useToast } from "../../hooks/useToast";
import { adminAPI } from "../../api/admin";

const CATEGORIES = [
  "Microcontroller",
  "Sensor",
  "SBC",
  "Communication Module",
  "Passive Component",
  "Other",
];

export default function EditComponent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    componentName: "",
    componentId: "",
    category: "",
    totalQuantity: "",
    availableQuantity: "",
    location: "",
    unitPrice: "",
    description: "",
    image: null,
    status: "active",
  });

  // Fetch component data on mount
  useEffect(() => {
    adminAPI
      .getComponentById(id)
      .then((res) => {
        const c = res.data;
        setFormData({
          componentName: c.component_name || "",
          componentId: c.component_code || "",
          category: c.category || "",
          totalQuantity: c.total_quantity?.toString() || "",
          availableQuantity: c.available_quantity?.toString() || "",
          location: c.location || "",
          unitPrice: c.unit_price?.toString() || "",
          description: c.description || "",
          image: null,
          status: c.status || "active",
        });
        setFetching(false);
      })
      .catch((err) => {
        console.error("Failed to fetch component:", err);
        toast.error("Failed to load component data");
        setFetching(false);
      });
  }, [id, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate
    if (
      !formData.componentName ||
      !formData.componentId ||
      !formData.category ||
      !formData.totalQuantity
    ) {
      toast.error("Please fill in all required fields!");
      setLoading(false);
      return;
    }

    // Create FormData to support file upload
    const data = new FormData();
    data.append("component_name", formData.componentName);
    data.append("component_code", formData.componentId);
    data.append("category", formData.category);
    data.append("total_quantity", parseInt(formData.totalQuantity, 10));
    data.append(
      "available_quantity",
      parseInt(formData.availableQuantity, 10) ||
        parseInt(formData.totalQuantity, 10),
    );
    data.append("status", formData.status);
    if (formData.description) {
      data.append("description", formData.description);
    }
    if (formData.image) {
      data.append("image", formData.image);
    }

    // Call API with FormData
    adminAPI
      .updateComponent(id, data)
      .then(() => {
        toast.success("Component updated successfully!");
        navigate("/admin/components");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Error updating component!");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCancel = () => {
    navigate("/admin/components");
  };

  if (fetching) {
    return (
      <AdminLayout title="Edit Component">
        <Card>
          <p className="text-sm text-slate-600">Loading component data...</p>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Component">
      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Edit Component
          </h2>
          <p className="text-sm text-slate-600">
            Update the details of this hardware component
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two column layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Component Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Component Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="componentName"
                placeholder="e.g., Arduino Mega 2560"
                value={formData.componentName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                required
              />
            </div>

            {/* Component ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Component Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="componentId"
                placeholder="e.g., COMP005"
                value={formData.componentId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            {/* Total Quantity */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Total Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalQuantity"
                placeholder="0"
                value={formData.totalQuantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                required
              />
            </div>

            {/* Available Quantity */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Available Quantity
              </label>
              <input
                type="number"
                name="availableQuantity"
                placeholder="0"
                value={formData.availableQuantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g., Lab A · Shelf 1"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Unit Price (৳)
              </label>
              <input
                type="number"
                name="unitPrice"
                placeholder="0"
                value={formData.unitPrice}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              placeholder="Brief description of the component"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
            />
          </div>

          {/* Component Image */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Component Image (Optional - upload to replace current)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="imageInput"
              />
              <label htmlFor="imageInput" className="cursor-pointer">
                <div className="text-2xl mb-2">📁</div>
                <p className="text-sm text-slate-600">
                  {formData.image
                    ? formData.image.name
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-slate-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Component"}
            </Button>
          </div>
        </form>
      </Card>
    </AdminLayout>
  );
}
