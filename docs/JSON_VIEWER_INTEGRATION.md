# JSON Viewer Integration Guide

The JSON Viewer has been successfully integrated into the Scira MCP Chat application. This guide explains how to use the different JSON viewer components.

## Components Overview

### 1. JsonImageViewer
The core JSON viewer component with image preview capabilities.

```tsx
import { JsonImageViewer } from "@/components/json-image-viewer";

<JsonImageViewer data={yourJsonData} className="h-full" />
```

### 2. ChatJsonViewer
A button that opens the JSON viewer in a modal/sheet.

```tsx
import { ChatJsonViewer } from "@/components/chat-json-viewer";

<ChatJsonViewer
  jsonData={data}
  title="Custom Title"
  buttonText="View JSON"
/>
```

### 3. JsonViewerModal
A sheet component that wraps the JSON viewer.

```tsx
import { JsonViewerModal } from "@/components/json-viewer-modal";

<JsonViewerModal
  jsonData={data}
  title="JSON Data Viewer"
  description="Explore JSON with image preview"
  trigger={<button>Open Viewer</button>}
  side="right"
/>
```

### 4. InlineJsonViewer
A card component that shows JSON inline with an optional expand button.

```tsx
import { InlineJsonViewer } from "@/components/inline-json-viewer";

<InlineJsonViewer
  data={jsonData}
  title="API Response"
  description="Server response data"
  showViewButton={true}
/>
```

## Tool Invocation Integration

Tool invocations now automatically include JSON viewer buttons for arguments and results that contain JSON data:

```tsx
// The tool-invocation-with-json-viewer component is already integrated
// It automatically detects JSON content and adds viewer buttons
```

## Features

1. **Image Preview**: Automatically detects Base64-encoded images in JSON and displays them
2. **Copy Functionality**: Copy JSON paths and values with dedicated buttons
3. **Dark/Light Mode**: Fully compatible with the theme system
4. **Responsive Design**: Works on both desktop and mobile
5. **Large Image Handling**: Gracefully handles images that are too large to preview
6. **Raw/Preview Toggle**: Switch between raw Base64 data and image preview

## Usage Examples

### In Chat Messages
```tsx
// In your message component
import { ChatJsonViewer } from "@/components/chat-json-viewer";

// Add a JSON viewer button anywhere in your message
<ChatJsonViewer
  jsonData={messageData}
  title="Message Data"
/>
```

### In Tool Results
The tool invocation component automatically adds JSON viewers when appropriate:

```tsx
// Already integrated in components/message.tsx
import { ToolInvocation } from "./tool-invocation-with-json-viewer";
```

### Standalone Usage
```tsx
// For a full-page JSON viewer
<div className="h-screen">
  <JsonImageViewer data={largeJsonData} />
</div>
```

## Styling

The JSON viewer uses:
- Tailwind CSS classes for responsive design
- Theme-aware colors (works with dark/light mode)
- VS Code theme for JSON syntax highlighting
- shadcn/ui components for consistent UI

## Notes

- The viewer can handle any valid JSON data
- Base64 images are detected automatically
- Large images (>1MB) show a size warning
- All components are fully typed with TypeScript