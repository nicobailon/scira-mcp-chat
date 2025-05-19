"use client";

import React, { createContext, useContext, useCallback } from 'react';
import { useMCP } from './mcp-context';

interface MCPUIContextValue {
  executeUIAction: (tool: string, params: any) => Promise<any>;
}

const MCPUIContext = createContext<MCPUIContextValue | null>(null);

export function MCPUIProvider({ children }: { children: React.ReactNode }) {
  const { mcpServersForApi } = useMCP();

  const executeUIAction = useCallback(async (tool: string, params: any) => {
    try {
      // For UI actions, we need to call the MCP server directly
      // This is different from the regular chat flow where tools are executed by the AI
      
      // You could make an API call to a dedicated endpoint for UI actions
      const response = await fetch('/api/mcp/ui-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool,
          params,
          mcpServers: mcpServersForApi,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error executing UI action:', error);
      throw error;
    }
  }, [mcpServersForApi]);

  return (
    <MCPUIContext.Provider value={{ executeUIAction }}>
      {children}
    </MCPUIContext.Provider>
  );
}

export function useMCPUI() {
  const context = useContext(MCPUIContext);
  if (!context) {
    throw new Error('useMCPUI must be used within an MCPUIProvider');
  }
  return context;
}