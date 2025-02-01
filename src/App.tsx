import { useState, useEffect } from "react";
import MarkdownContainer from "./ScrollContainer";

const demoContent = `# Nested Example
 
A \`simple\` **inline** *marks* example with ***nested***.

## List

1.  First level
    *   Nested **unordered** list
        1.  Nested *ordered* list

## Quote

> First level quote
> > Second level quote

## Code block

Here is a quick sort code written in [Swift](https://swift.org/).

\`\`\`swift
func quickSort(_ arr: inout [Int], low: Int, high: Int) {
    if low < high {
        let pi = partition(&arr, low: low, high: high)
        quickSort(&arr, low: low, high: pi - 1)
        quickSort(&arr, low: pi + 1, high: high)
    }
}

func partition(_ arr: inout [Int], low: Int, high: Int) -> Int {
    let pivot = arr[high]
    var i = low - 1
    for j in low..<high {
        if arr[j] <= pivot {
            i += 1
            arr.swapAt(i, j)
        }
    }
    arr.swapAt(i + 1, high)
    return i + 1
}
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

	const TOKEN_LENGTH = 6;
	const TOKENS_PER_SEC = 20;
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
	}, [INTERVAL]);

	return (
		<div className="h-dvh relative flex flex-col">
			<p>
				Progress:{" "}
				{((currentMarkdown.length / totalLength) * 100).toFixed(1)}%
			</p>
			<MarkdownContainer content={currentMarkdown} />
		</div>
	);
}

export default App;
