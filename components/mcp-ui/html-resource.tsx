"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { HtmlResource as MCPHtmlResource } from "@mcp-ui/client";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon, ExpandIcon, LoaderIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMCPUI } from "@/lib/context/mcp-ui-context";

interface HtmlResourceBlockProps {
  resource: {
    uri: string;
    mimeType: "text/html";
    text?: string;
    blob?: string;
  };
  isInteractive?: boolean;
  className?: string;
  maxHeight?: number;
}

const HtmlResourceBlock: React.FC<HtmlResourceBlockProps> = ({
  resource,
  isInteractive = true,
  className,
  maxHeight = 400,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Get UI action executor from context
  const { executeUIAction } = useMCPUI();

  // Determine if this is a self-contained HTML (ui://) or external app (ui-app://)
  const isExternalApp = resource.uri.startsWith("ui-app://");
  const isSelfContained = resource.uri.startsWith("ui://");

  // Handle UI actions from the iframe
  const handleUiAction = useCallback(async (tool: string, params: any) => {
    console.log("UI Action received:", { tool, params });
    
    try {
      // Use the context to execute the UI action
      const result = await executeUIAction(tool, params);
      return { status: "ok", result };
    } catch (error) {
      console.error("Error executing UI action:", error);
      return { status: "error", error: error instanceof Error ? error.message : String(error) };
    }
  }, [executeUIAction]);

  // Already defined above, removed duplicate

  const resourceDisplay = (
    <div className={cn("relative border rounded-lg overflow-hidden bg-background", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderIcon className="h-4 w-4 animate-spin" />
            Loading content...
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-4 text-center text-sm text-destructive">
          <p>{error}</p>
          <p className="text-xs text-muted-foreground mt-1">
            URI: {resource.uri}
          </p>
        </div>
      )}
      
      {resource && (
        <div className={cn(
          "w-full h-full",
          !isExpanded && maxHeight && `max-h-[${maxHeight}px]`
        )}>
          <MCPHtmlResource
            resource={resource}
            onUiAction={handleUiAction}
          />
        </div>
      )}
      
      {/* Resource info header */}
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground border">
        {isExternalApp && <ExternalLinkIcon className="h-3 w-3" />}
        <span className="font-mono">
          {isExternalApp ? "ui-app://" : "ui://"}
        </span>
      </div>
    </div>
  );

  // For expandable view
  if (isInteractive && maxHeight) {
    return (
      <div className="space-y-2">
        <div style={{ height: `${maxHeight}px` }}>
          {resourceDisplay}
        </div>
        
        <div className="flex justify-center">
          <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3">
                <ExpandIcon className="h-3 w-3 mr-1" />
                Expand
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
              <DialogHeader className="px-4 py-3 border-b">
                <DialogTitle className="text-sm font-mono">
                  {resource.uri}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                <MCPHtmlResource
                  resource={resource}
                  onUiAction={handleUiAction}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return resourceDisplay;
};

export { HtmlResourceBlock };