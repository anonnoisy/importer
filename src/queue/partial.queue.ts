import { Queue, QueueEvents } from "bullmq";
import { context } from "../bootstrap";
import { QUEUE_TOKEN } from "./queue";

export const QueuePartial = new Queue(QUEUE_TOKEN.PARTIAL, {
  connection: context.redisConnection,
});

const queuePartialEvents = new QueueEvents(QUEUE_TOKEN.PARTIAL, {
  connection: context.redisConnection,
});

queuePartialEvents.on("waiting", ({ jobId }) => {
  console.log(`A job with ID ${jobId} is waiting`);
});

queuePartialEvents.on("active", ({ jobId, prev }) => {
  console.log(`Job ${jobId} is now active; previous status was ${prev}`);
});

queuePartialEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`${jobId} has completed and returned ${returnvalue}`);
});

queuePartialEvents.on("failed", ({ jobId, failedReason }) => {
  console.log(`${jobId} has failed with reason ${failedReason}`);
});
