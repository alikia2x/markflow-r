import { MarkedToken, ProcessedToken, Token } from "./global";

export function preprocess(tokens: Token[]): ProcessedToken[] {
	const root: ProcessedToken = { children: [] };
	const stack: ProcessedToken[] = [root];
	let current = root;

	let lastInlineTokenPosition = -1;

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.type === "inline") {
			lastInlineTokenPosition = i;
		}
	}

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
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
		} else if (token.type === "inline") {
			const inlineChildren = processInlineChildren(
				token,
				lastInlineTokenPosition == i
			);
			current.children!.push(...inlineChildren);
		} else {
			current.children!.push(processStandaloneToken(token));
		}
	}

	return root.children || [];
}

function processInlineChildren(token: Token, l: boolean): ProcessedToken[] {
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
			if (
				processed.tag ||
				processed.content ||
				processed.children?.length
			) {
				if (current) {
					current.children!.push(processed);
				} else {
					result.push(processed);
				}
			}
		}
	};

	function splitContentIntoUnicodeChars(
		content: string,
		b: boolean = false
	): ProcessedToken[] {
		const contentArray = b ? Array.from(content) : [content];
		return contentArray.map((char) => ({
			type: "text" as const,
			content: char,
		}));
	}

	// 遍历 token.children
	token.children?.forEach((child, i) => {
		if (child.type === "text") {
			const unicodeTokens = splitContentIntoUnicodeChars(child.content, l && i == token.children.length - 1);
			if (current) {
				current.children!.push(...unicodeTokens);
			} else {
				result.push(...unicodeTokens);
			}
		} else {
			handleToken(child);
		}
	});

	return result;
}

function createNode(token: Token): ProcessedToken {
	const node: ProcessedToken = {
		tag: token.tag || undefined,
		attrs:
			token.attrs && token.attrs.length > 0
				? Object.fromEntries(token.attrs)
				: undefined,
	};

	if (token.type === "code_inline") {
		node.content = token.content;
	} else {
		node.children = [];
	}

	return node;
}

function processStandaloneToken(token: Token): ProcessedToken {
	const result: ProcessedToken = {
		type: token.type,
		info: token.info ?? undefined,
	};

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
			.filter(
				(child) => child.tag || child.content || child.children?.length
			); // 过滤空子节点
	}

	// 如果节点没有任何有效内容，则返回空对象
	if (!result.tag && !result.content && !result.children?.length) {
		return {};
	}

	return result;
}

export function diffTokens(
	arr: ProcessedToken[],
	arr_new: ProcessedToken[]
): MarkedToken[] {
	const result: MarkedToken[] = JSON.parse(JSON.stringify(arr_new));
	const map = new Map<string, ProcessedToken>();
	function buildMap(tokens: ProcessedToken[], path: string) {
		tokens.forEach((token, index) => {
			const currentPath = `${path}.${index}`;
			map.set(currentPath, token);
			if (token.children) {
				buildMap(token.children, currentPath);
			}
		});
	}
	buildMap(arr, "");
	function compareTokens(newTokens: MarkedToken[], path: string) {
		newTokens.forEach((newToken, index) => {
			const currentPath = `${path}.${index}`;
			const oldToken = map.get(currentPath);
			if (!oldToken) {
				newToken.status = "added";
			} else if (
				JSON.stringify(newToken) !== JSON.stringify(oldToken) &&
				newToken.type !== "text"
			) {
				newToken.status = "added";
			} else if (newToken.type === "text") {
				newToken.status = "added";
			}
			if (newToken.children && oldToken?.children) {
				compareTokens(newToken.children, currentPath);
			} else if (newToken.children) {
				newToken.children.forEach((child) => {
					const newChild = child as MarkedToken;
					newChild.status = "added";
					return newChild;
				});
			}
		});
	}
	compareTokens(result, "");
	return result;
}
