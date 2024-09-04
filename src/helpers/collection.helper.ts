export namespace Collection {
  export function chunk<T>(arr: T[], size: number) {
    return Array.from(
      { length: Math.ceil(arr.length / size) },
      (_: T, i: number) => arr.slice(i * size, i * size + size)
    );
  }
}
