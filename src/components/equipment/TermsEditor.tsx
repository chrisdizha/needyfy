
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';

const LEGAL_TIPS = [
  "Be specific about return times, deposit amounts, and what is considered acceptable use.",
  "Clearly outline penalty fees for late return, loss, or damage.",
  "If unsure, consult legal counsel or use one of our standard templates for protection.",
];

type TermsEditorProps = {
  value: string;
  onChange: (terms: string) => void;
  versionHistory: string[];
  onSaveVersion: (terms: string) => void;
};

const TermsEditor = ({
  value,
  onChange,
  versionHistory,
  onSaveVersion,
}: TermsEditorProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['terms-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('terms_templates')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-1">
        <Button type="button" size="sm" variant="outline" onClick={() => setShowTemplates(true)}>
          Choose Template
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setShowGuide(true)}>
          Legal Tips
        </Button>
        <Button type="button" size="sm" variant="link" onClick={() => setShowPreview(true)}>
          Preview
        </Button>
        <Button type="button" size="sm" variant="ghost"
          onClick={() => onSaveVersion(value)} disabled={!value}>
          Save as New Version
        </Button>
      </div>

      <Textarea
        id="terms"
        name="terms"
        rows={6}
        value={value}
        placeholder="Write or edit your rental terms and policies here..."
        onChange={(e) => onChange(e.target.value)}
        required
      />

      <div className="text-xs text-muted-foreground mt-1">
        You can use a template and edit to fit your rental.
      </div>

      {/* Template Library */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Templates Library</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {templatesLoading ? (
              <div className="text-center py-4">Loading templates...</div>
            ) : templates && templates.length > 0 ? (
              templates.map((template) => (
                <div key={template.id} className="border rounded p-2 bg-gray-50 flex flex-col gap-1">
                  <div className="font-semibold flex items-center gap-2">
                    {template.name}
                    {template.is_default && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Category: {template.category}</div>
                  <div className="whitespace-pre-wrap text-xs text-gray-700 max-h-20 overflow-y-auto">
                    {template.template_content}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1 self-end"
                    onClick={() => {
                      onChange(template.template_content);
                      setShowTemplates(false);
                    }}
                  >
                    Use this template
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No templates available. Contact support to add templates.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Legal Guidance */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Legal Tips & Guidance</DialogTitle>
          </DialogHeader>
          <ul className="list-disc pl-6 space-y-1 text-sm text-gray-800">
            {LEGAL_TIPS.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
          <div className="mt-3 text-xs text-gray-400">
            These are informational suggestions and not legal advice.
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms Preview</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-50 border rounded p-3 whitespace-pre-wrap text-sm max-h-[300px] overflow-y-auto">
            {value || <span className="text-gray-400">No terms entered.</span>}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version history */}
      {versionHistory.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-semibold text-gray-700 mb-1">Version History</div>
          <div className="flex flex-col gap-2">
            {versionHistory.map((ver, idx) => (
              <div key={idx} className="border rounded p-2 text-xs bg-gray-100 flex justify-between items-center">
                <div className="whitespace-pre-wrap">{ver.substring(0, 110)}{ver.length > 110 ? "..." : ""}</div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onChange(ver)}
                  className="ml-2"
                >
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsEditor;
