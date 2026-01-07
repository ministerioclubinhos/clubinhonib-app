export const debounce = <T extends (...args: any[]) => void>(fn: T, delay = 300) => {
  let t: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => {
    if (t) clearTimeout(t);
    t = undefined;
  };
  return debounced as T & { cancel: () => void };
};
