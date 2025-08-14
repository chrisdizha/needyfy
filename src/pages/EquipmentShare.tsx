
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Upload } from 'lucide-react';

const EquipmentShare: React.FC = () => {
  const navigate = useNavigate();
  const [shareData, setShareData] = useState<{
    title?: string;
    text?: string;
    url?: string;
    files?: FileList;
  }>({});

  useEffect(() => {
    // Handle share target data
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    const text = urlParams.get('text');
    const url = urlParams.get('url');

    setShareData({
      title: title || undefined,
      text: text || undefined,
      url: url || undefined,
    });

    // Handle shared files (if any)
    if ('launchQueue' in window) {
      (window as any).launchQueue.setConsumer((launchParams: any) => {
        if (launchParams.files && launchParams.files.length) {
          setShareData(prev => ({
            ...prev,
            files: launchParams.files
          }));
        }
      });
    }
  }, []);

  const handleListEquipment = () => {
    navigate('/list-equipment', { 
      state: { 
        sharedData: shareData 
      } 
    });
  };

  const handleBrowseEquipment = () => {
    navigate('/equipment');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Shared Content Received
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {shareData.title && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Title</h3>
                <p className="mt-1">{shareData.title}</p>
              </div>
            )}
            
            {shareData.text && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                <p className="mt-1">{shareData.text}</p>
              </div>
            )}
            
            {shareData.url && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Link</h3>
                <p className="mt-1 text-blue-600 hover:underline">
                  <a href={shareData.url} target="_blank" rel="noopener noreferrer">
                    {shareData.url}
                  </a>
                </p>
              </div>
            )}
            
            {shareData.files && shareData.files.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Files</h3>
                <div className="mt-1 space-y-1">
                  {Array.from(shareData.files).map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Upload className="h-4 w-4" />
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleListEquipment} className="flex-1">
                List Equipment
              </Button>
              <Button variant="outline" onClick={handleBrowseEquipment} className="flex-1">
                Browse Equipment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EquipmentShare;
