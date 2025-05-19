import React, { useState, useCallback, useEffect } from 'react';
import { JsonViewerModal } from '@/components/json-viewer-modal';
import { TabbedJsonViewer } from '@/components/tabbed-json-viewer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ChatCommandHandlerProps {
  message: string;
  children?: React.ReactNode;
}

interface TabData {
  label: string;
  data: any;
  description?: string;
}

interface ProcessedCommand {
  type: 'single' | 'tabs';
  data?: unknown;
  tabs?: TabData[];
}

export function ChatCommandHandler({ message, children }: ChatCommandHandlerProps) {
  const [processedCommand, setProcessedCommand] = useState<ProcessedCommand | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commandProcessed, setCommandProcessed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const processCommand = useCallback(async () => {
    const trimmedMessage = message.trim();
    
    // Check for help (command without arguments)
    if (trimmedMessage === '/json_view' || trimmedMessage === '/json_view_tabs') {
      setShowHelp(true);
      return true;
    }
    
    // Check if message starts with our commands
    if (!trimmedMessage.startsWith('/json_view')) {
      return false;
    }

    // Extract JSON payload from the command
    const singleCommandRegex = /^\/json_view\s+(.+)$/;
    const tabsCommandRegex = /^\/json_view_tabs\s+(.+)$/;
    
    const singleMatch = trimmedMessage.match(singleCommandRegex);
    const tabsMatch = trimmedMessage.match(tabsCommandRegex);
    
    if (!singleMatch && !tabsMatch) {
      setError('Invalid command format. Use /json_view or /json_view_tabs with JSON data');
      return true;
    }

    const isTabsCommand = !!tabsMatch;
    const jsonString = (isTabsCommand ? tabsMatch : singleMatch)![1].trim();
    
    try {
      const parsedJson = JSON.parse(jsonString);
      
      if (isTabsCommand) {
        // Validate tabs structure
        if (!parsedJson.tabs || !Array.isArray(parsedJson.tabs)) {
          setError('Invalid tabs format. Expected: {"tabs": [{"label": "Tab1", "data": {...}}]}');
          return true;
        }
        
        // Validate each tab's data through the API
        const validatedTabs: TabData[] = [];
        for (const tab of parsedJson.tabs) {
          if (!tab.label || !tab.data) {
            setError('Each tab must have a "label" and "data" property');
            return true;
          }
          
          const response = await fetch('/api/json-viewer/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tab.data),
          });

          const result = await response.json();

          if (!response.ok) {
            setError(`Failed to validate data for tab "${tab.label}": ${result.error}`);
            return true;
          }

          if (result.metadata.isTruncated) {
            toast.warning(`Data for tab "${tab.label}" was truncated (original: ${result.metadata.originalSize} bytes, truncated: ${result.metadata.truncatedSize} bytes)`);
          }

          if (result.metadata.warnings?.length > 0) {
            result.metadata.warnings.forEach((warning: string) => {
              toast.warning(`Tab "${tab.label}": ${warning}`);
            });
          }

          validatedTabs.push({
            label: tab.label,
            data: result.data,
            description: tab.description,
          });
        }
        
        setProcessedCommand({
          type: 'tabs',
          tabs: validatedTabs,
        });
      } else {
        // Validate single JSON through API endpoint
        const response = await fetch('/api/json-viewer/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsedJson),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Failed to validate JSON');
          return true;
        }

        if (result.metadata.isTruncated) {
          toast.warning(`JSON data was truncated (original: ${result.metadata.originalSize} bytes, truncated: ${result.metadata.truncatedSize} bytes)`);
        }

        if (result.metadata.warnings?.length > 0) {
          result.metadata.warnings.forEach((warning: string) => {
            toast.warning(warning);
          });
        }

        setProcessedCommand({
          type: 'single',
          data: result.data,
        });
      }
      
      setShowModal(true);
      setError(null);
    } catch (e) {
      setError(`Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    return true; // Command was processed
  }, [message]);

  // Check if this is a command
  const isCommand = message.trim().startsWith('/json_view');
  
  // Process the command
  useEffect(() => {
    if (isCommand && !commandProcessed) {
      processCommand().then(result => {
        setCommandProcessed(result);
      });
    }
  }, [isCommand, commandProcessed, processCommand]);

  if (!isCommand) {
    return <>{children}</>;
  }

  if (!commandProcessed) {
    return <>{children}</>;
  }

  // Show help if requested
  if (showHelp) {
    return (
      <div className="p-3 rounded-lg bg-muted/50">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">JSON Viewer Commands</h3>
            <div className="space-y-2 text-sm">
              <div>
                <code className="font-mono bg-muted px-1.5 py-0.5 rounded">/json_view &lt;json&gt;</code>
                <p className="text-muted-foreground mt-1">Display JSON data in a modal viewer</p>
                <p className="text-muted-foreground text-xs">Example: {`/json_view { "name": "John", "age": 30 }`}</p>
              </div>
              <div>
                <code className="font-mono bg-muted px-1.5 py-0.5 rounded">/json_view_tabs &lt;tabs_json&gt;</code>
                <p className="text-muted-foreground mt-1">Display multiple JSON datasets in tabs</p>
                <p className="text-muted-foreground text-xs">Example: {`/json_view_tabs { "tabs": [{"label": "Data", "data": {"key": "value"}}, {"label": "Metadata", "data": {"info": "example"}}] }`}</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Note: Large JSON data will be automatically truncated for safety
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-sm text-muted-foreground">Command:</span>
        <code className="text-sm font-mono">
          {processedCommand?.type === 'tabs' ? '/json_view_tabs' : '/json_view'}
        </code>
      </div>
      
      {error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground mb-3">
            {processedCommand?.type === 'tabs' 
              ? `${processedCommand.tabs?.length || 0} tabs loaded. Click to view:`
              : 'JSON data loaded. Click to view:'}
          </div>
          {processedCommand?.type === 'tabs' ? (
            <JsonViewerModal
              tabs={processedCommand.tabs}
              title="Tabbed JSON Viewer"
              description="Data from /json_view_tabs command"
              trigger={
                <Button variant="outline" size="sm">
                  Open Tabbed Viewer
                </Button>
              }
            />
          ) : (
            <JsonViewerModal
              jsonData={processedCommand?.data}
              title="JSON Viewer"
              description="Data from /json_view command"
              trigger={
                <Button variant="outline" size="sm">
                  Open JSON Viewer
                </Button>
              }
            />
          )}
        </>
      )}
    </div>
  );
}

// Hook for processing commands in the chat
export function useChatCommands(input: string, setInput: (value: string) => void) {
  const processJsonViewCommand = useCallback(async (text: string) => {
    const trimmedText = text.trim();
    
    // Check for help (command without arguments)
    if (trimmedText === '/json_view' || trimmedText === '/json_view_tabs') {
      return { 
        isCommand: true, 
        processed: true,
        showHelp: true,
        clearInput: true
      };
    }
    
    if (!trimmedText.startsWith('/json_view')) {
      return { isCommand: false, processed: false };
    }

    // Extract and validate JSON
    const singleCommandRegex = /^\/json_view\s+(.+)$/;
    const tabsCommandRegex = /^\/json_view_tabs\s+(.+)$/;
    
    const singleMatch = trimmedText.match(singleCommandRegex);
    const tabsMatch = trimmedText.match(tabsCommandRegex);
    
    if (!singleMatch && !tabsMatch) {
      return { 
        isCommand: true, 
        processed: false, 
        error: 'Invalid command format. Use /json_view or /json_view_tabs with JSON data' 
      };
    }

    const isTabsCommand = !!tabsMatch;
    const jsonString = (isTabsCommand ? tabsMatch : singleMatch)![1].trim();

    try {
      const parsedJson = JSON.parse(jsonString);
      
      if (isTabsCommand) {
        // Validate tabs structure
        if (!parsedJson.tabs || !Array.isArray(parsedJson.tabs)) {
          return {
            isCommand: true,
            processed: false,
            error: 'Invalid tabs format. Expected: {"tabs": [{"label": "Tab1", "data": {...}}]}'
          };
        }
        
        // Validate each tab's data through the API
        const validatedTabs: TabData[] = [];
        for (const tab of parsedJson.tabs) {
          if (!tab.label || !tab.data) {
            return {
              isCommand: true,
              processed: false,
              error: 'Each tab must have a "label" and "data" property'
            };
          }
          
          const response = await fetch('/api/json-viewer/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tab.data),
          });

          const result = await response.json();

          if (!response.ok) {
            return {
              isCommand: true,
              processed: false,
              error: `Failed to validate data for tab "${tab.label}": ${result.error}`
            };
          }

          if (result.metadata.isTruncated) {
            toast.warning(`Data for tab "${tab.label}" was truncated (original: ${result.metadata.originalSize} bytes, truncated: ${result.metadata.truncatedSize} bytes)`);
          }

          if (result.metadata.warnings?.length > 0) {
            result.metadata.warnings.forEach((warning: string) => {
              toast.warning(`Tab "${tab.label}": ${warning}`);
            });
          }

          validatedTabs.push({
            label: tab.label,
            data: result.data,
            description: tab.description,
          });
        }
        
        return {
          isCommand: true,
          processed: true,
          type: 'tabs',
          tabs: validatedTabs,
          clearInput: true
        };
      } else {
        // Validate JSON through API endpoint
        const response = await fetch('/api/json-viewer/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsedJson),
        });

        const result = await response.json();

        if (!response.ok) {
          return { 
            isCommand: true, 
            processed: false, 
            error: result.error || 'Failed to validate JSON' 
          };
        }

        if (result.metadata.isTruncated) {
          toast.warning(`JSON data was truncated (original: ${result.metadata.originalSize} bytes, truncated: ${result.metadata.truncatedSize} bytes)`);
        }

        if (result.metadata.warnings?.length > 0) {
          result.metadata.warnings.forEach((warning: string) => {
            toast.warning(warning);
          });
        }

        return { 
          isCommand: true, 
          processed: true,
          type: 'single',
          jsonData: result.data,
          clearInput: true
        };
      }
    } catch (e) {
      return { 
        isCommand: true, 
        processed: false, 
        error: `Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}` 
      };
    }
  }, []);

  const handleCommand = useCallback(async (text: string) => {
    const result = await processJsonViewCommand(text);
    
    if (result.isCommand && result.clearInput) {
      setInput('');
    }
    
    return result;
  }, [processJsonViewCommand, setInput]);

  return { handleCommand };
}