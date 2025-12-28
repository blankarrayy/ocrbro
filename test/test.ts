import { OcrBro } from '../nodes/OcrBro/OcrBro.node';
import * as fs from 'fs';
import * as path from 'path';

// Mock helpers
const mockHelpers = {
    getBinaryDataBuffer: (index: number, propertyName: string) => {
        const filePath = path.join(__dirname, 'sample.png');
        console.log(`Reading file from ${filePath}`);
        return fs.readFileSync(filePath);
    },
    getBinaryMetadata: (index: number, propertyName: string) => {
        return { mimeType: 'image/png' };
    },
    returnJsonArray: (items: any[]) => items
};

// Mock Node
const node = new OcrBro();

// Mock Execution Context
const mockExecute = async function (this: any) {
    this.helpers = mockHelpers;
    this.getNodeParameter = (param: string) => {
        if (param === 'binaryPropertyName') return 'data';
        if (param === 'language') return 'eng';
        return '';
    };
    this.getInputData = () => {
        return [{
            json: {},
            binary: {
                data: {
                    mimeType: 'image/png'
                }
            }
        }];
    };
    this.continueOnFail = () => false;

    console.log("Starting execution...");
    return await node.execute.call(this);
};

// Run
mockExecute.call({})
    .then((result: any) => {
        console.log("Execution successful!");
        console.log("Result JSON:", JSON.stringify(result[0][0].json, null, 2));
    })
    .catch((err: any) => {
        console.error("Execution failed:", err);
    });
