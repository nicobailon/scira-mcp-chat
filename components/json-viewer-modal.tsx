"use client"

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { JsonImageViewer } from "@/components/json-image-viewer";
import { TabbedJsonViewer } from "@/components/tabbed-json-viewer";

interface TabData {
  label: string;
  data: any;
  description?: string;
}

interface JsonViewerModalProps {
  jsonData?: any;
  tabs?: TabData[];
  defaultTab?: string;
  title?: string;
  description?: string;
  trigger: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function JsonViewerModal({
  jsonData,
  tabs,
  defaultTab,
  title = "JSON Viewer",
  description = "Explore JSON data with image preview",
  trigger,
  side = "right"
}: JsonViewerModalProps) {
  // Validation: either jsonData or tabs must be provided
  if (!jsonData && (!tabs || tabs.length === 0)) {
    console.warn("JsonViewerModal: Either jsonData or tabs must be provided");
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent 
        side={side} 
        className="w-full sm:max-w-[80vw] lg:max-w-[1200px] p-0"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="h-[calc(100vh-120px)] overflow-hidden">
          {tabs ? (
            <TabbedJsonViewer tabs={tabs} defaultTab={defaultTab} className="h-full" />
          ) : (
            <JsonImageViewer data={jsonData} className="h-full" />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}