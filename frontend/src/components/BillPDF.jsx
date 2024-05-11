import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

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

function BillPDF({ data, date }) {
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
        <Text style={styles.date}>
          Date of Report: {new Date(date * 1000).toLocaleDateString()}
        </Text>
        <View style={styles.section}>
          <Text style={styles.title}>Daily Report</Text>
        </View>

        {/* Profit Information */}
        {data.profit && data.profit?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Profit</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Contractor ID</Text>
                <Text style={styles.tableHeader}>Contractor Name</Text>
                <Text style={styles.tableHeader}>Amount</Text>
              </View>
              {data.profit?.map((profit, i) => {
                return (
                  <View style={styles.tableRow} key={i}>
                    <Text style={styles.tableCell}>{profit?.contract?.id}</Text>
                    <Text style={styles.tableCell}>
                      {profit?.contract?.name}
                    </Text>
                    <Text style={styles.tableCell}>
                      {parseFloat(profit.profit).toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Deficit Information */}
        {data.deficit && data.deficit?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Deficit</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Contractor ID</Text>
                <Text style={styles.tableHeader}>Contractor Name</Text>
                <Text style={styles.tableHeader}>Amount</Text>
              </View>
              {data.deficit?.map((deficit, i) => {
                return (
                  <View style={styles.tableRow} key={i}>
                    <Text style={styles.tableCell}>
                      {deficit?.contract?.id}
                    </Text>
                    <Text style={styles.tableCell}>
                      {deficit?.contract?.name}
                    </Text>
                    <Text style={styles.tableCell}>
                      {parseFloat(deficit.deficit).toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

export default BillPDF;
