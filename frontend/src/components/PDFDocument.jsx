import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  gridContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  gridItem: {
    width: "48%", // Adjust as needed
  },
  text: {
    fontSize: 12,
    color: "#333",
  },
  date: {
    position: "absolute",
    top: 20,
    right: 40,
    fontSize: 10,
    color: "#333",
  },
});

function PdfDocument({ data }) {
  const { vehicle, sts, landfill, status } = data;
  const reportDate = new Date(
    data.landfill_arrival_time * 1000,
  ).toLocaleString();

  const formatCapacity = (capacity) => {
    return `${capacity} Ton`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.date}>Date of Report: {reportDate}</Text>
        <View style={styles.section}>
          <Text style={styles.title}>Trip Report</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Assigned Vehicle Information</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.text}>Registration No:</Text>
              <Text style={styles.text}>Vehicle Type:</Text>
              <Text style={styles.text}>Capacity:</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.text}>{vehicle.reg_no}</Text>
              <Text style={styles.text}>{vehicle.vtype}</Text>
              <Text style={styles.text}>
                {formatCapacity(vehicle.capacity)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Associated STS Information</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.text}>Name:</Text>
              <Text style={styles.text}>Ward No:</Text>
              <Text style={styles.text}>Latitude:</Text>
              <Text style={styles.text}>Longitude:</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.text}>{sts.name}</Text>
              <Text style={styles.text}>{sts.ward_no}</Text>
              <Text style={styles.text}>{sts.latitude}</Text>
              <Text style={styles.text}>{sts.longitude}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Associated Landfill Information</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.text}>Name:</Text>
              <Text style={styles.text}>Capacity:</Text>
              <Text style={styles.text}>Current Capacity:</Text>
              <Text style={styles.text}>Latitude:</Text>
              <Text style={styles.text}>Longitude:</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.text}>{landfill.name}</Text>
              <Text style={styles.text}>
                {formatCapacity(landfill.capacity)}
              </Text>
              <Text style={styles.text}>
                {formatCapacity(landfill.current_capacity)}
              </Text>
              <Text style={styles.text}>{landfill.latitude}</Text>
              <Text style={styles.text}>{landfill.longitude}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Transfer Details</Text>
          <Text style={styles.text}>
            Weight at STS: {data.sts_departure_weight} Ton
          </Text>
          <Text style={styles.text}>
            Waste Disposed at Landfill: {data.landfill_arrival_weight} Ton
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default PdfDocument;
