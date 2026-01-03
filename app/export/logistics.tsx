import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
import AnimatedCard from "../../src/components/AnimatedCard";
import ModernInput from "../../src/components/ModernInput";
import AnimatedButton from "../../src/components/AnimatedButton";
import { theme } from "../../src/theme/tokens";
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
    <AnimatedCard
      key={partner.id}
      style={styles.partnerCard}
      delay={index * 50}
    >
      <View style={styles.partnerHeader}>
        <View style={styles.partnerLogo}>
          <Truck size={24} color={theme.colors.primary[600]} />
        </View>
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerName}>{partner.name}</Text>
          <View style={styles.ratingContainer}>
            <Star
              size={14}
              color={theme.colors.warning}
              fill={theme.colors.warning}
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
              <ServiceIcon size={12} color={theme.colors.primary[600]} />
              <Text style={styles.serviceChipText}>{service}</Text>
            </View>
          );
        })}
      </View>

      {/* Markets Served */}
      <View style={styles.marketsRow}>
        <Globe size={14} color={theme.colors.text.tertiary} />
        <Text style={styles.marketsText}>
          Serves: {partner.markets.slice(0, 3).join(", ")}
          {partner.markets.length > 3 && ` +${partner.markets.length - 3} more`}
        </Text>
      </View>

      {/* Transit Times */}
      {partner.estimatedTransitTimes &&
        partner.estimatedTransitTimes.length > 0 && (
          <View style={styles.transitContainer}>
            <Clock size={14} color={theme.colors.text.tertiary} />
            <Text style={styles.transitText}>
              Transit: {partner.estimatedTransitTimes[0].market} -{" "}
              {partner.estimatedTransitTimes[0].days}
            </Text>
          </View>
        )}

      {/* Location */}
      <View style={styles.locationRow}>
        <MapPin size={14} color={theme.colors.text.tertiary} />
        <Text style={styles.locationText}>{partner.headquarters}</Text>
      </View>

      {/* Contact Actions */}
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleCall(partner.contactPhone)}
        >
          <Phone size={18} color={theme.colors.primary[600]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleEmail(partner.contactEmail)}
        >
          <Mail size={18} color={theme.colors.primary[600]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleWebsite(partner.website)}
        >
          <Globe size={18} color={theme.colors.primary[600]} />
        </TouchableOpacity>
        <AnimatedButton
          title="Request Quote"
          variant="primary"
          size="sm"
          style={styles.quoteButton}
          onPress={() => handleEmail(partner.contactEmail)}
        />
      </View>
    </AnimatedCard>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading partners...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Logistics Partners</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <ModernInput
          placeholder="Search partners..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={theme.colors.text.tertiary} />}
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
          <TouchableOpacity
            key={service.key}
            style={[
              styles.tab,
              activeService === service.key && styles.activeTab,
            ]}
            onPress={() => setActiveService(service.key)}
          >
            <service.icon
              size={16}
              color={
                activeService === service.key
                  ? theme.colors.text.inverse
                  : theme.colors.text.secondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeService === service.key && styles.activeTabText,
              ]}
            >
              {service.label}
            </Text>
          </TouchableOpacity>
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
            colors={[theme.colors.primary[600]]}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
        {filteredPartners.length === 0 ? (
          <View style={styles.emptyState}>
            <Truck
              size={64}
              color={theme.colors.text.tertiary}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  tabsContainer: {
    backgroundColor: theme.colors.background.primary,
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    marginRight: theme.spacing.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary[600],
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing["2xl"],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  partnerCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  partnerLogo: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginTop: 2,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  partnerDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  serviceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.full,
  },
  serviceChipText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  marketsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  marketsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  transitContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  transitText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  locationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  quoteButton: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing["4xl"],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
});
