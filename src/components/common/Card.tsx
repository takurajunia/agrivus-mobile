import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = true,
  onClick,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-card ${
        hover
          ? "transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2"
          : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
