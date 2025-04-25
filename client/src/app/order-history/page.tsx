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

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [profilePopup, setProfilePopup] = useState(false);
  const [profileInfo, setProfileInfo] = useState<UserProfile | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const socket = useSocket();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  // Function to fetch order history for the user
  const fetchOrderHistory = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/orders/history/${user?.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Failed to fetch order history");
        return;
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError("Failed to fetch order history");
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

  useEffect(() => {
    if (loading) return;
    if (!token || !user) {
      router.push("/login");
      return;
    }
    fetchOrderHistory();
  }, [token, user, loading]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdated = (updatedOrder: Order) => {
      setOrders((prevOrders) => {
        const exists = prevOrders.find((order) => order._id === updatedOrder._id);
        if (exists) {
          return prevOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          );
        } else {
          return [...prevOrders, updatedOrder];
        }
      });
    };

    socket.on("orderUpdated", handleOrderUpdated);

    return () => {
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, [socket]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <nav className="bg-gray-800 text-white py-2 px-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Quick Commerce</h1>
        <div className="space-x-4 flex items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
          >
            Dashboard
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
                <p className="text-sm capitalize">Role: {profileInfo.role}</p>
              </div>
            )}
          </button>
        </div>
      </nav>

      <div className="px-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Order History</h1>
        {error && (
          <p className="text-red-500 mb-4 text-center bg-red-100 p-2 rounded">
            {error}
          </p>
        )}
        {orders.length === 0 ? (
          <p className="text-gray-600 text-center">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white shadow-md rounded-lg">
              <thead>
                <tr>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">Product</th>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">Quantity</th>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">Location</th>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{order.product}</td>
                    <td className="border px-4 py-2">{order.quantity}</td>
                    <td className="border px-4 py-2">{order.location}</td>
                    <td className="border px-4 py-2">{order.status}</td>
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
