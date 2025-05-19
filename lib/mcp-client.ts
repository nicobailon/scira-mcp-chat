import { experimental_createMCPClient as createMCPClient } from 'ai';


export interface KeyValuePair {
  key: string;
  value: string;
}

export interface MCPServerConfig {
  url: string;
  type: 'sse' | 'stdio';
  command?: string;
  args?: string[];
  env?: KeyValuePair[];
  headers?: KeyValuePair[];
}

export interface MCPClientManager {
  tools: Record<string, any>;
  clients: any[];
  cleanup: () => Promise<void>;
  callTool: (tool: string, params: any) => Promise<any>;
}

/**
 * Initialize MCP clients for API calls
 * This uses the already running persistent SSE servers
 */
export async function initializeMCPClients(
  mcpServers: MCPServerConfig[] = [],
  abortSignal?: AbortSignal
): Promise<MCPClientManager> {
  // Initialize tools
  let tools: Record<string, any> = {};
  const mcpClients: any[] = [];

  // Process each MCP server configuration
  for (const mcpServer of mcpServers) {
    try {
      // All servers are handled as SSE
      const transport = {
        type: 'sse' as const,
        url: mcpServer.url,
        headers: mcpServer.headers?.reduce((acc, header) => {
          if (header.key) acc[header.key] = header.value || '';
          return acc;
        }, {} as Record<string, string>)
      };

      const mcpClient = await createMCPClient({ transport });
      mcpClients.push(mcpClient);

      const mcptools = await mcpClient.tools();

      console.log(`MCP tools from ${mcpServer.url}:`, Object.keys(mcptools));

      // Add MCP tools to tools object
      tools = { ...tools, ...mcptools };
    } catch (error) {
      console.error("Failed to initialize MCP client:", error);
      // Continue with other servers instead of failing the entire request
    }
  }

  // Register cleanup for all clients if an abort signal is provided
  if (abortSignal && mcpClients.length > 0) {
    abortSignal.addEventListener('abort', async () => {
      await cleanupMCPClients(mcpClients);
    });
  }

  // Function to call tools from UI actions
  const callTool = async (tool: string, params: any) => {
    console.log(`Calling tool ${tool} with params:`, params);
    
    // Find the tool in our tools object
    if (!(tool in tools)) {
      throw new Error(`Tool ${tool} not found`);
    }
    
    try {
      const toolFunction = tools[tool];
      const result = await toolFunction(params);
      return result;
    } catch (error) {
      console.error(`Error calling tool ${tool}:`, error);
      throw error;
    }
  };

  return {
    tools,
    clients: mcpClients,
    cleanup: async () => await cleanupMCPClients(mcpClients),
    callTool
  };
}

async function cleanupMCPClients(clients: any[]): Promise<void> {
  // Clean up the MCP clients
  for (const client of clients) {
    try {
      await client.close();
    } catch (error) {
      console.error("Error closing MCP client:", error);
    }
  }
} 