import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { createWorker } from 'tesseract.js';

export class OcrBro implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'OCR Bro',
        name: 'ocrBro',
        icon: 'file:ocrbro.png',
        group: ['transform'],
        version: 1,
        description: 'Extract text from images (OCR) or PDFs',
        defaults: {
            name: 'OCR Bro',
        },
        inputs: ['main'],
        outputs: ['main'],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'OCR from Image',
                        value: 'ocrImage',
                        description: 'Extract text from images using Tesseract OCR',
                    },
                    {
                        name: 'Extract Text from PDF',
                        value: 'extractPdf',
                        description: 'Extract text from PDF documents',
                    },
                ],
                default: 'ocrImage',
            },
            {
                displayName: 'Input Binary Field',
                name: 'binaryPropertyName',
                type: 'string',
                default: 'data',
                required: true,
                description: 'The name of the binary property containing the file',
            },
            {
                displayName: 'Language',
                name: 'language',
                type: 'string',
                default: 'eng',
                description: 'Tesseract language code (e.g., eng, deu, spa). Multiple languages can be separated by "+".',
                displayOptions: {
                    show: {
                        operation: ['ocrImage'],
                    },
                },
            },
            {
                displayName: 'Password Protected?',
                name: 'isPasswordProtected',
                type: 'boolean',
                default: false,
                description: 'Whether the PDF file is encrypted/password protected',
                displayOptions: {
                    show: {
                        operation: ['extractPdf'],
                    },
                },
            },
            {
                displayName: 'Password',
                name: 'password',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                description: 'The password required to unlock the PDF document',
                displayOptions: {
                    show: {
                        operation: ['extractPdf'],
                        isPasswordProtected: [true],
                    },
                },
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const operation = this.getNodeParameter('operation', 0) as string;
        const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;

        if (operation === 'ocrImage') {
            const language = this.getNodeParameter('language', 0) as string;

            // @ts-ignore
            const worker = await createWorker();
            // @ts-ignore
            await worker.loadLanguage(language);
            // @ts-ignore
            await worker.initialize(language);

            for (let i = 0; i < items.length; i++) {
                try {
                    const item = items[i];
                    // @ts-ignore
                    const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
                    const binaryMetadata = item.binary ? item.binary[binaryPropertyName] : undefined;

                    if (!binaryMetadata) {
                        throw new Error(`Binary property "${binaryPropertyName}" does not exist on item ${i}`);
                    }

                    const mimeType = binaryMetadata.mimeType;

                    if (!mimeType.startsWith('image/')) {
                        throw new Error(`Unsupported file type: ${mimeType}. Use "Extract Text from PDF" for PDF files.`);
                    }

                    // @ts-ignore
                    const { data } = await worker.recognize(binaryData);

                    returnData.push({
                        json: {
                            text: data.text,
                            confidence: data.confidence,
                            words: data.words?.length || 0,
                        },
                        binary: item.binary,
                    });
                } catch (error) {
                    if (this.continueOnFail()) {
                        returnData.push({ json: { error: (error as Error).message } });
                        continue;
                    }
                    throw error;
                }
            }

            await worker.terminate();
        } else if (operation === 'extractPdf') {
            // Dynamic import for ESM module
            const { extractText, getDocumentProxy } = await import('unpdf');

            for (let i = 0; i < items.length; i++) {
                try {
                    const item = items[i];
                    // @ts-ignore
                    const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
                    const binaryMetadata = item.binary ? item.binary[binaryPropertyName] : undefined;

                    if (!binaryMetadata) {
                        throw new Error(`Binary property "${binaryPropertyName}" does not exist on item ${i}`);
                    }

                    const mimeType = binaryMetadata.mimeType;

                    if (mimeType !== 'application/pdf') {
                        throw new Error(`Expected PDF file but got: ${mimeType}. Use "OCR from Image" for image files.`);
                    }

                    let pdfBufferToProcess: any = new Uint8Array(binaryData);
                    
                    const isPasswordProtected = this.getNodeParameter('isPasswordProtected', i, false) as boolean;
                    if (isPasswordProtected) {
                        const password = this.getNodeParameter('password', i) as string;
                        const { PDFDocument } = await import('@yongseok_choi/pdf-lib');
                        const pdfDoc = await PDFDocument.load(binaryData, {
                            password: password,
                            ignoreEncryption: true,
                        });
                        pdfBufferToProcess = (await pdfDoc.save()) as unknown as Uint8Array;
                    }

                    const pdf = await getDocumentProxy(pdfBufferToProcess);
                    const { text, totalPages } = await extractText(pdf, { mergePages: true });

                    returnData.push({
                        json: {
                            text: text as string,
                            pages: totalPages,
                        },
                        binary: item.binary,
                    });
                } catch (error) {
                    if (this.continueOnFail()) {
                        returnData.push({ json: { error: (error as Error).message } });
                        continue;
                    }
                    throw error;
                }
            }
        }

        return [returnData];
    }
}
