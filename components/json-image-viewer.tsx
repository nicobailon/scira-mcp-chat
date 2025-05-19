"use client"

import React from 'react';
import JsonView from '@uiw/react-json-view';
import { vscodeTheme } from '@uiw/react-json-view/esm/theme';
import { darkTheme } from '@uiw/react-json-view/esm/theme';
import { detectBase64Image } from '@/lib/utils/base64_image_prototype';
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface JsonImageViewerProps {
  data?: any;
  className?: string;
}

export function JsonImageViewer({ data, className }: JsonImageViewerProps) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = React.useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = React.useState<string | null>(null);
  const [selectedImagePath, setSelectedImagePath] = React.useState<string | null>(null);
  const [rawViewNodePaths, setRawViewNodePaths] = React.useState<Set<string>>(new Set());
  
  // Maximum Base64 length for image preview (approx 750KB)
  const MAX_BASE64_LENGTH = 1000000;
  
  // Use provided data or fall back to sample JSON
  const displayData = data || {
    sample: {
      message: "No data provided",
      timestamp: new Date().toISOString()
    }
  };

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatPath = (pathArray: (string | number)[]) => {
    return pathArray.reduce((acc, segment) => {
      if (typeof segment === 'number') {
        return acc + '[' + segment + ']';
      } else {
        return acc ? acc + '.' + segment : segment;
      }
    }, '');
  };

  const getValueForCopy = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value, null, 2);
  };

  const handleStringClick = (originalFullString: string, path?: (string | number)[]) => {
    const detectionResult = detectBase64Image(originalFullString);
    
    if (detectionResult.isImage && detectionResult.base64Data) {
      const { imageType, base64Data } = detectionResult;
      
      // Check if the Base64 data is too large
      if (base64Data.length > MAX_BASE64_LENGTH) {
        setSelectedImageSrc('IMAGE_TOO_LARGE');
        setSelectedImagePath(path ? formatPath(path) : null);
        return;
      }
      
      // If within size limits, set the full data URI
      if (originalFullString.startsWith('data:image/')) {
        setSelectedImageSrc(originalFullString);
      } else {
        // For raw Base64 strings, construct a data URI
        setSelectedImageSrc(`data:image/${imageType || 'unknown'};base64,${base64Data}`);
      }
      setSelectedImagePath(path ? formatPath(path) : null);
    }
  };

  const toggleRawView = (path: string) => {
    setRawViewNodePaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleCopy = async (text: string, feedbackType: 'path' | 'value') => {
    try {
      await navigator.clipboard.writeText(text);
      const message = feedbackType === 'path' ? 'Path Copied!' : 'Value Copied!';
      toast.success(message);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const renderCopyButtons = (path: (string | number)[], value: any) => {
    const formattedPath = formatPath(path);
    const copyValue = getValueForCopy(value);
    
    return (
      <span className="inline-flex gap-1 ml-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy(formattedPath, 'path');
          }}
          title={`Copy path: ${formattedPath}`}
        >
          📋 Path
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy(copyValue, 'value');
          }}
          title="Copy value"
        >
          📋 Value
        </Button>
      </span>
    );
  };

  const jsonViewTheme = theme === 'dark' ? vscodeTheme : darkTheme;

  return (
    <div className={cn(
      "flex h-full w-full min-h-[400px]",
      isMobile && "flex-col",
      className
    )}>
      <div className={cn(
        "flex-[6] p-4 overflow-auto bg-background",
        !isMobile && "border-r",
        isMobile && "border-b"
      )}>
        <JsonView 
          value={displayData}
          collapsed={2}
          style={jsonViewTheme}
          enableClipboard={false}
        >
          <JsonView.KeyName
            render={(props, renderProps) => {
              const { type, path, value, children } = renderProps;
              
              if (type === 'key') {
                return (
                  <span className="relative">
                    {children}
                    {renderCopyButtons(path, value)}
                  </span>
                );
              }
              return undefined;
            }}
          />
          <JsonView.String
            render={(props, renderProps) => {
              const { type, value, path } = renderProps;
              if (type === 'value' && typeof value === 'string') {
                const detectionResult = detectBase64Image(value);
                
                if (detectionResult.isImage) {
                  const nodePathKey = path.join('.');
                  const isRawView = rawViewNodePaths.has(nodePathKey);
                  
                  return (
                    <span className="inline-flex items-center gap-2">
                      {isRawView ? (
                        <>
                          <span className="text-blue-400 break-all font-mono text-sm">
                            &quot;{value.substring(0, 100)}{value.length > 100 ? '...' : ''}&quot;
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawView(nodePathKey);
                            }}
                          >
                            Show Preview
                          </Button>
                        </>
                      ) : (
                        <>
                          <button
                            className="text-blue-500 underline cursor-pointer hover:text-blue-600"
                            onClick={() => handleStringClick(value, path)}
                            aria-label={`Preview image at ${formatPath(path)}`}
                          >
                            [Image Preview - click to see]
                          </button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawView(nodePathKey);
                            }}
                          >
                            Show Raw
                          </Button>
                        </>
                      )}
                    </span>
                  );
                }
                
                // For non-image strings, add copy buttons
                return (
                  <span className="relative">
                    {props}
                    {renderCopyButtons(path, value)}
                  </span>
                );
              }
              return undefined;
            }}
          />
          <JsonView.Float
            render={(props, renderProps) => {
              const { type, value, path } = renderProps;
              if (type === 'value') {
                return (
                  <span className="relative">
                    {props}
                    {renderCopyButtons(path, value)}
                  </span>
                );
              }
              return undefined;
            }}
          />
          <JsonView.Bool
            render={(props, renderProps) => {
              const { type, value, path } = renderProps;
              if (type === 'value') {
                return (
                  <span className="relative">
                    {props}
                    {renderCopyButtons(path, value)}
                  </span>
                );
              }
              return undefined;
            }}
          />
          <JsonView.Null
            render={(props, renderProps) => {
              const { type, value, path } = renderProps;
              if (type === 'value') {
                return (
                  <span className="relative">
                    {props}
                    {renderCopyButtons(path, value)}
                  </span>
                );
              }
              return undefined;
            }}
          />
        </JsonView>
      </div>
      <div className={cn(
        "flex-[4] p-4 overflow-auto bg-muted/50",
        "flex items-center justify-center"
      )}>
        {selectedImageSrc === 'IMAGE_TOO_LARGE' ? (
          <div className="text-center">
            <div className="text-lg font-medium text-foreground">Image too large to preview</div>
            <div className="text-sm text-muted-foreground">
              (exceeds {(MAX_BASE64_LENGTH / 1024 / 1024).toFixed(1)}MB limit)
            </div>
          </div>
        ) : selectedImageSrc ? (
          <img 
            src={selectedImageSrc} 
            alt={selectedImagePath ? `Image preview from: ${selectedImagePath}` : "Base64 image preview"}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-muted-foreground">
            Select an image in the JSON to preview
          </div>
        )}
      </div>
    </div>
  );
}