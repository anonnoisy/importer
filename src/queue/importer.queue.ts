import { Queue, QueueEvents } from "bullmq";
import { context } from "../bootstrap";
import { QUEUE_TOKEN } from "./queue";

export const QueueImporter = new Queue(QUEUE_TOKEN.IMPORTER, {
  connection: context.redisConnection,
});

const queueImporterEvents = new QueueEvents(QUEUE_TOKEN.IMPORTER, {
  connection: context.redisConnection,
});

queueImporterEvents.on("waiting", ({ jobId }) => {
  console.log(`A job with ID ${jobId} is waiting`);
});

queueImporterEvents.on("active", ({ jobId, prev }) => {
  console.log(`Job ${jobId} is now active; previous status was ${prev}`);
});

queueImporterEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`${jobId} has completed and returned ${returnvalue}`);
});

queueImporterEvents.on("failed", ({ jobId, failedReason }) => {
  console.log(`${jobId} has failed with reason ${failedReason}`);
});
