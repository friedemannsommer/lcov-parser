module.exports = {
    'node-option': [process.version.startsWith('v16.') ? 'require=ts-node/register' : 'import=./node/register.mjs'],
    extension: ['ts'],
    spec: 'src/tests/**/*.spec.ts'
}