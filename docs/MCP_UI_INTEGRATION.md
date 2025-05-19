# MCP UI Protocol Integration Guide

This document outlines how the MCP UI protocol is integrated into scira-mcp-chat, enabling interactive HTML components within chat responses.

## Overview

The MCP UI protocol extends the Model Context Protocol (MCP) to support rich, interactive UI components that can be embedded in chat responses. These components can execute actions and update dynamically based on user interactions.

## Architecture

### 1. Client-Side Components

#### HtmlResourceBlock (`/components/mcp-ui/html-resource.tsx`)
- Renders HTML resource blocks returned by MCP servers
- Supports both self-contained HTML (`ui://`) and external applications (`ui-app://`)
- Handles iframe communication for UI actions
- Provides expandable view for better user experience

#### MCP UI Context (`/lib/context/mcp-ui-context.tsx`)
- Provides a React context for executing UI actions
- Connects UI interactions to the MCP server API
- Handles error states and loading states

### 2. Server-Side Integration

#### UI Action API (`/app/api/mcp/ui-action/route.ts`)
- Dedicated endpoint for handling UI actions from MCP UI components
- Initializes MCP clients for tool execution
- Returns structured responses for UI updates

#### MCP Client Updates (`/lib/mcp-client.ts`)
- Extended with `callTool` method for direct tool execution
- Supports UI action handling separate from chat flow

### 3. Message Rendering Integration

The message component has been updated to detect and render HTML resource blocks:

```typescript
// In message.tsx
if (isHtmlResourceBlock(part)) {
  return (
    <div key={`message-${message.id}-part-${i}`} className="mb-4">
      <HtmlResourceBlock 
        resource={part.resource}
        isInteractive={true}
        maxHeight={400}
      />
    </div>
  );
}
```

## Usage

### For MCP Server Developers

To create MCP servers that support the UI protocol, use the `@mcp-ui/server` package:

```typescript
import { createHtmlResource } from '@mcp-ui/server';

// Create a self-contained HTML resource
const uiResource = createHtmlResource({
  uri: 'ui://task-dashboard/1',
  content: { 
    type: 'directHtml', 
    htmlString: '<div>Interactive component</div>' 
  },
  delivery: 'text',
});

// Create an external app resource
const appResource = createHtmlResource({
  uri: 'ui-app://external-widget/session-123',
  content: { 
    type: 'externalUrl', 
    iframeUrl: 'https://example.com/widget' 
  },
  delivery: 'text',
});
```

### For UI Component Developers

Interactive components can send actions back to the MCP server:

```javascript
// Inside the iframe/component
function sendAction(tool, params) {
  window.parent.postMessage({ 
    tool: tool, 
    params: params 
  }, '*');
}

// Example: Send a button click action
function handleButtonClick() {
  sendAction('update_status', { status: 'completed', taskId: 123 });
}
```

## URI Schemes

The MCP UI protocol supports two URI schemes:

1. **`ui://`** - Self-contained HTML content
   - Content is embedded directly in the resource
   - Rendered in a sandboxed iframe with `srcdoc`
   - Suitable for simple interactive components

2. **`ui-app://`** - External applications
   - Content is hosted externally
   - Rendered in an iframe with `src` attribute
   - Suitable for complex applications or existing web interfaces

## Security Considerations

1. **Iframe Sandboxing**: All UI resources are rendered in sandboxed iframes
2. **Origin Validation**: Message passing includes origin verification
3. **Tool Execution**: UI actions go through the same tool validation as regular MCP calls
4. **CSP Headers**: Content Security Policy headers should be configured appropriately

## Configuration

### Installing Dependencies

Add the required MCP UI packages:

```bash
npm install @mcp-ui/client @mcp-ui/server
```

### Environment Setup

No additional environment variables are required. The UI protocol uses the existing MCP server configurations.

## Examples

### Task Management Dashboard

```typescript
// MCP Server implementation
this.server.tool(
  'show_task_dashboard',
  'Display an interactive task management dashboard',
  async () => {
    const dashboardHtml = `
      <div id="task-dashboard">
        <h2>Project Tasks</h2>
        <div id="tasks">
          <!-- Tasks will be loaded here -->
        </div>
        <button onclick="addTask()">Add Task</button>
        <script>
          function addTask() {
            const taskName = prompt('Enter task name:');
            if (taskName) {
              window.parent.postMessage({
                tool: 'create_task',
                params: { name: taskName }
              }, '*');
            }
          }
        </script>
      </div>
    `;

    return {
      content: [createHtmlResource({
        uri: 'ui://task-dashboard/1',
        content: { type: 'directHtml', htmlString: dashboardHtml },
        delivery: 'text',
      })]
    };
  }
);
```

## Troubleshooting

### Common Issues

1. **Components not rendering**: Check that message parts are properly typed as resource blocks
2. **Actions not working**: Verify that the MCP server has the required tools available
3. **Iframe not loading**: Check console for CSP violations or network errors
4. **Context errors**: Ensure components are wrapped in the MCPUIProvider

### Debug Mode

Enable debug logging by setting `localStorage.mcpDebug = 'true'` in the browser console.

## Future Enhancements

1. **React Server Components**: Support for RSC-based UI resources
2. **WebSocket Communication**: Real-time bidirectional communication
3. **Component Library**: Pre-built UI components for common patterns
4. **State Management**: Persistent state across UI interactions