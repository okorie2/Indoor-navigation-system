import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Search, MapPin, ChevronRight } from "lucide-react-native";

interface Building {
  id: string;
  name: string;
  address: string;
  floors: number;
}

const mockBuildings: Building[] = [
  {
    id: "1",
    name: "University of Northampton - Waterside Campus",
    address: "University Drive, Northampton NN1 5PH",
    floors: 4,
  },
  {
    id: "2",
    name: "University of Northampton - Avenue Campus",
    address: "St George's Avenue, Northampton NN2 6JD",
    floors: 3,
  },
  {
    id: "3",
    name: "University of Northampton - Park Campus",
    address: "Boughton Green Road, Northampton NN2 7AL",
    floors: 5,
  },
  {
    id: "4",
    name: "Northampton General Hospital",
    address: "Cliftonville, Northampton NN1 5BD",
    floors: 8,
  },
  {
    id: "5",
    name: "Northampton Town Centre",
    address: "Market Square, Northampton NN1 2DP",
    floors: 2,
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBuildings, setFilteredBuildings] = useState(mockBuildings);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockBuildings.filter(
      (building) =>
        building.name.toLowerCase().includes(query.toLowerCase()) ||
        building.address.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBuildings(filtered);
  };

  const handleBuildingSelect = (building: Building) => {
    router.push({
      pathname: "/location-input",
      params: { buildingId: building.id, buildingName: building.name },
    });
  };

  const renderBuildingItem = ({ item }: { item: Building }) => (
    <TouchableOpacity
      style={styles.buildingCard}
      onPress={() => handleBuildingSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.buildingInfo}>
        <View style={styles.buildingHeader}>
          <MapPin size={20} color="#2563EB" />
          <Text style={styles.buildingName}>{item.name}</Text>
        </View>
        <Text style={styles.buildingAddress}>{item.address}</Text>
        <Text style={styles.buildingFloors}>{item.floors} floors</Text>
      </View>
      <ChevronRight size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Indoor Navigation</Text>
        <Text style={styles.subtitle}>
          Search for a building to get started
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search buildings..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          {searchQuery ? `Results for "${searchQuery}"` : "Available Buildings"}
        </Text>
        <FlatList
          data={filteredBuildings}
          renderItem={renderBuildingItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  buildingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buildingInfo: {
    flex: 1,
  },
  buildingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  buildingAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    lineHeight: 20,
  },
  buildingFloors: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
  },
});
