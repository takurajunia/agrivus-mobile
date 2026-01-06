import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Truck,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  ChevronRight,
  Ship,
  Plane,
  Package,
  Clock,
} from "lucide-react-native";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
  NeumorphicSearchBar,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
import exportService from "../../src/services/exportService";

interface LogisticsPartner {
  id: string;
  name: string;
  description: string;
  serviceTypes: string[];
  markets: string[];
  rating: number;
  reviewCount: number;
  contactPhone: string;
  contactEmail: string;
  website: string;
  headquarters: string;
  certifications: string[];
  estimatedTransitTimes: {
    market: string;
    days: string;
  }[];
}

const SERVICE_TYPES = [
  { key: "all", label: "All", icon: Truck },
  { key: "sea", label: "Sea Freight", icon: Ship },
  { key: "air", label: "Air Freight", icon: Plane },
  { key: "land", label: "Land Transport", icon: Truck },
  { key: "warehouse", label: "Warehousing", icon: Package },
];

export default function ExportLogisticsScreen() {
  const router = useRouter();
  const [partners, setPartners] = useState<LogisticsPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeService, setActiveService] = useState("all");

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      }
      const response = await exportService.getLogisticsPartners();
      if (response.success) {
        setPartners(response.data.partners || []);
      }
    } catch (error) {
      console.error("Failed to fetch logistics partners:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPartners(true);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (url: string) => {
    if (url) {
      Linking.openURL(url.startsWith("http") ? url : `https://${url}`);
    }
  };

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesService =
      activeService === "all" ||
      partner.serviceTypes.some((s) =>
        s.toLowerCase().includes(activeService.toLowerCase())
      );

    return matchesSearch && matchesService;
  });

  const getServiceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "sea":
      case "sea freight":
        return Ship;
      case "air":
      case "air freight":
        return Plane;
      case "land":
      case "land transport":
        return Truck;
      case "warehouse":
      case "warehousing":
        return Package;
      default:
        return Truck;
    }
  };

  const renderPartner = (partner: LogisticsPartner, index: number) => (
    <NeumorphicCard
      key={partner.id}
      style={styles.partnerCard}
      animationDelay={index * 50}
    >
      <View style={styles.partnerHeader}>
        <View style={styles.partnerLogo}>
          <Truck size={24} color={neumorphicColors.primary[600]} />
        </View>
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerName}>{partner.name}</Text>
          <View style={styles.ratingContainer}>
            <Star
              size={14}
              color={neumorphicColors.semantic.warning}
              fill={neumorphicColors.semantic.warning}
            />
            <Text style={styles.ratingText}>
              {partner.rating?.toFixed(1)} ({partner.reviewCount} reviews)
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.partnerDescription} numberOfLines={2}>
        {partner.description}
      </Text>

      {/* Service Types */}
      <View style={styles.servicesContainer}>
        {partner.serviceTypes.map((service, idx) => {
          const ServiceIcon = getServiceIcon(service);
          return (
            <View key={idx} style={styles.serviceChip}>
              <ServiceIcon size={12} color={neumorphicColors.primary[600]} />
              <Text style={styles.serviceChipText}>{service}</Text>
            </View>
          );
        })}
      </View>

      {/* Markets Served */}
      <View style={styles.marketsRow}>
        <Globe size={14} color={neumorphicColors.text.tertiary} />
        <Text style={styles.marketsText}>
          Serves: {partner.markets.slice(0, 3).join(", ")}
          {partner.markets.length > 3 && ` +${partner.markets.length - 3} more`}
        </Text>
      </View>

      {/* Transit Times */}
      {partner.estimatedTransitTimes &&
        partner.estimatedTransitTimes.length > 0 && (
          <View style={styles.transitContainer}>
            <Clock size={14} color={neumorphicColors.text.tertiary} />
            <Text style={styles.transitText}>
              Transit: {partner.estimatedTransitTimes[0].market} -{" "}
              {partner.estimatedTransitTimes[0].days}
            </Text>
          </View>
        )}

      {/* Location */}
      <View style={styles.locationRow}>
        <MapPin size={14} color={neumorphicColors.text.tertiary} />
        <Text style={styles.locationText}>{partner.headquarters}</Text>
      </View>

      {/* Contact Actions */}
      <View style={styles.contactActions}>
        <NeumorphicIconButton
          icon={<Phone size={18} color={neumorphicColors.primary[600]} />}
          onPress={() => handleCall(partner.contactPhone)}
          size="medium"
          variant="secondary"
        />
        <NeumorphicIconButton
          icon={<Mail size={18} color={neumorphicColors.primary[600]} />}
          onPress={() => handleEmail(partner.contactEmail)}
          size="medium"
          variant="secondary"
        />
        <NeumorphicIconButton
          icon={<Globe size={18} color={neumorphicColors.primary[600]} />}
          onPress={() => handleWebsite(partner.website)}
          size="medium"
          variant="secondary"
        />
        <NeumorphicButton
          title="Request Quote"
          variant="primary"
          size="small"
          style={styles.quoteButton}
          onPress={() => handleEmail(partner.contactEmail)}
        />
      </View>
    </NeumorphicCard>
  );

  if (loading) {
    return (
      <NeumorphicScreen variant="list" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading partners...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="list" showLeaves={false}>
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="ghost"
          size="medium"
        />
        <Text style={styles.title}>Logistics Partners</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <NeumorphicSearchBar
          placeholder="Search partners..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Service Type Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {SERVICE_TYPES.map((service) => (
          <NeumorphicButton
            key={service.key}
            title={service.label}
            variant={activeService === service.key ? "primary" : "tertiary"}
            size="small"
            icon={
              <service.icon
                size={16}
                color={
                  activeService === service.key
                    ? neumorphicColors.text.inverse
                    : neumorphicColors.text.secondary
                }
              />
            }
            onPress={() => setActiveService(service.key)}
            style={styles.tabButton}
          />
        ))}
      </ScrollView>

      {/* Partners List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[neumorphicColors.primary[600]]}
            tintColor={neumorphicColors.primary[600]}
          />
        }
      >
        {filteredPartners.length === 0 ? (
          <View style={styles.emptyState}>
            <Truck
              size={64}
              color={neumorphicColors.text.tertiary}
              strokeWidth={1}
            />
            <Text style={styles.emptyTitle}>No Partners Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Logistics partners will appear here"}
            </Text>
          </View>
        ) : (
          filteredPartners.map((partner, index) =>
            renderPartner(partner, index)
          )
        )}
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neumorphicColors.base.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: neumorphicColors.base.background,
  },
  title: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  placeholder: {
    width: 48,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tabButton: {
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  partnerCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  partnerLogo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: neumorphicColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: 2,
  },
  ratingText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  partnerDescription: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  serviceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: neumorphicColors.primary[50],
    borderRadius: borderRadius.full,
  },
  serviceChipText: {
    ...typography.caption,
    color: neumorphicColors.primary[600],
    fontWeight: "500",
  },
  marketsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  marketsText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  transitContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  transitText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  locationText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
  },
  quoteButton: {
    flex: 1,
    marginLeft: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
});
