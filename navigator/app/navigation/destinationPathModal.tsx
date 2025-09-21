import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import {
  X,
  CircleCheck as CheckCircle,
  TriangleAlert as AlertTriangle,
  Navigation,
  MapPin,
  RotateCcw,
  QrCode,
  ArrowUp,
  AlignLeft as TurnLeft,
  AlignRight as TurnRight,
} from "lucide-react-native";
import { Travelling, Route } from "../_types";
import { styles } from "./styles/destinationParthStyles";
import { CORRECTIBLE_DEVIATION } from "@/constants/navigation";

export default function DestinationPathModal(props: {
  toggleModal: () => void;
  handleGoBack: () => void;
  currentFloor: number;
  currentLocation: string;
  userRoute: Route;
  currentSteps: Travelling[];
  nodeMainIndex: number;
  nodeSubIndex: number;
  isOnTrack: boolean;
  deviationDistance: number;
  messaging: string;
  arrivedDestination: boolean;
}) {
  // Mock states for demonstration - these would come from your navigation logic

  const completedSteps = 0; // Mock completion

  // Course correction logic
  const needsReplanning = props.deviationDistance >= CORRECTIBLE_DEVIATION;
  const correctionSteps = [
    { direction: "Turn left", distance: 3, icon: TurnLeft },
    { direction: "Walk straight", distance: 5, icon: ArrowUp },
    { direction: "Turn right", distance: 0, icon: TurnRight },
  ];
  const journey = [{ to: props.userRoute.start }, ...props.userRoute.edges];

  const getNavigationMessage = () => {
    if (props.isOnTrack) {
      return {
        type: "success",
        icon: CheckCircle,
        title: "You're on the right track!",
        message: props.messaging,
        color: "#10B981",
      };
    } else if (needsReplanning) {
      return {
        type: "error",
        icon: QrCode,
        title: "Replanning needed",
        message: props.messaging,
        color: "#EF4444",
      };
    } else {
      return {
        type: "warning",
        icon: AlertTriangle,
        title: "Course correction needed",
        message: props.messaging,
        color: "#F59E0B",
      };
    }
  };

  const navigationStatus = getNavigationMessage();

  return (
    <View style={styles.modalContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

      {/* Enhanced Modal Header */}
      <View style={styles.modalHeader}>
        <View style={styles.headerLeft}>
          <Navigation size={24} color="#3B82F6" />
          <View style={styles.headerText}>
            <Text style={styles.modalTitle}>Active Navigation</Text>
            <Text style={styles.modalSubtitle}>
              Floor {props.currentFloor} - Senate
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={props.toggleModal}
        >
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Prominent Navigation Status Message */}
      <View
        style={[
          styles.navigationMessageCard,
          { borderLeftColor: navigationStatus.color },
        ]}
      >
        <View style={styles.messageIcon}>
          <navigationStatus.icon size={24} color={navigationStatus.color} />
        </View>
        <View style={styles.messageContent}>
          <Text
            style={[styles.messageTitle, { color: navigationStatus.color }]}
          >
            {navigationStatus.title}
          </Text>
          <Text style={styles.messageText}>{navigationStatus.message}</Text>
        </View>
      </View>

      {/* Course Correction Section */}
      {!props.isOnTrack && (
        <View style={styles.correctionSection}>
          {needsReplanning ? (
            <View style={styles.replanningCard}>
              <View style={styles.replanningHeader}>
                <QrCode size={32} color="#EF4444" />
                <View style={styles.replanningContent}>
                  <Text style={styles.replanningTitle}>
                    Scan QR Code to Replan
                  </Text>
                  <Text style={styles.replanningText}>
                    You&apos;ve deviated too far from the original path. Find
                    the nearest QR code and scan it to generate a new route from
                    your current location.
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.scanButton}>
                <QrCode size={20} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Open QR Scanner</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.correctionCard}>
              <View style={styles.correctionHeader}>
                <RotateCcw size={24} color="#F59E0B" />
                <Text style={styles.correctionTitle}>
                  Course Correction Steps
                </Text>
              </View>
              <Text style={styles.correctionSubtitle}>
                Follow these steps to get back on your original route:
              </Text>

              <View style={styles.correctionSteps}>
                {correctionSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <View key={index} style={styles.correctionStep}>
                      <View style={styles.correctionStepNumber}>
                        <Text style={styles.correctionStepNumberText}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.correctionStepIcon}>
                        <IconComponent size={20} color="#F59E0B" />
                      </View>
                      <View style={styles.correctionStepContent}>
                        <Text style={styles.correctionStepDirection}>
                          {step.direction}
                        </Text>
                        {step.distance > 0 && (
                          <Text style={styles.correctionStepDistance}>
                            for {step.distance} meters
                          </Text>
                        )}
                      </View>
                      {index < correctionSteps.length - 1 && (
                        <View style={styles.correctionStepConnector} />
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={styles.correctionFooter}>
                <View style={styles.correctionProgress}>
                  <Text style={styles.correctionProgressText}>
                    Once completed, you&apos;ll rejoin your original route at
                    step {completedSteps + 1}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
      <ScrollView
        style={styles.modalContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Route Progress */}
        <View style={styles.routeProgressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Turn Steps</Text>
            <View style={styles.progressStats}>
              <Text style={styles.progressText}>
                {completedSteps}/{props.currentSteps.length} steps
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        (completedSteps / props.currentSteps.length) * 100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.stepsContainer}
          >
            {props.currentSteps.map((step, index) => {
              const isCompleted = index < props.nodeSubIndex;
              const isCurrent = index === props.nodeSubIndex;
              const isUpcoming = index > props.nodeSubIndex;

              return (
                <View key={step.turn + index} style={styles.stepContainer}>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepNode,
                        isCompleted && styles.stepNodeCompleted,
                        isCurrent && styles.stepNodeCurrent,
                        isCurrent &&
                          props.arrivedDestination &&
                          styles.stepNodeCompleted,
                        isUpcoming && styles.stepNodeUpcoming,
                      ]}
                    >
                      {isCompleted ? (
                        <CheckCircle size={16} color="#FFFFFF" />
                      ) : (
                        <Text
                          style={[
                            styles.stepNodeText,
                            isCurrent && styles.stepNodeTextCurrent,
                          ]}
                        >
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepDirection,
                        isCurrent &&
                          !props.arrivedDestination &&
                          styles.stepDirectionCurrent,
                      ]}
                    >
                      {step.turn}
                    </Text>
                    <Text style={styles.stepDistance}>{step.meters}m</Text>
                  </View>
                  {index < props.currentSteps.length - 1 && (
                    <View
                      style={[
                        styles.stepConnector,
                        isCompleted && styles.stepConnectorCompleted,
                      ]}
                    />
                  )}
                </View>
              );
            })}
            <View style={styles.destinationStep}>
              <View style={styles.destinationNode}>
                <MapPin size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.destinationText}>
                {journey?.[props.nodeMainIndex]?.to}
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Enhanced Current Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <MapPin size={20} color="#3B82F6" />
            <Text style={styles.locationTitle}>Start Location</Text>
          </View>
          <Text style={styles.locationText}>{props.currentLocation}</Text>
        </View>

        {/* Journey Overview */}
        <View style={styles.journeySection}>
          <Text style={styles.sectionTitle}>Your Journey</Text>
          <View style={styles.journeyPath}>
            {journey?.map((path, index) => {
              const segmenetStatus = {
                isStart: index === 0,
                isDestination: index === journey.length - 1,
                isCurrent:
                  index === props.nodeMainIndex - 1 &&
                  !props.arrivedDestination,
                isCompleted:
                  props.nodeMainIndex - 1 > index ||
                  (index === props.nodeMainIndex - 1 &&
                    props.arrivedDestination),
                hasNext: index < journey.length - 1,
              };

              const renderDotIcon = () => {
                if (segmenetStatus.isStart || segmenetStatus.isDestination) {
                  return <MapPin size={12} color="#FFFFFF" />;
                }
                if (segmenetStatus.isCompleted) {
                  return <CheckCircle size={12} color="#FFFFFF" />;
                }
                return null;
              };

              const pathLabel = segmenetStatus.isCompleted
                ? "Path Completed"
                : segmenetStatus.isCurrent
                ? "Current Path"
                : "";

              return (
                <React.Fragment key={path.to}>
                  {/* Step Node */}
                  <View style={styles.journeyStep}>
                    <View style={styles.journeyStepIndicator}>
                      <View
                        style={[
                          styles.journeyDot,
                          segmenetStatus.isStart && styles.journeyDotStart,
                          segmenetStatus.isDestination &&
                            styles.journeyDotDestination,
                          segmenetStatus.isCurrent &&
                            !segmenetStatus.isStart &&
                            !segmenetStatus.isDestination &&
                            styles.journeyDotCurrent,
                          segmenetStatus.isCompleted &&
                            !segmenetStatus.isStart &&
                            !segmenetStatus.isDestination &&
                            !segmenetStatus.isCurrent &&
                            styles.journeyDotCompleted,
                        ]}
                      >
                        {renderDotIcon()}
                      </View>
                    </View>
                    <View style={styles.journeyStepContent}>
                      <Text
                        style={[
                          styles.journeyStepText,
                          segmenetStatus.isStart && styles.journeyStepTextStart,
                          segmenetStatus.isDestination &&
                            styles.journeyStepTextDestination,
                          segmenetStatus.isCurrent &&
                            styles.journeyStepTextCurrent,
                        ]}
                      >
                        {path.to}
                      </Text>
                      {segmenetStatus.isDestination && (
                        <>
                          <Text style={styles.destinationLabel}>
                            Final Destination
                          </Text>
                          {props.arrivedDestination && (
                            <Text style={styles.currentLabel}>Arrived</Text>
                          )}
                        </>
                      )}
                      {segmenetStatus.isStart && (
                        <Text style={styles.startLabel}>Starting Point</Text>
                      )}
                    </View>
                  </View>

                  {/* Segment Between Steps */}
                  {segmenetStatus.hasNext && (
                    <View style={styles.pathSegment}>
                      <View style={styles.pathSegmentIndicator}>
                        <View
                          style={[
                            styles.journeyLine,
                            segmenetStatus.isCompleted &&
                              styles.journeyLineCompleted,
                            segmenetStatus.isCurrent &&
                              styles.journeyLineCurrent,
                          ]}
                        />
                      </View>
                      <View style={styles.pathSegmentContent}>
                        <Text
                          style={
                            segmenetStatus.isCompleted
                              ? styles.completedLabel
                              : segmenetStatus.isCurrent
                              ? styles.currentLabel
                              : styles.upcomingLabel
                          }
                        >
                          {pathLabel}
                        </Text>
                      </View>
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* Enhanced Legend */}
        <View style={styles.legendSection}>
          <Text style={styles.sectionTitle}>Legend</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#10B981" }]}
              />
              <Text style={styles.legendText}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#3B82F6" }]}
              />
              <Text style={styles.legendText}>Current</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#E5E7EB" }]}
              />
              <Text style={styles.legendText}>Upcoming</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#EF4444" }]}
              />
              <Text style={styles.legendText}>Destination</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Modal Footer */}
      <View style={styles.modalFooter}>
        <TouchableOpacity style={styles.endButton} onPress={props.handleGoBack}>
          <Text style={styles.endButtonText}>End Navigation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
