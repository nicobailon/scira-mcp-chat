import React from 'react';
import JsonView from '@uiw/react-json-view';
import { vscodeTheme } from '@uiw/react-json-view/esm/theme';
import { detectBase64Image } from '../../../lib/utils/base64_image_prototype';

const styles = {
  container: {
    display: 'flex' as const,
    width: '100%',
    height: '100%',
    minHeight: '400px',
    backgroundColor: '#1e1e1e',
  },
  jsonPane: {
    flex: '6',
    padding: '16px',
    borderRight: '1px solid #313131',
    backgroundColor: '#1e1e1e',
    overflow: 'auto',
  },
  imagePane: {
    flex: '4',
    padding: '16px',
    backgroundColor: '#252526',
    overflow: 'auto',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    border: '2px dashed #4a4a4a',
    borderRadius: '8px',
    backgroundColor: '#2d2d30',
    color: '#969696',
    fontSize: '14px',
    fontWeight: 500,
  },
  // Mobile styles
  containerMobile: {
    flexDirection: 'column' as const,
  },
  jsonPaneMobile: {
    flex: '1',
    borderRight: 'none',
    borderBottom: '1px solid #313131',
  },
  imagePaneMobile: {
    flex: '1',
  },
  // Image preview styles
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' as const,
  },
  noImageMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#969696',
    fontSize: '14px',
  },
  imageTooLarge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#838383',
    fontSize: '16px',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  // Copy button styles
  copyButtonContainer: {
    display: 'inline-flex',
    gap: '4px',
    marginLeft: '8px',
  },
  copyButton: {
    border: '1px solid #4a4a4a',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '10px',
    cursor: 'pointer',
    backgroundColor: '#2d2d30',
    color: '#b8b8b8',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#323234',
      borderColor: '#5a5a5a',
    }
  },
  copyFeedback: {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    backgroundColor: '#16825d',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    zIndex: 10000,
    animation: 'slideIn 0.3s ease-out',
  },
};

// Helper function to format path for copying
const formatPath = (pathArray: (string | number)[]) => {
  return pathArray.reduce((acc, segment) => {
    if (typeof segment === 'number') {
      return acc + '[' + segment + ']';
    } else {
      return acc ? acc + '.' + segment : segment;
    }
  }, '');
};

// Helper function to get value for copying
const getValueForCopy = (value: any): string => {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value, null, 2);
};

interface JsonImageViewerLayoutProps {
  data?: any;
  className?: string;
}

const JsonImageViewerLayout: React.FC<JsonImageViewerLayoutProps> = ({ data, className }) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = React.useState<string | null>(null);
  const [selectedImagePath, setSelectedImagePath] = React.useState<string | null>(null);
  const [rawViewNodePaths, setRawViewNodePaths] = React.useState<Set<string>>(new Set());
  const [copyFeedback, setCopyFeedback] = React.useState<string | null>(null);
  
  // Maximum Base64 length for image preview (approx 750KB)
  const MAX_BASE64_LENGTH = 1000000;
  
  // Use provided data or fall back to sample JSON
  const displayData = data || {
    images: {
      png_data_uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVQIHWP4/5+hnoEBCEYUAJj2C/mHIDQOAAAAAElFTkSuQmCC",
      jpeg_data_uri: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmAA8A/9k=",
      raw_base64_long: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==".repeat(3),
      regular_string: "This is just a regular string, not an image",
      shortString: "Hello, world!",
      empty_string: ""
    },
    metadata: {
      created: "2025-01-18",
      version: 1.0,
      has_images: true
    },
    other_data: {
      numbers: [1, 2, 3, 4, 5],
      boolean: true,
      null_value: null,
      nested: {
        more_data: "Some nested data",
        another_image: "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="
      }
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

  // Add global style for animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const containerStyle = {
    ...styles.container,
    ...(isMobile ? styles.containerMobile : {}),
  };

  const jsonPaneStyle = {
    ...styles.jsonPane,
    ...(isMobile ? styles.jsonPaneMobile : {}),
  };

  const imagePaneStyle = {
    ...styles.imagePane,
    ...(isMobile ? styles.imagePaneMobile : {}),
  };

  const handleStringClick = (originalFullString: string, path?: (string | number)[]) => {
    const detectionResult = detectBase64Image(originalFullString);
    
    if (detectionResult.isImage && detectionResult.base64Data) {
      const { imageType, base64Data } = detectionResult;
      
      // Check if the Base64 data is too large
      if (base64Data.length > MAX_BASE64_LENGTH) {
        // Set a special value to indicate image is too large
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
      setCopyFeedback(message);
      
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setCopyFeedback(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderCopyButtons = (path: (string | number)[], value: any) => {
    const formattedPath = formatPath(path);
    const copyValue = getValueForCopy(value);
    
    return (
      <span style={styles.copyButtonContainer}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy(formattedPath, 'path');
          }}
          style={styles.copyButton}
          title={`Copy path: ${formattedPath}`}
          aria-label={`Copy path: ${formattedPath}`}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#323234';
            e.currentTarget.style.borderColor = '#5a5a5a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2d2d30';
            e.currentTarget.style.borderColor = '#4a4a4a';
          }}
        >
          📋 Path
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy(copyValue, 'value');
          }}
          style={styles.copyButton}
          title="Copy value"
          aria-label={`Copy value: ${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value}`}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#323234';
            e.currentTarget.style.borderColor = '#5a5a5a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2d2d30';
            e.currentTarget.style.borderColor = '#4a4a4a';
          }}
        >
          📋 Value
        </button>
      </span>
    );
  };

  return (
    <div style={containerStyle} className={className}>
      <div style={jsonPaneStyle}>
        <JsonView 
          value={displayData}
          collapsed={2} // Collapse at depth 2 for better performance
          style={vscodeTheme}
          enableClipboard={false} // Disable default clipboard to use our custom implementation
        >
          <JsonView.KeyName
            render={(props, renderProps) => {
              const { type, path, value, children } = renderProps;
              
              if (type === 'key') {
                return (
                  <span style={{ position: 'relative' }}>
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
                  // Use the path as a unique identifier
                  const nodePathKey = path.join('.');
                  const isRawView = rawViewNodePaths.has(nodePathKey);
                  
                  return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {isRawView ? (
                        <>
                          <span 
                            style={{
                              color: '#9cdcfe',
                              wordBreak: 'break-all',
                              fontFamily: 'monospace',
                              fontSize: '13px',
                            }}
                          >
                            &quot;{value.substring(0, 100)}{value.length > 100 ? '...' : ''}&quot;
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawView(nodePathKey);
                            }}
                            style={{
                              border: '1px solid #4a4a4a',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              backgroundColor: '#2d2d30',
                              color: '#4fc1ff',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#323234';
                              e.currentTarget.style.borderColor = '#5a5a5a';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#2d2d30';
                              e.currentTarget.style.borderColor = '#4a4a4a';
                            }}
                            aria-label={`Show preview for ${formatPath(path)}`}
                          >
                            Show Preview
                          </button>
                        </>
                      ) : (
                        <>
                          <span
                            style={{
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              color: '#4fc1ff',
                            }}
                            onClick={() => handleStringClick(value, path)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleStringClick(value, path);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            title="Click to preview image"
                            aria-label={`Preview image at ${formatPath(path)}`}
                          >
                            [Image Preview - click to see]
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRawView(nodePathKey);
                            }}
                            style={{
                              border: '1px solid #4a4a4a',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              backgroundColor: '#2d2d30',
                              color: '#4fc1ff',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#323234';
                              e.currentTarget.style.borderColor = '#5a5a5a';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#2d2d30';
                              e.currentTarget.style.borderColor = '#4a4a4a';
                            }}
                            aria-label={`Show raw data for ${formatPath(path)}`}
                          >
                            Show Raw
                          </button>
                        </>
                      )}
                    </span>
                  );
                }
                
                // For non-image strings, add copy buttons
                return (
                  <span style={{ position: 'relative' }}>
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
                  <span style={{ position: 'relative' }}>
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
                  <span style={{ position: 'relative' }}>
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
                  <span style={{ position: 'relative' }}>
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
      <div style={imagePaneStyle}>
        {selectedImageSrc === 'IMAGE_TOO_LARGE' ? (
          <div style={styles.imageTooLarge}>
            <div>Image too large to preview</div>
            <div style={{ fontSize: '14px' }}>
              (exceeds {(MAX_BASE64_LENGTH / 1024 / 1024).toFixed(1)}MB limit)
            </div>
          </div>
        ) : selectedImageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={selectedImageSrc} 
            alt={selectedImagePath ? `Image preview from: ${selectedImagePath}` : "Base64 image preview"}
            style={styles.imagePreview}
          />
        ) : (
          <div style={styles.noImageMessage}>
            Select an image in the JSON to preview
          </div>
        )}
      </div>
      {copyFeedback && (
        <div 
          style={styles.copyFeedback}
          role="status"
          aria-live="polite"
        >
          {copyFeedback}
        </div>
      )}
    </div>
  );
};

export default JsonImageViewerLayout;