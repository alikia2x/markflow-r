import {
    useLayoutEffect,
    useRef,
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import { animated as a, useSpring } from "react-spring";
import ResizeObserver from "resize-observer-polyfill";
import { throttle } from "lodash-es";

const SCROLL_THRESHOLD = 250;
const SCROLL_THROTTLE = 300;

const ScrollableContainer = ({ children, contentIndicator }) => {
    const [spring, setSpring] = useSpring(() => ({
        y: 0,
        config: {
            mass: 1,
            tension: 160,
            friction: 40,
            clamp: true,
        },
        onRest: () => {
            isAnimating.current = false;
        },
    }));

    const containerRef = useRef(null);
    const viewportRef = useRef(null);
    const isAnimating = useRef(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const [contentHeight, setContentHeight] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const contentHeightRef = useRef(contentHeight);
    const containerHeightRef = useRef(0);

    const [stillUpdating, setStillUpdating] = useState(false);
    const contentUpdateTimeoutRef = useRef(null);

    useEffect(() => {
        // 每次 content 更新时，重置定时器
        setStillUpdating(true);
        if (contentUpdateTimeoutRef.current) {
            clearTimeout(contentUpdateTimeoutRef.current);
        }

        // 设置一个 1 秒的定时器，如果 1 秒内没有更新，则认为 content 停止更新
        contentUpdateTimeoutRef.current = setTimeout(() => {
            setStillUpdating(false);
        }, 1000);

        // 清除定时器
        return () => {
            if (contentUpdateTimeoutRef.current) {
                clearTimeout(contentUpdateTimeoutRef.current);
            }
        };
    }, [contentIndicator]);

    // 同步最新高度到ref
    useEffect(() => {
        contentHeightRef.current = contentHeight;
    }, [contentHeight]);
    useEffect(() => {
        containerHeightRef.current = containerHeight;
    }, [containerHeight]);

    // 内容尺寸变化观测
    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const ro = new ResizeObserver(([entry]) => {
            const newHeight = entry.contentRect.height;
            setContentHeight(newHeight);

            if (autoScroll) {
                const targetY = Math.max(0, newHeight - containerHeightRef.current);
                throttledScroll(targetY);
            }
        });

        ro.observe(viewport);
        return () => ro.disconnect();
    }, [autoScroll]);

    // 容器尺寸变化观测
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const ro = new ResizeObserver(([entry]) => {
            const newHeight = entry.contentRect.height;
            setContainerHeight(newHeight);
            containerHeightRef.current = entry.contentRect.height;
            if (autoScroll) {
                const targetY = Math.max(0, contentHeightRef.current - entry.contentRect.height);
                setSpring.start({ y: -targetY });
            }
        });

        ro.observe(container);
        return () => ro.disconnect();
    }, [autoScroll, setSpring]);

    // 自动滚动逻辑
    const throttledScroll = useMemo(() => throttle((targetY) => {
        isAnimating.current = true;
        setSpring.start({
            y: -targetY,
            immediate: targetY === 0, // 当滚动到顶部时立即跳转
        });
    }, SCROLL_THROTTLE), [setSpring]);

    // 处理滚轮事件
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY;
        const currentY = -spring.y.get();
        const maxScroll = Math.max(0, contentHeightRef.current - containerHeightRef.current);
        
        let newY = currentY + delta;
        newY = Math.max(0, Math.min(newY, maxScroll));
        
        // 更新自动滚动状态
        const isNearBottom = newY >= maxScroll - SCROLL_THRESHOLD;
        if (isAnimating.current == false || stillUpdating == false) {
            setAutoScroll(false);
        }
        else if (autoScroll === false) {
            setAutoScroll(isNearBottom);
        }
        else {
            setAutoScroll(false)
        }
        isAnimating.current = true;
        setSpring.start({
            y: -newY,
            onRest: () => {
                isAnimating.current = false;
            },
            immediate: true
        });
    }, [autoScroll, setSpring, spring.y, stillUpdating]);

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