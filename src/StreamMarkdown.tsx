import { useEffect, useRef, useState } from "react";
import markdownit from "markdown-it";
import { diffTokens, preprocess } from "./processor";
import { MarkedToken, ProcessedToken } from "./global";
import { renderToken } from "./Renderer";
import "./StreamMarkdown.css";

interface StreamMarkdownProps {
	content: string;
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
