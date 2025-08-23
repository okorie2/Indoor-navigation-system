import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  FlatList,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import {
  QrCode,
  MapPin,
  ArrowLeft,
  Keyboard,
  Camera,
} from "lucide-react-native";
import { SAMPLE_DESTINATIONS } from "./_data";
import { styles as destinationInputStyles } from "./destination-input";

export default function LocationInputScreen() {
  const { buildingId, buildingName } = useLocalSearchParams<{
    buildingId: string;
    buildingName: string;
  }>();

  const [showCamera, setShowCamera] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const [showDropdown, setShowDropdown] = useState(false);
  const [destination, setDestination] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Filter destinations based on search input
  const filteredDestinations = useMemo(() => {
    if (!destination.trim()) return [];
    const searchTerm = destination.toLowerCase().trim();
    return SAMPLE_DESTINATIONS.filter(
      (dest) =>
        dest.name.toLowerCase().includes(searchTerm) ||
        dest.category.toLowerCase().includes(searchTerm)
    ).slice(0, 5);
  }, [destination]);

  const handleSelectDestination = (destinationName: string) => {
    console.log(destinationName, "destname");
    setDestination(destinationName);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleQRScan = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Camera Not Available",
        "QR scanning is not available on web. Please use manual input."
      );
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is needed for QR scanning."
        );
        return;
      }
    }
    setShowCamera(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScannedData(data);
    setDestination(data);
    setShowCamera(false);
  };

  const handleContinue = () => {
    if (!destination.trim()) {
      Alert.alert(
        "Location Required",
        "Please scan a QR code or enter your current location manually."
      );
      return;
    }

    router.push({
      pathname: "/destination-input",
      params: {
        buildingId,
        buildingName,
        currentLocation: destination.trim(),
      },
    });
  };

  if (showCamera && Platform.OS !== "web") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cameraHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowCamera(false)}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>Scan QR Code</Text>
        </View>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>
              Point your camera at the QR code
            </Text>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  const renderDropdownItem = ({
    item,
    index,
  }: {
    item: (typeof SAMPLE_DESTINATIONS)[0];
    index: number;
  }) => (
    <TouchableOpacity
      style={[
        destinationInputStyles.dropdownItem,
        index === selectedIndex && destinationInputStyles.dropdownItemSelected,
      ]}
      onPress={() => handleSelectDestination(item.name)}
    >
      <View style={destinationInputStyles.dropdownItemContent}>
        <MapPin size={16} color="#6B7280" />
        <View style={destinationInputStyles.dropdownItemText}>
          <Text style={destinationInputStyles.dropdownItemName}>
            {item.name}
          </Text>
          <Text style={destinationInputStyles.dropdownItemCategory}>
            {item.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#2563EB" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>Current Location</Text>
              <Text style={styles.buildingName}>{buildingName}</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.instructionCard}>
              <MapPin size={32} color="#2563EB" />
              <Text style={styles.instructionTitle}>Set Your Location</Text>
              <Text style={styles.instructionText}>
                Scan a QR code or manually enter your current location to get
                started with navigation.
              </Text>
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleQRScan}
                activeOpacity={0.7}
              >
                <View style={styles.optionIcon}>
                  <QrCode size={24} color="#ffffff" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Scan QR Code</Text>
                  <Text style={styles.optionDescription}>
                    Use your camera to scan a location QR code
                  </Text>
                </View>
                <Camera size={20} color="#6B7280" />
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.manualInputContainer}>
                <Text style={styles.inputLabel}>Manual Input</Text>
                <View style={styles.inputBox}>
                  <Keyboard
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Senate Room 101"
                    value={destination}
                    onChangeText={(text) => {
                      setDestination(text);
                      setShowDropdown(text.length > 0);
                    }}
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setShowDropdown(destination.length > 0)}
                  />
                </View>
                {showDropdown && filteredDestinations.length > 0 && (
                  <View style={destinationInputStyles.dropdown}>
                    <FlatList
                      data={filteredDestinations}
                      renderItem={renderDropdownItem}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                )}
                <Text style={styles.inputHint}>
                  Enter your current room or location within the building
                </Text>
              </View>
            </View>

            {destination.trim() && (
              <View style={styles.locationPreview}>
                <Text style={styles.previewLabel}>Current Location:</Text>
                <Text style={styles.previewLocation}>{destination}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !destination.trim() && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!destination.trim()}
            >
              <Text
                style={[
                  styles.continueButtonText,
                  !destination.trim() && styles.continueButtonTextDisabled,
                ]}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  buildingName: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  instructionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionIcon: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    padding: 12,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  manualInputContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  inputHint: {
    fontSize: 12,
    color: "#6B7280",
  },
  locationPreview: {
    backgroundColor: "#EBF8FF",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E40AF",
    marginBottom: 4,
  },
  previewLocation: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  continueButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  continueButtonTextDisabled: {
    color: "#9CA3AF",
  },
  cameraHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 16,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  scannerText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 24,
    textAlign: "center",
  },
});
