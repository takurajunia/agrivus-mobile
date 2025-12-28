import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button, Card, LoadingSpinner, BoostBadge } from "../components/common";
import StatCard from "../components/common/StatCard";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalTransactions: user?.totalTransactions || 0,
        platformScore: user?.platformScore || 0,
        totalVolume: user?.totalVolume || "0.00",
      });
      setLoading(false);
    }, 500);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Role-based dashboard content
  const renderDashboardContent = () => {
    switch (user?.role) {
      case "farmer":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Platform Score"
                value={stats.platformScore}
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                }
                trend={{ value: "+15%", isPositive: true }}
              />
              <StatCard
                title="Total Transactions"
                value={stats.totalTransactions}
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                }
                color="blue"
              />
              <StatCard
                title="Total Volume"
                value={`$${parseFloat(stats.totalVolume).toLocaleString()}`}
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                color="gold"
              />
            </div>

            {/* Boost Section */}
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold text-primary-green mb-4">
                🚀 Your Activity Boost
              </h2>
              <BoostBadge
                boostMultiplier={parseFloat(user.boostMultiplier || "1.0")}
                platformScore={user.platformScore || 0}
                recentTransactions7d={user.recentTransactions7d || 0}
                streakDays={user.streakDays || 0}
                showDetails={true}
              />

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">📈</div>
                    <div>
                      <div className="text-sm text-blue-700 font-semibold">
                        Total Transactions
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {user.totalTransactions || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">💰</div>
                    <div>
                      <div className="text-sm text-green-700 font-semibold">
                        Total Volume
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        ${parseFloat(user.totalVolume || "0").toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🔥</div>
                    <div>
                      <div className="text-sm text-purple-700 font-semibold">
                        Current Streak
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        {user.streakDays || 0} days
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-bold text-yellow-900 mb-2">
                  💡 How to Increase Your Boost
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>✅ Complete more transactions (biggest impact)</li>
                  <li>✅ Stay active daily to build your streak</li>
                  <li>✅ Maintain high quality ratings</li>
                  <li>✅ Be active in the last 7-30 days</li>
                </ul>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link to="/my-listings">
                    <Button variant="primary" className="w-full">
                      📋 View My Listings
                    </Button>
                  </Link>
                  <Link to="/listings/create">
                    <Button variant="success" className="w-full">
                      ➕ Create New Listing
                    </Button>
                  </Link>
                  <Link to="/marketplace">
                    <Button variant="outline" className="w-full">
                      Browse Marketplace
                    </Button>
                  </Link>
                  <Link to="/orders">
                    <Button variant="outline" className="w-full">
                      View Orders
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Account created
                      </p>
                      <p className="text-xs text-gray-600">
                        Welcome to Agrivus!
                      </p>
                    </div>
                  </div>
                  <div className="text-center text-gray-500 text-sm py-8">
                    No recent activity yet
                  </div>
                </div>
              </Card>
            </div>
          </>
        );

      case "buyer":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Platform Score"
                value={stats.platformScore}
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                }
              />
              <StatCard
                title="Total Orders"
                value={stats.totalTransactions}
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                }
                color="blue"
              />
              <StatCard
                title="Total Spent"
                value={`$${parseFloat(stats.totalVolume).toLocaleString()}`}
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                color="gold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link to="/marketplace">
                    <Button variant="primary" className="w-full">
                      Browse Products
                    </Button>
                  </Link>
                  <Link to="/orders">
                    <Button variant="outline" className="w-full">
                      My Orders
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4">
                  Recent Orders
                </h3>
                <div className="text-center text-gray-500 text-sm py-8">
                  No orders yet. Start shopping!
                </div>
              </Card>
            </div>
          </>
        );

      case "transporter":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Platform Score"
                value={stats.platformScore}
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                }
              />
              <StatCard
                title="Completed Deliveries"
                value={stats.totalTransactions}
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                }
                color="blue"
              />
              <StatCard
                title="Total Earnings"
                value={`$${parseFloat(stats.totalVolume).toLocaleString()}`}
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                color="gold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link to="/orders">
                    <Button variant="primary" className="w-full">
                      View Assigned Orders
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    Update Availability
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4">
                  Active Deliveries
                </h3>
                <div className="text-center text-gray-500 text-sm py-8">
                  No active deliveries
                </div>
              </Card>
            </div>
          </>
        );

      default:
        return (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Welcome to your dashboard!</p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-green font-serif mb-2">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-gray-600">
            Role: <span className="font-semibold capitalize">{user?.role}</span>
          </p>
        </div>

        {/* Dashboard Content */}
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default Dashboard;
