export const getNotificationRoute = (
  type: string,
  data: any,
  userRole?: string,
): string => {
  switch (type) {
    case "transport_offer":
    case "transport_offer_sent":
    case "transport_offer_accepted":
    case "transport_offer_declined":
    case "transport_offer_countered":
    case "transport_offer_counter_accepted":
    case "transport_assigned":
      if (
        type === "transport_offer_countered" &&
        userRole === "buyer" &&
        data?.orderId
      ) {
        return `/order/${data.orderId}`;
      }
      return "/transport-offers";
    case "order":
    case "order_placed":
    case "order_received":
    case "order_update":
    case "order_delivered":
      if (data?.orderId) {
        if (userRole === "transporter" && data?.offerId) {
          return "/transport-offers";
        }
        return `/order/${data.orderId}`;
      }
      return "/(tabs)/orders";
    case "bid":
    case "auction":
    case "auction_won":
    case "auction_outbid":
      if (data?.auctionId) {
        return `/auction/${data.auctionId}`;
      }
      return "/(tabs)/auctions";
    case "message":
    case "chat":
      if (data?.conversationId) {
        return `/chat/${data.conversationId}`;
      }
      return "/(tabs)/chat";
    case "payment":
    case "payment_received":
    case "wallet":
      return "/(tabs)/wallet";
    case "listing":
      if (data?.listingId) {
        return `/listing/${data.listingId}`;
      }
      return "/(tabs)/marketplace";
    default:
      return "/(tabs)/notifications";
  }
};
