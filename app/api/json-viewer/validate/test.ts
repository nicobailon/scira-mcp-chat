// Test file for the JSON validation API endpoint
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock function to test the validation endpoint
export async function testValidationEndpoint() {
  const testCases = [
    {
      name: 'Valid JSON',
      data: { name: 'Test', age: 25 },
      expectedStatus: 200,
    },
    {
      name: 'Large JSON that should be truncated',
      data: {
        bigData: Array(100000).fill(0).map((_, i) => ({
          id: i,
          value: `Value ${i}`,
          nested: { deep: { data: `Deep data ${i}` } }
        }))
      },
      expectedStatus: 200,
      expectTruncation: true,
    },
    {
      name: 'JSON with long strings',
      data: {
        longString: 'A'.repeat(150000),
        normalData: { key: 'value' }
      },
      expectedStatus: 200,
      expectTruncation: true,
    },
    {
      name: 'JSON with image data',
      data: {
        image: `data:image/png;base64,${'A'.repeat(50000)}`,
        title: 'Test Image'
      },
      expectedStatus: 200,
      expectImageProcessing: true,
    },
    {
      name: 'Circular reference handling',
      data: (() => {
        const obj: any = { name: 'Circular' };
        obj.self = obj;
        return obj;
      })(),
      expectedStatus: 400,
      expectedError: 'circular reference',
    },
  ];

  for (const testCase of testCases) {
    try {
      const response = await fetch('/api/json-viewer/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const result = await response.json();

      console.log(`Test: ${testCase.name}`);
      console.log(`Status: ${response.status} (expected: ${testCase.expectedStatus})`);
      
      if (testCase.expectedStatus !== response.status) {
        console.error(`❌ Status mismatch`);
      } else {
        console.log(`✅ Status match`);
      }

      if (testCase.expectTruncation && result.metadata?.isTruncated) {
        console.log(`✅ Data was truncated as expected`);
      }

      if (testCase.expectImageProcessing && result.metadata?.hasImages) {
        console.log(`✅ Image data was processed`);
      }

      if (testCase.expectedError && result.error?.includes(testCase.expectedError)) {
        console.log(`✅ Expected error received: ${result.error}`);
      }

      console.log('---');
    } catch (error) {
      console.error(`Test "${testCase.name}" failed:`, error);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testValidationEndpoint();
}