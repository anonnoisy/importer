import { context } from "./bootstrap";
import { sparepartProcessor } from "./processor";

async function main() {
  await sparepartProcessor("storage/spareparts.csv");
}

main()
  .then(async () => {
    await context.db.$disconnect();
  })
  .catch(async (e) => {
    console.log(e);
    await context.db.$disconnect();
    process.exit(1);
  });
