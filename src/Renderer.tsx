import { MarkedToken } from "./global";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { HeightAnimatedPre } from "./animatedpre";

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

export function renderToken(token: MarkedToken, key: number) {
	const styleObject = token.attrs
		? token.attrs.style
			? parseStyleString(token.attrs.style)
			: {}
		: {};
	if (token.attrs && token.attrs.style) {
		delete token.attrs.style;
	}
	if (token.tag === "code") {
		if (token.type === "fence") {
			return (
                <HeightAnimatedPre key={key} content={token.content} />
            );
		} else {
			return <code key={key}>{token.content}</code>;
		}
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
