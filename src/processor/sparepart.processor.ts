import { Job, Worker } from "bullmq";
import { reader } from "../libraries";
import { QUEUE_TOKEN } from "../queue/queue";
import { context } from "../bootstrap";
import { Brand, Category } from "../repositories";
import { Prisma } from "@prisma/client";
import { Collection, Parser } from "../helpers";
import { QueueImporter, QueuePartial } from "../queue";

export async function sparepartProcessor(path: string) {
  const brands = await Brand.findManyMap();
  const categories = await Category.findManyMap();

  const spareparts: Prisma.sparepartsUncheckedCreateInput[] = [];

  reader(path, {
    onRow: (row: string[]) => {
      if (!categories.has(row[3])) {
        throw new Error(`category with name: ${row[3]} is not found`);
      }
      if (!brands.get(row[4])) {
        throw new Error(`brand with name: ${row[4]} is not found`);
      }

      spareparts.push({
        part_number: row[1],
        part_name: row[2],
        category_id: categories.get(row[3])!.id,
        brand_id: brands.get(row[4])!.id,
        part_description: row[5] === "" ? undefined : row[5],
        device_compatible: row[6] === "" ? undefined : row[6],
        version: row[7] === "" ? undefined : row[7],
        initial_stock: 1000,
        sparepart_prices: {
          create: [
            {
              label: "Price",
              value: Parser.rupiah(row[9]),
            },
            {
              label: "Partner Price",
              value: Parser.rupiah(row[10]),
            },
            {
              label: "B2B Price",
              value: Parser.rupiah(row[11]),
            },
            {
              label: "B2G Price",
              value: Parser.rupiah(row[12]),
            },
          ],
        },
      });
    },
    onFinish: async () => {
      const sparepartChunks = Collection.chunk(spareparts, 100);

      await QueuePartial.obliterate();
      await QueueImporter.obliterate();

      for (let index = 0; index < sparepartChunks.length; index++) {
        QueuePartial.add(`partial_${index}`, sparepartChunks[index], {
          delay: index * 5000,
        });
      }
    },
  });

  if (!workerPartial.isRunning()) {
    workerPartial.run();
  }

  if (!workerImporter.isRunning()) {
    workerImporter.run();
  }
}

const workerPartial = new Worker(
  QUEUE_TOKEN.PARTIAL,
  async (job: Job<Prisma.sparepartsUncheckedCreateInput[]>) => {
    const chunks = Collection.chunk(job.data, 10);

    for (let index = 0; index < job.data.length; index++) {
      QueueImporter.add(`${job.name}_importer_${index}`, chunks[index], {
        delay: index * 200,
      });
    }
  },
  {
    connection: context.redisConnection,
  }
);

workerPartial.on("completed", (job) => {
  console.log(`${job.name} has completed!`);
});

workerPartial.on("failed", (job, err) => {
  console.log(`${job!.name} has failed with ${err.message}`);
});

const workerImporter = new Worker(
  QUEUE_TOKEN.IMPORTER,
  async (job: Job<Prisma.sparepartsUncheckedCreateInput[]>) => {
    const start = performance.now();
    for (let index = 0; index < job.data.length; index++) {
      const sparepart = job.data[index];

      await Promise.all([
        context.db.sparepart_prices.deleteMany({
          where: { part_number: sparepart.part_number },
        }),
        context.db.spareparts.deleteMany({
          where: { part_number: sparepart.part_number },
        }),
      ]);

      await context.db.spareparts.create({
        data: sparepart,
      });
    }

    const end = performance.now();
    return `finished in: ${end - start}ms`;
  },
  {
    connection: context.redisConnection,
  }
);

workerImporter.on("completed", (job) => {
  console.log(`${job.name} has completed!`);
});

workerImporter.on("failed", (job, err) => {
  console.log(`${job!.name} has failed with ${err.message}`);
});
