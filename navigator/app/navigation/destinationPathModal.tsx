import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { ArrowRight, X } from "lucide-react-native";
import { Travelling, UserRoute } from "../_types";

export default function DestinationPathModal(props: {
  toggleModal: () => void;
  handleGoBack: () => void;
  currentFloor: number;
  currentLocation: string;
  userRoute: UserRoute;
  currentSteps: Travelling[];
  currentStep: number;
  currentPathIndex: number;
}) {
  return (
    <View style={styles.modalContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Modal Header */}
      <View style={styles.modalHeader}>
        <View style={styles.modalHeaderInfo}>
          <Text style={styles.modalTitle}>Floor Plan Navigation</Text>
          <Text style={styles.modalSubtitle}>
            Floor {props.currentFloor} - Senate
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={props.toggleModal}
        >
          <X size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.modalContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Route Progress */}
        <View style={styles.routeProgressModal}>
          <Text style={styles.routeLabel}>Route Progress:</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.routeContainer}
          >
            {props.currentSteps.map((node, index) => (
              <View key={node.turn + index} style={styles.routeItem}>
                <View style={styles.routeNodeContainer}>
                  <View style={[styles.routeNode]}>
                    <Text
                      style={[
                        styles.routeNodeText,
                        (index <= props.currentStep ||
                          index === props.currentSteps.length - 1) &&
                          styles.routeNodeTextActive,
                      ]}
                    >
                      {node.turn}
                    </Text>
                  </View>
                </View>

                <View style={styles.arrowContainer}>
                  <ArrowRight
                    size={16}
                    color="#6B7280"
                    style={styles.routeArrow}
                  />
                  <Text style={styles.distanceText}>{node.meters}m</Text>
                </View>
              </View>
            ))}
            <View style={[styles.routeNode, styles.routeNodeCompleted]}>
              <Text style={[styles.routeNodeText]}>
                {props.userRoute.edges[props.currentPathIndex]?.to}
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Navigation Status Panel */}
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>Navigation Status</Text>

          {/* Current Location */}
          <View style={styles.startingPointCard}>
            <Text style={styles.startingPointLabel}>STARTING POINT</Text>
            <Text style={styles.startingPointText}>
              {props.currentLocation}
            </Text>
          </View>

          {/* Available Paths from Current Location */}
          <View style={styles.availablePathsContainer}>
            <Text style={styles.availablePathsLabel}>PATHS TO TRAVEL</Text>
            <View style={styles.pathsList}>
              {/* Mock path data */}
              {props.userRoute.edges?.map((path, index) => {
                const isActive = false;
                return (
                  <View
                    style={[
                      styles.pathItem,
                      isActive && {
                        backgroundColor: "#F3F4F6", // base color
                        overflow: "hidden",
                      },
                    ]}
                    key={path.to}
                  >
                    {isActive && (
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          bottom: 0,
                          width: `0%`, // only this matters
                          backgroundColor: "#2563EB",
                          borderRadius: 8,
                        }}
                      />
                    )}
                    {index === props.userRoute.edges.length - 1 && (
                      <Text style={styles.destinationLabel}>DESTINATION</Text>
                    )}
                    <View style={styles.pathHeader}>
                      <Text
                        style={[
                          styles.pathDestination,
                          isActive && {
                            color: "#FFF", // base color
                          },
                        ]}
                      >
                        {path.to}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>LEGEND</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendCircle,
                    {
                      backgroundColor: "#F1F5F9",
                      borderWidth: 2,
                      borderColor: "#E2E8F0",
                    },
                  ]}
                />
                <Text style={styles.legendText}>Starting location</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendCircle,
                    {
                      backgroundColor: "#F3F4F6",
                      borderWidth: 2,
                      borderColor: "#D1D5DB",
                    },
                  ]}
                />
                <Text style={styles.legendText}>Unvisited node</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendCircle, { backgroundColor: "#3B82F6" }]}
                />
                <Text style={styles.legendText}>Current node</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendCircle, { backgroundColor: "#10B981" }]}
                />
                <Text style={styles.legendText}>Destination</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Text style={styles.demoText}>
            Demo: Toggle controls to show/hide paths and weights
          </Text>
        </View>
      </ScrollView>

      {/* Modal Footer */}
      <View style={styles.modalFooter}>
        <TouchableOpacity style={styles.endButton} onPress={props.handleGoBack}>
          <Text style={styles.endButtonText}>End Navigation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB", // modal background light
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalHeaderInfo: { flex: 1 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  modalSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  closeButton: { padding: 4 },
  modalContent: { flex: 1 },
  controlsContainer: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerControls: { flexDirection: "row", gap: 8, justifyContent: "center" },
  controlButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    padding: 8,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonActive: { backgroundColor: "#2563EB" },
  controlButtonText: { fontSize: 12, fontWeight: "600", color: "#4B5563" },
  controlButtonTextActive: { color: "#ffffff" },
  routeProgressModal: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  routeLabel: { fontSize: 12, color: "#6B7280", marginBottom: 8 },
  routeContainer: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: 4,
  },
  routeNodeContainer: {
    alignItems: "center",
    minHeight: 40,
    justifyContent: "center",
  },
  routeNode: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  routeNodeCompleted: { backgroundColor: "#10B981" },
  routeNodeCurrent: { backgroundColor: "#2563EB" },
  routeNodeDestination: { backgroundColor: "#EF4444" },
  routeNodeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4B5563",
  },
  routeNodeTextActive: { color: "#ffffff" },
  arrowContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    minHeight: 40,
  },
  routeArrow: {
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 8,
    color: "#9CA3AF",
    fontWeight: "500",
    textAlign: "center",
  },
  statusPanel: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  startingPointCard: {
    backgroundColor: "#F59E0B", // Good yellow color for starting location
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  startingPointLabel: {
    fontSize: 12,
    color: "#FFFFFF", // Changed to white for better contrast on yellow
    marginBottom: 4,
  },
  destinationLabel: {
    fontSize: 12,
    color: "#10B981",
    marginBottom: 4,
  },
  startingPointText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  availablePathsContainer: { marginBottom: 20 },
  availablePathsLabel: { fontSize: 12, color: "#6B7280", marginBottom: 12 },
  pathsList: { gap: 8 },
  pathItem: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    position: "relative",
  },
  pathItemSelected: { backgroundColor: "#10B981", borderColor: "#10B981" },
  pathHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  pathDestination: { fontSize: 14, fontWeight: "600", color: "#111827" },
  pathDetails: { fontSize: 10, color: "#6B7280", lineHeight: 14 },
  pathDestinationSelected: { color: "#FFFFFF" },
  pathWeight: { fontSize: 10, color: "#6B7280" },
  pathWeightSelected: { color: "#D1FAE5" },
  pathDetailsSelected: { color: "#D1FAE5" },
  legend: { borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 16 },
  legendTitle: { fontSize: 12, color: "#6B7280", marginBottom: 12 },
  legendItems: { gap: 8 },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendLine: { width: 16, height: 4, marginRight: 8 },
  legendCircle: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 10, color: "#4B5563" },

  demoNotice: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 8,
  },
  demoText: { fontSize: 10, color: "#6B7280", textAlign: "center" },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  endButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  endButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
