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

export default function OrdersPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [location, setLocation] = useState("");
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

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `${backendUrl}/api/orders/customer/${user?.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product, quantity, location }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Failed to place order");
        return;
      }
      const newOrder = await res.json();
      setOrders([...orders, newOrder]);
      setProduct("");
      setQuantity(1);
      setLocation("");
    } catch (err) {
      setError("Failed to place order");
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!token || !user) {
      router.push("/login");
      return;
    }
    if (user.role !== "customer") {
      router.push("/dashboard");
      return;
    }
    fetchOrders();
  }, [token, user, loading]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdated = (updatedOrder: Order) => {
      setOrders((prevOrders) => {
        const exists = prevOrders.find(
          (order) => order._id === updatedOrder._id
        );
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
      <nav className="bg-gray-800 text-white py-2 px-4 flex justify-between items-center shadow-lg mb-6">
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

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Customer Dashboard - Orders
        </h1>
        {error && (
          <p className="text-red-500 mb-4 text-center bg-red-100 p-2 rounded">
            {error}
          </p>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Place a New Order
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold">
                Product
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
            >
              Submit Order
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            My Orders
          </h2>
          {orders.length === 0 ? (
            <p className="text-gray-600 text-center">No orders yet.</p>
          ) : (
            <table className="min-w-full border-collapse bg-white rounded-lg">
              <thead>
                <tr>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">
                    Product
                  </th>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">
                    Quantity
                  </th>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">
                    Location
                  </th>
                  <th className="border px-4 py-2 bg-gray-100 text-gray-700">
                    Status
                  </th>
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
          )}
        </div>
      </div>
    </div>
  );
}
