import { useEffect, useState, type RefObject } from 'react';
import { MEDITATION_SHEET_OVERFLOW_TOLERANCE_PX } from './constants';

/**
 * Reports when the printable sheet (or any fixed-height area inside it, when `areaSelector`
 * is given) holds more content than fits. Observers are attached once per sheet element.
 */
export function useSheetOverflow(
  sheetRef: RefObject<HTMLElement | null>,
  areaSelector: string | null,
  onChange?: (overflow: boolean) => void
): boolean {
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    let frame = 0;
    const measure = () => {
      const areas = areaSelector
        ? Array.from(sheet.querySelectorAll<HTMLElement>(areaSelector))
        : [sheet];
      setOverflow(
        areas.some(
          (area) => area.scrollHeight > area.clientHeight + MEDITATION_SHEET_OVERFLOW_TOLERANCE_PX
        )
      );
    };
    // Typing fires many mutations; one measurement per frame is enough.
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(sheet);
    const mutations = new MutationObserver(schedule);
    mutations.observe(sheet, { subtree: true, childList: true, characterData: true });
    sheet.addEventListener('load', schedule, true);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
      sheet.removeEventListener('load', schedule, true);
    };
  }, [sheetRef, areaSelector]);
  useEffect(() => {
    onChange?.(overflow);
  }, [overflow, onChange]);
  useEffect(() => () => onChange?.(false), [onChange]);
  return overflow;
}
