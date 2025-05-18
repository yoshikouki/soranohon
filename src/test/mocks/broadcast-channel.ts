export class MockBroadcastChannel {
  name: string;
  listeners: Map<string, Set<(event: MessageEvent) => void>> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  postMessage(data: unknown) {
    const event = new MessageEvent("message", { data });
    const listeners = this.listeners.get("message");
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  addEventListener(event: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(listener);
  }

  removeEventListener(event: string, listener: (event: MessageEvent) => void) {
    this.listeners.get(event)?.delete(listener);
  }

  close() {
    this.listeners.clear();
  }
}
