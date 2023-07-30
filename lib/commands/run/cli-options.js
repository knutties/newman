const commandUtil = require('../../../bin/util');

const cliOptions = [
    ['-e, --environment <path>', 'Specify a URL or path to a Postman Environment'],
    ['-g, --globals <path>', 'Specify a URL or path to a file containing Postman Globals'],
    ['-r, --reporters [reporters]', 'Specify the reporters to use for this run', commandUtil.cast.csvParse, ['cli']],
    ['-n, --iteration-count <n>', 'Define the number of iterations to run', commandUtil.cast.integer],
    ['-d, --iteration-data <path>', 'Specify a data file to use for iterations (either JSON or CSV)'],
    ['--folder <path>',
        'Specify the folder to run from a collection. Can be specified multiple times to run multiple folders',
        commandUtil.cast.memoize, []],
    ['--global-var <value>',
        'Allows the specification of global variables via the command line, in a key=value format',
        commandUtil.cast.memoizeKeyVal, []],
    ['--env-var <value>',
        'Allows the specification of environment variables via the command line, in a key=value format',
        commandUtil.cast.memoizeKeyVal, []],
    ['--export-environment <path>', 'Exports the final environment to a file after completing the run'],
    ['--export-globals <path>', 'Exports the final globals to a file after completing the run'],
    ['--export-collection <path>', 'Exports the executed collection to a file after completing the run'],
    ['--postman-api-key <apiKey>', 'API Key used to load the resources from the Postman API'],
    ['--bail [modifiers]',
        'Specify whether or not to gracefully stop a collection run on encountering an error' +
        ' and whether to end the run with an error based on the optional modifier', commandUtil.cast.csvParse],
    ['--ignore-redirects', 'Prevents Newman from automatically following 3XX redirect responses'],
    ['-x , --suppress-exit-code', 'Specify whether or not to override the default exit code for the current run'],
    ['--silent', 'Prevents Newman from showing output to CLI'],
    ['--disable-unicode', 'Forces Unicode compliant symbols to be replaced by their plain text equivalents'],
    ['--color <value>', 'Enable/Disable colored output (auto|on|off)', commandUtil.cast.colorOptions, 'auto'],
    ['--delay-request [n]', 'Specify the extent of delay between requests (milliseconds)', commandUtil.cast.integer, 0],
    ['--timeout [n]', 'Specify a timeout for collection run (milliseconds)', commandUtil.cast.integer, 0],
    ['--timeout-request [n]', 'Specify a timeout for requests (milliseconds)', commandUtil.cast.integer, 0],
    ['--timeout-script [n]', 'Specify a timeout for scripts (milliseconds)', commandUtil.cast.integer, 0],
    ['--working-dir <path>', 'Specify the path to the working directory'],
    ['--no-insecure-file-read', 'Prevents reading the files situated outside of the working directory'],
    ['-k, --insecure', 'Disables SSL validations'],
    ['--ssl-client-cert-list <path>', 'Specify the path to a client certificates configurations (JSON)'],
    ['--ssl-client-cert <path>', 'Specify the path to a client certificate (PEM)'],
    ['--ssl-client-key <path>', 'Specify the path to a client certificate private key'],
    ['--ssl-client-passphrase <passphrase>', 'Specify the client certificate passphrase (for protected key)'],
    ['--ssl-extra-ca-certs <path>', 'Specify additionally trusted CA certificates (PEM)'],
    ['--cookie-jar <path>', 'Specify the path to a custom cookie jar (serialized tough-cookie JSON) '],
    ['--export-cookie-jar <path>', 'Exports the cookie jar to a file after completing the run'],
    ['--verbose', 'Show detailed information of collection run and each request sent']
];

module.exports = {
    cliOptions: cliOptions
};
