const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        console.log('Creating worker...');
        // Enable logging
        const worker = await createWorker({
            logger: m => console.log(m)
        });

        console.log('Loading language eng...');
        await worker.loadLanguage('eng');

        console.log('Initializing eng...');
        await worker.initialize('eng');

        const imagePath = path.join(__dirname, 'sample.png');
        console.log(`Reading image from ${imagePath}`);
        const imageBuffer = fs.readFileSync(imagePath);

        console.log('Recognizing...');
        const ret = await worker.recognize(imageBuffer);
        console.log('Text:', ret.data.text);

        await worker.terminate();
    } catch (err) {
        console.error('Error in main loop:', err);
    }
})();
