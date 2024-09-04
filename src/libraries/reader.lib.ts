import fs from "node:fs";
import { parse, Options } from "csv-parse";

export function reader(
  path: string,
  config?: {
    onRow?: (row: any) => void;
    onFinish?: () => void;
    onError?: (err: Error) => void;
  },
  options: Options = { delimiter: ";", from_line: 2 }
) {
  console.log(`start reading: ${path}`);

  const t = performance.now();

  fs.createReadStream(path)
    .pipe(parse(options))
    .on("data", function (row) {
      if (config?.onRow) {
        config.onRow(row);
      }
    })
    .on("end", function () {
      const s = performance.now();
      console.log(`finished reading: ${((s - t) / 1000).toFixed(4)}s`);

      if (config?.onFinish) {
        config.onFinish();
      }
    })
    .on("error", function (error) {
      if (config?.onError) {
        config.onError(error);
      }

      throw new Error(error.message);
    });
}
