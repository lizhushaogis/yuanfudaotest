// Navigation to another step removes the frame, so stale load callbacks are ignored.
export function mountPreview(frame, status, html) {
  frame.inert = true;
  frame.setAttribute('aria-busy', 'true');
  status.dataset.state = 'loading';
  status.textContent = '交互准备中';
  frame.addEventListener('load', () => {
    // Let the loaded document paint before exposing its controls.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!frame.isConnected || !status.isConnected) return;
      frame.inert = false;
      frame.setAttribute('aria-busy', 'false');
      status.dataset.state = 'ready';
      status.textContent = '可以开始';
    }));
  }, {once: true});
  frame.srcdoc = html;
}
