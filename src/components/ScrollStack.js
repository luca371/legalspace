import { useLayoutEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { useLenis } from './LenisContext';
import './ScrollStack.css';

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete
}) => {
  const scrollerRef = useRef(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lenisRef = useRef(null);
  const cardsRef = useRef([]);
  // Hooks must be called unconditionally — we always read the context, but
  // only ever USE registerLenis below when useWindowScroll is true (the
  // global page scroller is the only instance nav links care about).
  const { registerLenis } = useLenis();
  // Cache of each card's static top offset — recomputed only on resize/layout change,
  // never read mid-scroll. This removes the O(n) getBoundingClientRect() storm that
  // ran on every single Lenis scroll tick and was the main source of jitter.
  const cardTopsRef = useRef([]);
  const endElementTopRef = useRef(0);
  const lastTransformsRef = useRef(new Map());
  const isUpdatingRef = useRef(false);
  const rafPendingRef = useRef(false);

  const calculateProgress = useCallback((scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value, containerHeight) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight
      };
    } else {
      const scroller = scrollerRef.current;
      return {
        scrollTop: scroller.scrollTop,
        containerHeight: scroller.clientHeight
      };
    }
  }, [useWindowScroll]);

  // Recompute static offsets — only called on mount + resize, NOT on every scroll frame.
  const recomputeOffsets = useCallback(() => {
    const getOffset = el => {
      if (useWindowScroll) {
        const rect = el.getBoundingClientRect();
        return rect.top + window.scrollY;
      }
      return el.offsetTop;
    };

    cardTopsRef.current = cardsRef.current.map(card => getOffset(card));

    const endElement = useWindowScroll
      ? document.querySelector('.scroll-stack-end')
      : scrollerRef.current?.querySelector('.scroll-stack-end');
    endElementTopRef.current = endElement ? getOffset(endElement) : 0;
  }, [useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
    const endElementTop = endElementTopRef.current;

    // Pre-compute trigger starts once per frame (cheap, no DOM reads) to find
    // the topCardIndex for blur, instead of an O(n) DOM-reading loop per card.
    const triggerStarts = cardTopsRef.current.map(
      (cardTop, j) => cardTop - stackPositionPx - itemStackDistance * j
    );
    let topCardIndex = 0;
    for (let j = 0; j < triggerStarts.length; j++) {
      if (scrollTop >= triggerStarts[j]) topCardIndex = j;
    }

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = cardTopsRef.current[i];
      const triggerStart = triggerStarts[i];
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = triggerStart;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount && i < topCardIndex) {
        const depthInStack = topCardIndex - i;
        blur = Math.max(0, depthInStack * blurAmount);
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      // Fix: round to whole pixels, not 2 decimals. Sub-pixel translateY values
      // force the GPU compositor to re-antialias every frame, which is the jitter.
      const newTransform = {
        translateY: Math.round(translateY),
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 10) / 10
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        lastTransform.translateY !== newTransform.translateY ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';

        card.style.transform = transform;
        card.style.filter = filter;

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData
  ]);

  // rAF-batched handler: Lenis can emit 'scroll' more than once per frame in some
  // browsers (synthetic touch events especially) — this guarantees we only ever
  // write to the DOM once per animation frame, eliminating double-paint jitter.
  const handleScroll = useCallback(() => {
    if (rafPendingRef.current) return;
    rafPendingRef.current = true;
    requestAnimationFrame(() => {
      rafPendingRef.current = false;
      updateCardTransforms();
    });
  }, [updateCardTransforms]);

  const setupLenis = useCallback(() => {
    const lenisOptions = useWindowScroll
      ? {
          duration: 1.2,
          easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 2,
          infinite: false,
          wheelMultiplier: 1,
          lerp: 0.1,
          syncTouch: true,
          syncTouchLerp: 0.075
        }
      : {
          wrapper: scrollerRef.current,
          content: scrollerRef.current?.querySelector('.scroll-stack-inner'),
          duration: 1.2,
          easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 2,
          infinite: false,
          gestureOrientationHandler: true,
          normalizeWheel: true,
          wheelMultiplier: 1,
          touchInertiaMultiplier: 35,
          lerp: 0.1,
          syncTouch: true,
          syncTouchLerp: 0.075,
          touchInertia: 0.6
        };

    if (!useWindowScroll && !scrollerRef.current) return;

    const lenis = new Lenis(lenisOptions);
    lenis.on('scroll', handleScroll);

    // Publish the global page-scroll instance so nav links (or anything else
    // outside this component) can call lenis.scrollTo() without creating a
    // second, conflicting Lenis instance.
    if (useWindowScroll) {
      registerLenis(lenis);
    }

    // Single RAF loop drives Lenis itself — handleScroll above batches the
    // resulting DOM writes onto their own RAF tick, so the two never fight.
    const raf = time => {
      lenis.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    };
    animationFrameRef.current = requestAnimationFrame(raf);

    lenisRef.current = lenis;
    return lenis;
  }, [handleScroll, useWindowScroll, registerLenis]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!useWindowScroll && !scroller) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : scroller.querySelectorAll('.scroll-stack-card')
    );

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.perspective = '1000px';
    });

    // Wait one frame so the marginBottom-driven layout has settled BEFORE we
    // read offsets and start Lenis. Reading offsets in the same tick we just
    // mutated layout was the timing race behind part of the visible shake.
    requestAnimationFrame(() => {
      recomputeOffsets();
      setupLenis();
      updateCardTransforms();
    });

    const handleResize = () => {
      recomputeOffsets();
      updateCardTransforms();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      if (useWindowScroll) {
        registerLenis(null);
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    updateCardTransforms,
    recomputeOffsets,
    registerLenis
  ]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;