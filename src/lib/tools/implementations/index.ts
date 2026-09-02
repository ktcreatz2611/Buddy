import { toolRegistry } from '../registry';
import { webSearchTool } from './web-search';
import { urlRetrieverTool } from './url-retriever';
import { calculatorTool } from './calculator';
import { fileSearchTool } from './file-search';
import { codeExecutionTool } from './code-execution';

// Register all system tools
toolRegistry.register(webSearchTool);
toolRegistry.register(urlRetrieverTool);
toolRegistry.register(calculatorTool);
toolRegistry.register(fileSearchTool);
toolRegistry.register(codeExecutionTool);

// Export registry and tools for convenience
export { toolRegistry };
