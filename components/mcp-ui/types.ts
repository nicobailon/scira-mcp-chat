// Types for MCP UI protocol support

export interface HtmlResourceBlock {
  type: 'resource';
  resource: {
    uri: string;
    mimeType: 'text/html';
    text?: string;
    blob?: string;
  };
}

export interface UiAction {
  tool: string;
  params: any;
}

export interface UiActionResponse {
  status: 'ok' | 'error';
  result?: any;
  error?: string;
}

// Check if a message part is an HTML resource block
export function isHtmlResourceBlock(part: any): part is HtmlResourceBlock {
  return (
    part &&
    typeof part === 'object' &&
    part.type === 'resource' &&
    part.resource &&
    part.resource.mimeType === 'text/html' &&
    (typeof part.resource.uri === 'string') &&
    (part.resource.text !== undefined || part.resource.blob !== undefined)
  );
}

// URI scheme utilities
export function isUiScheme(uri: string): boolean {
  return uri.startsWith('ui://') || uri.startsWith('ui-app://');
}

export function isExternalApp(uri: string): boolean {
  return uri.startsWith('ui-app://');
}

export function isSelfContainedHtml(uri: string): boolean {
  return uri.startsWith('ui://');
}