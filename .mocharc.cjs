const nodeVersion = process.version
const nodeMajorVersion = Number.parseInt(nodeVersion.slice(1, nodeVersion.indexOf('.')))

module.exports = {
    extensions: ['ts'],
    loader: nodeMajorVersion <= 16 ? 'ts-node/esm' : undefined,
    'node-option': nodeMajorVersion > 16 ? ['import=./node/register.mjs'] : undefined,
    require: nodeMajorVersion <= 16 ? 'ts-node/register' : undefined,
    spec: 'src/tests/**/*.spec.ts'
}
