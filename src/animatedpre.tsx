import { useEffect, useRef, useState } from "react";

export function HeightAnimatedPre({ content }: { content: string }) {
    const [height, setHeight] = useState(0);
    const codeRef = useRef(null);

    // 监听 code 元素的高度变化
    useEffect(() => {
        if (codeRef.current) {
            const newHeight = codeRef.current.offsetHeight;
            setHeight(newHeight + 32);
        }
    }, [content]);

    return (
        <pre
            style={{
                overflow: "hidden",
                height: `${height}px`,
                transition: "height 0.3s ease",
            }}
        >
            <code ref={codeRef}>{content}</code>
        </pre>
    );
}