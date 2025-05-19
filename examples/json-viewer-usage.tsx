"use client"

import React from 'react';
import { ChatJsonViewer } from "@/components/chat-json-viewer";
import { InlineJsonViewer } from "@/components/inline-json-viewer";

// Example JSON data with Base64 images
const exampleData = {
  user: {
    name: "John Doe",
    avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    preferences: {
      theme: "dark",
      notifications: true
    }
  },
  images: {
    logo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmAA8A/9k=",
    thumbnail: "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="
  },
  metadata: {
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  }
};

export function JsonViewerExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">JSON Viewer Integration Examples</h2>
      
      {/* Example 1: Button to open JSON viewer */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">1. Modal JSON Viewer</h3>
        <p className="text-muted-foreground">Click the button to open JSON in a modal:</p>
        <ChatJsonViewer
          jsonData={exampleData}
          title="User Profile Data"
          buttonText="View User JSON"
        />
      </div>

      {/* Example 2: Inline JSON viewer with expand option */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">2. Inline JSON Viewer</h3>
        <p className="text-muted-foreground">JSON displayed inline with expand button:</p>
        <InlineJsonViewer
          data={exampleData}
          title="API Response"
          description="Example response from user profile endpoint"
          showViewButton={true}
        />
      </div>

      {/* Example 3: Integration in chat messages */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">3. Chat Message Integration</h3>
        <p className="text-muted-foreground">In actual usage, tool invocations automatically get JSON viewers:</p>
        <div className="bg-muted/30 p-4 rounded-lg">
          <pre className="text-sm">
{`// When a tool returns JSON data, it automatically
// includes a "View in JSON Viewer" button

<ToolInvocation
  toolName="fetchUserData"
  state="result"
  args={{ userId: "123" }}
  result={userProfileJson}
  isLatestMessage={true}
  status="ready"
/>`}
          </pre>
        </div>
      </div>

      {/* Example 4: Direct JSON viewer usage */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">4. Direct JSON Viewer Component</h3>
        <p className="text-muted-foreground">Use the JsonImageViewer directly:</p>
        <div className="h-[400px] border rounded-lg overflow-hidden">
          <JsonImageViewer data={exampleData} className="h-full" />
        </div>
      </div>
    </div>
  );
}