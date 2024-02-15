import { spawn } from "child_process";

// just call minq
export async function runFile(minqfile: string) {
    const spawnedProcess = spawn("minq", ["-f", minqfile]);
    spawnedProcess.stderr.pipe(process.stderr);
    process.stdin.pipe(spawnedProcess.stdin);
    spawnedProcess.stdout.pipe(process.stdout);
}