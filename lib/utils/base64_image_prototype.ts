/**
 * Detects if a string contains a Base64-encoded image without decoding it.
 * 
 * This function checks for common Base64 image prefixes (data URIs) or attempts
 * to detect raw Base64 strings that might be images based on their length and validity.
 * 
 * @param dataString - The string to check for Base64 image content
 * @returns An object containing:
 *   - isImage: Whether the string is detected as a Base64 image
 *   - imageType: The detected image type (png, jpeg, etc.) or null
 *   - base64Data: The Base64 data portion (without prefix) or null
 *   - error: Any error message during detection or null
 */
export function detectBase64Image(dataString: string): {
  isImage: boolean;
  imageType: string | null;
  base64Data: string | null;
  error: string | null;
} {
  // Common Base64 image data URI prefixes
  const imageDataUriPattern = /^data:image\/(png|jpeg|jpg|gif|webp|bmp|svg\+xml);base64,(.+)$/i;
  
  // Minimum length for considering a raw Base64 string as a potential image
  const MIN_BASE64_IMAGE_LENGTH = 200;
  
  // Check for data URI prefix
  const dataUriMatch = dataString.match(imageDataUriPattern);
  
  if (dataUriMatch) {
    // Extract image type and Base64 data from data URI
    const imageType = dataUriMatch[1].toLowerCase();
    const base64Data = dataUriMatch[2];
    
    // Return the Base64 data without decoding
    return {
      isImage: true,
      imageType: imageType === 'jpg' ? 'jpeg' : imageType,
      base64Data: base64Data,
      error: null
    };
  }
  
  // Check for raw Base64 string (no data URI prefix)
  // Only consider strings longer than MIN_BASE64_IMAGE_LENGTH
  if (dataString.length > MIN_BASE64_IMAGE_LENGTH) {
    // Validate if it's a valid Base64 string
    // Base64 strings only contain A-Z, a-z, 0-9, +, /, and optional padding (=)
    const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
    
    // Remove whitespace for validation
    const cleanedString = dataString.replace(/\s/g, '');
    
    if (base64Pattern.test(cleanedString)) {
      // For raw Base64, we can't directly determine the image type
      // We'll use a generic type or try to infer from the decoded data
      // For this prototype, we'll default to 'unknown'
      return {
        isImage: true,
        imageType: 'unknown', // Could be enhanced to detect from binary signature
        base64Data: cleanedString,
        error: null
      };
    }
  }
  
  // String doesn't match any image pattern
  return {
    isImage: false,
    imageType: null,
    base64Data: null,
    error: null
  };
}

/**
 * Decodes Base64 data using atob with error handling.
 * 
 * This function should only be called when actual decoding is needed,
 * as it can be expensive for large data.
 * 
 * @param base64Data - The Base64 data to decode (without data URI prefix)
 * @returns An object containing:
 *   - decodedData: The decoded string or null if decoding failed
 *   - error: Any error message during decoding or null
 */
export function decodeBase64Data(base64Data: string): {
  decodedData: string | null;
  error: string | null;
} {
  try {
    const decodedData = atob(base64Data);
    return {
      decodedData: decodedData,
      error: null
    };
  } catch (error) {
    return {
      decodedData: null,
      error: `Failed to decode Base64: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Example usages (commented out for testing purposes):

/*
// Example 1: Valid data URI with PNG image
const pngDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
console.log('PNG Data URI:', detectBase64Image(pngDataUri));

// Example 2: Valid data URI with JPEG image
const jpegDataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmAA8A/9k=';
console.log('JPEG Data URI:', detectBase64Image(jpegDataUri));

// Example 3: Raw Base64 string (valid, long enough)
const rawBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='.repeat(3);
console.log('Raw Base64:', detectBase64Image(rawBase64));

// Example 4: Invalid Base64 string
const invalidBase64 = 'This is not a valid Base64 string!@#$%^&*()';
console.log('Invalid Base64:', detectBase64Image(invalidBase64));

// Example 5: Short non-image string
const shortString = 'Hello, world!';
console.log('Short String:', detectBase64Image(shortString));

// Example 6: Malformed data URI
const malformedDataUri = 'data:image/png;base64,INVALID!@#$';
console.log('Malformed Data URI:', detectBase64Image(malformedDataUri));

// Example 7: Decoding Base64 data
const detectionResult = detectBase64Image(pngDataUri);
if (detectionResult.isImage && detectionResult.base64Data) {
  console.log('Decoding:', decodeBase64Data(detectionResult.base64Data));
}
*/