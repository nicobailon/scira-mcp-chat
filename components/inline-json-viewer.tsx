"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonImageViewer } from "@/components/json-image-viewer";
import { ChatJsonViewer } from "./chat-json-viewer";
import { FileJson2 } from "lucide-react";

interface InlineJsonViewerProps {
  data: any;
  title?: string;
  description?: string;
  showViewButton?: boolean;
  className?: string;
}

export function InlineJsonViewer({
  data,
  title = "JSON Data",
  description,
  showViewButton = true,
  className
}: InlineJsonViewerProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          {showViewButton && (
            <ChatJsonViewer
              jsonData={data}
              title={title}
              buttonText="Expand View"
            />
          )}
        </div>
        {description && (
          <CardDescription className="mt-1.5">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[400px] overflow-hidden rounded-md border">
          <JsonImageViewer data={data} className="h-full" />
        </div>
      </CardContent>
    </Card>
  );
}