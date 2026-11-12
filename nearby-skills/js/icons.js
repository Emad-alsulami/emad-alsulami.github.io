/* Line icons (24×24, stroke) + hero illustration */
const ICONS = {
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  chat: '<path d="M21 12a8.5 8.5 0 0 1-12.4 7.5L3.5 21l1.5-5A8.5 8.5 0 1 1 21 12z"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  bread: '<path d="M6 20a1 1 0 0 1-1-1v-7.3A4 4 0 0 1 7 4h10a4 4 0 0 1 2 7.7V19a1 1 0 0 1-1 1z"/><path d="M10 8l-1.5 2.5M14.5 8L13 10.5"/>',
  yoga: '<circle cx="12" cy="4.5" r="2"/><path d="M4 9.5l8 2 8-2"/><path d="M12 11.5v4l-4.5 5M12 15.5l4.5 5"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
  plant: '<path d="M7 20h10"/><path d="M12 20v-9"/><path d="M12 11C12 7.5 9.5 5 5.5 5c0 3.5 2.5 6 6.5 6zM12 13.5c0-3.5 2.5-6 6.5-6 0 3.5-2.5 6-6.5 6z"/>',
  sprout: '<path d="M12 21v-9"/><path d="M12 12c0-4.4-3.1-7-7.5-7 0 4.4 3.1 7 7.5 7z"/><path d="M12 14.5c0-3.9 2.8-6.5 7.5-6.5 0 3.9-2.8 6.5-7.5 6.5z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
  coffee: '<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
  edit: '<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  checks: '<path d="M1.5 12.5l4.5 4.5L16 7"/><path d="M11.5 16.5l.5.5L22.5 7"/>',
  file: '<path d="M14 3H6.5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  swap: '<path d="M17 3l4 4-4 4"/><path d="M21 7H8"/><path d="M7 21l-4-4 4-4"/><path d="M3 17h13"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  heart:'<path d="M12 20s-8-4.6-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.4 12 20 12 20z"/>'
};

function ic(name, cls) {
  return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
}

/* Hero illustration — a neighbour with a crate of plants, a house and trees.
   variant: 'crate' | 'chat' | 'water' */
function ILLU(variant) {
  variant = variant || 'crate';
  var ink = '#34421F', g1 = '#4A5A2F', g2 = '#6E8247', g3 = '#9BAE72', skin = '#E8C3A0', sand = '#E4DAC4';
  var rays = '';
  [[-60, 40], [-35, 30], [-10, 27], [15, 30], [40, 40]].forEach(function (r) {
    var a = r[0] * Math.PI / 180, d1 = 32, d2 = 32 + 10;
    var cx = 160, cy = 74;
    rays += '<line x1="' + (cx + Math.sin(a) * d1).toFixed(1) + '" y1="' + (cy - Math.cos(a) * d1).toFixed(1) +
      '" x2="' + (cx + Math.sin(a) * d2).toFixed(1) + '" y2="' + (cy - Math.cos(a) * d2).toFixed(1) + '"/>';
  });
  var extra = '';
  if (variant === 'chat') {
    extra = '<g transform="translate(214 18)"><path d="M0 12a12 12 0 0 1 12-12h28a12 12 0 0 1 12 12v12a12 12 0 0 1-12 12H18l-10 9 2-9A12 12 0 0 1 0 24z" fill="' + g1 + '"/>' +
      '<circle cx="15" cy="18" r="3" fill="#F4EFE3"/><circle cx="26" cy="18" r="3" fill="#F4EFE3"/><circle cx="37" cy="18" r="3" fill="#F4EFE3"/></g>';
  }
  var hands = variant === 'water'
    ? '<g transform="translate(184 118)"><path d="M0 8h26v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6z" fill="' + g3 + '" stroke="' + ink + '" stroke-width="2"/><path d="M26 14l18-12" stroke="' + ink + '" stroke-width="3" stroke-linecap="round"/><path d="M6 8a7 7 0 0 1 14 0" fill="none" stroke="' + ink + '" stroke-width="2"/></g>'
    : variant === 'chat'
      ? '<g transform="translate(140 122)"><rect x="0" y="0" width="30" height="30" rx="5" fill="#F4EFE3" stroke="' + ink + '" stroke-width="2"/><path d="M30 8h4a6 6 0 0 1 0 12h-4" fill="none" stroke="' + ink + '" stroke-width="2"/><path d="M8 -6c-2 -3 2 -5 0 -8M16 -6c-2 -3 2 -5 0 -8" stroke="' + g2 + '" stroke-width="2" fill="none" stroke-linecap="round"/></g>'
      : '<g transform="translate(0 12)"><path d="M132 118c-6-14 0-26 10-30 2 10-2 22-10 30z" fill="' + g2 + '"/><path d="M146 116c-2-16 8-26 18-26-1 12-8 22-18 26z" fill="' + g3 + '"/>' +
        '<path d="M164 118c2-14 12-22 22-20-3 11-11 19-22 20z" fill="' + g2 + '"/><path d="M176 120c6-10 16-12 22-8-5 7-13 10-22 8z" fill="' + g3 + '"/>' +
        '<circle cx="152" cy="106" r="5" fill="#D98C5F"/><circle cx="182" cy="108" r="4" fill="#D98C5F"/>' +
        '<rect x="124" y="116" width="78" height="40" rx="4" fill="#D8B386" stroke="#8A6A3E" stroke-width="2"/><path d="M124 130h78M124 143h78" stroke="#8A6A3E" stroke-width="1.6"/></g>';

  return '<svg class="illu" viewBox="0 0 300 190" role="img" aria-hidden="true">' +
    '<ellipse cx="160" cy="176" rx="132" ry="9" fill="' + sand + '"/>' +
    // house
    '<g><path d="M30 176v-62l34-28 34 28v62z" fill="#EFE7D4" stroke="' + ink + '" stroke-width="2.2"/>' +
    '<path d="M22 118l42-35 42 35" fill="none" stroke="' + ink + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="78" y="78" width="9" height="18" fill="' + ink + '"/>' +
    '<rect x="42" y="124" width="16" height="16" rx="1.5" fill="#F7D98C" stroke="' + ink + '" stroke-width="2"/><path d="M50 124v16M42 132h16" stroke="' + ink + '" stroke-width="1.5"/>' +
    '<path d="M68 176v-26a7 7 0 0 1 14 0v26" fill="' + g1 + '" stroke="' + ink + '" stroke-width="2"/></g>' +
    // trees
    '<g><rect x="250" y="118" width="5" height="58" rx="2" fill="' + ink + '"/><ellipse cx="252" cy="104" rx="22" ry="30" fill="' + g2 + '"/>' +
    '<path d="M252 84v40M252 104l-10-8M252 112l10-9" stroke="' + g1 + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<rect x="276" y="140" width="4" height="36" rx="2" fill="' + ink + '"/><ellipse cx="278" cy="130" rx="13" ry="19" fill="' + g3 + '"/></g>' +
    '<g fill="' + g2 + '"><path d="M108 176c-2-10 2-16 8-18 0 7-3 13-8 18z"/><path d="M222 176c2-10-2-16-8-18 0 7 3 13 8 18z"/></g>' +
    // rays
    '<g stroke="' + g1 + '" stroke-width="2.6" stroke-linecap="round">' + rays + '</g>' +
    // person
    '<path d="M118 176c0-42 18-66 42-66s42 24 42 66z" fill="' + g1 + '"/>' +
    '<path d="M150 110l10 12 10-12" fill="none" stroke="' + ink + '" stroke-width="2"/>' +
    '<rect x="153" y="94" width="14" height="16" rx="5" fill="' + skin + '"/>' +
    '<circle cx="160" cy="80" r="19" fill="' + skin + '"/>' +
    '<path d="M140 78a20 20 0 0 1 40 0z" fill="' + g2 + '"/><path d="M139 78h42" stroke="' + ink + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M146 70v-6M153 66v-8M160 65v-9M167 66v-8M174 70v-6" stroke="' + g1 + '" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="160" cy="58" r="5" fill="' + g1 + '"/>' +
    '<path d="M146 84c-1 8 2 14 6 16M174 84c1 8-2 14-6 16" fill="none" stroke="#7A5232" stroke-width="2.4" stroke-linecap="round"/>' +
    '<circle cx="153" cy="85" r="1.8" fill="' + ink + '"/><circle cx="167" cy="85" r="1.8" fill="' + ink + '"/>' +
    '<path d="M154 92c3 3 9 3 12 0" fill="none" stroke="' + ink + '" stroke-width="1.8" stroke-linecap="round"/>' +
    '<circle cx="149" cy="90" r="2.6" fill="#E59D86" opacity=".6"/><circle cx="171" cy="90" r="2.6" fill="#E59D86" opacity=".6"/>' +
    hands + extra +
    '</svg>';
}
