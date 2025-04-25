"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";

interface Order {
  _id: string;
  product: string;
  quantity: number;
  location: string;
  status: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const socket = useSocket();

  const [profilePopup, setProfilePopup] = useState(false);
  const [profileInfo, setProfileInfo] = useState<UserProfile | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/orders/pending`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Failed to fetch orders");
        return;
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError("Failed to fetch orders");
    }
  };

  const fetchProfileInfo = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Failed to fetch profile info");
        return;
      }
      const data = await res.json();
      setProfileInfo(data);
    } catch (err) {
      setError("Failed to fetch profile info");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  useEffect(() => {
    if (loading) return;
    if (!token || !user) {
      router.push("/login");
      return;
    }
    if (user.role !== "delivery") {
      router.push("/orders");
      return;
    }
    fetchOrders();
  }, [token, user, loading, router]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdated = (updatedOrder: Order) => {
      setOrders((prevOrders) => {
        const exists = prevOrders.find((o) => o._id === updatedOrder._id);
        if (exists) {
          if (updatedOrder.status !== "Pending") {
            return prevOrders.filter((o) => o._id !== updatedOrder._id);
          }
          return prevOrders.map((o) =>
            o._id === updatedOrder._id ? updatedOrder : o
          );
        } else {
          return updatedOrder.status === "Pending" ? [...prevOrders, updatedOrder] : prevOrders;
        }
      });
    };

    socket.on("orderUpdated", handleOrderUpdated);
    return () => {
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, [socket]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, deliveryPartnerId: user?.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Failed to update order status");
        return;
      }
      const updatedOrder = await res.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    } catch (err) {
      setError("Failed to update order status");
    }
  };

  const renderActionButton = (order: Order) => {
    switch (order.status) {
      case "Pending":
        return (
          <button
            onClick={() => updateStatus(order._id, "Accepted")}
            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          >
            Accept
          </button>
        );
      case "Accepted":
        return (
          <button
            onClick={() => updateStatus(order._id, "Out for Delivery")}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Out for Delivery
          </button>
        );
      case "Out for Delivery":
        return (
          <button
            onClick={() => updateStatus(order._id, "Delivered")}
            className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
          >
            Delivered
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white py-2 px-4 flex justify-between items-center shadow-md mb-4">
        <h1 className="text-2xl font-bold">Quick Commerce</h1>
        <div className="space-x-4 flex items-center">
          <button
            onClick={() => router.push("/order-history")}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
          >
            Order History
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
          <button
            onClick={() => {
              setProfilePopup((prev) => !prev);
              if (!profileInfo) {
                fetchProfileInfo();
              }
            }}
            className="relative text-white px-3 py-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
          >
            Profile
            {profilePopup && profileInfo && (
              <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg p-4 w-64 text-gray-800 z-50">
                <p className="font-bold mb-1">{profileInfo.name}</p>
                <p className="text-sm mb-1">{profileInfo.email}</p>
                <p className="text-sm capitalize">
                  Role: {profileInfo.role}
                </p>
              </div>
            )}
          </button>
        </div>
      </nav>

      <div className="px-4">
        <h1 className="text-3xl font-bold my-4 text-center">
          Delivery Partner Dashboard
        </h1>
        {error && (
          <p className="text-red-500 mb-4 text-center">{error}</p>
        )}
        {orders.length === 0 ? (
          <p className="text-center">No pending orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white shadow-md rounded-lg">
              <thead>
                <tr>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">Product</th>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">Quantity</th>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">Location</th>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">Status</th>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{order.product}</td>
                    <td className="border px-4 py-2">{order.quantity}</td>
                    <td className="border px-4 py-2">{order.location}</td>
                    <td className="border px-4 py-2">{order.status}</td>
                    <td className="border px-4 py-2">
                      {renderActionButton(order)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
