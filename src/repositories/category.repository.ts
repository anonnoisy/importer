import { context } from "../bootstrap";

export namespace Category {
  export async function findManyMap() {
    const categories = await context.db.categories.findMany();
    return new Map(categories.map((c) => [c.name, c]));
  }
}
