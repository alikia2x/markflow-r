import { useState, useEffect, Profiler } from "react";
import StreamMarkdown from "./StreamMarkdown";
import { bigMd } from "./consts";

const demoContent = `${bigMd}`;
`# Nested Example

A \`simple\` **inline** *marks* example with ***nested***.

## List

1.  First level
    *   Nested **unordered** list
        1.  Nested *ordered* list

## Quote

> First level quote
> > Second level quote

## Code block

    \`\`\`python
    print("Hello, world!")
    \`\`\`

## Link

[Google](https://www.google.com)

**[Emphasized Google](https://www.google.com)**

## Image

![Image](https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png)
`;

const totalLength = demoContent.length;

function App() {
	const [currentMarkdown, setCurrentMarkdown] = useState("");
	const [renderTime, setRenderTime] = useState(0);

	const onRender = (
		id: string,
		phase: "mount" | "update" | "update",
		actualDuration: number
	) => {
		setRenderTime(actualDuration);
	};
	const TOKEN_LENGTH = 6;
	const TOKENS_PER_SEC = 30;
	const INTERVAL = 1000 / TOKENS_PER_SEC;

	useEffect(() => {
		// 模拟流式数据接收

		let index = 0;
		const interval = setInterval(() => {
			if (index < demoContent.length) {
				setCurrentMarkdown(
					(prev) =>
						prev +
						demoContent.slice(
							index * TOKEN_LENGTH,
							index * TOKEN_LENGTH + TOKEN_LENGTH
						)
				);
				index++;
			} else {
				clearInterval(interval);
			}
		}, INTERVAL);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="h-dvh relative flex flex-col">
			{/* <p>Render Time: {renderTime.toFixed(1)} ms</p>
			<p>
				Progress:{" "}
				{((currentMarkdown.length / totalLength) * 100).toFixed(1)}%
			</p> */}
			{/* <Profiler id="StreamMarkdown" onRender={onRender}> */}
			<StreamMarkdown content={currentMarkdown} />
			{/* </Profiler> */}
		</div>
	);
}

export default App;
