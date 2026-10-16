export function fuzzyMatch(text, query) {
  if (!query || !query.trim()) return true;
  if (!text) return false;
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

export function highlightMatch(text, query) {
  if (!text) return [{ text: '', highlight: false }];
  if (!query || !query.trim()) return [{ text, highlight: false }];

  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  const index = lower.indexOf(q);

  if (index === -1) {
    return [{ text, highlight: false }];
  }

  const parts = [];
  if (index > 0) {
    parts.push({ text: text.substring(0, index), highlight: false });
  }
  parts.push({ text: text.substring(index, index + q.length), highlight: true });
  if (index + q.length < text.length) {
    parts.push({ text: text.substring(index + q.length), highlight: false });
  }

  return parts;
}
