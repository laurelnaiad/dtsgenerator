import * as assert from 'power-assert';
import dtsgenerator from '../src/';
import opts, { clear } from '../src/commandOptions';


describe('type arithmetic test', () => {

    beforeEach(() => {
        opts.arithmetic = true;
    });

    afterEach(() => {
        clear();
    });

    it('should combine allOf and anyOf using intersection', async () => {
        const schema: JsonSchemaOrg.Schema = {
            id: 'http://test/typeArithmetic',
            allOf: [
                { anyOf: [
                    { type: 'object', required: ['a'], properties: { a: { type: 'string' } } },
                    { type: 'object', required: ['b'], properties: { b: { enum: ['one', 'two'] } } },
                ]},
                {
                    required: ['c'],
                    type: 'object',
                    properties: {
                        c:  { type: 'number'  },
                    },
                },
            ],
        };
        const result = await dtsgenerator([schema]);

        const expected = `declare namespace Test {
    export type TypeArithmetic = ({
        a: string;
    } | {
        b: "one" | "two";
    }) & {
        c: number;
    };
}
`;
        assert.equal(result, expected, result);
    });
});
