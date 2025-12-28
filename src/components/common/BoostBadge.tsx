import React from "react";

interface BoostBadgeProps {
  boostMultiplier: number;
  platformScore?: number;
  recentTransactions7d?: number;
  streakDays?: number;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

const BoostBadge: React.FC<BoostBadgeProps> = ({
  boostMultiplier,
  platformScore = 0,
  recentTransactions7d = 0,
  streakDays = 0,
  size = "md",
  showDetails = false,
}) => {
  // Determine badge color based on boost level
  const getBoostColor = (multiplier: number) => {
    if (multiplier >= 8) return "from-purple-500 to-pink-500"; // Elite
    if (multiplier >= 6) return "from-yellow-400 to-orange-500"; // Gold
    if (multiplier >= 4) return "from-blue-400 to-indigo-500"; // Silver
    if (multiplier >= 2) return "from-green-400 to-teal-500"; // Bronze
    return "from-gray-400 to-gray-500"; // New
  };

  const getBoostTier = (multiplier: number) => {
    if (multiplier >= 8) return { name: "Elite", icon: "👑" };
    if (multiplier >= 6) return { name: "Gold", icon: "🏆" };
    if (multiplier >= 4) return { name: "Silver", icon: "🥈" };
    if (multiplier >= 2) return { name: "Bronze", icon: "🥉" };
    return { name: "New", icon: "⭐" };
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const tier = getBoostTier(boostMultiplier);
  const colorGradient = getBoostColor(boostMultiplier);

  if (!showDetails) {
    // Simple badge
    return (
      <div
        className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${colorGradient} text-white font-bold rounded-full ${sizeClasses[size]} shadow-md`}
        title={`${tier.name} Member - ${boostMultiplier}x visibility boost`}
      >
        <span>{tier.icon}</span>
        <span>{boostMultiplier.toFixed(1)}x</span>
      </div>
    );
  }

  // Detailed card
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${colorGradient} rounded-full flex items-center justify-center text-2xl shadow-lg`}
          >
            {tier.icon}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{tier.name} Member</h4>
            <p className="text-xs text-gray-600">
              Activity Score: {platformScore}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-green">
            {boostMultiplier.toFixed(1)}x
          </div>
          <div className="text-xs text-gray-600">Boost</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-600">
            {recentTransactions7d}
          </div>
          <div className="text-xs text-blue-800">Transactions (7d)</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-bold text-green-600">
            {streakDays} {streakDays === 1 ? "day" : "days"}
          </div>
          <div className="text-xs text-green-800">Active Streak</div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">💡 Visibility Boost:</span> Your
          products appear {boostMultiplier.toFixed(1)}x more prominently in
          search results. Keep transacting to increase your boost!
        </p>
      </div>
    </div>
  );
};

export default BoostBadge;
