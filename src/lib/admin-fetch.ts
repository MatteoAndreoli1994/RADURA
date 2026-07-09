export function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  ms = 8000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  const { signal: existingSignal, ...rest } = init;
  if (existingSignal) {
    if (existingSignal.aborted) {
      controller.abort();
    } else {
      existingSignal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }

  return fetch(input, { ...rest, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}
