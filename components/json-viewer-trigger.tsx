"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { JsonViewerModal } from "@/components/json-viewer-modal";
import { FileJson2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonViewerTriggerProps {
  data: any;
  title?: string;
  description?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function JsonViewerTrigger({
  data,
  title = "JSON Viewer",
  description = "View data in JSON format with image preview",
  variant = "outline",
  size = "sm",
  className,
  side = "right",
  icon = <FileJson2 className="h-4 w-4" />,
  children
}: JsonViewerTriggerProps) {
  return (
    <JsonViewerModal
      jsonData={data}
      title={title}
      description={description}
      side={side}
      trigger={
        <Button 
          variant={variant} 
          size={size} 
          className={cn("gap-2", className)}
        >
          {icon}
          {children || "View JSON"}
        </Button>
      }
    />
  );
}

// Compact icon-only version
export function JsonViewerIconTrigger({
  data,
  title = "JSON Viewer",
  description,
  className,
  side = "right"
}: Omit<JsonViewerTriggerProps, 'children' | 'icon'>) {
  return (
    <JsonViewerModal
      jsonData={data}
      title={title}
      description={description}
      side={side}
      trigger={
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-8 w-8", className)}
          title="View in JSON Viewer"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      }
    />
  );
}