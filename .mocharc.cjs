const nodeVersion = process.version
const nodeMajorVersion = Number.parseInt(nodeVersion.slice(1, nodeVersion.indexOf('.')))

module.exports = {
    'node-option': nodeMajorVersion > 16 ? ['import=./node/register.mjs'] : undefined,
    extension: ['ts'],
    spec: 'src/tests/**/*.spec.ts',
    loader: nodeMajorVersion <= 16 ? 'ts-node/esm' : undefined
}
