import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

export interface Package {
  meta: {
    name: string;
    description: string;
    version: string;
  };
  minq?: {
    file: string;
  };
  scripts?: Map<string, string>;
}

export default function convertXmlToPackage(xmlData: string): Package {
  const parser = new XMLParser();
  const jsonObj = parser.parse(xmlData);
  const meta = jsonObj.package.meta;
  const minq = jsonObj.package.minq;
  const scripts = new Map<string, string>();
  if (jsonObj.package.scripts) {
    jsonObj.package.scripts.script.forEach((script: any) => {
      scripts.set(script.name, script._);
    });
  }

  const pkg: Package = {
    meta: {
      name: meta.name,
      description: meta.description,
      version: meta.version,
    },
    minq: minq ? { file: minq.file } : undefined,
    scripts: scripts.size > 0 ? scripts : undefined,
  };

  return pkg;
}