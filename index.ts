import { spawn } from "child_process";
import { runFile } from "./minq-runner";
import { PkgJSONFile, parsePkgJSON } from "./package-parser";
import * as yargs from 'yargs';
import { prompt } from "readline-sync";
import { existsSync, writeFileSync } from "fs";

async function runPkgMain(pkg: PkgJSONFile) {
    console.log("> " + pkg?.meta.name + "@" + pkg?.meta.version)
    console.log("> " + pkg?.meta.description.split("\n").join("\n> "));
    if(!existsSync(pkg?.main as string)) {
        console.error("MPS ERR: File '" + pkg?.main as string + "' does not exist!");
        process.exit(-1);
    }
    runFile(pkg?.main as string);
}
(async () => {
let pkg: null | PkgJSONFile = null;

    try {
        if (existsSync("pkg.json")) {
            pkg = await parsePkgJSON("pkg.json");
        }
    }
    catch (err) {
        console.log(err)
        console.error("MPS ERR: Cannot parse pkg.json because it`s invaild!");
        process.exit(-1);
    }

function checkPkg() {
    if (pkg === null) {
        console.error("MPS ERR: " + "pkg.json file not defined in this directory!")
        process.exit(-1);
    }
}
yargs.version("1.1.0");

yargs.command({
    command: 'run <script>',
    describe: 'Runs a script from package',
    handler(argv) {
        checkPkg();
        const script = argv.script as string;
        if (!pkg?.scripts.has(script)) {
            console.error("MPS ERR: Script '" + script + "' does not exist in package " + pkg?.meta.name + "@" + pkg?.meta.version + "")
            process.exit(-1);
        }
        const spawnedProcess = spawn("cmd", ["/c", pkg?.scripts.get(script) as string]);
        spawnedProcess.stderr.pipe(process.stderr);
        process.stdin.pipe(spawnedProcess.stdin);
        spawnedProcess.stdout.pipe(process.stdout);
    }
});

yargs.command({
    command: 'init',
    describe: 'Initializes pkg.json file',
    builder: {
        y: {
            describe: 'is values initialized automaticly?',
            type: 'boolean'
        }
    },
    handler(argv) {
        if (existsSync("pkg.json")) {
            console.error("MPS ERR: Cannot initialize package because pkg.json alredy exists.");
            process.exit(-1);
        }
        if (argv.y) {
            const generatedJson = `
{
    "$schema": "https://raw.githubusercontent.com/MINQ-Project/mps/main/minq-pkg-json.json",
    "meta": {
        "name": "my-package",
        "version": "v1.0.0",
        "description": "No description provided."
    },
    "main": "index.mq",
    "scripts": {

    }
}
`;
            console.log(generatedJson);
            writeFileSync("pkg.json", generatedJson)
        } else {
            const nameregex = /^(?!mps$|minq$)[a-z\-]+$/
            let packageName: string = "";
            while (!nameregex.test(packageName)) {
                packageName = prompt({
                    prompt: "Package name (my-package): "
                }).trim();
                if (!packageName) {
                    packageName = "my-package";
                }
                if (!nameregex.test(packageName)) {
                    console.log("Name is invaild. try again!");
                }
            }

            const versionregex = /v(\d+\.){2}\d+$/
            let packageVersion: string = "";
            while (!versionregex.test(packageVersion)) {
                packageVersion = prompt({
                    prompt: "Package Version (v1.0.0): "
                }).trim();
                if (!packageVersion) {
                    packageVersion = "v1.0.0";
                } else if (!versionregex.test(packageVersion)) {
                    console.log("Version is invaild. try again!");
                }
            }

            const mainregex = /.*\.(minq|mq)$/i
            let packageMain = "";
            while (!mainregex.test(packageMain)) {
                packageMain = prompt({
                    prompt: "Package Main File (index.mq): "
                }).trim();
                if (!packageMain) {
                    packageMain = "index.mq";
                } else if (!mainregex.test(packageMain)) {
                    console.log("Main File is invaild. try again!");
                }
            }

            let packageDescription = prompt({
                prompt: "Package description (No description provided.): "
            }).trim();
            if (!packageDescription) {
                packageDescription = "No description provided.";
            }

            const generatedJson = `
{
    "$schema": "https://raw.githubusercontent.com/MINQ-Project/mps/main/minq-pkg-json.json",
    "meta": {
        "name": "${packageName}",
        "version": "${packageVersion}",
        "description": "${packageDescription}"
    },
    "main": "${packageMain}",
    "scripts": {
                    
    }
}
            `;
            writeFileSync("pkg.json", generatedJson)
        }
    }
});


yargs.command({
    command: '$0',
    handler: function () {
        checkPkg();
        runPkgMain(pkg as PkgJSONFile)
    }
});

yargs.demandCommand(1)
    .recommendCommands()
    .strict()
    .parse();
})();