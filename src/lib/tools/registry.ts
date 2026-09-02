import { Tool, PermissionScope } from './types';

/**
 * Registry for managing available tools in the workspace.
 * Follows a singleton pattern.
 */
class ToolRegistry {
  private tools = new Map<string, Tool>();

  /**
   * Register a new tool.
   * @param tool The tool to register.
   */
  register(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool ${tool.name} is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * Get a tool by its name.
   * @param name The name of the tool.
   * @returns The tool if found, otherwise undefined.
   */
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool exists.
   * @param name The name of the tool.
   * @returns True if the tool exists, otherwise false.
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * List all registered tools.
   * @returns An array of all tools.
   */
  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * List tools by a specific permission scope.
   * @param scope The permission scope to filter by.
   * @returns An array of tools matching the scope.
   */
  listByScope(scope: PermissionScope): Tool[] {
    return this.list().filter(tool => tool.permissionScope === scope);
  }

  /**
   * Get tools allowed for a specific role.
   * @param role The role of the caller.
   * @param allowlist Specific tools explicitly allowed.
   * @returns Array of allowed tools.
   */
  getForRole(role: string, allowlist: string[]): Tool[] {
    // In a real implementation, you'd check role-based permissions.
    // For now, we intersect the allowlist with registered tools.
    return allowlist
      .map(name => this.get(name))
      .filter((tool): tool is Tool => tool !== undefined);
  }
}

export const toolRegistry = new ToolRegistry();
