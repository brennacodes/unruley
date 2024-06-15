const path = require('path');
const Mocha = require('mocha');

function setupMocha() {
    return new Promise((resolve, reject) => {
        try {
            const mocha = new Mocha({
                ui: 'tdd',
                color: true,
                timeout: 10000 // Increase timeout as needed
            });

            const testFile = path.resolve(__dirname, './extension.test.js');
            mocha.addFile(testFile);

            mocha.run(failures => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

exports.run = setupMocha;
