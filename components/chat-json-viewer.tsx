"use client"

import React from 'react';
import { JsonViewerModal } from "@/components/json-viewer-modal";
import { Button } from "@/components/ui/button";
import { FileJson2 } from "lucide-react";

interface ChatJsonViewerProps {
  jsonData: any;
  title?: string;
  buttonText?: string;
}

export function ChatJsonViewer({
  jsonData,
  title = "JSON Data Viewer",
  buttonText = "View JSON"
}: ChatJsonViewerProps) {
  // Parse JSON if it's a string
  const parsedData = React.useMemo(() => {
    if (typeof jsonData === 'string') {
      try {
        return JSON.parse(jsonData);
      } catch (e) {
        return { error: 'Invalid JSON', raw: jsonData };
      }
    }
    return jsonData;
  }, [jsonData]);

  return (
    <JsonViewerModal
      jsonData={parsedData}
      title={title}
      trigger={
        <Button variant="outline" size="sm" className="gap-2">
          <FileJson2 className="h-4 w-4" />
          {buttonText}
        </Button>
      }
    />
  );
}