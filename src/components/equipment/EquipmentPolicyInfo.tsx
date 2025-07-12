
import { FileText } from "lucide-react";

const INSURANCE_TEXT = "Basic insurance included: Covers accidental damage up to USD$2,000 per booking (deductible may apply). Coverage will increase to USD$10,000 with time.";
const LATE_FEES_TEXT = "Late return penalty: ₱250 per hour for the first 4 hours, then ₱1,000 per extra day. Strictly enforced.";
const CANCELLATION_TEXT = "Cancellation policy: See details below. Standardized templates available—customize as needed before listing.";

const EquipmentPolicyInfo = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3 text-sm">
    <FileText className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
    <div>
      <div className="mb-1"><span className="font-semibold">Insurance:</span> {INSURANCE_TEXT}</div>
      <div className="mb-1"><span className="font-semibold">Late Fees:</span> {LATE_FEES_TEXT}</div>
      <div className="mb-0"><span className="font-semibold">Cancellation Policy:</span> {CANCELLATION_TEXT}</div>
    </div>
  </div>
);

export default EquipmentPolicyInfo;
