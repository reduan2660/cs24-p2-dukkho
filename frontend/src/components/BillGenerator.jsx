import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BillPDF from "./BillPDF";
import { ImSpinner5 } from "react-icons/im";

const BillGenerator = ({ data, date }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      {isClient && (
        <PDFDownloadLink
          document={<BillPDF data={data} date={date}/>}
          fileName={`report_${date}`}
        >
          {({ loading }) =>
            loading ? (
              <button>
                <ImSpinner5 className="h-5 w-5 animate-spin text-white" />
              </button>
            ) : (
              <button className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white">
                Download Report
              </button>
            )
          }
        </PDFDownloadLink>
      )}
    </div>
  );
};

export default BillGenerator;
