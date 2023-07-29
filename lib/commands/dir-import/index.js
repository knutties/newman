const dirUtils = require('../dir-utils');
const commandUtil = require('../../../bin/util');
/*
    @param {Command} - An commander Command instance to which this command is added
*/
module.exports = function (program) {
    program
        .command('dir-import <collection-dir>')
        .description('convert a postman directory representation into a postman collection')
        .usage('<collection-dir> [options]')
        .option('-o, --output-file <file>', 'output collection file, default is collection.json')
        .action((collectionDir, command) => {
            dirUtils.assertDirectoryExistence(collectionDir);

            let collectionJson = {};
            let outputFile = 'collection.json';
            let options = commandUtil.commanderToObject(command);
            if (typeof(options.outputFile) === 'string') {
                outputFile = options.outputFile;
            }
            collectionJson = dirUtils.dirTreeToCollectionJson(collectionDir);

            let content = JSON.stringify(collectionJson, null, 2);
            dirUtils.createFile(outputFile, content);
            process.exit(0);
        });
}
