"use client"

import React from 'react';
import { JsonViewerModal } from '@/components/json-viewer-modal';
import { Button } from '@/components/ui/button';

export function TabbedJsonViewerExample() {
  const sampleTabs = [
    {
      label: "User Data",
      data: {
        users: [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          }
        ]
      },
      description: "User profile information including avatars"
    },
    {
      label: "System Info",
      data: {
        server: {
          name: "prod-server-01",
          status: "running",
          uptime: "14 days",
          metrics: {
            cpu: "25%",
            memory: "60%",
            disk: "45%"
          }
        },
        database: {
          type: "PostgreSQL",
          version: "15.2",
          connections: 42
        }
      },
      description: "Server and database status information"
    },
    {
      label: "Analytics",
      data: {
        traffic: {
          daily: [1200, 1400, 1350, 1600, 1450, 1700, 1800],
          weekly: [8400, 9100, 8900, 9500, 9200, 9800, 10200],
          monthly: [34000, 36500, 35800, 38000, 37200, 39500, 41000]
        },
        conversions: {
          rate: "3.2%",
          total: 1245,
          value: "$124,500"
        },
        topPages: [
          { path: "/home", views: 8500 },
          { path: "/product", views: 6200 },
          { path: "/about", views: 3100 }
        ]
      },
      description: "Website analytics and performance metrics"
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Tabbed JSON Viewer Example</h2>
      
      <JsonViewerModal
        tabs={sampleTabs}
        defaultTab="User Data"
        title="Dashboard Data"
        description="Multiple data sections organized in tabs"
        trigger={
          <Button variant="outline">
            Open Tabbed Viewer
          </Button>
        }
      />
    </div>
  );
}