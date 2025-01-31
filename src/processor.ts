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

export interface ProcessedToken {
    tag?: string;
    content?: string;
    attrs?: { [key: string]: string };
    children?: ProcessedToken[];
}

export function preprocess(tokens: Token[]): ProcessedToken[] {
    const root: ProcessedToken = { children: [] };
    const stack: ProcessedToken[] = [root];
    let current = root;

    for (const token of tokens) {
        if (token.nesting === 1) {
            const newNode = createNode(token);
            current.children!.push(newNode);
            stack.push(newNode);
            current = newNode;
        } else if (token.nesting === -1) {
            if (stack.length > 1) {
                stack.pop();
                current = stack[stack.length - 1];
            }
        } else if (token.type === 'inline') {
            // 直接合并 inline 的子节点到当前层级
            const inlineChildren = processInlineChildren(token);
            current.children!.push(...inlineChildren);
        } else {
            current.children!.push(processStandaloneToken(token));
        }
    }

    return root.children || [];
}

function processInlineChildren(token: Token): ProcessedToken[] {
    const result: ProcessedToken[] = [];
    const localStack: ProcessedToken[] = [];
    let current: ProcessedToken | null = null;

    const handleToken = (t: Token) => {
        if (t.nesting === 1) {
            const node = createNode(t);
            if (current) {
                current.children!.push(node);
            } else {
                result.push(node);
            }
            localStack.push(node);
            current = node;
        } else if (t.nesting === -1) {
            if (localStack.length > 0) {
                localStack.pop();
                current = localStack[localStack.length - 1] || null;
            }
        } else {
            const processed = processStandaloneToken(t);
            // 过滤空节点
            if (processed.tag || processed.content || processed.children?.length) {
                if (current) {
                    current.children!.push(processed);
                } else {
                    result.push(processed);
                }
            }
        }
    };

    token.children?.forEach(handleToken);
    return result;
}

function createNode(token: Token): ProcessedToken {
    const node: ProcessedToken = {
        tag: token.tag || undefined,
        attrs: token.attrs && token.attrs.length > 0 
            ? Object.fromEntries(token.attrs) 
            : undefined
    };

    if (token.type === 'code_inline') {
        node.content = token.content;
    } else {
        node.children = [];
    }

    return node;
}

function processStandaloneToken(token: Token): ProcessedToken {
    const result: ProcessedToken = {};

    if (token.tag) result.tag = token.tag;
    if (token.attrs?.length) result.attrs = Object.fromEntries(token.attrs);

    // 处理文本内容
    if (token.content && !token.children?.length) {
        result.content = token.content;
    }
    // 递归处理子节点
    else if (token.children?.length) {
        result.children = token.children
            .map(processStandaloneToken)
            .filter(child => child.tag || child.content || child.children?.length); // 过滤空子节点
    }

    // 如果节点没有任何有效内容，则返回空对象
    if (!result.tag && !result.content && !result.children?.length) {
        return {};
    }

    return result;
}