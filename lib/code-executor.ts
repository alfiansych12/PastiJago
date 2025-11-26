// Simple safe code execution untuk development
// NOTE: Untuk production, gunakan proper sandboxing

export async function executeCode(code: string): Promise<{ result: string; error: string | null }> {
  try {
    // Capture console.log outputs
    let output = '';
    const originalConsoleLog = console.log;
    
    console.log = (...args) => {
      output += args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ') + '\n';
      originalConsoleLog(...args);
    };

    // Execute code
    const result = eval(`(function() { ${code} })()`);
    
    // Restore console.log
    console.log = originalConsoleLog;

    // If function returns a value, add it to output
    if (result !== undefined && !code.includes('console.log')) {
      output += String(result);
    }

    return { result: output.trim(), error: null };
  } catch (error: any) {
    return { 
      result: '', 
      error: error.message || 'Terjadi error saat mengeksekusi kode' 
    };
  }
}

export function validateCode(code: string, expectedOutput: string): boolean {
  // Simple validation - untuk production butuh test runner yang lebih robust
  return code.includes(expectedOutput) || 
         expectedOutput.split('\n').every(line => code.includes(line.trim()));
}