import { initializeMCPClients, type MCPServerConfig } from '@/lib/mcp-client';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const {
      tool,
      params,
      mcpServers = [],
    }: {
      tool: string;
      params: any;
      mcpServers: MCPServerConfig[];
    } = await req.json();

    if (!tool) {
      return new Response(
        JSON.stringify({ error: "Tool name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize MCP clients with the provided server configurations
    const { callTool, cleanup } = await initializeMCPClients(mcpServers, req.signal);

    try {
      // Execute the tool
      const result = await callTool(tool, params);
      
      // Clean up immediately after successful execution
      await cleanup();

      return new Response(
        JSON.stringify({ 
          status: "ok", 
          result 
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    } catch (toolError) {
      // Clean up on error
      await cleanup();
      
      console.error(`Error executing tool ${tool}:`, toolError);
      return new Response(
        JSON.stringify({ 
          status: "error", 
          error: toolError instanceof Error ? toolError.message : "Tool execution failed" 
        }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error('Error in UI action endpoint:', error);
    return new Response(
      JSON.stringify({ 
        status: "error", 
        error: "Internal server error" 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}