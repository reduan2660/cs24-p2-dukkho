import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import api from "../api";
import { BiSolidLeaf } from "react-icons/bi";

const styles = StyleSheet.create({
  page: {
    paddingTop: 20, // Reduced from 40
    paddingHorizontal: 40,
    paddingBottom: 40, // Reduced from 60
  },
  section: {
    marginBottom: 15, // Reduced from 20
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
    fontWeight: "black",
    marginBottom: 8, // Reduced from 10
    textAlign: "center",
  },
  table: {
    width: "100%",
    marginBottom: 8, // Reduced from 10
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  tableHeader: {
    backgroundColor: "lightgray",
    borderStyle: "solid",
    borderColor: "#333",
    borderWidth: 1,
    padding: 5,
    flex: 1,
    fontSize: 10,
    textAlign: "center",
  },
  tableCell: {
    borderStyle: "solid",
    borderColor: "#333",
    borderWidth: 1,
    padding: 5,
    flex: 1,
    fontSize: 10,
    textAlign: "center",
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
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3, // Reduced from 10
  },
  gridCell: {
    width: "48%",
    marginBottom: 8, // Reduced from 10
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: "black",
    color: "#333",
    marginBottom: 4, // Reduced from 5
  },
  gridText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 10, // Reduced from 15
  },
});

function PdfDocument({ data, oil }) {
  const { vehicle, sts, landfill, status } = data;
  const reportDate = new Date(
    data.landfill_arrival_time * 1000,
  ).toLocaleString();

  const formatCapacity = (capacity) => {
    return `${capacity} Ton`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text
          style={{
            position: "absolute",
            top: 20,
            left: 40,
            fontSize: 15,
          }}
        >
          EcoSync
        </Text>
        <Text style={styles.date}>Date of Report: {reportDate}</Text>
        <View style={styles.section}>
          <Text style={styles.title}>Trip Report</Text>
        </View>

        {/* Assigned Vehicle Information */}
        <View style={styles.section}>
          <Text style={styles.label}>Assigned Vehicle Information</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Registration No</Text>
              <Text style={styles.tableHeader}>Vehicle Type</Text>
              <Text style={styles.tableHeader}>Capacity</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{vehicle.reg_no}</Text>
              <Text style={styles.tableCell}>{vehicle.vtype}</Text>
              <Text style={styles.tableCell}>
                {formatCapacity(vehicle.capacity)}
              </Text>
            </View>
          </View>
        </View>

        {/* Associated STS Information */}
        <View style={styles.section}>
          <Text style={styles.label}>Associated STS Information</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Name</Text>
              <Text style={styles.tableHeader}>Ward No</Text>
              <Text style={styles.tableHeader}>Latitude</Text>
              <Text style={styles.tableHeader}>Longitude</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{sts.name}</Text>
              <Text style={styles.tableCell}>{sts.ward_no}</Text>
              <Text style={styles.tableCell}>{sts.latitude}</Text>
              <Text style={styles.tableCell}>{sts.longitude}</Text>
            </View>
          </View>
        </View>

        {/* Associated Landfill Information */}
        <View style={styles.section}>
          <Text style={styles.label}>Associated Landfill Information</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Name</Text>
              <Text style={styles.tableHeader}>Capacity</Text>
              <Text style={styles.tableHeader}>Current Capacity</Text>
              <Text style={styles.tableHeader}>Latitude</Text>
              <Text style={styles.tableHeader}>Longitude</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{landfill.name}</Text>
              <Text style={styles.tableCell}>
                {formatCapacity(landfill.capacity)}
              </Text>
              <Text style={styles.tableCell}>
                {formatCapacity(landfill.current_capacity)}
              </Text>
              <Text style={styles.tableCell}>{landfill.latitude}</Text>
              <Text style={styles.tableCell}>{landfill.longitude}</Text>
            </View>
          </View>
        </View>

        {/* Waste Disposal Details */}
        <View style={styles.section}>
          <Text style={styles.label}>Waste Disposal Details</Text>
          <View style={styles.gridContainer}>
            {/* First column */}
            <View style={styles.gridCell}>
              <Text style={styles.gridTitle}>STS Departure Time</Text>
              <Text style={styles.gridText}>
                {formatTimestamp(data.sts_departure_time)}
              </Text>
              <Text style={styles.gridTitle}>Landfill Arrival Time</Text>
              <Text style={styles.gridText}>
                {formatTimestamp(data.landfill_arrival_time)}
              </Text>
              <Text style={styles.gridTitle}>Waste taken from STS</Text>
              <Text style={styles.gridText}>
                {data.sts_departure_weight} Tonnes
              </Text>
            </View>
            {/* Second column */}
            <View style={styles.gridCell}>
              <Text style={styles.gridTitle}>Landfill Departure Time</Text>
              <Text style={styles.gridText}>
                {formatTimestamp(data.landfill_departure_time)}
              </Text>
              <Text style={styles.gridTitle}>STS Arrival Time</Text>
              <Text style={styles.gridText}>
                {formatTimestamp(data.sts_arrival_time)}
              </Text>
              <Text style={styles.gridTitle}>Waste disposed at Landfill</Text>
              <Text style={styles.gridText}>
                {data.landfill_arrival_weight} Tonnes
              </Text>
            </View>
          </View>
        </View>

        {/* Oil Consumption Details */}
        {/* {oil && (
          <View style={styles.section}>
            <Text style={styles.label}>Oil Consumption Details</Text>
            <View style={styles.gridContainer}>
              <View style={styles.gridCell}>
                <Text style={styles.gridTitle}>STS to Landfill</Text>
                <Text style={styles.gridText}>{oil.to_landfill} Liters</Text>
                <Text style={styles.gridTitle}>Total Consumption</Text>
                <Text style={styles.gridText}>{oil.round_trip} Liters</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.gridTitle}>Landfill to STS</Text>
                <Text style={styles.gridText}>{oil.from_landfill} Liters</Text>
                <Text style={styles.gridTitle}>Total Distance</Text>
                <Text style={styles.gridText}>{oil.distance} Kilometers</Text>
              </View>
            </View>
          </View>
        )} */}

        {/* Transfer Summary */}
        <View>
          <Text style={styles.label}>Transfer Summary</Text>
          <View style={styles.gridContainer}>
            {/* First column */}
            <View style={{ width: "48%" }}>
              <Text style={styles.gridTitle}>STS</Text>
              <Text style={styles.gridText}>{sts.name}</Text>
              <Text style={styles.gridTitle}>Vehicle Number</Text>
              <Text style={styles.gridText}>{vehicle.reg_no}</Text>
              <Text style={styles.gridTitle}>Waste taken from STS</Text>
              <Text style={styles.gridText}>
                {data.sts_departure_weight} Tonnes
              </Text>
            </View>
            {/* Second column */}
            <View style={{ width: "48%" }}>
              <Text style={styles.gridTitle}>Landfill</Text>
              <Text style={styles.gridText}>{landfill.name}</Text>
              <Text style={styles.gridTitle}>Oil Consumption</Text>
              <Text style={styles.gridText}>{data.oil} Liters</Text>
              <Text style={styles.gridTitle}>Waste disposed at Landfill</Text>
              <Text style={styles.gridText}>
                {data.landfill_arrival_weight} Tonnes
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default PdfDocument;
