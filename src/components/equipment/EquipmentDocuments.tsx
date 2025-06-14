
import { useRef, useState } from "react";
import { useEquipmentDocuments } from "@/hooks/useEquipmentDocuments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Download, Trash2, FilePlus } from "lucide-react";
import { format } from "date-fns";

type Props = {
  equipmentId: string;
  className?: string;
};

const docTypes = [
  "Insurance Certificate",
  "User Manual",
  "Maintenance Log",
  "Compliance Certificate",
  "Other",
];

const EquipmentDocuments = ({ equipmentId, className }: Props) => {
  const { docs, isLoading, error, uploadDoc, deleteDoc, getDownloadUrl } = useEquipmentDocuments(equipmentId);
  const [selectedDocType, setSelectedDocType] = useState(docTypes[0]);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileRef.current?.files?.[0]) {
      toast.error("Select a file to upload.");
      return;
    }
    setUploading(true);
    uploadDoc.mutate(
      {
        file: fileRef.current.files[0],
        docType: selectedDocType,
        expiryDate: expiryDate || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Document uploaded.");
          setExpiryDate("");
          if (fileRef.current) fileRef.current.value = "";
        },
        onError: (err: any) => {
          toast.error(err.message);
        },
        onSettled: () => setUploading(false),
      }
    );
  };

  const handleDownload = async (file_path: string, file_name: string) => {
    try {
      const url = await getDownloadUrl(file_path);
      const a = document.createElement("a");
      a.href = url;
      a.download = file_name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 1000);
    } catch (e: any) {
      toast.error("Failed to download.");
    }
  };

  const handleDelete = (doc: any) => {
    if (window.confirm("Delete this document?")) {
      deleteDoc.mutate(doc, {
        onSuccess: () => toast.success("Deleted."),
        onError: (err: any) => toast.error(err.message),
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          Equipment Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="mb-5 space-y-2" onSubmit={handleUpload}>
          <div className="flex gap-2">
            <select
              value={selectedDocType}
              onChange={e => setSelectedDocType(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {docTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <Input
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              placeholder="Expiry date (optional)"
              className="w-36"
            />
            <Input
              type="file"
              ref={fileRef}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-auto"
              required
            />
            <Button type="submit" disabled={uploading} size="sm">
              <FilePlus className="w-4 h-4 mr-1" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
        <div>
          {isLoading && "Loading documents..."}
          {error && <div className="text-destructive">{error.message}</div>}
          {!isLoading && (!docs || docs.length === 0) && (
            <div className="text-muted-foreground text-sm">No documents uploaded yet.</div>
          )}
          {docs && docs.length > 0 && (
            <table className="w-full text-sm border divide-y rounded-md">
              <thead>
                <tr>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Uploaded</th>
                  <th className="text-left p-2">Expiry</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc: any) => (
                  <tr key={doc.id}>
                    <td className="p-2">{doc.doc_type}</td>
                    <td className="p-2">{doc.file_name}</td>
                    <td className="p-2">{format(new Date(doc.date_uploaded), "yyyy/MM/dd")}</td>
                    <td className="p-2">
                      {doc.expiry_date
                        ? format(new Date(doc.expiry_date), "yyyy/MM/dd")
                        : <span className="text-muted-foreground">—</span>
                      }
                    </td>
                    <td className="p-2 text-center flex justify-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleDownload(doc.file_path, doc.file_name)} title="Download">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDelete(doc)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  )
};

export default EquipmentDocuments;
