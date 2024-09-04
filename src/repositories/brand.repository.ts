import { context } from "../bootstrap";

export namespace Brand {
  export async function findManyMap() {
    const brands = await context.db.brands.findMany();
    return new Map(brands.map((b) => [b.name, b]));
  }
}
