export namespace Parser {
  export function rupiah(s: string): number {
    const parsed = s
      .replaceAll("Rp", "")
      .replaceAll(".", "")
      .replaceAll(",", ".");

    return parseFloat(parsed);
  }
}
