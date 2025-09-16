import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MapPin, Navigation, Keyboard } from "lucide-react-native";
import axios from "axios";
import { debounce } from "lodash";

export default function DestinationInputScreen() {
  const { currentLocation } = useLocalSearchParams<{
    currentLocation: string;
  }>();

  const [destination, setDestination] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputHelperText, setInputHelperText] = useState(
    "Start typing to see suggestions or enter the room number/location name"
  );
  const [locSearchQuery, setLocSearchQuery] = useState("");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  const handleSelectDestination = (destinationName: string) => {
    setDestination(destinationName);
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

  const handleStartNavigation = () => {
    if (!destination.trim()) {
      Alert.alert("Destination Required", "Please enter your destination.");
      return;
    }

    router.push({
      pathname: "/navigation",
      params: {
        currentLocation,
        destination: destination.trim(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
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
              <Text style={styles.title}>Set Destination</Text>
              <Text style={styles.buildingName}>{destination}</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.currentLocationCard}>
              <View style={styles.locationHeader}>
                <MapPin size={20} color="#10B981" />
                <Text style={styles.locationLabel}>Current Location</Text>
              </View>
              <Text style={styles.locationText}>{currentLocation}</Text>
            </View>

            <View style={styles.destinationCard}>
              <View style={styles.destinationHeader}>
                <Navigation size={32} color="#2563EB" />
                <Text style={styles.destinationTitle}>
                  Where do you want to go?
                </Text>
              </View>

              <Text style={styles.destinationDescription}>
                Enter your destination within {"the Senate building"}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Destination</Text>
                <View style={styles.searchContainer}>
                  <View style={styles.inputBox}>
                    <Keyboard
                      size={20}
                      color="#6B7280"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g., SN401"
                      value={locSearchQuery}
                      onChangeText={handleChange}
                      placeholderTextColor="#9CA3AF"
                      autoFocus={true}
                    />
                  </View>

                  {showDropdown && locationOptions.length > 0 && (
                    <View style={styles.dropdown}>
                      <ScrollView
                        style={{ maxHeight: 200 }}
                        showsVerticalScrollIndicator={true}
                      >
                        {locationOptions.map((item, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => {
                              handleSelectDestination(item);
                              setLocSearchQuery(item);
                              setShowDropdown(false);
                            }}
                          >
                            <View style={styles.dropdownItemContent}>
                              <MapPin size={16} color="#6B7280" />
                              <View style={styles.dropdownItemText}>
                                <Text style={styles.dropdownItemName}>
                                  {item}
                                </Text>
                                <Text style={styles.dropdownItemCategory}>
                                  {item}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <Text style={styles.inputHint}>{inputHelperText}</Text>
              </View>

              <View style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>Popular destinations:</Text>
                <View style={styles.exampleList}>
                  <TouchableOpacity
                    style={styles.exampleItem}
                    onPress={() => handleSelectDestination("Senate Room 401")}
                  >
                    <Text style={styles.exampleText}>Senate Room 401</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.exampleItem}
                    onPress={() => handleSelectDestination("Library")}
                  >
                    <Text style={styles.exampleText}>Library</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.exampleItem}
                    onPress={() => handleSelectDestination("Cafeteria")}
                  >
                    <Text style={styles.exampleText}>Cafeteria</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.navigateButton,
                !destination.trim() && styles.navigateButtonDisabled,
              ]}
              onPress={handleStartNavigation}
              disabled={!destination.trim()}
            >
              <Navigation
                size={20}
                color={destination.trim() ? "#ffffff" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.navigateButtonText,
                  !destination.trim() && styles.navigateButtonTextDisabled,
                ]}
              >
                Start Navigation
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
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
  currentLocationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#10B981",
    marginLeft: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  destinationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  destinationHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  destinationTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 12,
    textAlign: "center",
  },
  destinationDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  searchContainer: {
    position: "relative",
    zIndex: 1000,
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
  inputBoxWithDropdown: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: "transparent",
    marginBottom: 0,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  dropdown: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 200,
    marginBottom: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemSelected: {
    backgroundColor: "#EBF8FF",
  },
  dropdownItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownItemText: {
    marginLeft: 8,
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  dropdownItemCategory: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  inputHint: {
    fontSize: 12,
    color: "#6B7280",
  },
  exampleContainer: {
    marginTop: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 12,
  },
  exampleList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  exampleItem: {
    backgroundColor: "#EBF8FF",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  navigateButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  navigateButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  navigateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
  navigateButtonTextDisabled: {
    color: "#9CA3AF",
  },
});
