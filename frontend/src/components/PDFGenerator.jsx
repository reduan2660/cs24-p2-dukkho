import React, { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfDocument from "./PDFDocument";
import { ImSpinner5 } from "react-icons/im";

const PdfGenerator = ({ data, oil }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div>
      {isClient && (
        <PDFDownloadLink
          document={<PdfDocument data={data} oil={oil}/>}
          fileName={`trip_report_${data.vehicle?.reg_no}_${data.sts.name}_${data.landfill.name}`}
        >
          {({ loading }) =>
            loading ? (
              <button>
                <ImSpinner5 className="text-white h-5 w-5 animate-spin" />
              </button>
            ) : (
              <button className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white">Download Report</button>
            )
          }
        </PDFDownloadLink>
      )}
    </div>
  );
};

export default PdfGenerator;
