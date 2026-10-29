export function validHost(host, allowed) { return typeof host === 'string' && allowed.has(host); }
export function validUpgrade(req, allowed) {
  if (req.url !== '/wisp/' || !validHost(req.headers.host, allowed)) return false;
  try {
    const origin = new URL(req.headers.origin);
    return ['http:', 'https:'].includes(origin.protocol) && origin.host === req.headers.host;
  } catch { return false; }
}

export const relayOptions = {
  allow_udp_streams: false, allow_private_ips: false, allow_loopback_ips: false,
  allow_direct_ip: false, port_whitelist: [80, 443],
  // Wisp 0.4.1's per-host limiter iterates an object and crashes on valid requests.
  // Retain its working total limit; use the default for the broken per-host limiter.
  stream_limit_total: 64, stream_limit_per_host: -1,
};
