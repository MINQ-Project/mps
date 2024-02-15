import fs from 'fs';
import Ajv from 'ajv';
// Definicja interfejsu
export interface PkgJSONFile {
    main: string,
    meta: {
        name: string,
        version: string,
        description: string
    },
    scripts: Map<string, string>   
}

// Funkcja do parsowania JSON
export function parsePkgJSON(jsonFilePath: string, schemaFilePath: string): PkgJSONFile | null {
    // Wczytanie pliku JSON
    const rawData = fs.readFileSync(jsonFilePath);
    const jsonData: any = JSON.parse(rawData.toString());

    // Wczytanie schematu JSON
    const rawSchema = fs.readFileSync(schemaFilePath);
    const jsonSchema = JSON.parse(rawSchema.toString());

    // Inicjalizacja Ajv i dodanie schematu Draft-04
    const ajv = new Ajv();
    // Walidacja danych JSON za pomocą schematu
    const validate = ajv.compile(jsonSchema);
    const valid = validate(jsonData);

    if (!valid) {
        console.error('Invalid JSON data:', validate.errors);
        return null;
    }

    // Przekształcenie danych JSON na interfejs PkgJSONFile
    const result: PkgJSONFile = {
        main: (jsonData as any).main as string,
        meta: (jsonData as any).meta as { name: string; version: string; description: string; },
        scripts: (jsonData as any).scripts ? new Map(Object.entries((jsonData as any).scripts)) : new Map()
    };

    return result;
}
