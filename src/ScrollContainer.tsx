import { useLayoutEffect, useRef, useEffect, useCallback, useState } from "react";
import { animated as a, useSpring } from "react-spring";
import ResizeObserver from "resize-observer-polyfill";
import { useAtom } from "jotai";
import { autoScrollAtom } from "./scrollAtom";

const ScrollableContainer = ({ children, contentIndicator }) => {
    const [spring, setSpring] = useSpring(() => ({
        y: 0,
        config: {
            mass: 1,
            tension: 170,
            friction: 35,
            clamp: true,
        },
    }));

    const containerRef = useRef(null);
    const viewportRef = useRef(null);
    const [autoScroll, setAutoScroll] = useAtom(autoScrollAtom);
    const [contentHeight, setContentHeight] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    // 内容尺寸变化观测
    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const ro = new ResizeObserver(([entry]) => {
            const newHeight = entry.contentRect.height;
            setContentHeight(newHeight);

            if (autoScroll) {
                const targetY = Math.max(0, newHeight - containerHeight);
                setSpring.start({ y: -targetY });
            }
        });

        ro.observe(viewport);
        return () => ro.disconnect();
    }, [autoScroll, containerHeight, setSpring]);

    // 容器尺寸变化观测
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const ro = new ResizeObserver(([entry]) => {
            const newHeight = entry.contentRect.height;
            setContainerHeight(newHeight);

            if (autoScroll) {
                const targetY = Math.max(0, contentHeight - newHeight);
                setSpring.start({ y: -targetY });
            }
        });

        ro.observe(container);
        return () => ro.disconnect();
    }, [autoScroll, contentHeight, setSpring]);

    // 处理滚轮事件
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        setAutoScroll(false); // 只要鼠标开始滚动就关闭自动滚动

        const delta = e.deltaY;
        const currentY = -spring.y.get();
        const maxScroll = Math.max(0, contentHeight - containerHeight);

        let newY = currentY + delta;
        newY = Math.max(0, Math.min(newY, maxScroll));

        setSpring.start({
            y: -newY,
            immediate: true,
        });
    }, [contentHeight, containerHeight, setSpring, spring.y, setAutoScroll]);

    // 滚轮事件监听
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    return (
        <div
            ref={containerRef}
            className="relative h-full overflow-y-hidden"
        >
            <a.div
                style={{
                    transform: spring.y.to(y => `translate3d(0,${y}px,0)`),
                    willChange: 'transform',
                    position: 'absolute',
                    width: '100%',
                }}
                ref={viewportRef}
            >
                {children}
            </a.div>
        </div>
    );
};

export default ScrollableContainer;