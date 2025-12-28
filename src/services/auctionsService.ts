import api from "./api";

export interface Auction {
  id: string;
  listingId: string;
  farmerId: string;
  startingPrice: string;
  currentPrice: string;
  reservePrice: string | null;
  bidIncrement: string;
  startTime: string;
  endTime: string;
  status: string;
  totalBids: number;
  winnerId: string | null;
  finalPrice: string | null;
  escrowHeldAt: string | null;
  transportChoiceDeadline: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidAmount: string;
  status: string;
  createdAt: string;
}

export interface CreateAuctionData {
  listingId: string;
  startingPrice: number;
  reservePrice?: number;
  bidIncrement?: number;
  durationHours?: number;
  autoExtend?: boolean;
}

export interface PlaceBidData {
  bidAmount: number;
}

export interface ChooseTransportData {
  deliveryLocation: string;
  notes?: string;
  usesTransport: boolean;
  transporterId?: string;
  transportCost?: number;
}

// Get all live auctions
export const getLiveAuctions = async (page = 1, limit = 20) => {
  const response = await api.get("/auctions/live", {
    params: { page, limit },
  });
  return response.data;
};

// Get auction details
export const getAuctionDetails = async (auctionId: string) => {
  const response = await api.get(`/auctions/${auctionId}`);
  return response.data;
};

// Create auction (farmer)
export const createAuction = async (data: CreateAuctionData) => {
  const response = await api.post("/auctions", data);
  return response.data;
};

// Place bid (buyer)
export const placeBid = async (auctionId: string, data: PlaceBidData) => {
  const response = await api.post(`/auctions/${auctionId}/bid`, data);
  return response.data;
};

// Get my bids
export const getMyBids = async () => {
  const response = await api.get("/auctions/my/bids");
  return response.data;
};

// Choose transport (winner)
export const chooseTransport = async (
  auctionId: string,
  data: ChooseTransportData
) => {
  const response = await api.post(
    `/auctions/${auctionId}/choose-transport`,
    data
  );
  return response.data;
};

// Farmer accepts highest bid (reserve not met)
export const acceptHighestBid = async (auctionId: string) => {
  const response = await api.post(`/auctions/${auctionId}/accept-bid`);
  return response.data;
};

// Farmer rejects auction
export const rejectAuction = async (auctionId: string) => {
  const response = await api.post(`/auctions/${auctionId}/reject`);
  return response.data;
};

// Farmer relists auction
export const relistAuction = async (
  auctionId: string,
  data: { startingPrice: number; reservePrice?: number; durationHours?: number }
) => {
  const response = await api.post(`/auctions/${auctionId}/relist`, data);
  return response.data;
};

// Service object for method-based access
export const auctionsService = {
  getLiveAuctions,
  getAuctionDetails,
  createAuction,
  placeBid,
  getMyBids,
  chooseTransport,
  acceptHighestBid,
  rejectAuction,
  relistAuction,
};
