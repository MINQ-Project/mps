import { promises as fs } from 'fs';
import Ajv from 'ajv';
import fetch from 'node-fetch';

// Interface Definition
export interface PkgJSONFile {
    main: string,
    meta: {
        name: string,
        version: string,
        description: string
    },
    scripts: Map<string, string>
}

export async function parsePkgJSON(jsonFilePath: string): Promise<PkgJSONFile | null> {
    // Load package.json file
    const rawData = await fs.readFile(jsonFilePath);
    const jsonData: any = JSON.parse(rawData.toString());

    // Fetch JSON schema
    const response = await fetch("https://raw.githubusercontent.com/MINQ-Project/mps/main/minq-pkg-json.json");
    const jsonSchema = await response.json() as any;

    // Ajv initialization
    const ajv = new Ajv();
    // JSON Data validation
    const validate = ajv.compile(jsonSchema);
    const valid = validate(jsonData);

    if (!valid) {
        console.error('MPS ERR: Invalid JSON data:', validate.errors);
        return null;
    }

    // Convert JSON Data to PkgJSONFile
    const result: PkgJSONFile = {
        main: (jsonData as any).main,
        meta: (jsonData as any).meta,
        scripts: (jsonData as any).scripts ? new Map(Object.entries((jsonData as any).scripts)) : new Map()
    };

    return result;
}
