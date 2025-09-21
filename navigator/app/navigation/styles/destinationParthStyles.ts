import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },

  // Prominent Navigation Message
  navigationMessageCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messageIcon: {
    marginRight: 16,
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 22,
  },

  // Course Correction Section
  correctionSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },

  // Replanning Card
  replanningCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FECACA",
  },
  replanningHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  replanningContent: {
    flex: 1,
    marginLeft: 12,
  },
  replanningTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 8,
  },
  replanningText: {
    fontSize: 14,
    color: "#7F1D1D",
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },

  // Correction Card
  correctionCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FED7AA",
  },
  correctionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  correctionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F59E0B",
    marginLeft: 12,
  },
  correctionSubtitle: {
    fontSize: 14,
    color: "#92400E",
    marginBottom: 20,
    lineHeight: 20,
  },
  correctionSteps: {
    marginBottom: 16,
  },
  correctionStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  correctionStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  correctionStepNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  correctionStepIcon: {
    marginRight: 12,
  },
  correctionStepContent: {
    flex: 1,
  },
  correctionStepDirection: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 2,
  },
  correctionStepDistance: {
    fontSize: 14,
    color: "#A16207",
  },
  correctionStepConnector: {
    position: "absolute",
    left: 13,
    top: 28,
    width: 2,
    height: 16,
    backgroundColor: "#FED7AA",
  },
  correctionFooter: {
    borderTopWidth: 1,
    borderTopColor: "#FED7AA",
    paddingTop: 16,
  },
  correctionProgress: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
  },
  correctionProgressText: {
    fontSize: 14,
    color: "#92400E",
    textAlign: "center",
    fontWeight: "500",
  },
  modalContent: {
    flex: 1,
  },

  // Route Progress Section
  routeProgressSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  progressStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginLeft: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 3,
  },

  stepsContainer: {
    flexDirection: "row",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepItem: {
    alignItems: "center",
    marginRight: 8,
  },
  stepNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepNodeCompleted: {
    backgroundColor: "#10B981",
  },
  stepNodeCurrent: {
    backgroundColor: "#3B82F6",
  },
  stepNodeUpcoming: {
    backgroundColor: "#E5E7EB",
  },
  stepNodeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  stepNodeTextCurrent: {
    color: "#FFFFFF",
  },
  stepDirection: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 2,
    textAlign: "center",
  },
  stepDirectionCurrent: {
    color: "#3B82F6",
  },
  stepDistance: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
  },
  stepConnector: {
    width: 20,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  stepConnectorCompleted: {
    backgroundColor: "#10B981",
  },
  destinationStep: {
    alignItems: "center",
    marginLeft: 8,
  },
  destinationNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  destinationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
    textAlign: "center",
  },

  // Current Location Card
  locationCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 8,
  },
  locationText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },

  // Journey Section
  journeySection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  journeyPath: {
    paddingLeft: 8,
  },
  journeyStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  journeyStepIndicator: {
    alignItems: "center",
    marginRight: 16,
  },
  journeyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  journeyDotCompleted: {
    backgroundColor: "#10B981",
  },
  journeyDotCurrent: {
    backgroundColor: "#3B82F6",
  },
  journeyDotDestination: {
    backgroundColor: "#EF4444",
  },
  journeyDotStart: {
    backgroundColor: "#F59E0B",
  },
  journeyLine: {
    width: 2,
    height: 32,
    backgroundColor: "#E5E7EB",
    marginTop: 4,
  },
  journeyLineCompleted: {
    backgroundColor: "#10B981",
  },
  journeyLineCurrent: {
    backgroundColor: "#3B82F6",
  },
  journeyStepContent: {
    flex: 1,
    paddingTop: 2,
  },
  journeyStepText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 2,
  },
  journeyStepTextCurrent: {
    color: "#3B82F6",
  },
  journeyStepTextDestination: {
    color: "#EF4444",
  },
  journeyStepTextStart: {
    color: "#F59E0B",
  },

  // Path segment styles
  pathSegment: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 10,
  },
  pathSegmentIndicator: {
    alignItems: "center",
    marginRight: 16,
  },
  pathSegmentContent: {
    flex: 1,
    paddingLeft: 4,
  },

  // Labels
  destinationLabel: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  startLabel: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "500",
  },
  currentLabel: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
  },
  completedLabel: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  upcomingLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Legend Section
  legendSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: "45%",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },

  // Modal Footer
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  endButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
