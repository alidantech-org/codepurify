export function assertSerializable(value: unknown, path = 'root'): void {
  if (typeof value === 'function') {
    throw new Error(`Non-serializable function found at ${path}`);
  }

  if (!value || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      assertSerializable(item, `${path}[${index}]`);
    });
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    assertSerializable(child, `${path}.${key}`);
  }
}
