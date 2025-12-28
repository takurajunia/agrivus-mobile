import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Button, BoostBadge } from "../common";
import type { ListingWithFarmer } from "../../types";
import { safeDisplayText, singularizeUnit } from "../../utils/textUtils";
import chatService from "../../services/chatService";

interface ListingCardProps {
  listing: ListingWithFarmer;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { listing: listingData, farmer } = listing;
  const navigate = useNavigate();
  const [messagingFarmer, setMessagingFarmer] = useState(false);

  const handleQuickMessage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setMessagingFarmer(true);
    try {
      const response = await chatService.getOrCreateConversation(
        listingData.farmerId
      );
      if (response.success) {
        navigate("/chat", { state: { conversationId: response.data.id } });
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    } finally {
      setMessagingFarmer(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-primary-green to-medium-green flex items-center justify-center relative overflow-hidden">
        {listingData.images && listingData.images.length > 0 ? (
          <img
            src={listingData.images[0]}
            alt={listingData.cropType}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="w-20 h-20 text-white opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}

        {/* Platform Score Badge */}
        {farmer.platformScore > 50 && (
          <div className="absolute top-2 right-2 bg-accent-gold text-dark-green px-3 py-1 rounded-full text-xs font-bold">
            ⭐ Top Seller
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-primary-green mb-2 font-serif">
          {listingData.cropType}
          {listingData.cropName && (
            <span className="text-base font-normal text-gray-600 ml-2">
              ({safeDisplayText(listingData.cropName)})
            </span>
          )}
        </h3>

        {/* Farmer Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>{farmer.fullName}</span>
            <span className="text-accent-gold">
              • Score: {farmer.platformScore}
            </span>
          </div>
          {farmer.boostMultiplier &&
            parseFloat(farmer.boostMultiplier) > 1.5 && (
              <BoostBadge
                boostMultiplier={parseFloat(farmer.boostMultiplier)}
                size="sm"
              />
            )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{listingData.location}</span>
        </div>

        {/* Description */}
        {listingData.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {listingData.description}
          </p>
        )}

        {/* Price & Quantity */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-2xl font-bold text-primary-green">
              ${parseFloat(listingData.pricePerUnit).toFixed(2)}
              <span className="text-sm text-gray-600">
                /{singularizeUnit(listingData.unit)}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              {parseFloat(listingData.quantity).toFixed(2)} {listingData.unit}{" "}
              available
            </p>
          </div>
        </div>

        {/* Quality Certifications */}
        {listingData.qualityCertifications &&
          listingData.qualityCertifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {listingData.qualityCertifications.map((cert, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-light-green text-primary-green text-xs rounded-full font-semibold"
                >
                  {cert}
                </span>
              ))}
            </div>
          )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`/listings/${listingData.id}`} className="flex-1">
            <Button variant="primary" className="w-full" size="sm">
              View Details
            </Button>
          </Link>
          <Link
            to={`/orders/create?listingId=${listingData.id}`}
            className="flex-1"
          >
            <Button variant="success" className="w-full" size="sm">
              Order Now
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <span>👁 {listingData.viewCount} views</span>
          <button
            onClick={handleQuickMessage}
            disabled={messagingFarmer}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:text-gray-400"
            title="Message farmer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {messagingFarmer ? "..." : "Message"}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ListingCard;
