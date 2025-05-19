"use client"

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonImageViewer } from "@/components/json-image-viewer";
import { cn } from "@/lib/utils";

interface TabData {
  label: string;
  data: any;
  description?: string;
}

interface TabbedJsonViewerProps {
  tabs: TabData[];
  defaultTab?: string;
  className?: string;
}

export function TabbedJsonViewer({ tabs, defaultTab, className }: TabbedJsonViewerProps) {
  // Handle empty tabs array
  if (!tabs || tabs.length === 0) {
    return <JsonImageViewer data={{ error: "No data provided" }} className={className} />;
  }

  // If only one tab, render without tabs interface
  if (tabs.length === 1) {
    return <JsonImageViewer data={tabs[0].data} className={className} />;
  }

  // Use the first tab's label as default if not specified
  const defaultValue = defaultTab || tabs[0].label;

  return (
    <Tabs defaultValue={defaultValue} className={cn("w-full h-full flex flex-col", className)}>
      <TabsList className="w-full justify-start mb-2">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.label} value={tab.label} className="flex-none">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent 
          key={tab.label} 
          value={tab.label} 
          className="flex-1 mt-0"
        >
          {tab.description && (
            <div className="text-sm text-muted-foreground mb-2 px-1">
              {tab.description}
            </div>
          )}
          <JsonImageViewer data={tab.data} className="h-full" />
        </TabsContent>
      ))}
    </Tabs>
  );
}