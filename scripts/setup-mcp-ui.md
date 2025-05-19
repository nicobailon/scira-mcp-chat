# MCP UI Setup Script

Since `@mcp-ui/client` and `@mcp-ui/server` might not be published yet, here's how to set up MCP UI support:

## Manual Installation

1. Clone the MCP UI repository:
```bash
git clone https://github.com/idosal/mcp-ui.git
cd mcp-ui
```

2. Build the packages:
```bash
npm install
npm run build
```

3. Link the packages locally:
```bash
cd packages/client
npm link

cd ../server
npm link

cd /Users/nicobailon/Documents/development/scira-mcp-chat
npm link @mcp-ui/client @mcp-ui/server
```

## Alternative: Direct Implementation

If the packages are not available, you can implement the core functionality directly:

### Client Implementation

Create a simple HtmlResource component that handles iframe rendering and message passing.

### Server Implementation

Use the MCP SDK directly to create resource blocks with the appropriate structure:

```typescript
{
  type: 'resource',
  resource: {
    uri: 'ui://component/id',
    mimeType: 'text/html',
    text: '<html>...</html>'
  }
}
```

## Testing

To test MCP UI integration:

1. Start the MCP UI example server from the `mcp-ui` repository
2. Add it as an SSE server in your chat interface
3. Ask the AI to show interactive components
4. Verify that UI blocks render and actions work