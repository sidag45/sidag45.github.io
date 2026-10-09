(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);
  let agent = 'VISITOR';

  /* ---------- FILE DATE: the subject's date of birth ---------- */
  const FILE_DATE = new Date(1999, 9, 8); // year, month (0 = Jan), day
  const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  const FD = {
    roman: `${String(FILE_DATE.getDate()).padStart(2,'0')}.${['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][FILE_DATE.getMonth()]}.${FILE_DATE.getFullYear()}`,
    short: `${String(FILE_DATE.getDate()).padStart(2,'0')} ${MONTHS[FILE_DATE.getMonth()].slice(0,3)} ${FILE_DATE.getFullYear()}`,
    long: `${FILE_DATE.getDate()} ${MONTHS[FILE_DATE.getMonth()]} ${FILE_DATE.getFullYear()}`,
  };

  /* ---------- DATA ---------- */
  const FILES = [
    { id:'PAGELIFT', code:'OP-01', name:'Pagelift', status:'Active', clr:'Public',
      op:'Lifts any live webpage into Figma as editable frames and layers.',
      role:'Sole operative. Design, build, publishing.',
      body:'A free Figma plugin paired with a Chrome extension, Pagelift — Capture. The extension reads a page as it renders in the browser; the plugin rebuilds it in Figma as real frames and layers. Published on the Figma Community and the Chrome Web Store.',
      secret:'Originally filed under the codename "Web to Figma" before it was renamed.',
      tags:['Figma Plugin API','Chrome Extension','TypeScript','DOM capture'],
      link:{href:'https://sidag45.github.io/pagelift/', label:'Visit site'} },
    { id:'PEGASUS', code:'OP-02', name:'Pegasus-1', status:'In progress', clr:'Secret',
      op:'Scroll-driven 3D exploded view of a mechanical watch for a fictional maison.',
      role:'Concept, 3D direction, three.js build.',
      body:'An interactive exploded-watch experience for Halden & Vey, a brand invented for the exercise. As the visitor scrolls, the Pegasus-1 separates layer by layer so each part can be studied, with a path toward XR viewing.',
      secret:'The brand does not exist. The watch does not exist. The movement is real enough to fool a collector.',
      tags:['three.js','Scroll animation','WebXR','Product storytelling'],
      link:{href:'https://sidag45.github.io/XR%20Projects/3d-watch-animate/', label:'View the watch'} },
    { id:'DESKTOP', code:'OP-03', name:'Gesture Desktop', status:'In progress', clr:'Secret',
      op:'A MacBook-style desktop in the browser, operated by hand in front of a webcam.',
      role:'Interaction design and engineering.',
      body:'Files and folders can be picked up, dragged and dropped with fingers. A two-finger tap opens the context menu, and the usual trackpad controls still work. With the camera on, hand tracking drives a red pointer, mapped from finger movement to screen distance.',
      secret:'Built as a study in how far direct-manipulation habits transfer to mid-air input.',
      tags:['Hand tracking','Computer vision','Gesture UX','JavaScript'],
      link:{href:'https://sidag45.github.io/XR%20Projects/virtual-desktop/', label:'Try the desktop'} },
    { id:'PAPERTOSS', code:'OP-04', name:'Paper Toss', status:'Playable', clr:'Secret',
      op:'Office basketball played hands-free: crumple a sheet and throw it in the bin, using only your hand in front of a webcam.',
      role:'Game design, gesture design and build.',
      body:'Pinch thumb and index finger to pick up the sheet from the desk, make a fist three times to crumple it into a ball, then swing toward the bin and open your hand to let go. A power meter shows the strength of the throw, and every basket moves the bin farther away. The game tracks baskets, tosses, streak and best streak. Hand tracking runs in the browser and the video never leaves the device; mouse and touch work too.',
      secret:'Every gesture maps to something a real hand does with real paper. Nobody needs a tutorial to throw.',
      tags:['Hand tracking','Gesture input','Game design','JavaScript'],
      link:{href:'https://sidag45.github.io/XR%20Projects/paper-toss/paper-toss.html', label:'Play Paper Toss'} },
    { id:'SRK', code:'OP-05', name:'SRK Haute Horlogerie', status:'Delivered', clr:'Confidential',
      op:'A private viewing room for a luxury watch boutique.',
      role:'Web design and Webflow development, via Enclave Labs.',
      body:'Designed and improved the boutique\'s Webflow site to feel like an appointment, not a checkout. Built the CMS structure, SEO-friendly imports, collection filtering, dynamic content and custom JavaScript interactions, plus automations for publishing new pieces.',
      secret:'The brief: nobody should feel they are shopping. They should feel invited.',
      tags:['Webflow','CMS architecture','Custom JS','Automation'] },
    { id:'MOVEMENT', code:'OP-06', name:'Movement Lab', status:'Active', clr:'Confidential',
      op:'A coaching app for a Hong Kong gym, built to grow into a global subscription.',
      role:'Product and engineering lead, via Enclave Labs.',
      body:'Stage one equips Movement Fitness\'s personal trainers to coach their in-gym clients through the app. Stage two opens the same codebase to self-serve subscribers worldwide, covering training programmes and nutrition.',
      secret:'Two products, one codebase. Planned that way from day one.',
      tags:['Next.js','Mobile','Product strategy','Scalability'] },
    { id:'PARALLEL', code:'OP-07', name:'ParallelChain Lab', status:'Concluded', clr:'Secret',
      op:'Front-end lead on a Layer 1 blockchain platform.',
      role:'Lead Front-end Engineer. Unit of 5+.',
      body:'Led the front-end team and set its architecture. Shipped the block explorer and a native wallet, built developer tools and documentation, and helped tighten engineering processes across the lab.',
      secret:'Leadership of the unit included process reform, not only code.',
      tags:['React','TypeScript','Team lead','Developer tools'] },
    { id:'ROJU', code:'OP-08', name:'ROJU', status:'Concluded', clr:'Confidential',
      op:'Mobile app and CMS for an online jump rope learning platform.',
      role:'Mobile and full-stack engineer.',
      body:'Built ROJU\'s React Native app and published it to the App Store and Google Play. Contributed backend features in Java Spring Boot and built a React content management system for the coaching content.',
      secret:'Shipped on both stores, which is its own kind of fieldcraft.',
      tags:['React Native','Spring Boot','React CMS'] },
    { id:'FAATEH', code:'OP-09', name:'Faateh Real Estate', status:'Handed over', clr:'Confidential',
      op:'A Webflow site for a real estate firm, plus a full handover kit.',
      role:'Design, build and client training, via Enclave Labs.',
      body:'Built the site in Webflow, then prepared the client to own it: a handover document and a tutorial video script covering sign-up, site transfer and day-to-day editing.',
      secret:'Good handovers mean the client never needs to call back. That is the goal.',
      tags:['Webflow','Client handover','Documentation'] },
  ];

  /* ---------- HCI ANNEXES: research analysis for selected case files ---------- */
  const ANALYSIS = {
    PAGELIFT: {
      rq: 'Does importing a live webpage as editable Figma layers shorten the path from "I want to work on this page" to an editable design, and reduce reconstruction errors, compared with rebuilding the page from screenshots?',
      principles: [
        ['Gulf of execution', 'Norman describes the gap between what a person wants and the actions a tool offers for it. Rebuilding a page by hand turns one goal into hundreds of steps: measuring spacing, retyping copy, re-picking colours. Pagelift reduces it to one action in the browser and one in Figma.'],
        ['Match with the real world', 'The imported layer tree follows the structure of the page itself, and layers are named after the parts people see, such as header, card and button, instead of "Rectangle 12". Designers find their way by recognition rather than recall.'],
        ['Visibility of system status', 'Capturing a long page takes a few seconds. The extension shows what it is collecting and the plugin reports progress, so nobody has to wonder whether the click registered.'],
        ['Error prevention and recovery', 'Every import lands in a new frame, so nothing already on the canvas is touched. A poor capture is removed or undone in one step.'],
      ],
      figs: ['pl-flow', 'pl-tree'],
      study: 'A within-subjects study in which designers recreate the same landing-page section twice: once by tracing a screenshot and once with Pagelift. Measures: time to a first editable frame, fidelity errors counted against the live page, and perceived workload on the NASA-TLX.',
    },
    PEGASUS: {
      rq: 'Does an exploded view that the reader drives by scrolling help people understand how a mechanical watch is built, and remember its parts and their order, better than a static exploded diagram or an animation that plays by itself?',
      principles: [
        ['Progressive disclosure', 'A watch has dozens of parts. Showing all of them at once overwhelms; the scroll separates one layer at a time, crystal, bezel, dial, hands, movement, case and caseback, so the reader takes in each part before meeting the next.'],
        ['Control over animation', 'Tversky, Morrison and Bétrancourt found that animated diagrams often teach no better than static ones, partly because they run too fast to follow. Tying the motion to the scroll position hands the pace to the reader: stop, reverse and replay at will.'],
        ['Natural mapping', 'Scrolling down pulls the watch apart and scrolling up puts it back together, so the direction of input matches the direction of motion. The distance scrolled maps to how far the layers separate, which makes the effect predictable.'],
        ['Spatial contiguity', 'Mayer\'s multimedia principle says people learn more when words sit next to the thing they describe. Each label is drawn beside its part with a leader line, not in a numbered legend the eye has to jump to.'],
        ['Orientation and restraint', 'Scroll-driven pages can make people feel the page has been taken from them. A progress indicator shows how far through the breakdown the reader is, ordinary scrolling still works, and people who prefer reduced motion get a static exploded diagram.'],
      ],
      figs: ['pg-explode', 'pg-scroll', 'pg-labels'],
      study: 'A between-subjects study with three conditions: a static exploded diagram, an exploded animation that plays by itself, and the scroll-controlled exploded view. Measures: accuracy naming parts, recall of assembly order, time spent, and self-rated understanding. A follow-up in XR would test whether pulling parts apart by hand improves recall further.',
    },
    DESKTOP: {
      rq: 'Can mid-air hand tracking through a laptop webcam support precise direct-manipulation tasks (pick up, drag, drop, open a context menu) on a desktop metaphor, and how does the finger-to-pointer gain affect speed, accuracy and arm fatigue?',
      principles: [
        ['Direct manipulation', 'Shneiderman\'s criteria are continuous representation of objects, physical actions in place of commands, and fast, reversible results. The desktop keeps files and folders on screen and lets people pick them up by hand, so the question is whether those criteria survive when the hand never touches anything.'],
        ['Fitts\'s law and control-display gain', 'Movement time grows with distance and shrinks with target width. The ratio between finger movement and pointer movement trades one against the other: high gain crosses the screen quickly but makes small targets hard to hit, while low gain is precise but tiring.'],
        ['The Midas touch problem', 'If every hand movement acts, people trigger things they only meant to look at. The gesture set uses an explicit clutch: the pointer follows the hand, but nothing is picked up until a pinch, and opening the hand drops.'],
        ['Feedback without touch', 'Mid-air input has no physical click to confirm an action. The red pointer, hover highlights and a lifted look on grabbed items carry all of the confirmation a trackpad would give through the fingertip.'],
        ['Fatigue and posture', 'Holding an arm up in front of a screen tires it within minutes, often called gorilla arm. Tracking the hand just above the keyboard, and keeping trackpad controls available, keeps sessions comfortable.'],
      ],
      figs: ['gd-setup', 'gd-states', 'gd-fitts'],
      study: 'A target-acquisition study in the style of ISO 9241-411, comparing the trackpad with hand tracking at three gain levels. Measures: throughput in bits per second, error rate, and perceived exertion on the Borg CR10 scale after each block.',
    },
  };

  /* ---------- pencil-sketch renderer: seeded, so each drawing is stable ---------- */
  function sketcher(seed, W, H){
    let s = seed >>> 0;
    const r = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const j = a => (r() * 2 - 1) * a;
    const f = n => n.toFixed(1);
    const out = [];
    const esc = t => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    function stroke(x1, y1, x2, y2, cls = 'pc', w = 1.5, passes = 2){
      const len = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
      for (let k = 0; k < passes; k++){
        const ax = x1 + j(1.1), ay = y1 + j(1.1), bx = x2 + j(1.1), by = y2 + j(1.1);
        const bow = j(Math.min(3.5, len * .012 + .5)), t = .35 + r() * .3;
        const mx = ax + (bx - ax) * t + nx * bow, my = ay + (by - ay) * t + ny * bow;
        out.push(`<path class="${cls}" stroke-width="${(k ? w * .55 : w).toFixed(2)}" d="M${f(ax)} ${f(ay)}Q${f(mx)} ${f(my)} ${f(bx)} ${f(by)}"/>`);
      }
    }
    const api = {
      line(x1, y1, x2, y2, c, w){ stroke(x1, y1, x2, y2, c, w); return api; },
      dash(x1, y1, x2, y2){ stroke(x1, y1, x2, y2, 'pd', 1.2, 1); return api; },
      rect(x, y, w, h, c = 'pc', sw = 1.5){
        stroke(x - 2, y, x + w + 2, y + j(.8), c, sw); stroke(x + w, y - 2, x + w + j(.8), y + h + 2, c, sw);
        stroke(x + w + 2, y + h, x - 2, y + h + j(.8), c, sw); stroke(x, y + h + 2, x + j(.8), y - 2, c, sw); return api;
      },
      xbox(x, y, w, h){ api.rect(x, y, w, h); stroke(x + 3, y + 3, x + w - 3, y + h - 3, 'pc', 1); stroke(x + w - 3, y + 3, x + 3, y + h - 3, 'pc', 1); return api; },
      ellipse(cx, cy, rx, ry, c = 'pc', sw = 1.5, rot = 0){
        const cr = Math.cos(rot), sr = Math.sin(rot);
        for (let k = 0; k < 2; k++){
          const a0 = r() * 6.28, n = 30, pts = [];
          for (let i = 0; i <= n + 3; i++){
            const a = a0 + i / n * 6.55, q = 1 + j(.035);
            const ex = Math.cos(a) * rx * q, ey = Math.sin(a) * ry * q;
            pts.push(`${f(cx + ex * cr - ey * sr)} ${f(cy + ex * sr + ey * cr)}`);
          }
          out.push(`<path class="${c}" stroke-width="${(k ? sw * .55 : sw).toFixed(2)}" d="M${pts.join('L')}"/>`);
        }
        return api;
      },
      hatch(x, y, w, h, gap = 7){
        for (let d = -h; d < w; d += gap){
          let x1 = x + d, y1 = y + h, x2 = x + d + h, y2 = y;
          if (x1 < x){ y1 -= (x - x1); x1 = x; }
          if (x2 > x + w){ y2 += (x2 - (x + w)); x2 = x + w; }
          if (y1 > y2 + 1) stroke(x1, y1, x2, y2, 'ph', .9, 1);
        }
        return api;
      },
      arrow(x1, y1, x2, y2, c = 'pc', w = 1.5){
        stroke(x1, y1, x2, y2, c, w);
        const a = Math.atan2(y2 - y1, x2 - x1), L = 11;
        stroke(x2, y2, x2 - L * Math.cos(a - .42), y2 - L * Math.sin(a - .42), c, w, 1);
        stroke(x2, y2, x2 - L * Math.cos(a + .42), y2 - L * Math.sin(a + .42), c, w, 1);
        return api;
      },
      curve(x1, y1, cx, cy, x2, y2, c = 'pc', head = true){
        out.push(`<path class="${c}" stroke-width="1.5" d="M${f(x1)} ${f(y1)}Q${f(cx + j(2))} ${f(cy + j(2))} ${f(x2)} ${f(y2)}"/>`);
        out.push(`<path class="${c}" stroke-width=".8" d="M${f(x1 + j(1))} ${f(y1 + j(1))}Q${f(cx + j(3))} ${f(cy + j(3))} ${f(x2 + j(1))} ${f(y2 + j(1))}"/>`);
        if (head){
          const a = Math.atan2(y2 - cy, x2 - cx), L = 11;
          stroke(x2, y2, x2 - L * Math.cos(a - .42), y2 - L * Math.sin(a - .42), c, 1.5, 1);
          stroke(x2, y2, x2 - L * Math.cos(a + .42), y2 - L * Math.sin(a + .42), c, 1.5, 1);
        }
        return api;
      },
      scrib(x, y, w, c = 'pc'){ // a scribbled line standing in for text
        let d = `M${f(x)} ${f(y)}`, xx = x;
        while (xx < x + w){ const st = 5 + r() * 4; d += `Q${f(xx + st / 2)} ${f(y - 3 - r() * 2)} ${f(Math.min(xx + st, x + w))} ${f(y + j(1))}`; xx += st; }
        out.push(`<path class="${c}" stroke-width="1.1" d="${d}"/>`); return api;
      },
      dot(x, y, rad, c = 'fg'){ out.push(`<circle class="${c}" cx="${f(x + j(.6))}" cy="${f(y + j(.6))}" r="${rad}"/>`); return api; },
      text(x, y, str, o = {}){
        const rot = o.rot != null ? o.rot : j(1.6);
        out.push(`<text class="${o.cls || 'pt'}" x="${f(x)}" y="${f(y)}" font-size="${o.size || 15}" text-anchor="${o.anchor || 'start'}" transform="rotate(${rot.toFixed(2)} ${f(x)} ${f(y)})">${esc(str)}</text>`);
        return api;
      },
      svg(label){ return `<svg class="sk" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${out.join('')}</svg>`; },
    };
    return api;
  }

  const SKETCHES = {
    'pg-explode': {
      caption: 'The Pegasus-1 pulled apart along its axis. Each layer is labelled where it sits, and the bar on the right shows how far the reader has scrolled.',
      label: 'Wireframe: an exploded side view of a watch with crystal, bezel, dial, hands, movement, case with crown and caseback stacked on a dashed axis, labelled with leader lines, and a scroll progress bar on the right.',
      draw(){
        const k = sketcher(83, 660, 360);
        k.dash(240, 16, 240, 348);
        k.ellipse(240, 40, 88, 15).hatch(190, 34, 60, 10, 9);
        k.ellipse(240, 84, 96, 18).ellipse(240, 84, 78, 13);
        k.ellipse(240, 130, 84, 16);
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(i => { const a = i / 12 * 6.283; k.dot(240 + Math.cos(a) * 70, 130 + Math.sin(a) * 12, 1.6); });
        k.line(240, 170, 292, 164).line(240, 170, 212, 158).dot(240, 170, 3);
        k.ellipse(240, 214, 80, 16).ellipse(214, 212, 22, 6, 'pc', 1.1).ellipse(262, 216, 15, 4.5, 'pc', 1.1).ellipse(240, 210, 9, 3, 'pc', 1);
        k.ellipse(240, 262, 100, 19).line(140, 262, 140, 282).line(340, 262, 340, 282);
        k.curve(140, 282, 240, 312, 340, 282, 'pc', false);
        k.rect(372, 264, 18, 14).line(342, 271, 372, 271);
        k.ellipse(240, 330, 86, 15);
        const lab = [['crystal', 40], ['bezel', 84], ['dial', 130], ['hands', 166], ['movement', 214], ['case + crown', 266], ['caseback', 330]];
        lab.forEach(([n, y]) => { k.line(n === 'case + crown' ? 392 : 332, y, 440, y, 'pc', 1); k.text(448, y + 5, n, {size: 15}); });
        k.rect(612, 26, 12, 300).hatch(612, 26, 12, 214, 6).ellipse(618, 240, 9, 9, 'pr', 1.6).dot(618, 240, 4, 'fr');
        k.text(600, 352, 'scroll 70%', {size: 13, anchor: 'end'});
        k.text(18, 186, 'one layer', {cls: 'ptr', size: 26, rot: -4}).text(18, 212, 'per step', {cls: 'ptr', size: 26, rot: -4});
        return k.svg(this.label);
      },
    },
    'pg-scroll': {
      caption: 'Storyboard of the scroll. The reader sets the pace: scrolling down pulls the watch apart, scrolling up puts it back together.',
      label: 'Wireframe storyboard: three browser frames showing the watch assembled at 0 percent, half separated at 50 percent and fully exploded with labels at 100 percent, with arrows between them.',
      draw(){
        const k = sketcher(97, 660, 310);
        const frames = [[20, '0% · assembled', 0], [240, '50%', 18], [460, '100% · exploded', 34]];
        frames.forEach(([x, cap, gap], fi) => {
          k.rect(x, 24, 180, 226).line(x, 44, x + 180, 44).ellipse(x + 12, 34, 3, 3).ellipse(x + 22, 34, 3, 3);
          const cx = gap > 20 ? x + 64 : x + 90, rx = gap > 20 ? 40 : 52, base = 150 - gap * 2;
          if (gap === 0){
            k.rect(cx - 22, 58, 44, 46).rect(cx - 22, 196, 44, 46);
            k.ellipse(cx, 150, 52, 44).ellipse(cx, 150, 42, 35);
            k.line(cx, 150, cx + 18, 132).line(cx, 150, cx - 6, 124).dot(cx, 150, 2.5);
          } else {
            for (let i = 0; i < 5; i++){ k.ellipse(cx, base + i * gap, rx - (i === 2 ? 6 : 0), 10); }
            if (gap > 20){ ['crystal', 'dial', 'hands', 'mvmt', 'back'].forEach((n, i) => { k.line(cx + rx + 3, base + i * gap, cx + rx + 11, base + i * gap, 'pc', 1).text(cx + rx + 13, base + i * gap + 4, n, {size: 11}); }); }
            k.dash(cx, base - 18, cx, base + 4 * gap + 18);
          }
          k.rect(x + 168, 52, 6, 190).dot(x + 171, 52 + 190 * [0, .5, 1][fi], 4, 'fr');
          k.text(x + 90, 274, cap, {size: 14, anchor: 'middle'});
          if (fi < 2) k.arrow(x + 186, 140, x + 234, 140);
        });
        k.text(330, 302, 'scroll down = take apart · scroll up = put back', {cls: 'ptr', size: 22, anchor: 'middle', rot: -1});
        return k.svg(this.label);
      },
    },
    'pg-labels': {
      caption: 'Why labels sit beside the parts. A numbered legend splits attention between the drawing and the key; a label at the part does not.',
      label: 'Wireframe comparison: on the left, numbered parts with a legend underneath, marked split attention; on the right, the same parts labelled directly with leader lines, marked spatial contiguity.',
      draw(){
        const k = sketcher(109, 660, 290);
        k.rect(20, 24, 290, 214).rect(350, 24, 290, 214);
        [[165, 2], [495, 0]].forEach(([cx, mode]) => {
          [60, 104, 148].forEach((y, i) => {
            k.ellipse(cx - (mode ? 30 : 40), y, 60, 12);
            if (mode){ k.ellipse(cx + 48, y, 10, 10, 'pc', 1.2).text(cx + 48, y + 5, String(i + 1), {size: 13, anchor: 'middle', rot: 0}); }
            else { k.line(cx + 24, y, cx + 60, y, 'pc', 1).text(cx + 66, y + 5, ['crystal', 'dial', 'movement'][i], {size: 15}); }
          });
        });
        k.line(30, 180, 300, 180, 'pc', 1);
        k.text(40, 204, '1 crystal   2 dial   3 movement', {cls: 'ptm', size: 13, rot: 0});
        k.curve(226, 116, 250, 176, 150, 190, 'pr');
        k.text(165, 266, 'split attention', {size: 16, anchor: 'middle'});
        k.text(495, 266, 'spatial contiguity', {size: 16, anchor: 'middle'});
        k.line(560, 196, 574, 212, 'pr', 2.2).line(574, 212, 604, 176, 'pr', 2.2);
        k.text(150, 230, 'eyes jump back and forth', {cls: 'ptr', size: 20, anchor: 'middle', rot: -2});
        return k.svg(this.label);
      },
    },
    'pl-flow': {
      caption: 'Capture to canvas in two actions. The page is captured in the browser, then lands in Figma as frames with named layers.',
      label: 'Wireframe: a browser window with the Pagelift popup and a Capture button, an arrow labelled one click, and a Figma window with a layers panel and the rebuilt page as a frame.',
      draw(){
        const k = sketcher(11, 660, 330);
        // browser
        k.rect(20, 40, 270, 250).line(20, 70, 290, 70).ellipse(34, 55, 4, 4).ellipse(47, 55, 4, 4).ellipse(60, 55, 4, 4).rect(80, 48, 150, 15);
        k.rect(38, 84, 130, 26).hatch(38, 84, 130, 26, 8).text(46, 102, 'header', {size: 13});
        k.scrib(40, 128, 120).scrib(40, 140, 96).xbox(40, 154, 108, 68).text(70, 240, 'image', {size: 12});
        k.rect(160, 154, 112, 30).scrib(168, 172, 70).rect(160, 192, 112, 30).scrib(168, 210, 60);
        k.rect(40, 250, 80, 24).text(55, 267, 'button', {size: 12});
        // extension popup
        k.rect(176, 76, 128, 74).line(176, 96, 304, 96).text(186, 91, 'Pagelift', {size: 14});
        k.rect(194, 108, 92, 28).text(212, 127, 'Capture', {size: 14}).ellipse(240, 122, 60, 22, 'pr', 1.6);
        k.text(160, 140, '1', {cls: 'ptr', size: 28, anchor: 'middle'});
        // arrow
        k.curve(306, 132, 334, 172, 362, 150, 'pr').text(298, 200, 'one click', {cls: 'ptr', size: 22, rot: -6});
        // figma
        k.rect(368, 40, 272, 250).line(368, 70, 640, 70).text(380, 61, 'Figma', {size: 14});
        k.rect(378, 80, 78, 200);
        ['Page', 'Header', 'Hero', 'Image', 'Card', 'Card', 'Button'].forEach((n, i) => {
          const ind = i === 0 ? 0 : (i >= 3 && i <= 5 ? 16 : 8);
          k.rect(386 + ind, 92 + i * 24, 7, 7).text(398 + ind, 99 + i * 24, n, {size: 11, rot: 0});
        });
        k.rect(470, 84, 158, 194).text(472, 80, 'frame', {size: 11, rot: 0});
        k.rect(480, 96, 138, 18).hatch(480, 96, 138, 18, 7).scrib(482, 128, 70).xbox(482, 138, 64, 42);
        k.rect(552, 138, 66, 18).rect(552, 162, 66, 18).rect(482, 194, 48, 16);
        k.dash(476, 90, 624, 90).dash(476, 274, 624, 274);
        k.text(470, 316, 'named layers, editable', {cls: 'ptr', size: 20, rot: -2}).arrow(462, 306, 432, 286, 'pr');
        k.text(630, 32, '2', {cls: 'ptr', size: 26, anchor: 'middle'});
        return k.svg(this.label);
      },
    },
    'pl-tree': {
      caption: 'The page structure carries over. Each element becomes a layer named for what a designer sees, not what Figma would call it by default.',
      label: 'Wireframe: page elements on the left connected by lines to matching layer names on the right, with the default name Rectangle 12 crossed out.',
      draw(){
        const k = sketcher(23, 660, 340);
        k.text(40, 34, 'on the page', {size: 15}).text(400, 34, 'in the layers panel', {size: 15});
        const rows = [['<header>', 'Header', 0], ['<nav>', 'Nav', 1], ['<main>', 'Main', 0], ['<section class=hero>', 'Hero', 1], ['<h1>', 'Title', 2], ['<a class=btn>', 'Button', 2], ['<footer>', 'Footer', 0]];
        rows.forEach(([tag, name, d], i) => {
          const y = 66 + i * 32;
          k.text(40 + d * 18, y, tag, {cls: 'ptm', size: 13, rot: 0});
          k.rect(400 + d * 18, y - 11, 10, 10).text(418 + d * 18, y, name, {size: 15, rot: 0});
          k.dash(232, y - 4, 388 + d * 18, y - 4);
        });
        k.rect(390, 44, 220, 236);
        k.text(400, 314, 'Rectangle 12', {cls: 'ptm', size: 13, rot: 0}).line(394, 310, 506, 308, 'pr', 2);
        k.text(518, 316, '→ Title', {cls: 'ptr', size: 24, rot: -2});
        k.text(40, 316, 'names people recognise', {cls: 'ptr', size: 24, rot: -2});
        return k.svg(this.label);
      },
    },
    'gd-setup': {
      caption: 'The webcam follows the fingertip just above the keyboard. Pointer travel is finger travel multiplied by a gain, k.',
      label: 'Wireframe: a hand with the index finger raised in front of a laptop; the webcam view cone reaches the fingertip, and a red pointer on the screen sits over a folder. A note reads delta p equals k times delta f.',
      draw(){
        const k = sketcher(37, 660, 340);
        // laptop
        k.rect(300, 30, 300, 190).rect(312, 42, 276, 166).line(312, 58, 588, 58);
        k.ellipse(450, 36, 3.5, 3.5, 'pc', 1.4).dot(450, 36, 2);
        [[330, 80], [330, 128], [390, 80]].forEach(([x, y], i) => {
          k.line(x, y, x + 14, y).line(x + 14, y, x + 18, y + 5).rect(x, y + 5, 40, 28);
          k.text(x + 20, y + 48, ['Work', 'Notes', 'Pics'][i], {size: 11, anchor: 'middle'});
        });
        k.rect(450, 90, 120, 92).line(450, 106, 570, 106).scrib(460, 126, 80).scrib(460, 140, 60).scrib(460, 154, 90);
        k.ellipse(428, 104, 7, 7, 'pr', 1.8).dot(428, 104, 4, 'fr');
        k.line(280, 220, 620, 220).line(280, 220, 254, 262).line(620, 220, 646, 262).line(254, 262, 646, 262);
        k.rect(408, 236, 84, 18);
        // camera cone
        k.dash(450, 38, 150, 104).dash(450, 38, 214, 150);
        // hand
        k.ellipse(150, 228, 46, 38, 'pc', 1.6, -.2);
        k.ellipse(170, 158, 10, 40, 'pc', 1.5, .3);
        k.ellipse(140, 186, 9, 17, 'pc', 1.3, -.1).ellipse(122, 192, 8, 15, 'pc', 1.3, -.2).ellipse(106, 202, 7, 13, 'pc', 1.3, -.35);
        k.ellipse(198, 236, 9, 20, 'pc', 1.4, 1.05);
        k.ellipse(182, 120, 9, 9, 'pr', 1.6);
        // deltas
        k.arrow(200, 96, 252, 80, 'pr').text(212, 74, 'Δf', {cls: 'ptr', size: 24});
        k.arrow(440, 112, 520, 70, 'pr').text(528, 64, 'Δp', {cls: 'ptr', size: 24});
        k.text(28, 300, 'Δp = k · Δf', {cls: 'ptr', size: 30, rot: -2});
        k.text(28, 326, 'k = gain (finger : screen ratio)', {cls: 'ptr', size: 20, rot: -1});
        k.text(458, 22, 'webcam', {size: 12});
        return k.svg(this.label);
      },
    },
    'gd-states': {
      caption: 'The gesture vocabulary as states. Nothing is picked up until a pinch, so looking is never mistaken for acting.',
      label: 'Wireframe state diagram: Idle, Hover, Grab and Menu states joined by arrows labelled hand enters, pinch, release to drop, two-finger tap and tap away.',
      draw(){
        const k = sketcher(53, 660, 300);
        const S = {Idle: [90, 150], Hover: [290, 150], Grab: [520, 70], Menu: [520, 236]};
        Object.entries(S).forEach(([n, [x, y]]) => { k.ellipse(x, y, 58, 32).text(x, y + 6, n, {size: 18, anchor: 'middle'}); });
        k.text(90, 204, 'hand out of view', {size: 12, anchor: 'middle'});
        k.text(290, 204, 'open hand, pointer moves', {size: 12, anchor: 'middle'});
        k.arrow(150, 142, 230, 142).text(190, 132, 'hand enters', {size: 12, anchor: 'middle'});
        k.arrow(230, 162, 150, 162).text(190, 182, 'leaves', {size: 12, anchor: 'middle'});
        k.curve(330, 124, 400, 60, 462, 62).text(372, 66, 'pinch', {cls: 'ptr', size: 24, anchor: 'middle'});
        k.curve(476, 96, 440, 118, 348, 140).text(446, 150, 'release = drop', {size: 12, anchor: 'middle'});
        k.text(596, 108, 'drag', {size: 12}).curve(574, 52, 620, 30, 576, 92, 'pc');
        k.curve(334, 172, 400, 240, 462, 240).text(372, 262, 'two-finger tap', {size: 13, anchor: 'middle'});
        k.curve(470, 214, 420, 172, 348, 166).text(452, 206, 'tap away', {size: 12, anchor: 'middle'});
        k.text(18, 40, 'clutch:', {cls: 'ptr', size: 24, rot: -3}).text(18, 62, 'no pinch, no action', {cls: 'ptr', size: 22, rot: -3}).text(18, 84, '(avoids Midas touch)', {cls: 'ptr', size: 20, rot: -3});
        return k.svg(this.label);
      },
    },
    'gd-fitts': {
      caption: 'Dragging a file into a folder as a Fitts task. Distance D and target width W predict movement time, and the gain decides how D and W feel to the hand.',
      label: 'Wireframe: a file dragged across the screen toward a folder, with distance D and target width W marked, and the formula MT equals a plus b times log2 of D over W plus 1.',
      draw(){
        const k = sketcher(71, 660, 290);
        k.rect(20, 20, 620, 210).line(20, 40, 640, 40);
        k.rect(60, 120, 36, 46).line(84, 120, 96, 132).text(78, 184, 'brief.pdf', {size: 12, anchor: 'middle'});
        k.ellipse(98, 126, 6, 6, 'pr', 1.6).dot(98, 126, 3.5, 'fr');
        k.line(500, 110, 516, 110).line(516, 110, 521, 116).rect(500, 116, 64, 46).text(532, 182, 'Projects', {size: 12, anchor: 'middle'});
        k.dash(98, 140, 500, 140).arrow(300, 140, 492, 140, 'pr');
        k.text(300, 130, 'D', {cls: 'ptr', size: 28, anchor: 'middle'});
        k.line(500, 196, 564, 196, 'pr', 1.4).line(500, 190, 500, 202, 'pr', 1.2).line(564, 190, 564, 202, 'pr', 1.2);
        k.text(532, 220, 'W', {cls: 'ptr', size: 26, anchor: 'middle'});
        k.text(36, 268, 'MT = a + b · log₂(D/W + 1)', {cls: 'ptr', size: 28, rot: -1.5});
        k.text(250, 196, 'high k: fast, misses small W', {size: 12}).text(250, 214, 'low k: precise, tiring', {size: 12});
        return k.svg(this.label);
      },
    },
  };

  function annexHTML(f){
    const A = ANALYSIS[f.id]; if (!A) return '';
    const fig = (id, n) => `<figure class="fig"><div class="sheet-sk">${SKETCHES[id].draw()}</div><figcaption><b>FIG. ${n}</b> · ${SKETCHES[id].caption}</figcaption></figure>`;
    const [first, ...rest] = A.figs;
    return `<section class="annex" aria-label="HCI analysis">
      <div class="annex-title"><h4>Annex A · HCI analysis</h4><span class="pen">read this one closely</span></div>
      <div class="rq"><span class="rq-tag">Research question</span><p>${A.rq}</p></div>
      ${fig(first, 1)}
      <h4>Principles at work</h4>
      <ol class="principles">${A.principles.map(([n, t]) => `<li><b>${n}</b><span>${t}</span></li>`).join('')}</ol>
      ${rest.map((id, i) => fig(id, i + 2)).join('')}
      <h4>Proposed study</h4>
      <p class="study"><b>Not yet run</b>${A.study}</p>
    </section>`;
  }

  /* ---------- CASE FILE GRID ---------- */
  const grid = $('#fileGrid');
  FILES.forEach(f => {
    const b = document.createElement('button');
    b.className = 'file'; b.type = 'button'; b.dataset.id = f.id;
    b.innerHTML = `<span class="clip" aria-hidden="true"></span>
      <span class="code"><span>${f.code}${ANALYSIS[f.id] ? ' <span class="annex-flag">+ ANNEX</span>' : ''}</span><span>${f.status.toUpperCase()}</span></span>
      <h3>${f.name}</h3>
      <span class="op">${f.op}</span>
      <span class="lvl"><span>Classification</span><b>${f.clr}</b></span>`;
    b.addEventListener('click', () => openFile(f.id));
    grid.appendChild(b);
  });

  const back = $('#sheetBack'), sheet = $('#sheet');
  let lastFocus = null;
  function openFile(id){
    const f = FILES.find(x => x.id === id); if (!f) return;
    lastFocus = document.activeElement;
    sheet.innerHTML = `
      <button class="close" type="button" id="closeSheet">Return to folder ✕</button>
      <span class="stamp">${f.clr}</span>
      <div style="font-family:var(--f-mono);font-size:12px;letter-spacing:.14em">${f.code} / ${f.id}</div>
      <h3 id="sheetTitle" class="inked">${f.name}</h3>
      <dl class="hdr">
        <dt>FILE OPENED</dt><dd>${FD.short}</dd>
        <dt>STATUS</dt><dd>${f.status}</dd>
        <dt>ROLE</dt><dd>${f.role}</dd>
        <dt>CLEARED FOR</dt><dd>${agent}</dd>
      </dl>
      <h4>Summary</h4><p>${f.op}</p>
      <h4>Field report</h4><p class="inked">${f.body}</p>
      <h4>Annex <span class="declass-hint">· click the bar to declassify</span></h4>
      <p><span class="redact" tabindex="0" role="button" aria-label="Redacted line, activate to reveal">${f.secret}</span></p>
      <h4>Methods</h4><div class="tags">${f.tags.map(t=>`<span>${t}</span>`).join('')}</div>
      ${annexHTML(f)}
      <div class="links">
        ${f.link ? `<a class="btn-ink" href="${f.link.href}" target="_blank" rel="noopener">${f.link.label} ↗</a>` : ''}
        <button class="btn-ink" type="button" id="nextFile" style="background:transparent;color:var(--ink);border:1px solid var(--ink)">Next file →</button>
      </div>`;
    back.hidden = false; document.body.style.overflow = 'hidden';
    $('#closeSheet').focus();
    $('#closeSheet').onclick = closeFile;
    $('#nextFile').onclick = () => { const i = FILES.indexOf(f); openFile(FILES[(i+1)%FILES.length].id); };
    const r = sheet.querySelector('.redact');
    const reveal = () => { if(!r.classList.contains('open')){ r.classList.add('open'); say(`Annex for ${f.code} declassified. Use discretion.`);} };
    r.addEventListener('click', reveal);
    r.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); reveal(); }});
    say(`File ${f.code} "${f.name}" opened. Clearance logged for ${agent}.`);
  }
  function closeFile(){
    back.hidden = true; document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  back.addEventListener('click', e => { if (e.target === back) closeFile(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !back.hidden) closeFile(); });

  /* ---------- TABS ---------- */
  const tabs = [...document.querySelectorAll('.tab')];
  const tabLines = {
    files:'Case files on the table. Nine operations. Open one.',
    subject:'Subject profile retrieved. Photograph on file, origin undisclosed.',
    contact:'Secure channels listed. Compose a cable and I will encode it.'
  };
  function showTab(name, quiet){
    tabs.forEach(t => {
      const on = t.id === 't-'+name;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (!quiet) say(tabLines[name]);
    try { history.replaceState(null,'','#'+name); } catch(e){}
  }
  tabs.forEach((t,i) => {
    t.addEventListener('click', () => showTab(t.id.slice(2)));
    t.addEventListener('keydown', e => {
      if (e.key==='ArrowRight'||e.key==='ArrowLeft'){
        const n = tabs[(i + (e.key==='ArrowRight'?1:tabs.length-1)) % tabs.length];
        n.focus(); n.click();
      }
    });
  });
  const h = (location.hash||'').slice(1);
  showTab(['files','subject','contact'].includes(h) ? h : 'files', true);

  /* ---------- DATE ---------- */
  const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  const fmt = d => `${String(d.getDate()).padStart(2,'0')}.${roman[d.getMonth()]}.${d.getFullYear()}`;
  $('#opened').textContent = FD.roman;
  $('#amended').textContent = fmt(new Date());
  document.querySelectorAll('.fdate-short').forEach(e => e.textContent = FD.short);
  document.querySelectorAll('.fyear').forEach(e => e.textContent = FILE_DATE.getFullYear());

  /* ---------- CONTACT ---------- */
  const cable = $('#cable');
  let lastCable = '';
  cable.addEventListener('submit', e => {
    e.preventDefault();
    const from = $('#c-from').value.trim(), reply = $('#c-reply').value.trim(), op = $('#c-op').value, msg = $('#c-msg').value.trim();
    const err = $('#c-err');
    if (!from) { err.textContent = 'Add your name so the subject knows who is calling.'; $('#c-from').focus(); return; }
    if (!/^\S+@\S+\.\S+$/.test(reply)) { err.textContent = 'Add a reply address that looks like name@domain.com.'; $('#c-reply').focus(); return; }
    if (msg.length < 10) { err.textContent = 'Write at least a sentence about what you need.'; $('#c-msg').focus(); return; }
    err.textContent = '';
    const stamp = new Date().toISOString().slice(0,16).replace('T',' ');
    lastCable = `TO: SIDDHARTH AGARWAL <hello@enclave-studios.com>\nFROM: ${from.toUpperCase()} <${reply}>\nRE: ${op.toUpperCase()}\nFILED: ${stamp} STOP\n\n${msg}\n\nEND OF CABLE`;
    $('#enc').textContent = lastCable; $('#enc-wrap').hidden = false;
    say(`Cable from ${from.toUpperCase()} encoded. Copy it and send to the dead drop address.`);
  });
  async function copy(text, label){
    try { await navigator.clipboard.writeText(text); say(`${label} copied to clipboard.`); }
    catch(e){ say(`Clipboard refused. Select the text and copy it by hand.`); }
  }
  $('#copyCable').addEventListener('click', () => copy(lastCable, 'Cable'));
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => copy(b.dataset.copy, 'Address')));

  /* ---------- ALPHA 5 DOCK ---------- */
  const out = $('#dockOut'), dock = $('#dock'), dIn = $('#dockIn');
  let typingQ = Promise.resolve();
  function line(text, cls){
    const el = document.createElement('div'); if (cls) el.className = cls;
    out.appendChild(el);
    if (reduce || cls) { el.textContent = text; out.scrollTop = out.scrollHeight; return Promise.resolve(); }
    return new Promise(res => {
      let i = 0; const t = setInterval(() => {
        el.textContent = 'A5: ' + text.slice(0, ++i); out.scrollTop = out.scrollHeight;
        if (i >= text.length) { clearInterval(t); res(); }
      }, 14);
    });
  }
  function say(text){ typingQ = typingQ.then(() => line(text)); return typingQ; }

  const cmds = {
    help: () => say('Commands: FILES, SUBJECT, CONTACT, OPEN <name>, LIST, WHOAMI, TIME, CLEAR.'),
    files: () => showTab('files'), subject: () => showTab('subject'), about: () => showTab('subject'),
    contact: () => showTab('contact'),
    list: () => say(FILES.map(f => `${f.code} ${f.name}`).join(' · ')),
    whoami: () => say(`You are agent ${agent}. Clearance: provisional.`),
    time: () => say(`Local time at station: ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}.`),
    clear: () => { out.innerHTML=''; },
  };
  $('#dockForm').addEventListener('submit', e => {
    e.preventDefault();
    const raw = dIn.value.trim(); if (!raw) return;
    dIn.value = ''; line('> ' + raw.toUpperCase(), 'u');
    const [c, ...rest] = raw.toLowerCase().split(/\s+/);
    if (c === 'open') {
      const q = rest.join(' ');
      const f = FILES.find(x => x.id.toLowerCase().startsWith(q) || x.name.toLowerCase().includes(q) || x.code.toLowerCase() === q);
      if (f) { showTab('files', true); openFile(f.id); } else say(`No file matches "${q}". Type LIST to see them.`);
    } else if (cmds[c]) cmds[c]();
    else say(`Unrecognised. Type HELP, agent.`);
  });
  $('#dockMin').addEventListener('click', () => {
    dock.classList.toggle('min');
    $('#dockMin').textContent = dock.classList.contains('min') ? '[+]' : '[–]';
  });
  addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && $('#boot').hidden) {
      e.preventDefault(); dock.classList.remove('min'); dIn.focus();
    }
  });

  /* ---------- BOOT SEQUENCE ---------- */
  const boot = $('#boot'), log = $('#bootlog'), bf = $('#bootform'), cn = $('#codename');
  const sleep = ms => reduce ? Promise.resolve() : new Promise(r => setTimeout(r, ms));
  let skipped = false;
  async function type(text, cls, speed=22){
    const el = document.createElement('div'); if (cls) el.className = cls; log.appendChild(el);
    const cur = document.createElement('span'); cur.className='cursor';
    if (reduce || skipped) { el.textContent = text; return; }
    el.appendChild(cur);
    for (let i=0;i<text.length;i++){
      if (skipped) { el.textContent = text; return; }
      cur.before(text[i]); await sleep(speed);
    }
    cur.remove();
  }
  async function run(){
    await type(`ALPHA 5 // ARCHIVE TERMINAL // RECORD OF ${FD.roman}`, 'dim', 8);
    await type('RETRIEVING FROM COLD STORAGE...... OK', 'dim', 8);
    await type('ESTABLISHING LINE.......... OK', 'dim', 8);
    await type('SCRAMBLER KEY ROTATED...... OK', 'dim', 8);
    await sleep(300);
    await type('\nGOOD EVENING. I AM ALPHA 5.');
    await type('YOU HAVE REACHED A RESTRICTED ARCHIVE.');
    await type('IT HOLDS THE FILE ON SUBJECT SA-26: SIDDHARTH AGARWAL,');
    await type('DESIGNER AND ENGINEER OF INTERFACES.');
    await type(`THE FILE WAS OPENED ON ${FD.long}, THE DAY HE WAS BORN.`);
    await type('WE HAVE BEEN WATCHING EVER SINCE.');
    await sleep(250);
    await type('\nIDENTIFY YOURSELF. A CODENAME WILL DO.');
    bf.hidden = false; cn.focus({preventScroll:true});
  }
  bf.addEventListener('submit', async e => {
    e.preventDefault();
    agent = (cn.value.trim() || 'NIGHTINGALE').toUpperCase().replace(/[^A-Z0-9 \-]/g,'').slice(0,24) || 'NIGHTINGALE';
    bf.hidden = true;
    await type(`> ${agent}`, '', 10);
    await type(`\nVOICEPRINT ACCEPTED. WELCOME, AGENT ${agent}.`);
    await type('CLEARANCE GRANTED: CASE FILES, SUBJECT PROFILE, CONTACT.');
    await type('I WILL STAY ON THE LINE. ADDRESS ME ANY TIME WITH "/".');
    $('#bootactions').hidden = false; $('#openBtn').focus({preventScroll:true});
  });
  function dismiss(){
    if (!cn.value.trim() && agent==='VISITOR') agent = 'NIGHTINGALE';
    $('#clr').textContent = 'AGENT ' + agent;
    $('#skip').hidden = true;
    const done = () => { boot.hidden = true; boot.classList.remove('off'); };
    if (reduce) done(); else { boot.classList.add('off'); setTimeout(done, 560); }
    out.innerHTML = '';
    say(`Line open, agent ${agent}. Nine case files are on the table.`).then(() => say('Type HELP for commands, or just click around.'));
  }
  $('#openBtn').addEventListener('click', dismiss);
  $('#skip').addEventListener('click', () => { skipped = true; dismiss(); });
  run();
})();
