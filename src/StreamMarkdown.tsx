import { useEffect, useRef, useState } from "react";
import MarkdownIt from "markdown-it";
import { preprocess, ProcessedToken } from "./processor";
import "./StreamMarkdown.css";

interface StreamMarkdownProps {
	content: string;
}

interface MarkedToken extends ProcessedToken {
	status?: "added";
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
	function compareTokens(
		newTokens: MarkedToken[],
		oldTokens: ProcessedToken[],
		path: string
	) {
		newTokens.forEach((newToken, index) => {
			const currentPath = `${path}.${index}`;
			const oldToken = map.get(currentPath);
			if (!oldToken) {
				newToken.status = "added";
			} else if (JSON.stringify(newToken) !== JSON.stringify(oldToken)) {
				newToken.status = "added";
			}
			if (newToken.children && oldToken?.children) {
				compareTokens(
					newToken.children,
					oldToken.children,
					currentPath
				);
			} else if (newToken.children) {
				newToken.children.forEach((child) => {
					const newChild = child as MarkedToken;
					newChild.status = "added";
					return newChild;
				});
			}
		});
	}
	compareTokens(result, arr, "");
	return result;
}

const VOID_TAGS = [
	"img",
	"br",
	"hr",
	"input",
	"meta",
	"link",
	"area",
	"base",
	"col",
	"command",
	"embed",
	"keygen",
	"param",
	"source",
	"track",
	"wbr",
];

function parseStyleString(styleString) {
	return styleString.split(";").reduce((styleObj, style) => {
		const [key, value] = style.split(":").map((s) => s.trim());
		if (key && value) {
			// 将样式属性转换为 camelCase
			const camelCaseKey = key.replace(/-([a-z])/g, (g) =>
				g[1].toUpperCase()
			);
			styleObj[camelCaseKey] = value;
		}
		return styleObj;
	}, {});
}

function renderToken(token: MarkedToken, key: number) {
	const styleObject = token.attrs
		? token.attrs.style
			? parseStyleString(token.attrs.style)
			: {}
		: {};
	if (token.attrs && token.attrs.style) {
		delete token.attrs.style;
	}
	if (token.content) {
		return (
			<span key={key} className="fade-in" style={styleObject}>
				{token.content}
			</span>
		);
	}
	if (token.tag) {
		const Tag = token.tag as keyof JSX.IntrinsicElements;
		if (VOID_TAGS.includes(token.tag)) {
			return (
				<Tag
					key={key}
					className="fade-in"
					style={styleObject}
					{...(token.attrs || {})}
				/>
			);
		}
		return (
			<Tag
				key={key}
				className="fade-in"
				style={styleObject}
				{...(token.attrs || {})}
			>
				{token.children?.map((child, index) =>
					renderToken(child as MarkedToken, index)
				)}
			</Tag>
		);
	}
	return null;
}

const StreamMarkdown = ({ content }: StreamMarkdownProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const md = useRef(new MarkdownIt()).current;
	const previousProcessedRef = useRef<ProcessedToken[]>([]);
	const [tokens, setTokens] = useState<MarkedToken[]>([]);

	// 处理内容变化
	useEffect(() => {
		const parsed = md.parse(content, {});
		const processed = preprocess(parsed);
		const diffResult = diffTokens(previousProcessedRef.current, processed);
		previousProcessedRef.current = processed;
		setTokens(diffResult);
		containerRef.current.scrollTo({
			top: containerRef.current.scrollHeight,
		});
	}, [content, md]);

	return (
		<div
			ref={containerRef}
			className="relative markdown max-h-full flex-1 overflow-y-auto"
		>
			{tokens.map((token, index) => renderToken(token, index))}
		</div>
	);
};

export default StreamMarkdown;
