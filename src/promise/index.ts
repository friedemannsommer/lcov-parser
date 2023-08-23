import { Lcov } from '../typings/file.js'
import { LcovParser } from '../parser.js'
import defaultFieldNames from '../lib/field-names.js'

export default function lcovParser(): Promise<Lcov> {
    const parser = new LcovParser(defaultFieldNames)

    parser.write(
        Buffer.from(`TN:awesome name
SF:path/to/file.ts
FN:1,fnName
FNF:1
FNH:1
FNDA:3,fnName
DA:1,1
DA:2,3
DA:3,3
LF:3 # for some (currently) unknown reason this will be "skipped"
LH:3
BRDA:1,0,0,3
BRF:1
BRH:1
end_of_record`)
    )

    console.log(parser.flush())

    return Promise.reject()
}
