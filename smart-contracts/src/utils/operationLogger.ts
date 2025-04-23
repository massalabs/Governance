import * as fs from 'fs';
import * as path from 'path';

const OPERATIONS_LOG_FILE = 'operations.log';

export function logOperation(operationType: string, operationId: string): void {
  const logEntry = `${operationType}: ${operationId}\n`;
  const logPath = path.join(process.cwd(), OPERATIONS_LOG_FILE);

  try {
    fs.appendFileSync(logPath, logEntry);
    console.log(`Operation logged: ${operationType} - ${operationId}`);
  } catch (error) {
    console.error('Failed to log operation:', error);
  }
} 