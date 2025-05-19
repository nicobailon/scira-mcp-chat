// Test the JSON validation API endpoint
const testCases = [
  {
    name: 'Valid JSON data',
    input: { name: 'test', value: 42, nested: { deep: true } },
    expectedSuccess: true,
  },
  {
    name: 'Large JSON data (should be truncated)',
    input: { 
      largeString: 'x'.repeat(6 * 1024 * 1024), // 6MB string 
      data: Array(2000).fill({ item: 'test' }) 
    },
    expectedTruncated: true,
  },
  {
    name: 'Invalid request (not an object)',
    input: 'not-json',
    expectedError: true,
  },
];

async function testValidationEndpoint() {
  console.log('Testing JSON validation API endpoint...\n');
  
  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/json-viewer/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.input),
      });
      
      const result = await response.json();
      
      if (testCase.expectedError && !response.ok) {
        console.log('✓ Expected error received:', result.error);
      } else if (testCase.expectedSuccess && response.ok) {
        console.log('✓ Success:', {
          hasData: !!result.data,
          isTruncated: result.metadata.isTruncated,
          warnings: result.metadata.warnings,
        });
      } else if (testCase.expectedTruncated && result.metadata.isTruncated) {
        console.log('✓ Data truncated as expected:', {
          originalSize: result.metadata.originalSize,
          truncatedSize: result.metadata.truncatedSize,
        });
      } else {
        console.log('✗ Unexpected result:', result);
      }
    } catch (error) {
      console.log('✗ Error:', error.message);
    }
    
    console.log('');
  }
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testValidationEndpoint().catch(console.error);
}