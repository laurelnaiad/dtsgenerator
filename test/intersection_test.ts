import * as assert from 'power-assert';
import { clear } from '../src/commandOptions';
import opts from '../src/commandOptions';
import dtsgenerator from '../src/core';

describe('intersection test', () => {

    beforeEach(() => {
        opts.intersection = true;
        opts.allDefs = true;
    });

    afterEach(() => {
        clear();
    });

    it('should combine allOf and anyOf using intersection', async () => {
        const schema: JsonSchemaOrg.Draft04.Schema = {
            id: 'http://test/intersection',
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
        const result = await dtsgenerator({ contents: [schema] });

        const expected = `declare namespace Test {
    export type Intersection = ({
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

    it('two namespace test', async () => {
        const schema1: JsonSchemaOrg.Draft04.Schema = {
            id: `my_ns`,
            definitions: {
                A: {

                    type: 'array',
                    items: {
                        $ref: `my_other_ns#/definitions/B`,
                    },
                },
            },
        };

        const schema2: JsonSchemaOrg.Draft04.Schema = {
            id: `my_other_ns`,
            definitions: {
                B: { type: 'string' },
            },
        };

        const result = await dtsgenerator({ contents: [schema1, schema2] });
        const x =
`declare type MyNs = any;
declare namespace MyNs {
    namespace Definitions {
        export type A = MyOtherNs.Definitions.B[];
    }
}
declare type MyOtherNs = any;
declare namespace MyOtherNs {
    namespace Definitions {
        export type B = string;
    }
}
`;
        assert.equal(result, x, result);

    });

});
