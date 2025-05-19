"use client"

import React from 'react';
import { ChatCommandHandler } from '@/components/chat-command-handler';

// Example usage of the JSON viewer commands in the chat interface

export function ChatCommandUsageExamples() {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Chat Command Usage Examples</h2>
      
      {/* Example 1: Show help */}
      <div>
        <h3 className="font-semibold mb-2">Example 1: Get help for commands</h3>
        <ChatCommandHandler message="/json_view" />
      </div>
      
      {/* Example 2: Single JSON view */}
      <div>
        <h3 className="font-semibold mb-2">Example 2: View single JSON data</h3>
        <ChatCommandHandler 
          message={`/json_view { "user": { "name": "Alice", "email": "alice@example.com", "roles": ["admin", "user"] } }`} 
        />
      </div>
      
      {/* Example 3: Tabbed JSON view */}
      <div>
        <h3 className="font-semibold mb-2">Example 3: View multiple JSON datasets in tabs</h3>
        <ChatCommandHandler 
          message={`/json_view_tabs { 
            "tabs": [
              {
                "label": "User Profile", 
                "data": {
                  "name": "Alice",
                  "email": "alice@example.com",
                  "joined": "2024-01-01"
                },
                "description": "User account information"
              },
              {
                "label": "Settings",
                "data": {
                  "theme": "dark",
                  "notifications": true,
                  "language": "en"
                },
                "description": "User preferences"
              },
              {
                "label": "Activity",
                "data": {
                  "lastLogin": "2024-12-20T10:30:00Z",
                  "totalPosts": 156,
                  "followers": 1230
                }
              }
            ]
          }`}
        />
      </div>
      
      {/* Example 4: Error handling */}
      <div>
        <h3 className="font-semibold mb-2">Example 4: Invalid JSON</h3>
        <ChatCommandHandler message='/json_view { invalid json }' />
      </div>
      
      {/* Example 5: Invalid tabs format */}
      <div>
        <h3 className="font-semibold mb-2">Example 5: Invalid tabs format</h3>
        <ChatCommandHandler message='/json_view_tabs { "data": "not tabs" }' />
      </div>
    </div>
  );
}

// Example of how to integrate with the chat component
export function ChatWithCommands() {
  return (
    <div className="w-full">
      <p className="mb-4 text-sm text-muted-foreground">
        Type commands in the chat input. Available commands:
      </p>
      <ul className="list-disc pl-5 mb-4 text-sm">
        <li><code>/json_view</code> - Show help for JSON viewer commands</li>
        <li><code>/json_view &lt;json&gt;</code> - Display JSON data in a modal viewer</li>
        <li><code>/json_view_tabs &lt;tabs_json&gt;</code> - Display multiple JSON datasets in tabs</li>
      </ul>
      
      <div className="border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-2">Command format for tabs:</p>
        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`/json_view_tabs { 
  "tabs": [
    {
      "label": "Tab Name",
      "data": { "your": "json data" },
      "description": "Optional description"
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
}