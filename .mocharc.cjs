const nodeVersion = process.version
const nodeMajorVersion = Number.parseInt(nodeVersion.slice(1, nodeVersion.indexOf('.')))
const mochaOptions = {
    extensions: ['ts'],
    spec: 'src/tests/**/*.spec.ts'
}

if (nodeMajorVersion <= 16) {
    mochaOptions.loader = 'ts-node/esm'
    mochaOptions.require = 'ts-node/register'
} else {
    mochaOptions['node-option'] = ['import=./node/register.mjs']
}

module.exports = mochaOptions
