import React from "react";
import { Card } from "./index";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "green" | "blue" | "gold" | "red";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = "green",
}) => {
  const colorClasses = {
    green: "bg-light-green text-primary-green",
    blue: "bg-blue-50 text-blue-600",
    gold: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend.isPositive ? "text-success" : "text-warning"
              }`}
            >
              <span className="font-semibold">
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>{" "}
              vs last month
            </p>
          )}
        </div>
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
