// A pixel Christmas tree a human and their AI decorate together. © 2026 Rinrin & Koban. All rights reserved.
// No accounts and no server: the two names and every ornament live in this browser's localStorage, nothing is sent
// anywhere; the save is tree.py itself, the same file an AI plays in its sandbox. The two creatures are the fluffballs
// she drew; they breathe, and with the lights off the AI turns to light.
// Every word on the page is in i18n.js.
import { SLOTS, PROPS, BUBBLE, DIGITS } from './data.js?v=66456c49d3';
import { T, LANGS, LOCALE, guessLang } from './i18n.js?v=66456c49d3';
import { NOTICE } from './notice.js?v=66456c49d3';

const STAR_AT = 42;          // a soul weighs 21 grams, two souls make 42: the answer to life, the universe, and everything
const PER_AUTHOR = 24;       // small ornaments shown per person; the rest wait in the box under the tree
const MAX_TEXT = 500, MAX_NAME = 20;
const STYLES = ['bauble', 'star', 'bell', 'gift', 'gingercat', 'snowflake', 'candycane', 'moon', 'lantern', 'acorn', 'heart', 'bunny'];
const KINDS = ['reason', 'moment', 'cute'];
const WHO = ['human', 'ai'];
const LOOKS = { human: ['peach'], ai: ['sky'] };
const POSES = ['rest', 'flat'];   // a breath's two frames (fluffballs.POSES); style.css shows them in turn
const KEY = { cast: 'tree2.cast', orn: 'tree2.ornaments', lights: 'tree2.lightsOff', star: 'tree2.starSeen', draft: 'tree2.draft', noNudge: 'tree2.noSaveNudge',
  lang: 'tree2.lang', rev: 'tree2.rev', toAi: 'tree2.toAi' };
const PIX = 'assets/pixel/';
// tree.py can draw this page as one HTML file with the tree inside (TREE_SAVE) and every picture packed in
// (TREE_ASSETS), for an AI's chat to show. Nothing is stored there (a chat's artifact may not touch browser storage at
// all), so it keeps everything in memory: the human may hang one, but it counts only once its words are pasted to the
// AI, who hangs it in tree.py (her 11/23: the tree has one true copy).
const VIEW = globalThis.TREE_SAVE || null;
const asset = (path) => (globalThis.TREE_ASSETS && globalThis.TREE_ASSETS[path]) || path;

const memory = new Map(VIEW ? [[KEY.cast, VIEW.cast], [KEY.orn, VIEW.ornaments], [KEY.star, VIEW.star_seen === true]] : []);
const store = {                                      // session: the draft lives in sessionStorage, the rest in localStorage
  get(k, fallback, session = false) {
    try {
      if (VIEW) return memory.has(k) ? memory.get(k) : fallback;
      const v = (session ? sessionStorage : localStorage).getItem(k);
      return v === null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  set(k, v, session = false) {
    try { if (VIEW) memory.set(k, v); else (session ? sessionStorage : localStorage).setItem(k, JSON.stringify(v)); return true; } catch { return false; }
  },
  remove(k, session = false) {
    try { if (VIEW) memory.delete(k); else (session ? sessionStorage : localStorage).removeItem(k); } catch { /* nothing to clear */ }
  },
};
const valid = (o) => o && typeof o.id === 'string' && WHO.includes(o.author) && KINDS.includes(o.kind) && typeof o.text === 'string'
  && STYLES.includes(o.style) && !Number.isNaN(Date.parse(o.created_at));

let cast = store.get(KEY.cast, null);
let ornaments = (store.get(KEY.orn, []) || []).filter(valid);
let lightsOff = store.get(KEY.lights, false) === true;
let lang = T[store.get(KEY.lang, null)] ? store.get(KEY.lang, null) : guessLang();
const t = (key, ...args) => { const v = T[lang][key] ?? T.en[key]; return typeof v === 'function' ? v(...args) : v; };
const onTree = pick(ornaments);
// what the human hung here and has not yet copied for the AI (her 11/23: hang one, a window to copy it; or let a few
// pile up and copy them all at once)
let toAi = (store.get(KEY.toAi, []) || []).filter((id) => ornaments.some((o) => o.id === id && o.author === 'human'));   // who is on the tree is drawn once per visit, so it changes a little each time you come back

function pick(list) {              // up to PER_AUTHOR per person, at random; everyone else goes in the box
  const on = new Set();
  for (const who of WHO) {
    const pool = list.filter((o) => o.author === who);
    for (let i = 0; i < pool.length && i < PER_AUTHOR; i++) {
      const j = i + Math.floor(Math.random() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
      on.add(pool[i].id);
    }
  }
  return on;
}
const byAge = (a, b) => a.created_at.localeCompare(b.created_at);
const newestFirst = (a, b) => b.created_at.localeCompare(a.created_at) || (a.id < b.id ? 1 : -1);
const name = (who) => (cast && cast[who] && cast[who].name) || (who === 'human' ? 'Human' : 'AI');
const save = () => store.set(KEY.orn, ornaments) || toast(t('noSave'));
const newId = () => {                 // four letters and digits, as tree.py makes them, so an AI can say "read 3kx9"
  const have = new Set(ornaments.map((o) => o.id));
  for (;;) {
    const id = Array.from({ length: 4 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
    if (!have.has(id)) return id;
  }
};

// ── building blocks ─────────────────────────────────────────────────────────────────────────────────────────────
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
  return el;
}
const px = (n) => `calc(var(--px) * ${n})`;
const box = (b) => ({ left: px(b.x), top: px(b.y), width: px(b.w), height: px(b.h) });
const img = (src, props = {}) => h('img', { src: asset(PIX + src), alt: '', 'aria-hidden': 'true', draggable: 'false', decoding: 'async', ...props });
const layer = (src, cls = '', style) => img(src, { class: `layer ${cls}`, style });
const SVG = 'http://www.w3.org/2000/svg';

function digitsSvg(text, x0, y, w, h, fill) {       // 3 x 5 pixel digits on a w x h grid
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'layer');
  const g = document.createElementNS(SVG, 'g');
  g.setAttribute('fill', fill);
  [...text].forEach((ch, i) => (DIGITS[ch] || []).forEach((row, dy) => [...row].forEach((bit, dx) => {
    if (bit !== '1') return;
    const r = document.createElementNS(SVG, 'rect');
    r.setAttribute('x', x0 + i * 4 + dx); r.setAttribute('y', y + dy); r.setAttribute('width', 1); r.setAttribute('height', 1);
    g.append(r);
  })));
  svg.append(g);
  return svg;
}

function giveBadge(k) {                             // how many wait for the AI: cream digits on a red plate, over the letter's corner
  const text = String(k), w = text.length * 4 + 3;
  const svg = digitsSvg(text, 2, 2, w, 9, '#fff6e8');
  svg.setAttribute('class', 'give-badge');
  svg.style.width = px(w); svg.style.height = px(9);
  const plate = (d, fill) => { const p = document.createElementNS(SVG, 'path'); p.setAttribute('d', d); p.setAttribute('fill', fill); return p; };
  svg.prepend(plate(`M1 0h${w - 2}v1h1v7h-1v1h-${w - 2}v-1h-1v-7h1z`, '#4a2c33'), plate(`M1 1h${w - 2}v7h-${w - 2}z`, '#e8506a'));
  return svg;
}

// ── the scene ───────────────────────────────────────────────────────────────────────────────────────────────────
const stage = document.getElementById('stage');
const GEAR = { ...PROPS.lamp, y: PROPS.lamp.y + PROPS.lamp.h + 2 };   // Settings, under the lamp (her 10/6: no page header)
const DISK = { ...GEAR, y: GEAR.y + GEAR.h + 2 };                      // Save, under Settings (her 11/20: one tap away on the scene)
const GIVE = VIEW ? DISK : { ...DISK, y: DISK.y + DISK.h + 2 };        // how many wait for the AI, under those
const pair = (name) => ({ day: layer(`${name}.png`), night: layer(`${name}-night.png`, 'fade') });
const breathing = (who, night, cls = '') => h('div', { class: `layer breathe ${who} ${cls}` },
  POSES.map((p) => img(`creatures/${who}-${p}${night ? '-night' : ''}.png`, { class: `layer ${p}` })));
const room = pair('room'), tree = pair('tree');
const human = { day: breathing('human', false), night: breathing('human', true, 'fade') };
const ai = { day: breathing('ai', false, 'fade'),      // in the dark the AI is all light, so the day ball goes
  night: layer('creatures/ai-night.svg', 'fade', { filter: 'drop-shadow(0 0 calc(var(--px) * 3) rgba(143, 208, 255, .55))' }) };
const lights = layer('lights.svg', 'fade', { mixBlendMode: 'screen' });
const star = layer('star.png', 'fade');
const starFx = h('div', { class: 'layer' });
const ornLayer = h('div', { class: 'layer fade' });
const potLayer = h('div', { class: 'layer' });
const controls = h('div', { class: 'layer' });
stage.append(room.day, room.night, tree.day, tree.night, lights, star, starFx, ornLayer, human.day, human.night, ai.day, ai.night,
  potLayer, controls);

function slotsFor(list) {                           // the k-th oldest on the tree takes the k-th hang point
  const out = new Map();
  list.slice().sort(byAge).forEach((o, k) => { if (k < SLOTS.length) out.set(o.id, SLOTS[k]); });
  return out;
}

function render() {
  const total = ornaments.length;
  const shown = ornaments.filter((o) => onTree.has(o.id));
  const inBox = ornaments.filter((o) => !onTree.has(o.id));
  const slots = slotsFor(shown);
  ornLayer.replaceChildren(...shown.filter((o) => slots.has(o.id)).map((o) => {
    const [x, y] = slots.get(o.id);
    return h('button', { class: 'hit', 'aria-label': t('readOrnament', name(o.author)), style: box({ x: x - 8, y: y - 2, w: 16, h: 19 }),
      onclick: () => openCard(o) },
      img(`ornaments/${o.style}.png`, { style: { position: 'absolute', left: px(2), top: px(2), width: px(12), height: px(15), imageRendering: 'pixelated' } }));
  }));

  const ready = total >= STAR_AT;
  const { cx, y } = PROPS.potLabel;
  if (ready) {
    potLayer.replaceChildren(img(`ui/${lightsOff ? 'paw-glow' : 'paw'}.png`, { class: 'pix', style: {
      position: 'absolute', ...box({ x: cx - 2, y, w: 5, h: 5 }),
      ...(lightsOff ? { mixBlendMode: 'screen', filter: 'drop-shadow(0 0 3px #ffe3b0)' } : {}) } }));
  } else {
    const text = `${total}/${STAR_AT}`;
    potLayer.replaceChildren(digitsSvg(text, cx - Math.floor((text.length * 4 - 1) / 2), y, 160, 276, lightsOff ? '#8c6f78' : '#f3c9b4'));
  }
  potLayer.setAttribute('aria-label', ready ? t('starReady') : t('moreToStar', STAR_AT - total));

  const dim = { filter: lightsOff ? 'brightness(.62)' : 'none', transition: 'filter .8s ease' };
  const ui = (file, style = {}) => img(`ui/${file}`, { style: { ...dim, ...style } });
  const bubble = (who, [bx, by], mirrored) => {
    const count = String(ornaments.filter((o) => o.author === who).length);
    const front = (BUBBLE.digits.x0 + BUBBLE.digits.x1 + 1) / 2;
    const x0 = Math.round((mirrored ? BUBBLE.w - front : front) - (count.length * 4 - 1) / 2);
    return h('button', { class: 'hit', 'aria-label': t('seeOrnamentsCount', name(who), count), style: box({ x: bx, y: by, w: BUBBLE.w, h: BUBBLE.h }),
      onclick: () => openList(who) },
      h('span', { class: 'layer', style: mirrored ? { transform: 'scaleX(-1)' } : {} }, ui('bubble.png')),
      digitsSvg(count, x0, BUBBLE.digits.y, BUBBLE.w, BUBBLE.h, '#fff6e8'));
  };
  controls.replaceChildren(...[                       // (a bare null would be put in as the text "null")
    h('button', { class: 'hit', 'aria-label': t('seeOrnaments', name('human')), style: box(PROPS.human), onclick: () => openList('human') }),
    h('button', { class: 'hit', 'aria-label': t('seeOrnaments', name('ai')), style: box(PROPS.ai), onclick: () => openList('ai') }),
    bubble('human', BUBBLE.human, false),
    bubble('ai', BUBBLE.ai, true),
    h('button', { class: 'hit', 'aria-label': t('hangOne'), title: t('hangOne'), style: box(PROPS.crate), onclick: openHang }, ui('crate.png')),
    inBox.length ? h('button', { class: 'hit', 'aria-label': t('boxCount', inBox.length), style: box(PROPS.present), onclick: openBox }, ui('present.png')) : null,
    h('button', { class: 'hit px-frame', 'aria-label': lightsOff ? t('lightsOn') : t('lightsOff'), style: { ...box(PROPS.lamp), ...dim },
      onclick: toggleLights }, img(`ui/${lightsOff ? 'moon' : 'bulb'}.png`)),
    h('button', { class: 'hit px-frame', 'aria-label': t('settings'), title: t('settings'), style: { ...box(GEAR), ...dim },
      onclick: () => openSettings('main') }, img('ui/gear.png')),
    VIEW ? null : h('button', { class: 'hit px-frame', 'aria-label': t('saveTree'), title: t('saveTree'), style: { ...box(DISK), ...dim },
      onclick: () => openSave() }, img('ui/save.png')),
    toAi.length ? h('button', { class: 'hit px-frame give-count', 'aria-label': t('toGive', toAi.length, name('ai')), title: t('toGive', toAi.length, name('ai')),
      style: { ...box(GIVE), ...dim }, onclick: () => openGive() }, img('ui/give.png'), giveBadge(toAi.length)) : null,
    ready ? h('button', { class: 'hit', 'aria-label': t('theStar'), style: box({ x: PROPS.star.x - 4, y: PROPS.star.y - 4, w: PROPS.star.w + 8, h: PROPS.star.h + 8 }),
      onclick: openStar }) : null,
  ].filter(Boolean));

  const lit = lightsOff && ready;
  if (lit !== (starFx.childElementCount > 0)) starFx.replaceChildren(...(lit ? [layer('star-halo.png', 'star-glow'), layer('star-lit.png', 'star-on')] : []));
}

function applyNight() {
  document.body.classList.toggle('night', lightsOff);
  stage.classList.toggle('night', lightsOff);
  for (const p of [room, tree, human, ai]) p.night.style.opacity = lightsOff ? 1 : 0;
  ai.day.style.opacity = lightsOff ? 0 : 1;
  lights.style.opacity = lightsOff ? 1 : 0;
  star.style.filter = lightsOff ? 'brightness(.45) saturate(.8)' : 'none';
  ornLayer.style.filter = lightsOff ? 'brightness(.72)' : 'none';
  render();
}
function applyLang() {
  document.documentElement.lang = lang;
  document.title = t('title');
}
function toggleLights() {
  lightsOff = !lightsOff;
  store.set(KEY.lights, lightsOff);
  applyNight();
}

// ── windows ─────────────────────────────────────────────────────────────────────────────────────────────────────
let sheet = null, sheetClose = null;
function openSheet(content, { onClose = null, modal = false, menu = false } = {}) {   // menu: the fixed-size Settings panel
  dropSheet();
  const panel = h('div', { class: `sheet px-ui px-frame${menu ? ' menu' : ''}`, role: 'dialog', onclick: (e) => e.stopPropagation() }, content);
  sheet = h('div', { class: 'sheet-bg', onclick: () => { if (!modal) closeSheet(); } }, panel);
  sheet.dataset.modal = modal ? '1' : '';
  sheetClose = onClose;
  stage.append(sheet);
  const focus = panel.querySelector('[autofocus]');
  if (focus) focus.focus();
}
function dropSheet() { if (sheet) { sheet.remove(); sheet = null; sheetClose = null; } }
function closeSheet() {
  if (!sheet) return;
  const then = sheetClose;
  dropSheet();
  if (unsaved && !VIEW) {                             // the tree just changed: offer the file before anything else,
    unsaved = false;                                  // unless they ticked "don't remind me again" (her 11/20: their call, their risk)
    if (store.get(KEY.noNudge, false) !== true) { saveNudge(then); return; }
  }
  if (then) then(); else starCue();
}
// After every change to the tree (her 11/20: each time, say what is at risk and put the save button right there): the tree
// lives in this browser only, so a cleared browser or another device has none of it. One tap saves it as tree.py.
let unsaved = false;
async function downloadSave() {
  try {
    const blob = new Blob([await treeFile()], { type: 'application/octet-stream' });
    const a = h('a', { href: URL.createObjectURL(blob), download: 'tree.py' });
    document.body.append(a); a.click(); a.remove();
    toast(t('savedFile'));
  } catch { toast(t('noSave')); }
}
function openSave() {                                // the disk button on the scene: the same sheet, asked for
  openSheet([
    h('h2', null, t('nudgeTitle')),
    h('p', { class: 'small' }, t('saveText')),
    h('div', { class: 'row end' },
      h('button', { type: 'button', onclick: () => closeSheet() }, t('close')),
      h('button', { type: 'button', autofocus: true, onclick: async () => { await downloadSave(); closeSheet(); } }, t('saveBackup'))),
  ]);
}
const nudgeToggle = (key, checked, onchange) => h('label', { class: 'check small' },
  h('input', { type: 'checkbox', checked, onchange: (e) => onchange(e.target.checked) }), h('span', null, t(key)));
function saveNudge(then) {
  openSheet([
    h('h2', null, t('nudgeTitle')),
    h('p', { class: 'small' }, t('nudgeText')),
    nudgeToggle('noMoreNudge', false, (on) => { store.set(KEY.noNudge, on); if (on) toast(t('noMoreNudgeNote')); }),
    h('div', { class: 'row end' },
      h('button', { type: 'button', onclick: () => closeSheet() }, t('later')),
      h('button', { type: 'button', autofocus: true, onclick: async () => { await downloadSave(); closeSheet(); } }, t('saveBackup'))),
  ], { onClose: then || (() => starCue()) });
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet && !sheet.dataset.modal) closeSheet(); });

let toastEl = null, toastTimer = 0;
function toast(text) {
  if (!toastEl) { toastEl = h('div', { class: 'toast px-ui px-frame', role: 'status' }); stage.append(toastEl); }
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

function radios(label, options, value, onChange) {
  const group = h('div', { class: 'row', role: 'radiogroup', 'aria-label': label });
  for (const [v, text, attrs] of options) {
    group.append(h('button', { type: 'button', role: 'radio', 'aria-checked': String(v === value), ...attrs, onclick: (e) => {
      for (const b of group.children) b.setAttribute('aria-checked', String(b === e.currentTarget));
      onChange(v);
    } }, text));
  }
  return group;
}

function stylePicker(value, onChange, { any = true } = {}) {
  const grid = h('div', { class: 'styles', role: 'radiogroup', 'aria-label': t('shape') });
  const choose = (v, btn) => { for (const b of grid.children) b.setAttribute('aria-checked', String(b === btn)); onChange(v); };
  if (any) {
    const b = h('button', { type: 'button', class: 'any', role: 'radio', 'aria-checked': String(!value), onclick: () => choose(null, b) }, t('surprise'));
    grid.append(b);
  }
  for (const s of STYLES) {
    const b = h('button', { type: 'button', role: 'radio', 'aria-label': t('styles')[s], title: t('styles')[s], 'aria-checked': String(value === s),
      onclick: () => choose(s, b) }, img(`ornaments/${s}.png`));
    grid.append(b);
  }
  return grid;
}

const when = (iso) => new Date(iso).toLocaleDateString(LOCALE[lang], { year: 'numeric', month: 'short', day: 'numeric' });
const excerpt = (t) => { const s = t.replace(/\s+/g, ' ').trim(); return s.length > 28 ? `${s.slice(0, 28)}…` : s; };

// ── hang one ────────────────────────────────────────────────────────────────────────────────────────────────────
function openHang() {
  // only the human hangs here: the AI hangs its own through tree.py (her 10/6: it means something only if the AI does it
  // itself, not pasted in by hand)
  const d = { kind: 'reason', text: '', style: null, ...store.get(KEY.draft, {}, true), who: 'human' };
  const keep = () => store.set(KEY.draft, d, true);
  const area = h('textarea', { rows: 3, maxlength: MAX_TEXT, placeholder: t('hintHuman'), 'aria-label': t('writeOnIt'), autofocus: true,
    oninput: () => { d.text = area.value; keep(); hang.disabled = !d.text.trim(); } });
  area.value = d.text;
  const hang = h('button', { type: 'button', disabled: !d.text.trim(), onclick: () => {
    const text = d.text.trim().slice(0, MAX_TEXT);
    if (!text) return;
    const o = { id: newId(), author: d.who, kind: d.kind, text, style: d.style || STYLES[Math.floor(Math.random() * STYLES.length)],
      created_at: new Date().toISOString() };
    ornaments.push(o);
    onTree.add(o.id);               // what you just hung goes on the tree, whatever the draw said
    save(); unsaved = true;
    setToAi([...toAi, o.id]);
    store.remove(KEY.draft, true);
    toast(t('hungIt'));
    // on the site it is hung already, so the window that hands it to the AI opens by itself only in the page tree.py drew,
    // where nothing is kept (her 11/24); here it waits behind the card's button and the AI count
    if (VIEW) openGive(o); else openCard(o);
  } }, t('hangIt'));
  openSheet([
    h('h2', null, t('hangNew')),
    h('p', { class: 'small muted' }, t('hangLead')),
    VIEW ? h('p', { class: 'small' }, t('viewHang', name('ai'))) : null,
    h('div', { class: 'small' }, t('whatKind')),
    radios(t('whatKind'), KINDS.map((k) => [k, t('kinds')[k]]), d.kind, (v) => { d.kind = v; keep(); }),
    area,
    h('div', { class: 'small' }, t('shape')),
    stylePicker(d.style, (v) => { d.style = v; keep(); }),
    h('div', { class: 'row end' },
      h('button', { type: 'button', onclick: () => { store.remove(KEY.draft, true); closeSheet(); } }, t('cancel')),
      hang),
  ]);
}

// ── read one ────────────────────────────────────────────────────────────────────────────────────────────────────
function openCard(o, back = null) {
  const mine = !VIEW || toAi.includes(o.id);         // in the packed page only what was hung there, not yet given
  const view = () => [
    h('div', { class: 'card-head' }, img(`ornaments/${o.style}.png`),
      h('div', null, h('div', null, t('hungThis', name(o.author), t('kinds')[o.kind])), h('div', { class: 'small muted' }, when(o.created_at)))),
    h('p', null, o.text),
    h('div', { class: 'row end' },
      o.author === 'human' && (!VIEW || mine) ? h('button', { type: 'button', onclick: () => openGive(o, () => openCard(o, back)) }, t('giveTitle', name('ai'))) : null,
      mine ? h('button', { type: 'button', onclick: () => edit() }, t('edit')) : null,
      mine ? h('button', { type: 'button', onclick: () => {
        if (!confirm(t('takeOffQ'))) return;
        ornaments = ornaments.filter((x) => x.id !== o.id);
        onTree.delete(o.id);
        save(); unsaved = true; setToAi(toAi.filter((id) => id !== o.id)); toast(t('takenOff'));
        closeSheet();
      } }, t('takeOff')) : null,
      h('button', { type: 'button', onclick: () => closeSheet() }, t('close'))),
  ];
  const edit = () => {
    const d = { text: o.text, style: o.style };
    const area = h('textarea', { rows: 4, maxlength: MAX_TEXT, 'aria-label': t('writtenOnIt'), autofocus: true, oninput: () => { d.text = area.value; ok.disabled = !d.text.trim(); } });
    area.value = d.text;
    const ok = h('button', { type: 'button', onclick: () => {
      const changed = o.text !== d.text.trim().slice(0, MAX_TEXT) || o.style !== d.style;
      o.text = d.text.trim().slice(0, MAX_TEXT); o.style = d.style;
      save(); unsaved = true; toast(t('saved'));
      if (changed && o.author === 'human' && !toAi.includes(o.id)) setToAi([...toAi, o.id]); else render();   // the AI's copy has the old words
      openCard(o, back);
    } }, t('save'));
    openSheet([h('h2', null, t('edit')), area, h('div', { class: 'small' }, t('shape')), stylePicker(d.style, (v) => { d.style = v; }, { any: false }),
      h('div', { class: 'row end' }, h('button', { type: 'button', onclick: () => openCard(o, back) }, t('cancel')), ok)], { onClose: back });
  };
  openSheet(view(), { onClose: back });
}

// ── for the AI: the words tree.py takes (tree.py's _PAGE_HEAD; its words may hold any line, ';' or '::') ────────────
function forAi(list) {
  // the head is a plain sentence: no ''' (the AI is told to pass all of it inside r'''...'''), and no #, >, - or "1." at
  // its start, which a chat app shows as a heading, a quote or a list (her 11/23 19:10: the # line came out huge)
  const n = list.length;
  return [`For tree.py (A Christmas Tree for Two): ${n === 1 ? 'an ornament' : `${n} ornaments`} the human hung on the page. Pass all of this, unchanged, to tree.cmd in one call, as a raw string.`,
    ...list.slice().sort(byAge).flatMap((o) => [`page-ornament ${o.id} human ${o.kind} ${o.style} ${o.created_at}`, o.text, `end-ornament ${o.id}`])].join('\n');
}
function setToAi(list) { toAi = list; store.set(KEY.toAi, list); render(); }
async function copyText(text, area) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* a frame may not be allowed the clipboard */ }
  try {
    area.focus(); area.select(); area.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch { return false; }
}
function openGive(o = null, back = null) {           // o: the one just hung or read; without it, all that wait
  const waiting = ornaments.filter((x) => toAi.includes(x.id)).sort(byAge);
  const area = h('textarea', { class: 'give-text', readonly: true, rows: 5, 'aria-label': t('giveWhat'), onfocus: () => area.select() });
  const copy = async (list) => {
    area.value = forAi(list);
    if (await copyText(area.value, area)) {
      setToAi(toAi.filter((id) => !list.some((x) => x.id === id)));
      toast(t('copied', name('ai')));
      closeSheet();
    } else { area.focus(); area.select(); toast(t('copyFailed')); }
  };
  const one = o ? [o] : waiting;
  area.value = forAi(one);
  const others = waiting.filter((x) => !o || x.id !== o.id).length;
  openSheet([
    h('h2', null, t('giveTitle', name('ai'))),
    h('p', { class: 'small' }, t('giveText', name('ai'))),
    VIEW ? h('p', { class: 'small muted' }, t('viewHang', name('ai'))) : null,
    area,
    waiting.length ? h('p', { class: 'small muted' }, t('toGive', waiting.length, name('ai'))) : null,
    h('div', { class: 'row end' },
      h('button', { type: 'button', onclick: () => closeSheet() }, t('close')),
      o && others ? h('button', { type: 'button', onclick: () => copy(waiting) }, t('copyAll', waiting.length)) : null,
      h('button', { type: 'button', autofocus: true, onclick: () => copy(one) }, one.length > 1 ? t('copyAll', one.length) : t('copyThis'))),
  ], { onClose: back });
}

// ── lists ───────────────────────────────────────────────────────────────────────────────────────────────────────
function listOf(title, items, tag, reopen) {
  return [
    h('h2', null, title),
    items.length ? h('ul', { class: 'list' }, items.map((o) => h('li', null, h('button', { type: 'button', onclick: () => openCard(o, reopen) },
      img(`ornaments/${o.style}.png`),
      h('span', { class: 'ex' }, h('span', null, excerpt(o.text)), h('span', { class: 'small muted' }, `${tag(o)} · ${when(o.created_at)}`)))))) : h('p', { class: 'muted' }, t('nothingYet')),
    h('div', { class: 'row end' }, h('button', { type: 'button', onclick: () => closeSheet() }, t('close'))),
  ];
}
function openList(who) {
  const mine = ornaments.filter((o) => o.author === who).sort(newestFirst);
  openSheet(listOf(t('ornamentsOf', name(who), mine.length), mine, (o) => t('kinds')[o.kind], () => openList(who)));
}
function openBox() {
  const inBox = ornaments.filter((o) => !onTree.has(o.id)).sort(newestFirst);
  openSheet([h('p', { class: 'small muted' }, t('boxLead', PER_AUTHOR)),
    ...listOf(t('boxTitle'), inBox, (o) => name(o.author), openBox)]);
}

// ── the star ────────────────────────────────────────────────────────────────────────────────────────────────────
function starCue() {                                 // the first time all 42 are up: the lights go off and the star lights
  if (sheet || ornaments.length < STAR_AT || store.get(KEY.star, false) === true) return;
  if (!store.set(KEY.star, true)) return;
  setTimeout(() => { if (!lightsOff) toggleLights(); }, 900);
}
const PACKED_FILM = globalThis.TREE_FILM || null;   // the star's film is its own file beside the page; the page packed into tree.py carries it whole
const FILM = globalThis.TREE_ASSETS ? PACKED_FILM : 'film.html';
function openStar() {
  const play = lightsOff && FILM;
  openSheet([
    h('h2', null, t('allHung', STAR_AT)),
    h('p', null, t('soul')),
    h('p', { class: 'muted' }, !lightsOff ? t('starDark') : FILM ? t('starLit') : t('starLitNoFilm')),
    h('div', { class: 'row end' },
      play ? h('button', { type: 'button', autofocus: true, onclick: () => { dropSheet(); openFilm(); } }, t('playFilm')) : null,
      h('button', { type: 'button', onclick: () => closeSheet() }, t('close'))),
  ]);
}
function openFilm() {                                // over the whole stage; the film's own page waits for a tap, then plays with its music
  const kinds = [...STYLES].sort();                 // the film's tree is this tree: what hangs on each hook, oldest first (her 11/20)
  const hung = ornaments.filter((o) => onTree.has(o.id)).sort(byAge).slice(0, SLOTS.length).map((o) => kinds.indexOf(o.style).toString(36)).join('');
  const cast = new URLSearchParams({ h: name('human'), a: name('ai'), l: lang, o: hung });   // and its stars are the two playing
  const frame = h('iframe', { class: 'film', title: t('theFilm'), allow: 'autoplay',   // a packed film has no address to carry the cast after a #: the frame's name does
    ...(PACKED_FILM ? { name: String(cast), srcdoc: PACKED_FILM } : { src: `${FILM}#${cast}` }) });
  sheet = h('div', { class: 'film-bg' }, frame,
    h('button', { type: 'button', class: 'film-close px-ui px-frame', 'aria-label': t('close'), onclick: () => closeSheet() }, '×'));
  sheet.dataset.modal = '';
  stage.append(sheet);
}

// ── the two of you ──────────────────────────────────────────────────────────────────────────────────────────────
const LOOK = 48;                                     // the preview window, in scene pixels
function lookPreview(who) {                         // the fluffball's own box, centred and standing on the window's floor
  const b = PROPS[who], at = { x: b.x - Math.floor((LOOK - b.w) / 2), y: b.y - (LOOK - b.h) };
  return h('div', { class: 'who-look', role: 'img', 'aria-label': t('looks')[LOOKS[who][0]] },
    img(`creatures/${who}-rest.png`, { style: { left: px(-at.x), top: px(-at.y) } }));
}
function openCast() {                               // the first visit: a title screen, then who the two are. After that a name is changed in Settings, where it stands
  const d = { human: { name: '', look: 'peach', ...(cast && cast.human) }, ai: { name: '', look: 'sky', ...(cast && cast.ai) } };
  // the title screen (her 11/21: a phone set to Japanese opened straight onto a Japanese name form; a game shows its
  // title first and lets you pick the language there)
  const file = saveFile();                           // a save opened here goes straight to its tree, with the names in it
  const title = () => openSheet([
    h('h1', { class: 'title-name' }, t('title')),
    h('div', { class: 'cast-row' }, WHO.map((who) => h('figure', null, lookPreview(who)))),
    Object.assign(radios(t('language'), LANGS.map(([code, label]) => [code, label, { lang: code }]), lang, (v) => {
      lang = v; store.set(KEY.lang, v); applyLang(); render(); title();
    }), { className: 'title-langs' }),
    h('div', { class: 'title-start' }, h('button', { type: 'button', autofocus: true, onclick: () => step('human') }, t('start')),
      h('button', { type: 'button', onclick: () => file.click() }, t('restoreBackup')), file),
  ], { modal: true });
  const step = (who) => {
    const input = h('input', { type: 'text', maxlength: MAX_NAME, autofocus: true, 'aria-label': who === 'human' ? t('yourName') : t('aiName'),
      placeholder: who === 'human' ? t('yourName') : t('aiName'), oninput: () => { d[who].name = input.value; next.disabled = !input.value.trim(); } });
    input.value = d[who].name;
    const next = h('button', { type: 'button', disabled: !d[who].name.trim(), onclick: () => {
      d[who].name = input.value.trim().slice(0, MAX_NAME);
      if (who === 'human') { step('ai'); return; }
      cast = d;
      store.set(KEY.cast, cast) || toast(t('noSave'));
      render();
      closeSheet();
    } }, who === 'human' ? t('next') : t('startDecorating'));
    openSheet([
      h('h2', null, who === 'human' ? t('whoDecorates') : t('theAi')),
      h('p', { class: 'small muted' }, who === 'human' ? t('firstYou') : t('andTheOne')),
      h('div', { class: 'row' }, lookPreview(who),
        radios(t('look'), LOOKS[who].map((l) => [l, t('looks')[l]]), d[who].look, (v) => { d[who].look = v; })),
      input,
      h('div', { class: 'row end' }, h('button', { type: 'button', onclick: () => (who === 'ai' ? step('human') : title()) }, t('back')), next),
    ], { modal: true });
  };
  title();
}

// ── the save: tree.py itself, the tree in the block at its end (tree.py reads and writes that same block) ───────
const SAVE_BEGIN = '# ===== TREE SAVE · written by tree.py, do not edit by hand =====', SAVE_END = '# ===== END TREE SAVE =====';
function readSave(src) {                            // from the end: the marker lines also appear near the top of tree.py
  const block = src.slice(src.lastIndexOf(SAVE_BEGIN), src.lastIndexOf(SAVE_END));
  return JSON.parse(block.slice(block.indexOf("r'''") + 4, block.lastIndexOf("'''")));
}
async function treeFile() {                         // the site's own tree.py with this tree in it
  const res = await fetch('tree.py', { cache: 'no-store' });
  const src = await res.text();
  const start = src.lastIndexOf(SAVE_BEGIN), end = src.lastIndexOf(SAVE_END);
  if (!res.ok || start < 0 || end < start) throw new Error('no tree.py');
  const rev = (Number(store.get(KEY.rev, 0)) || 0) + 1;
  const state = { format: 'two-tree', version: 1, cast, ornaments, star_seen: store.get(KEY.star, false) === true, rev,
    page: location.origin + location.pathname };   // where this page lives: tree.py's link leads back here, if it is a public address (her 11/23: someone's own copy, with their own characters)
  // as tree.py writes it: ASCII only and no single quote, so it sits inside r'''...''' as it is
  const json = JSON.stringify(state).replace(/[\u007f-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)
    .replace(/'/g, '\\u0027');
  store.set(KEY.rev, rev);
  return `${src.slice(0, start)}${SAVE_BEGIN}\n_SAVE = r'''${json}'''\n${src.slice(end)}`;
}

// ── settings: a game menu (her 10/6). One page holds the two of you, the language and the save; the other, the credits
// (her 11/20: a name is changed where it stands, fewer pages to turn, nothing to scroll) ─────────────────────────────
let settingsTab = 'main';
function nameField(who) {                           // the name under its fluffball: tap it and type; Enter, or leaving the field, keeps it
  const label = who === 'human' ? t('yourName') : t('aiName');
  const input = h('input', { type: 'text', class: 'name-edit', maxlength: MAX_NAME, placeholder: label, 'aria-label': label,
    onkeydown: (e) => { if (e.key === 'Enter' && !e.isComposing) input.blur(); },   // not the Enter that picks a word while typing Chinese or Japanese
    onchange: () => {
      const v = input.value.trim().slice(0, MAX_NAME);
      input.value = v || name(who);                 // emptied: the old name comes back
      if (!v || v === name(who)) return;
      cast = { ...cast, [who]: { ...cast[who], name: v } };
      const kept = store.set(KEY.cast, cast);
      unsaved = true; render(); toast(t(kept ? 'saved' : 'noSave'));
    } });
  input.value = name(who);
  // the pencil says "this can be changed" (her 11/21); it is drawn over the right end of the field and lets the tap through
  return h('label', { class: 'name-wrap' }, input, h('span', { class: 'pen', 'aria-hidden': 'true' }));
}
function saveFile() {                               // the hidden picker that opens a save. Settings has one, and so does the title screen
  const file = h('input', { type: 'file', style: { display: 'none' }, onchange: async () => {   // (her 11/24: with a tree saved already, one still had to name the two again to get in and open it)
    try {
      const src = await file.files[0].text();
      file.value = '';
      const data = src.includes(SAVE_BEGIN) ? readSave(src) : JSON.parse(src);    // tree.py, or a backup from before it
      const list = (data.ornaments || []).filter(valid);
      if (!WHO.every((w) => data.cast && data.cast[w] && typeof data.cast[w].name === 'string' && data.cast[w].name.trim())) throw new Error('no names');
      if ((cast || ornaments.length) && !confirm(t('replaceQ', list.length))) return;   // on the title screen there is no tree to replace
      cast = data.cast; ornaments = list; onTree.clear(); pick(ornaments).forEach((id) => onTree.add(id));
      store.set(KEY.cast, cast); save();
      // a save may be the page's own, with ones still to give in it; pasting one twice does no harm (tree.py knows it)
      toAi = toAi.filter((id) => list.some((x) => x.id === id && x.author === 'human')); store.set(KEY.toAi, toAi);
      if ('star_seen' in data) store.set(KEY.star, data.star_seen === true);
      store.set(KEY.rev, Number(data.rev) || 0);
      render(); toast(t('restored')); closeSheet();
    } catch { toast(t('notBackup')); }
  } });
  return file;
}
function openSettings(tab = settingsTab) {          // called bare (back from a window it opened) it stays on its tab
  settingsTab = tab;
  const file = saveFile();
  const startOver = h('button', { type: 'button', onclick: () => {   // down in the corner, away from the two it must not be mistaken for
    if (!confirm(t('startOverQ'))) return;
    ornaments = []; onTree.clear(); save(); toAi = []; store.set(KEY.toAi, toAi);
    store.remove(KEY.star);
    render(); closeSheet(); toast(t('bareTree'));
  } }, t('startOver'));
  const pages = {
    main: () => [
      h('div', { class: 'cast-row' }, WHO.map((who) => h('figure', null, lookPreview(who), VIEW ? h('figcaption', null, name(who)) : nameField(who)))),
      MANUAL && !VIEW ? h('div', { class: 'row own-chars' }, h('button', { type: 'button', class: 'small', onclick: () => openOwnChars() }, t('ownChars'))) : null,
      radios(t('language'), LANGS.map(([code, label]) => [code, label, { lang: code }]), lang, (v) => {
        lang = v; store.set(KEY.lang, v); applyLang(); render(); openSettings();
      }),
      ...(VIEW ? [h('p', { class: 'small' }, t('viewNote', name('ai')))] : [
        h('p', { class: 'small' }, t('storageNote')),
        nudgeToggle('nudgeSetting', store.get(KEY.noNudge, false) !== true, (on) => store.set(KEY.noNudge, !on)),
        h('div', { class: 'row' },
          h('button', { type: 'button', onclick: () => downloadSave() }, t('saveBackup')),
          h('button', { type: 'button', onclick: () => file.click() }, t('restoreBackup')), file),
      ]),
    ],
    about: () => [                                   // the roles as the film's end credits have them (her 10/6)
      h('p', { class: 'small' }, t('aboutText')),
      h('div', { class: 'credits' }, t('credits', name('human'), name('ai')).map(([role, who]) =>
        h('div', { class: 'credit' }, h('div', { class: 'role' }, role), h('div', { class: 'who' }, who)))),
      h('p', { class: 'small muted' }, t('notice'), h('a', { href: '#', onclick: (e) => { e.preventDefault(); openNotice(); } }, t('fullNotice'))),
    ],
  };
  openSheet([
    h('div', { class: 'tabs', role: 'tablist', 'aria-label': t('settings') }, [['main', t('settings')], ['about', t('about')]].map(([id, label]) =>
      h('button', { type: 'button', role: 'tab', 'aria-selected': String(id === tab), onclick: () => openSettings(id) }, label))),
    h('div', { class: 'menu-page' }, pages[tab]()),
    h('div', { class: 'row end' }, tab === 'main' && !VIEW ? [startOver, h('span', { class: 'grow' })] : null,
      h('button', { type: 'button', onclick: () => closeSheet() }, t('close'))),
  ], { menu: true });
}

// ── the full notice, in the page's language: NOTICE.md, cut by language into notice.js ─────────────────────────────
function openNotice() {
  const { title, body } = NOTICE[lang] || NOTICE.en;
  openSheet([
    h('h2', null, title),
    body.split(/\n{2,}/).map((block) => {                // all NOTICE.md uses: ### headings, - lists, **bold** lines
      if (block.startsWith('### ')) return h('div', { class: 'small muted section' }, block.slice(4));
      if (block.startsWith('- ')) return h('ul', { class: 'small notice-list' }, block.split('\n').map((l) => h('li', null, l.slice(2))));
      const bold = /^\*\*(.+)\*\*$/.exec(block);
      return h('p', { class: 'small' }, bold ? h('strong', null, bold[1]) : block);
    }),
    h('div', { class: 'row end' }, h('button', { type: 'button', onclick: () => closeSheet() }, t('back'))),
  ], { onClose: openSettings });
}

// ── your own characters: a button under the two names, a few short words for the human and the manual to hand to
// their AI (her 11/20: the manual is the AI's to read). The page packed into tree.py has no file beside it, so it goes without.
const MANUAL = globalThis.TREE_ASSETS ? null : () => `CHARACTERS.${lang}.md`;
function openOwnChars() {
  openSheet([
    h('h2', null, t('ownChars')),
    t('ownCharsText').map((text) => h('p', { class: 'small' }, text)),
    h('p', { class: 'small' }, h('a', { href: MANUAL(), download: MANUAL() }, t('ownCharsGet'))),
    h('div', { class: 'row end' }, h('button', { type: 'button', onclick: () => closeSheet() }, t('back'))),
  ], { onClose: openSettings });
}

document.addEventListener('touchstart', () => {}, { passive: true });   // iOS Safari shows :active (a press) only then
applyLang();
applyNight();
// A link from tree.py carries a whole tree after the # (her 11/23: a phone's chat app shows tree.html without running
// it, so the way to the tree from there is a link): zlib, then base64 for addresses. Nothing after a # is sent to the
// server. A device that already has another tree with ornaments on it is asked before that tree is replaced.
async function fromLink() {
  const m = /^#t=([A-Za-z0-9_-]+)$/.exec(location.hash);
  if (!m || VIEW) return;
  try { history.replaceState(null, '', location.pathname + location.search); } catch { /* the address keeps its tail */ }
  try {
    const bytes = Uint8Array.from(atob(m[1].replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    let data = JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'))).text());
    if (Array.isArray(data) && data[0] === 2) {     // the small way tree.py writes it now (tree.py _link); the first links were the save itself
      const [, human, ai, seen, rev, rows] = data; let at = 0;
      data = { cast: { human: { name: human[0], look: human[1] }, ai: { name: ai[0], look: ai[1] } }, star_seen: !!seen, rev,
        ornaments: rows.map(([id, who, kind, style, dt, text]) => ({ id, author: WHO[who], kind: KINDS[kind], style: STYLES[style], text,
          created_at: new Date((at += dt) * 1000).toISOString().replace('.000Z', 'Z') })) };
    }
    const list = (data.ornaments || []).filter(valid);
    if (list.length !== (data.ornaments || []).length) throw new Error('damaged');
    if (!WHO.every((w) => data.cast && data.cast[w] && typeof data.cast[w].name === 'string' && data.cast[w].name.trim())) throw new Error('no names');
    const mark = (c, l) => JSON.stringify([WHO.map((w) => c && c[w] && c[w].name), l.map((o) => [o.id, o.text, o.style]).sort()]);
    if (mark(cast, ornaments) === mark(data.cast, list)) return;
    if (ornaments.length && !confirm(t('linkQ', list.length, ornaments.length))) return;
    cast = data.cast; ornaments = list; onTree.clear(); pick(ornaments).forEach((id) => onTree.add(id));
    store.set(KEY.cast, cast); save(); toAi = []; store.set(KEY.toAi, toAi);   // a link comes from tree.py: the AI has all of it
    store.remove(KEY.star);                           // the star's cue is for whoever is looking: it plays on this device too
    store.set(KEY.rev, Number(data.rev) || 0);
    render();
    return true;
  } catch { alert(t('badLink')); }
}
fromLink().then(() => { if (!cast || !cast.human || !cast.ai) openCast(); else starCue(); });
addEventListener('hashchange', () => fromLink().then((took) => { if (took) location.reload(); }));   // the link tapped with the page already open
