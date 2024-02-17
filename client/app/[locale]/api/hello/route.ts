import { join } from "path";
import { existsSync } from "fs";
import { spawnSync } from "child_process";

export function GET(req: Request, res: Response) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "";

    const dirPath = join(process.cwd(), "opencvScripts");
    const path = join(dirPath, "hello.py");

    if (!existsSync(path)) {
      return new Response(
        JSON.stringify({
          message: `Python script not found at: ${path}`,
        }),
        {
          status: 500,
          headers: {
            "content-type": "application/json;charset=UTF-8",
          },
        }
      )
    }

    console.log(`Running Python script at: ${path}`);
    // const pythonProcess = spawnSync("python", [path, name], { encoding: "utf8" });
    const pythonProcess = spawnSync("python", [path, Buffer.from(name, "utf8").toString("hex")], { encoding: "utf8" });
    // const pythonProcess = spawnSync("python", [path, name], { encoding: "utf8", env: { ...process.env, PYTHONIOENCODING: "UTF-8" } });
    const result = pythonProcess.stdout.toString();
    console.log(result);

    return new Response(
      JSON.stringify({
        message: `${result}`,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: `Internal Server Error - ${error}`,
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      }
    )
  }
}