const fs = require('fs');
const path = require('path');

// Helper function to extract HTTP methods, request body, request parameters, and response details
function getHttpMethods(fileContent) {
  const methods = {};
  
  if (fileContent.includes('GET')) {
    methods['get'] = {
      summary: 'Get data',
      parameters: extractParameters(fileContent),
      responses: extractResponses(fileContent),
    };
  }
  if (fileContent.includes('POST')) {
    methods['post'] = {
      summary: 'Create data',
      requestBody: extractRequestBody(fileContent),
      responses: extractResponses(fileContent),
    };
  }
  if (fileContent.includes('PUT')) {
    methods['put'] = {
      summary: 'Update data',
      requestBody: extractRequestBody(fileContent),
      responses: extractResponses(fileContent),
    };
  }
  if (fileContent.includes('PATCH')) {
    methods['patch'] = {
      summary: 'Partial update',
      requestBody: extractRequestBody(fileContent),
      responses: extractResponses(fileContent),
    };
  }
  if (fileContent.includes('DELETE')) {
    methods['delete'] = {
      summary: 'Delete data',
      parameters: extractParameters(fileContent),
      responses: extractResponses(fileContent),
    };
  }
  
  return methods;
}

// Extract request body from the file content (assumes it might reference `req.body`)
function extractRequestBody(fileContent) {
  if (fileContent.includes('req.body')) {
    return {
      content: {
        'application/json': {
          schema: {
            type: 'object',  // Assuming the body is JSON object
            properties: extractRequestBodyProperties(fileContent),
          }
        }
      }
    };
  }
  return null;
}

// A simple function to try and infer the properties of the request body
function extractRequestBodyProperties(fileContent) {
  // Search for body properties like `req.body.name`, `req.body.email` etc.
  const bodyProperties = {};
  
  const bodyRegex = /req\.body\.(\w+)/g;
  let match;
  
  while ((match = bodyRegex.exec(fileContent)) !== null) {
    const property = match[1];
    // Assuming all properties are strings for now; you could improve this with types
    bodyProperties[property] = { type: 'string' };
  }
  
  return bodyProperties;
}

// Extract route parameters (like `req.params.id`)
function extractParameters(fileContent) {
  const params = [];
  
  if (fileContent.includes('req.params')) {
    // A simple regex or a more specific pattern could be used here to extract parameter names
    const paramMatch = fileContent.match(/req\.params\.(\w+)/);
    if (paramMatch) {
      params.push({
        name: paramMatch[1],
        in: 'path',
        required: true,
        schema: { type: 'string' },
      });
    }
  }
  
  return params.length > 0 ? params : undefined;
}

// Extract response details from the file content (looking for `res.status` or similar)
function extractResponses(fileContent) {
  const responses = {};
  
  const statusMatch = fileContent.match(/res\.status\((\d+)\)/);
  if (statusMatch) {
    const statusCode = statusMatch[1];
    responses[statusCode] = {
      description: `Response for status ${statusCode}`,
    };
  }
  
  return Object.keys(responses).length > 0 ? responses : undefined;
}

// Function to create the OpenAPI spec for each file
function generateOpenAPISpec(apiFolder) {
  const openAPISpec = {
    openapi: '3.0.0',
    paths: {},
  };

  // Read all files in the specified directory
  const files = fs.readdirSync(apiFolder);

  // Loop through each file to create the paths
  files.forEach((file) => {
    const filePath = path.join(apiFolder, file);

    // Check if it's a directory or a file
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // If it's a directory, recursively process it
      const subFiles = fs.readdirSync(filePath);
      subFiles.forEach((subFile) => {
        const subFilePath = path.join(filePath, subFile);
        if (subFile.endsWith('.js')) {
          const route = `/api/${path.relative(apiFolder, subFilePath).replace('.js', '').replace(/\\/g, '/')}`;
          const fileContent = fs.readFileSync(subFilePath, 'utf-8');
          const methods = getHttpMethods(fileContent);
          for (const method in methods) {
            openAPISpec.paths[route] = openAPISpec.paths[route] || {};
            openAPISpec.paths[route][method] = methods[method];
          }
        }
      });
    } else if (file.endsWith('.js')) {
      // Process single JavaScript file
      const route = `/api/${file.replace('.js', '')}`;
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const methods = getHttpMethods(fileContent);
      for (const method in methods) {
        openAPISpec.paths[route] = openAPISpec.paths[route] || {};
        openAPISpec.paths[route][method] = methods[method];
      }
    }
  });

  return openAPISpec;
}

// Example usage
const apiFolder = './src/app/api'; // Your API folder path
const spec = generateOpenAPISpec(apiFolder);

// Save the spec to a file (e.g., openapi-spec.json)
fs.writeFileSync('./openapi-spec.json', JSON.stringify(spec, null, 2));

console.log('OpenAPI spec generated and saved to openapi-spec.json');
