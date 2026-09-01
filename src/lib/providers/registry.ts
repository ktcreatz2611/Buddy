import { ProviderAdapter } from './types';

class ProviderRegistry {
  private adapters = new Map<string, ProviderAdapter>();

  register(adapter: ProviderAdapter): void {
    if (this.adapters.has(adapter.id)) {
      throw new Error(`Provider adapter '${adapter.id}' is already registered`);
    }
    this.adapters.set(adapter.id, adapter);
  }

  get(id: string): ProviderAdapter {
    const adapter = this.adapters.get(id);
    if (!adapter) {
      throw new Error(`Provider adapter '${id}' not found. Available: ${[...this.adapters.keys()].join(', ')}`);
    }
    return adapter;
  }

  has(id: string): boolean {
    return this.adapters.has(id);
  }

  list(): ProviderAdapter[] {
    return [...this.adapters.values()];
  }

  listIds(): string[] {
    return [...this.adapters.keys()];
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
