import { Transform } from 'node:stream'

export default function lcovParser(): Transform {
    return new Transform({
        autoDestroy: false,
        defaultEncoding: 'utf-8',
        emitClose: false,
        readableObjectMode: true
    })
}
