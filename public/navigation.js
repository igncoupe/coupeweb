export function destination(input) {
  const text = input.trim();
  if (!text) throw new Error('Enter a website or a search.');
  const looksLikeHost = !/\s/.test(text) && (text.includes('.') || text.startsWith('localhost'));
  const candidate = /^https?:\/\//i.test(text) ? text : looksLikeHost ? `https://${text}` : null;
  if (/^[a-z][a-z\d+.-]*:/i.test(text) && !/^https?:\/\//i.test(text)) throw new Error('Use an http:// or https:// website address.');
  if (!candidate) return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
  const url = new URL(candidate);
  if (url.username || url.password) throw new Error('Addresses containing passwords are not supported.');
  return url.href;
}
