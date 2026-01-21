import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import Card from "../../components/common/Card.jsx";
import Badge from "../../components/common/Badge.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import { useToast } from "../../hooks/useToast";
import { adminAPI } from "../../api/admin.js";

export default function StockManagement() {
  const toast = useToast();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [stockModal, setStockModal] = useState({
    open: false,
    componentId: null,
    componentName: "",
  });
  const [stockQty, setStockQty] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadStock = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getComponents();
      const components = res.data || [];

      const mapped = components.map((c) => {
        const inUse = c.total_quantity - c.available_quantity;
        const minimum = 5; // Default minimum stock level
        let status = "In Stock";
        if (c.available_quantity === 0) status = "Critical";
        else if (c.available_quantity < minimum) status = "Low";

        return {
          id: c.components_id,
          component: c.name,
          current: c.total_quantity,
          available: c.available_quantity,
          inUse: inUse,
          minimum: minimum,
          status: status,
        };
      });

      setStock(mapped);
      setLowStockItems(
        mapped.filter((i) => i.status === "Critical" || i.status === "Low"),
      );
      setLoading(false);
    } catch (err) {
      console.error("Failed to load stock:", err);
      setStock([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const openStockModal = (componentId, componentName) => {
    setStockModal({ open: true, componentId, componentName });
    setStockQty("");
  };

  const closeStockModal = () => {
    setStockModal({ open: false, componentId: null, componentName: "" });
    setStockQty("");
  };

  const handleAddStock = async () => {
    if (
      !stockQty ||
      isNaN(parseInt(stockQty, 10)) ||
      parseInt(stockQty, 10) <= 0
    ) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const component = stock.find((s) => s.id === stockModal.componentId);
    if (!component) return;

    try {
      setActionLoading(true);
      const newTotal = component.current + parseInt(stockQty, 10);
      const newAvailable = component.available + parseInt(stockQty, 10);

      await adminAPI.updateComponent(stockModal.componentId, {
        total_quantity: newTotal,
        available_quantity: newAvailable,
      });
      toast.success("Stock added successfully!");
      closeStockModal();
      loadStock();
    } catch (err) {
      console.error("Failed to add stock:", err);
      toast.error("Failed to add stock");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Stock Management">
      {/* Alert */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-900">
              {lowStockItems.length} component(s) are running low on stock and
              need reordering!
            </p>
            <p className="text-sm text-yellow-700">
              {lowStockItems.map((i) => i.component).join(", ")} below minimum
              stock levels.
            </p>
          </div>
        </div>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Component Stock Status
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-3 px-3 font-semibold">Component</th>
                <th className="py-3 px-3 font-semibold">Current Stock</th>
                <th className="py-3 px-3 font-semibold">Available</th>
                <th className="py-3 px-3 font-semibold">In Use</th>
                <th className="py-3 px-3 font-semibold">Minimum Stock</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-3 px-3 font-semibold">{item.component}</td>
                  <td className="py-3 px-3">{item.current}</td>
                  <td className="py-3 px-3">{item.available}</td>
                  <td className="py-3 px-3">{item.inUse}</td>
                  <td className="py-3 px-3">{item.minimum}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        item.status === "Critical"
                          ? "error"
                          : item.status === "Low"
                            ? "warning"
                            : "success"
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => openStockModal(item.id, item.component)}
                      className="px-3 py-1 bg-emerald-500 text-white text-xs rounded font-semibold hover:bg-emerald-600"
                    >
                      Add Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Stock Modal */}
      <Modal
        open={stockModal.open}
        onClose={closeStockModal}
        title="Add Stock"
        footer={
          <>
            <button
              onClick={closeStockModal}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddStock}
              disabled={
                actionLoading || !stockQty || parseInt(stockQty, 10) <= 0
              }
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? "Adding..." : "Add Stock"}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">
          Add stock to <strong>{stockModal.componentName}</strong>
        </p>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Quantity to Add
        </label>
        <input
          type="number"
          min="1"
          value={stockQty}
          onChange={(e) => setStockQty(e.target.value)}
          placeholder="Enter quantity"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddStock();
          }}
        />
      </Modal>
    </AdminLayout>
  );
}
