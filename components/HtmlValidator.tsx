// components/HtmlValidator.tsx
'use client';
import { useEffect } from 'react';

interface ExpectedStructure {
  doctype: string;
  html: {
    head?: {
      title?: string;
    };
    body: {
      [key: string]: string | string[] | any;
    };
  };
}

interface HtmlValidatorProps {
  code: string;
  expectedStructure: ExpectedStructure;
  onValidationResult: (isValid: boolean, message: string) => void;
}

export default function HtmlValidator({ code, expectedStructure, onValidationResult }: HtmlValidatorProps) {
  
  const validateHtml = () => {
    try {
      // Parse HTML code
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      
      // Check for parsing errors
      const parseErrors = doc.querySelectorAll('parsererror');
      if (parseErrors.length > 0) {
        onValidationResult(false, 'HTML syntax error: ' + parseErrors[0].textContent);
        return;
      }
      
      // Check doctype
      if (expectedStructure.doctype === 'html') {
        if (!code.includes('<!DOCTYPE html>')) {
          onValidationResult(false, 'Missing DOCTYPE html declaration');
          return;
        }
      }
      
      // Check HTML structure
      const htmlElement = doc.documentElement;
      if (!htmlElement) {
        onValidationResult(false, 'Missing HTML element');
        return;
      }
      
      // Check head and title
      if (expectedStructure.html.head?.title) {
        const head = htmlElement.querySelector('head');
        const title = head?.querySelector('title');
        if (!title || title.textContent?.trim() !== expectedStructure.html.head.title) {
          onValidationResult(false, `Title should be '${expectedStructure.html.head.title}'`);
          return;
        }
      }
      
      // Check body elements
      const body = htmlElement.querySelector('body');
      if (!body) {
        onValidationResult(false, 'Missing body element');
        return;
      }
      
      // Validate each expected element in body
      for (const [tag, expectedValue] of Object.entries(expectedStructure.html.body)) {
        // Handle special cases for multiple same tags (like h2_2)
        const actualTag = tag.replace(/_\\d+$/, ''); // Remove suffix like _2
        
        const elements = body.querySelectorAll(actualTag);
        
        if (Array.isArray(expectedValue)) {
          // Multiple elements expected
          if (elements.length < expectedValue.length) {
            onValidationResult(false, `Expected at least ${expectedValue.length} ${actualTag} elements`);
            return;
          }
          
          // Check content if specified
          expectedValue.forEach((expectedContent, index) => {
            if (expectedContent !== 'any' && elements[index]) {
              const elementText = elements[index].textContent?.trim();
              if (elementText !== expectedContent) {
                onValidationResult(false, `${actualTag} ${index + 1} should contain '${expectedContent}'`);
                return;
              }
            }
          });
          
        } else if (typeof expectedValue === 'string') {
          if (expectedValue === 'any') {
            // Any content is acceptable, but element must exist
            if (elements.length === 0) {
              onValidationResult(false, `Missing ${actualTag} element`);
              return;
            }
          } else {
            // Specific content expected
            const element = elements[0];
            if (!element || element.textContent?.trim() !== expectedValue) {
              onValidationResult(false, `${actualTag} should contain '${expectedValue}'`);
              return;
            }
          }
        }
      }
      
      onValidationResult(true, 'Struktur HTML benar! 🎉');
      
    } catch (error) {
      onValidationResult(false, 'Error parsing HTML: ' + error);
    }
  };
  
  // Auto-validate when code changes
  useEffect(() => {
    validateHtml();
  }, [code]);
  
  return null;
}