import { useEffect, useRef, useState } from "react";
import markdownit from "markdown-it";
import { preprocess } from "./processor";
import "./StreamMarkdown.css";
import { MarkedToken, ProcessedToken } from "./global";
import { renderToken } from "./Renderer";

interface StreamMarkdownProps {
	content: string;
}

function diffTokens(
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
			} else if (JSON.stringify(newToken) !== JSON.stringify(oldToken)) {
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

const StreamMarkdown = ({ content }: StreamMarkdownProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const md = useRef(markdownit()).current;
	const previousProcessedRef = useRef<ProcessedToken[]>([]);
	const [tokens, setTokens] = useState<MarkedToken[]>([]);

	// 处理内容变化
	useEffect(() => {
		const parsed = md.parse(content, {});
		const processed = preprocess(parsed);
		const diffResult = diffTokens(previousProcessedRef.current, processed);
		previousProcessedRef.current = processed;
		setTokens(diffResult);
	}, [content, md]);

	return (
		<div ref={containerRef} className="markdown w-full">
			{tokens.map((token, index) => renderToken(token, index))}
		</div>
	);
};

export default StreamMarkdown;
