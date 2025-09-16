import React, { useState } from "react";
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
} from "react-native";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  QrCode,
  MapPin,
  ArrowLeft,
  Keyboard,
  Camera,
} from "lucide-react-native";
import { styles as destinationInputStyles } from "./destination-input";
import axios from "axios";
import debounce from "lodash/debounce";

export default function LocationInputScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const [showDropdown, setShowDropdown] = useState(false);
  const [locSearchQuery, setLocSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [inputHelperText, setInputHelperText] = useState(
    "Enter your current room or location within the building"
  );

  const handleSelectLocation = (destinationName: string) => {
    setUserLocation(destinationName);
    setShowDropdown(false);
  };

  const handleNodeSearch = async (query: string) => {
    setInputHelperText("Searching...");
    try {
      const response = await axios.get(
        "https://7379110492f9.ngrok-free.app/searchNodes",
        {
          params: { query },
        }
      );

      setLocationOptions(response.data.nodes || []);
      setShowDropdown(true);
      if (!response.data.nodes) {
        setInputHelperText(response.data.message || "No locations found");
      } else {
        setInputHelperText("");
      }
    } catch (error: any) {
      console.error("Error fetching nodes:", error);
      setInputHelperText(error.message || "Error fetching locations");
    }
  };

  // wrap it with debounce so it only fires after user stops typing
  const debouncedSearch = React.useCallback(
    debounce((q) => handleNodeSearch(q), 500), // 500ms delay
    []
  );

  // handler for input change
  const handleChange = (value: string) => {
    setLocSearchQuery(value);
    debouncedSearch(value);
  };

  //debounce handleNodeSearch using lodash deboucne

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
    setUserLocation(data);
    setShowCamera(false);
  };

  const handleContinue = () => {
    if (!userLocation.trim()) {
      Alert.alert(
        "Location Required",
        "Please scan a QR code or enter your current location manually."
      );
      return;
    }

    router.push({
      pathname: "/destination-input",
      params: {
        currentLocation: userLocation.trim(),
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
              <Text style={styles.buildingName}>{userLocation}</Text>
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
                    placeholder="e.g., SN201"
                    value={locSearchQuery}
                    onChangeText={handleChange}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {showDropdown && locationOptions.length > 0 && (
                  <View style={destinationInputStyles.dropdown}>
                    <ScrollView
                      style={{ maxHeight: 200 }}
                      showsVerticalScrollIndicator={true}
                    >
                      {locationOptions.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          style={destinationInputStyles.dropdownItem}
                          onPress={() => {
                            handleSelectLocation(item);
                            setLocSearchQuery("");
                            setShowDropdown(false);
                          }}
                        >
                          <View
                            style={destinationInputStyles.dropdownItemContent}
                          >
                            <MapPin size={16} color="#6B7280" />
                            <View
                              style={destinationInputStyles.dropdownItemText}
                            >
                              <Text
                                style={destinationInputStyles.dropdownItemName}
                              >
                                {item}
                              </Text>
                              <Text
                                style={
                                  destinationInputStyles.dropdownItemCategory
                                }
                              >
                                {item}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                <Text style={styles.inputHint}>{inputHelperText}</Text>
              </View>
            </View>

            {userLocation.trim() && (
              <View style={styles.locationPreview}>
                <Text style={styles.previewLabel}>Current Location:</Text>
                <Text style={styles.previewLocation}>{userLocation}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !userLocation.trim() && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!userLocation.trim()}
            >
              <Text
                style={[
                  styles.continueButtonText,
                  !userLocation.trim() && styles.continueButtonTextDisabled,
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
