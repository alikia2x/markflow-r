export interface MarkedToken extends ProcessedToken {
	status?: "added";
}

export interface ProcessedToken {
    tag?: string;
    content?: string;
    attrs?: { [key: string]: string };
    children?: ProcessedToken[];
    type?: string;
    info?: string;
}

export interface Token {
    type: string;
    tag: string;
    attrs: Array<[string, string]> | null;
    map: [number, number] | null;
    nesting: number;
    level: number;
    children: Token[] | null;
    content: string;
    markup: string;
    info: string;
    meta: unknown;
    block: boolean;
    hidden: boolean;
    attrIndex(name: string): number;
    attrPush(attrData: [string, string]): void;
    attrSet(name: string, value: string): void;
    attrGet(name: string): string | null;
    attrJoin(name: string, value: string): void;
}