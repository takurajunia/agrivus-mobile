import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ordersService from "../services/ordersService";

interface Transporter {
  transporterId: string;
  transporter: {
    fullName: string;
    phone: string;
    email: string;
    platformScore: number;
    vehicleType: string;
    vehicleCapacity: string;
    baseLocation: string;
    rating: number | string;
    completedDeliveries: number;
    onTimeDeliveryRate: number | string;
  };
  matchScore: number;
  matchReasons: {
    highPlatformActivity: boolean;
    serviceAreaMatch: boolean;
    goodRating: boolean;
    experienced: boolean;
  };
}

interface TransportOfferWizardMobileProps {
  orderId: string;
  pickupLocation: string;
  deliveryLocation: string;
  transportCost: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TransportOfferWizardMobile: React.FC<
  TransportOfferWizardMobileProps
> = ({
  orderId,
  pickupLocation,
  deliveryLocation,
  transportCost,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const [step, setStep] = useState<
    "select-primary" | "select-secondary" | "select-tertiary" | "summary"
  >("select-primary");
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [primarySelected, setPrimarySelected] = useState<string | null>(null);
  const [secondarySelected, setSecondarySelected] = useState<string | null>(
    null,
  );
  const [tertiarySelected, setTertiarySelected] = useState<string | null>(null);

  const [proposedFee, setProposedFee] = useState<string>(
    transportCost ? transportCost.toString() : "",
  );
  const [minimumFee, setMinimumFee] = useState<number>(187.5);
  const [feeError, setFeeError] = useState<string | null>(null);

  useEffect(() => {
    loadTransporters();
  }, [orderId]);

  const loadTransporters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersService.matchTransporter(orderId);
      if (response.data?.matches) {
        setTransporters(response.data.matches);
      }
      if (response.data?.minimumFee) {
        setMinimumFee(response.data.minimumFee);
        setProposedFee(response.data.minimumFee.toString());
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transporters",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!primarySelected) {
      Alert.alert("Required", "Please select a primary transporter");
      return;
    }

    if (!secondarySelected && !tertiarySelected) {
      Alert.alert("Required", "Please select at least 2 transporters");
      return;
    }

    if (!proposedFee) {
      setFeeError("Please enter a transport fee");
      return;
    }

    const feeValue = parseFloat(proposedFee);
    if (Number.isNaN(feeValue)) {
      setFeeError("Invalid fee amount");
      return;
    }

    if (feeValue < minimumFee) {
      setFeeError(`Fee must be at least KES ${minimumFee.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);
      setFeeError(null);
      await ordersService.assignTransporter(orderId, {
        primaryTransporterId: primarySelected,
        secondaryTransporterId: secondarySelected || undefined,
        tertiaryTransporterId: tertiarySelected || undefined,
        transportCost: feeValue.toString(),
        pickupLocation,
      });
      onSuccess();
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to assign transporters",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderTransporterCard = (
    t: Transporter,
    isSelected: boolean,
    onSelect: () => void,
  ) => {
    return (
      <TouchableOpacity
        key={t.transporterId}
        onPress={onSelect}
        style={[
          styles.transporterCard,
          {
            borderColor: isSelected ? "#22c55e" : "#e5e7eb",
            backgroundColor: isSelected ? "#f0fdf4" : "#ffffff",
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.transporterName}>{t.transporter.fullName}</Text>
            <Text style={styles.vehicleType}>{t.transporter.vehicleType}</Text>
          </View>
          {isSelected && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#22c55e"
              style={{ marginLeft: 10 }}
            />
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{t.transporter.platformScore}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>
              ⭐{" "}
              {typeof t.transporter.rating === "string"
                ? parseFloat(t.transporter.rating).toFixed(1)
                : t.transporter.rating.toFixed(1)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Capacity</Text>
            <Text style={styles.statValue}>
              {t.transporter.vehicleCapacity}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Deliveries</Text>
            <Text style={styles.statValue}>
              {t.transporter.completedDeliveries}
            </Text>
          </View>
        </View>

        <View style={styles.badges}>
          {t.matchReasons.highPlatformActivity && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Active User</Text>
            </View>
          )}
          {t.matchReasons.serviceAreaMatch && (
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={styles.badgeText}>Service Match</Text>
            </View>
          )}
          {t.matchReasons.goodRating && (
            <View style={[styles.badge, styles.badgeYellow]}>
              <Text style={styles.badgeText}>Top Rated</Text>
            </View>
          )}
        </View>

        <View style={styles.scoreBar}>
          <Text style={styles.scoreLabel}>Match Score</Text>
          <View style={styles.scoreBarContainer}>
            <View
              style={[
                styles.scoreBarFill,
                {
                  width: `${Math.min(t.matchScore, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.scoreValue}>{t.matchScore}%</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && transporters.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Finding best transporters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Transporters</Text>
        <Text style={styles.headerSubtitle}>
          Choose 3 transporters in priority order
        </Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {["primary", "secondary", "tertiary", "summary"].map((s, i) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              {
                backgroundColor:
                  [
                    "select-primary",
                    "select-secondary",
                    "select-tertiary",
                    "summary",
                  ].indexOf(step) >= i
                    ? "#22c55e"
                    : "#e5e7eb",
              },
            ]}
          />
        ))}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={20} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === "select-primary" && (
          <View>
            <Text style={styles.stepTitle}>🚀 Tier 1: Primary Transporter</Text>
            <Text style={styles.stepDescription}>
              This transporter gets priority access for 1 hour
            </Text>
            <View style={styles.transportersList}>
              {transporters.map((t) =>
                renderTransporterCard(
                  t,
                  primarySelected === t.transporterId,
                  () => setPrimarySelected(t.transporterId),
                ),
              )}
            </View>
          </View>
        )}

        {step === "select-secondary" && (
          <View>
            <Text style={styles.stepTitle}>
              ⏰ Tier 2: Secondary Transporter
            </Text>
            <Text style={styles.stepDescription}>
              If primary doesn't respond within 1 hour, offer goes here
            </Text>
            <View style={styles.transportersList}>
              {transporters
                .filter((t) => t.transporterId !== primarySelected)
                .map((t) =>
                  renderTransporterCard(
                    t,
                    secondarySelected === t.transporterId,
                    () => setSecondarySelected(t.transporterId),
                  ),
                )}
            </View>
          </View>
        )}

        {step === "select-tertiary" && (
          <View>
            <Text style={styles.stepTitle}>
              🎯 Tier 3: Tertiary Transporter
            </Text>
            <Text style={styles.stepDescription}>
              If secondary also doesn't respond, offer goes here
            </Text>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setTertiarySelected(null)}
            >
              <Text style={styles.skipButtonText}>Skip Tier 3</Text>
            </TouchableOpacity>
            <View style={styles.transportersList}>
              {transporters
                .filter(
                  (t) =>
                    t.transporterId !== primarySelected &&
                    t.transporterId !== secondarySelected,
                )
                .map((t) =>
                  renderTransporterCard(
                    t,
                    tertiarySelected === t.transporterId,
                    () => setTertiarySelected(t.transporterId),
                  ),
                )}
            </View>
          </View>
        )}

        {step === "summary" && (
          <View>
            <Text style={styles.stepTitle}>Review Your Selections</Text>

            {/* Tier 1 */}
            <View style={[styles.tierCard, styles.tierCardPrimary]}>
              <View style={styles.tierBadge}>
                <Text style={styles.tierBadgeText}>Tier 1</Text>
              </View>
              <Text style={styles.tierDuration}>
                (Priority - 1 hour exclusive)
              </Text>
              {primarySelected && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.transporterName}>
                    {
                      transporters.find(
                        (t) => t.transporterId === primarySelected,
                      )?.transporter.fullName
                    }
                  </Text>
                  <Text style={styles.vehicleType}>
                    {
                      transporters.find(
                        (t) => t.transporterId === primarySelected,
                      )?.transporter.vehicleType
                    }
                  </Text>
                </View>
              )}
            </View>

            {/* Tier 2 */}
            <View style={[styles.tierCard, styles.tierCardSecondary]}>
              <View style={[styles.tierBadge, styles.tierBadgeBlue]}>
                <Text style={styles.tierBadgeText}>Tier 2</Text>
              </View>
              <Text style={styles.tierDuration}>(After 1 hour)</Text>
              {secondarySelected ? (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.transporterName}>
                    {
                      transporters.find(
                        (t) => t.transporterId === secondarySelected,
                      )?.transporter.fullName
                    }
                  </Text>
                  <Text style={styles.vehicleType}>
                    {
                      transporters.find(
                        (t) => t.transporterId === secondarySelected,
                      )?.transporter.vehicleType
                    }
                  </Text>
                </View>
              ) : (
                <Text style={styles.notSelected}>Not selected</Text>
              )}
            </View>

            {/* Tier 3 */}
            {tertiarySelected && (
              <View style={[styles.tierCard, styles.tierCardTertiary]}>
                <View style={[styles.tierBadge, styles.tierBadgePurple]}>
                  <Text style={styles.tierBadgeText}>Tier 3</Text>
                </View>
                <Text style={styles.tierDuration}>(After 2 hours)</Text>
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.transporterName}>
                    {
                      transporters.find(
                        (t) => t.transporterId === tertiarySelected,
                      )?.transporter.fullName
                    }
                  </Text>
                  <Text style={styles.vehicleType}>
                    {
                      transporters.find(
                        (t) => t.transporterId === tertiarySelected,
                      )?.transporter.vehicleType
                    }
                  </Text>
                </View>
              </View>
            )}

            {/* How It Works */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>How Cascading Works:</Text>
              <Text style={styles.infoBullet}>
                ✓ Hour 0: Tier 1 gets exclusive 1-hour window
              </Text>
              <Text style={styles.infoBullet}>
                ✓ Hour 1: Tier 2 activated (Tier 1 still can accept)
              </Text>
              <Text style={styles.infoBullet}>
                ✓ Hour 2: Tier 3 activated (all tiers still can accept)
              </Text>
              <Text style={styles.infoBullet}>
                ✓ First to accept wins! Assigned transporter gets the job
              </Text>
            </View>

            {/* Cost Summary */}
            <View style={styles.costSummary}>
              <Text style={styles.costLabel}>Proposed Transport Fee (KES)</Text>
              <TextInput
                style={styles.feeInput}
                keyboardType="numeric"
                value={proposedFee}
                onChangeText={setProposedFee}
                placeholder={`Minimum KES ${minimumFee.toFixed(2)}`}
              />
              <Text style={styles.feeHint}>
                Minimum fee: KES {minimumFee.toFixed(2)} (distance + weight)
              </Text>
              {feeError && <Text style={styles.feeError}>{feeError}</Text>}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        {step !== "summary" && (
          <>
            {step !== "select-primary" && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (step === "select-tertiary") {
                    setStep("select-secondary");
                  } else if (step === "select-secondary") {
                    setStep("select-primary");
                  }
                }}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                if (step === "select-primary") {
                  if (!primarySelected) {
                    Alert.alert(
                      "Required",
                      "Please select a primary transporter",
                    );
                    return;
                  }
                  setStep("select-secondary");
                } else if (step === "select-secondary") {
                  if (!secondarySelected) {
                    Alert.alert(
                      "Required",
                      "Please select a secondary transporter",
                    );
                    return;
                  }
                  setStep("select-tertiary");
                } else if (step === "select-tertiary") {
                  setStep("summary");
                }
              }}
            >
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>
          </>
        )}

        {step === "summary" && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Confirm & Send Offers</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#15803d",
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#dcfce7",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  stepDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    marginLeft: 10,
    color: "#b91c1c",
    fontSize: 14,
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  transportersList: {
    gap: 12,
  },
  transporterCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  transporterName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  vehicleType: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "#dbeafe",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeGreen: {
    backgroundColor: "#dcfce7",
  },
  badgeYellow: {
    backgroundColor: "#fef3c7",
  },
  badgeText: {
    fontSize: 12,
    color: "#1f2937",
    fontWeight: "500",
  },
  scoreBar: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  scoreBarFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  skipButton: {
    padding: 12,
    marginBottom: 12,
  },
  skipButtonText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
  },
  tierCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tierCardPrimary: {
    borderColor: "#22c55e",
    backgroundColor: "#f0fdf4",
  },
  tierCardSecondary: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  tierCardTertiary: {
    borderColor: "#a855f7",
    backgroundColor: "#faf5ff",
  },
  tierBadge: {
    backgroundColor: "#22c55e",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  tierBadgeBlue: {
    backgroundColor: "#3b82f6",
  },
  tierBadgePurple: {
    backgroundColor: "#a855f7",
  },
  tierBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  tierDuration: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  notSelected: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 10,
  },
  infoBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  infoBullet: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
  },
  costSummary: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  costLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  feeInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
  },
  feeHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  },
  feeError: {
    marginTop: 6,
    fontSize: 12,
    color: "#dc2626",
  },
  costValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#22c55e",
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#22c55e",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 14,
  },
});
