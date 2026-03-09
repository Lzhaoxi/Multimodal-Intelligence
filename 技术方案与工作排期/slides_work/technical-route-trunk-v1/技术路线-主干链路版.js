const path = require('path');
const PptxGenJS = require('pptxgenjs');
const {
  autoFontSize,
  calcTextBox,
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
} = require('./pptxgenjs_helpers');

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'CUSTOM', width: 13.333, height: 7.5 });
pptx.layout = 'CUSTOM';
pptx.author = 'OpenAI Codex';
pptx.company = 'OpenAI';
pptx.subject = '脑肿瘤 MRI 技术路线主干版';
pptx.title = '脑肿瘤 MRI 技术路线主干版';
pptx.lang = 'zh-CN';
pptx.theme = {
  headFontFace: 'Aptos',
  bodyFontFace: 'Microsoft YaHei',
  lang: 'zh-CN',
};

const W = 13.333;
const H = 7.5;
const FONTS = { cn: 'Microsoft YaHei', en: 'Aptos' };
const C = {
  bg: 'F5FAFC',
  panel: 'FFFFFF',
  line: 'C8DCE2',
  ink: '16313B',
  sub: '48636E',
  mute: '708791',
  teal: '1A8EA8',
  teal2: '5CB6C8',
  cyan: 'D8F0F4',
  cyan2: 'EAF7FA',
  green: 'DFF3EA',
  green2: 'EDF8F4',
  amber: 'FFF1DB',
  amber2: 'FFF6EA',
  red: 'FBE7E5',
  red2: 'FDF2F1',
  violet: 'EFF1FA',
  violet2: 'F5F6FD',
  navy: '234B63',
};

function addBase(slide, title, kicker = '') {
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: 0.34,
    line: { color: C.bg, transparency: 100 },
    fill: { color: C.teal },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 7.12,
    w: W,
    h: 0.38,
    line: { color: C.bg, transparency: 100 },
    fill: { color: 'EAF3F6' },
  });
  const titleOpts = autoFontSize(title, FONTS.cn, {
    x: 0.7,
    y: 0.58,
    w: 8.8,
    h: 0.58,
    fontSize: 24,
    minFontSize: 19,
    maxFontSize: 24,
    mode: 'auto',
    bold: true,
    margin: 0,
    padding: 0,
  });
  slide.addText(title, {
    ...titleOpts,
    fontFace: FONTS.cn,
    bold: true,
    color: C.ink,
    margin: 0,
  });
  if (kicker) {
    slide.addText(kicker, {
      x: 10.02,
      y: 0.64,
      w: 2.45,
      h: 0.22,
      fontFace: FONTS.en,
      fontSize: 10.2,
      color: C.teal,
      align: 'right',
      margin: 0,
    });
  }
}

function addFooter(slide, pageNo, footerText = '技术路线主干版') {
  slide.addText(footerText, {
    x: 0.7,
    y: 7.17,
    w: 5.2,
    h: 0.18,
    fontFace: FONTS.cn,
    fontSize: 9,
    color: C.mute,
    margin: 0,
  });
  slide.addText(String(pageNo).padStart(2, '0'), {
    x: 12.18,
    y: 7.15,
    w: 0.55,
    h: 0.18,
    fontFace: FONTS.en,
    fontSize: 9.5,
    bold: true,
    color: C.teal,
    align: 'right',
    margin: 0,
  });
}

function addCard(slide, cfg) {
  const {
    x, y, w, h,
    title,
    body,
    fill = C.panel,
    line = C.line,
    titleColor = C.ink,
    bodyColor = C.sub,
    titleSize = 13.8,
    bodySize = 10.8,
  } = cfg;
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.06,
    line: { color: line, pt: 1.1 },
    fill: { color: fill },
    shadow: { type: 'outer', color: 'B7C8CE', blur: 1, angle: 45, distance: 1, opacity: 0.08 },
  });
  if (title) {
    const titleOpts = autoFontSize(title, FONTS.cn, {
      x: x + 0.16,
      y: y + 0.12,
      w: w - 0.32,
      h: 0.28,
      fontSize: titleSize,
      minFontSize: 10.8,
      maxFontSize: titleSize,
      mode: 'auto',
      bold: true,
      margin: 0,
      padding: 0,
    });
    slide.addText(title, {
      ...titleOpts,
      fontFace: FONTS.cn,
      bold: true,
      color: titleColor,
      margin: 0,
    });
  }
  if (body) {
    const bodyBox = calcTextBox(bodySize, {
      text: body,
      w: w - 0.34,
      fontFace: FONTS.cn,
      margin: 0,
      padding: 0,
      leading: 1.18,
    });
    slide.addText(body, {
      x: x + 0.17,
      y: title ? y + 0.44 : y + 0.18,
      w: w - 0.34,
      h: Math.min(h - (title ? 0.52 : 0.24), bodyBox.h + 0.04),
      fontFace: FONTS.cn,
      fontSize: bodySize,
      color: bodyColor,
      margin: 0,
      valign: 'top',
    });
  }
}

function addMiniNote(slide, cfg) {
  const { x, y, w, title, body, fill = C.cyan2, line = C.line } = cfg;
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 1.16,
    rectRadius: 0.05,
    line: { color: line, pt: 0.9 },
    fill: { color: fill },
  });
  slide.addText(title, {
    x: x + 0.12,
    y: y + 0.1,
    w: w - 0.24,
    h: 0.18,
    fontFace: FONTS.cn,
    fontSize: 10.2,
    bold: true,
    color: C.navy,
    margin: 0,
  });
  const bodyBox = calcTextBox(8.8, {
    text: body,
    w: w - 0.24,
    fontFace: FONTS.cn,
    margin: 0,
    padding: 0,
    leading: 1.14,
  });
  slide.addText(body, {
    x: x + 0.12,
    y: y + 0.34,
    w: w - 0.24,
    h: Math.min(0.76, bodyBox.h + 0.02),
    fontFace: FONTS.cn,
    fontSize: 8.8,
    color: C.sub,
    margin: 0,
    valign: 'top',
  });
}

function addPill(slide, text, x, y, w, fill, color = C.ink) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.32,
    rectRadius: 0.08,
    line: { color: fill, transparency: 100 },
    fill: { color: fill },
  });
  slide.addText(text, {
    x,
    y: y + 0.055,
    w,
    h: 0.17,
    fontFace: FONTS.cn,
    fontSize: 9.2,
    bold: true,
    color,
    align: 'center',
    margin: 0,
  });
}

function addChevron(slide, x, y, w = 0.28, h = 0.34, color = C.teal2) {
  slide.addShape(pptx.ShapeType.chevron, {
    x, y, w, h,
    line: { color, pt: 1 },
    fill: { color },
  });
}

function addFlowStep(slide, x, y, w, h, title, body, fill) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.06,
    line: { color: fill, transparency: 15, pt: 1.2 },
    fill: { color: fill, transparency: 6 },
  });
  slide.addText(title, {
    x: x + 0.12,
    y: y + 0.12,
    w: w - 0.24,
    h: 0.22,
    fontFace: FONTS.cn,
    fontSize: 11.8,
    bold: true,
    color: C.ink,
    align: 'center',
    margin: 0,
  });
  const bodyBox = calcTextBox(9.4, {
    text: body,
    w: w - 0.26,
    fontFace: FONTS.cn,
    margin: 0,
    padding: 0,
    leading: 1.14,
  });
  slide.addText(body, {
    x: x + 0.13,
    y: y + 0.38,
    w: w - 0.26,
    h: Math.min(h - 0.46, bodyBox.h + 0.02),
    fontFace: FONTS.cn,
    fontSize: 9.4,
    color: C.sub,
    align: 'center',
    margin: 0,
    valign: 'mid',
  });
}

function finalizeSlide(slide) {
  warnIfSlideHasOverlaps(slide, pptx, { muteContainment: true });
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

function buildCover() {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, line: { color: C.bg, transparency: 100 }, fill: { color: C.bg } });
  slide.addShape(pptx.ShapeType.rect, { x: 0.74, y: 0.92, w: 0.12, h: 5.0, line: { color: C.teal, transparency: 100 }, fill: { color: C.teal } });
  const title = '脑肿瘤 MRI 技术路线主干版';
  const titleOpts = autoFontSize(title, FONTS.cn, {
    x: 1.18,
    y: 1.24,
    w: 6.7,
    h: 0.82,
    fontSize: 27,
    minFontSize: 22,
    maxFontSize: 27,
    mode: 'auto',
    bold: true,
    margin: 0,
    padding: 0,
  });
  slide.addText(title, { ...titleOpts, fontFace: FONTS.cn, color: C.ink, bold: true, margin: 0 });
  slide.addText('从原始设想到数据-微调-评测最小闭环', {
    x: 1.2,
    y: 2.3,
    w: 6.0,
    h: 0.28,
    fontFace: FONTS.cn,
    fontSize: 15,
    color: C.sub,
    margin: 0,
  });
  addPill(slide, '原始设想', 1.2, 3.05, 1.12, C.cyan, C.teal);
  addPill(slide, '收敛判断', 2.46, 3.05, 1.12, C.green, C.greenLine);
  addPill(slide, '数据主线', 3.72, 3.05, 1.12, C.amber, C.amberLine);
  addPill(slide, '多模态微调', 4.98, 3.05, 1.32, C.violet, C.navy);
  addPill(slide, '可信评测', 6.44, 3.05, 1.12, C.red, C.redLine);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.36, y: 1.16, w: 4.1, h: 4.92,
    rectRadius: 0.08,
    line: { color: 'CEE1E7', pt: 1.1 },
    fill: { color: 'FFFFFF' },
  });
  slide.addText('这版 PPT 只讲主干', {
    x: 8.62, y: 1.42, w: 3.54, h: 0.24,
    fontFace: FONTS.cn,
    fontSize: 14.4,
    bold: true,
    color: C.navy,
    margin: 0,
  });
  slide.addText('1. 原始设想是什么\n2. 为什么第一阶段必须收敛\n3. 数据怎么组织成统一样本\n4. 如何以 ms-swift 为主干做多模态微调\n5. 评测怎么保证结果可信', {
    x: 8.62, y: 1.86, w: 3.34, h: 2.2,
    fontFace: FONTS.cn,
    fontSize: 11.2,
    color: C.sub,
    margin: 0,
    valign: 'top',
  });
  slide.addText('术语说明和疑问，只放边上小字，不单独占大页。', {
    x: 8.62, y: 4.66, w: 3.28, h: 0.58,
    fontFace: FONTS.cn,
    fontSize: 10.2,
    color: C.teal,
    bold: true,
    margin: 0,
    valign: 'mid',
  });
  slide.addText('01', { x: 12.18, y: 6.86, w: 0.4, h: 0.18, fontFace: FONTS.en, fontSize: 11.5, bold: true, color: C.teal, align: 'right', margin: 0 });
  finalizeSlide(slide);
}

function buildOriginalVision() {
  const slide = pptx.addSlide();
  addBase(slide, '原始设想与问题背景', 'ORIGINAL VISION');

  addFlowStep(slide, 0.86, 2.0, 3.2, 2.22, '大规模异构数据库', '术前诊疗报告 / 医学影像 / 康复随访\n脱敏、样本对齐、预处理、存储、语料整理', C.cyan);
  addChevron(slide, 4.22, 2.9, 0.36, 0.42);
  addFlowStep(slide, 4.72, 2.0, 3.2, 2.22, '影像-文本特征抽取', 'CT / MRI 影像特征网络\n关键特征词、三元组与相似度特征', C.amber);
  addChevron(slide, 8.08, 2.9, 0.36, 0.42);
  addFlowStep(slide, 8.58, 2.0, 3.9, 2.22, '诊断-治疗-康复大模型与微调', '基于 Qwen3-VL 的神经外科诊疗模型\n多模态融合 + 参数高效微调', C.violet);

  addMiniNote(slide, {
    x: 9.58,
    y: 4.86,
    w: 2.62,
    title: '一句话判断',
    body: '这是一个远期蓝图，方向可以保留，但不适合直接作为第一阶段执行方案。',
    fill: C.red2,
    line: 'E2C9C9',
  });
  slide.addText('原始设想的核心问题不在“方向错”，而在“起点过大”。', {
    x: 0.98,
    y: 5.52,
    w: 8.0,
    h: 0.26,
    fontFace: FONTS.cn,
    fontSize: 12.2,
    bold: true,
    color: C.navy,
    margin: 0,
  });
  addFooter(slide, 2, '先把原始设想准确摆出来');
  finalizeSlide(slide);
}

function buildConvergence() {
  const slide = pptx.addSlide();
  addBase(slide, '为什么第一阶段必须收敛', 'WHY CONVERGE');

  slide.addShape(pptx.ShapeType.chevron, {
    x: 0.96, y: 2.02, w: 6.62, h: 2.64,
    line: { color: C.red, pt: 1 },
    fill: { color: C.red2 },
  });
  slide.addShape(pptx.ShapeType.chevron, {
    x: 5.94, y: 2.22, w: 1.44, h: 2.24,
    line: { color: C.green, pt: 1 },
    fill: { color: C.green2 },
  });
  slide.addText('范围太大', { x: 1.16, y: 2.32, w: 1.2, h: 0.2, fontFace: FONTS.cn, fontSize: 13, bold: true, color: C.redLine, margin: 0, align: 'center' });
  slide.addText('数据条件不足', { x: 2.56, y: 2.32, w: 1.7, h: 0.2, fontFace: FONTS.cn, fontSize: 13, bold: true, color: C.redLine, margin: 0, align: 'center' });
  slide.addText('技术链过长', { x: 4.5, y: 2.32, w: 1.4, h: 0.2, fontFace: FONTS.cn, fontSize: 13, bold: true, color: C.redLine, margin: 0, align: 'center' });
  slide.addText('评测口径不稳', { x: 6.0, y: 2.32, w: 1.3, h: 0.2, fontFace: FONTS.cn, fontSize: 13, bold: true, color: C.redLine, margin: 0, align: 'center' });

  slide.addText('收敛结果', {
    x: 6.02, y: 2.78, w: 1.06, h: 0.2,
    fontFace: FONTS.cn, fontSize: 10.8, bold: true, color: C.greenLine, align: 'center', margin: 0,
  });
  slide.addText('脑肿瘤 MRI', {
    x: 5.98, y: 3.18, w: 1.1, h: 0.2,
    fontFace: FONTS.cn, fontSize: 10.8, bold: true, color: C.greenLine, align: 'center', margin: 0,
  });
  slide.addText('最小闭环', {
    x: 6.02, y: 3.58, w: 1.06, h: 0.2,
    fontFace: FONTS.cn, fontSize: 10.8, bold: true, color: C.greenLine, align: 'center', margin: 0,
  });

  addMiniNote(slide, { x: 8.08, y: 1.92, w: 4.1, title: '为什么不是一步做“全神经外科智能诊疗”', body: '因为第一阶段最重要的是先形成一个可训练、可评测、可复现的闭环结果。问题收不住，团队就会被过长链路拖住。', fill: C.cyan2, line: C.line });
  addMiniNote(slide, { x: 8.08, y: 3.36, w: 4.1, title: '为什么脑肿瘤 MRI 更适合起步', body: '公开数据基础更好，更容易形成图像与文本主干，也更容易定义病例级检索和结构化字段评测。', fill: C.green2, line: 'CBE4D4' });

  slide.addText('第一阶段先收敛到脑肿瘤 MRI 最小闭环，而不是一开始做全神经外科智能诊疗。', {
    x: 1.06, y: 5.54, w: 11.1, h: 0.24,
    fontFace: FONTS.cn, fontSize: 12.4, bold: true, color: C.navy, align: 'center', margin: 0,
  });
  addFooter(slide, 3, '收敛是为了尽快跑通闭环');
  finalizeSlide(slide);
}

function buildGoalLayers() {
  const slide = pptx.addSlide();
  addBase(slide, '当前阶段目标 vs 最终目标', 'GOAL LAYERS');
  addCard(slide, {
    x: 0.92, y: 1.58, w: 5.28, h: 4.86,
    title: '最终目标｜多模态微调主线',
    body: '最终要做的，仍然是服务神经外科多任务的多模态微调路线。可以进一步研究外接 pretrained 图像 encoder、图像 embedding 注入、参数高效微调，以及更完整的多模态融合机制。',
    fill: 'FFFFFF', line: 'C7DDE4', titleColor: C.teal,
  });
  slide.addShape(pptx.ShapeType.chevron, {
    x: 6.36, y: 3.14, w: 0.56, h: 0.6,
    line: { color: C.teal2, pt: 1 },
    fill: { color: C.teal2 },
  });
  addCard(slide, {
    x: 7.08, y: 1.58, w: 5.32, h: 4.86,
    title: '当前阶段目标｜先打通最小闭环',
    body: '当前阶段不是一步把这些都做满，而是先在脑肿瘤 MRI 场景下，把“数据组织 -> 统一样本 -> 初版多模态微调 -> 可信评测”稳定跑通，形成可比较的第一版结果。',
    fill: 'FFFFFF', line: 'C7DDE4', titleColor: C.teal,
  });

  addMiniNote(slide, { x: 8.1, y: 5.02, w: 3.48, title: '后续增强方向', body: '强化学习/偏好优化可以作为下一阶段增强，但不进入当前主流程。', fill: C.violet2, line: 'D5D9F0' });
  addFooter(slide, 4, '最终目标和当前阶段不能混成一件事');
  finalizeSlide(slide);
}

function buildOverview() {
  const slide = pptx.addSlide();
  addBase(slide, '主干技术路线总览', 'TRUNK ROUTE');
  const xs = [0.7, 3.02, 5.34, 7.66, 9.98];
  const titles = ['原始数据', '数据标准化', '统一样本层', 'ms-swift 多模态微调', '评测闭环'];
  const bodies = [
    'MRI / 报告 / 病理\n公开数据起步',
    '统一目录\n统一病例键\n统一挂接关系',
    '结构化字段\nJSONL 样本\ntrain / val / test',
    '图像 encoder 接入\nembedding 注入 + PEFT\n任务适配',
    'patient 级切分\n冻结 benchmark\n结果表'
  ];
  const fills = [C.cyan, C.cyan2, C.cyan2, C.cyan2, C.cyan2];
  for (let i = 0; i < xs.length; i++) {
    addFlowStep(slide, xs[i], 2.42, 1.9, 1.72, titles[i], bodies[i], fills[i]);
    if (i < xs.length - 1) addChevron(slide, xs[i] + 1.96, 3.06);
  }
  addMiniNote(slide, { x: 9.48, y: 4.92, w: 2.56, title: '辅助性检查', body: 'embedding 检索可以作为表征质量检查或候选召回辅助，但不是主目标。', fill: C.cyan2, line: C.line });
  slide.addText('这条主线的关键不是某个单点技巧，而是让数据、样本、微调和评测围绕同一套输入口径运转。', { x: 0.98, y: 5.64, w: 8.1, h: 0.24, fontFace: FONTS.cn, fontSize: 12.1, bold: true, color: C.navy, margin: 0 });
  addFooter(slide, 5, '主线围绕多模态微调，不围绕单个技巧');
  finalizeSlide(slide);
}

function buildDataLayers() {
  const slide = pptx.addSlide();
  addBase(slide, '数据如何构建：从原始数据到统一数据层', 'DATA LAYERS');

  slide.addText('BIDS-like 原始层在这里的白话含义是：先统一目录、病例键、影像与文本的挂接关系。', { x: 0.82, y: 1.3, w: 9.3, h: 0.26, fontFace: FONTS.cn, fontSize: 12.8, bold: true, color: C.navy, margin: 0 });

  const x = 1.0;
  const w = 8.2;
  const names = ['raw', 'staging', 'manifests', 'tasks', 'eval'];
  const labels = [
    '原始影像、原始报告、原始来源记录',
    '标准化影像、slice pack、清洗文本、结构化报告',
    'patients / studies / series / split 清单',
    'finetune / retrieval / summary 的统一 JSONL 样本',
    '内部 held-out 与公开 benchmark 的冻结评测集',
  ];
  const fills = ['E7F6FA', 'EDF8F6', 'FFF4E7', 'FDF0F0', 'EEF1F9'];
  for (let i = 0; i < names.length; i++) {
    const yy = 1.86 + i * 0.72;
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: yy, w, h: 0.5,
      rectRadius: 0.04,
      line: { color: 'C9DDE3', pt: 1 },
      fill: { color: fills[i] },
    });
    slide.addText(names[i], { x: x + 0.22, y: yy + 0.14, w: 0.9, h: 0.18, fontFace: FONTS.en, fontSize: 12.2, bold: true, color: C.teal, margin: 0 });
    slide.addText(labels[i], { x: x + 1.3, y: yy + 0.14, w: 6.48, h: 0.18, fontFace: FONTS.cn, fontSize: 10.0, color: C.sub, margin: 0 });
  }

  addMiniNote(slide, { x: 9.72, y: 1.9, w: 2.38, title: '不是先做平台', body: '这一页讲的是数据规范，不是要先做一套复杂数据库平台。', fill: C.red2, line: 'E3D0D0' });
  addMiniNote(slide, { x: 9.72, y: 3.34, w: 2.38, title: '重点', body: '先冻结规范和追溯关系，让后面的样本生成与评测可以复现。', fill: C.cyan2, line: C.line });
  addMiniNote(slide, { x: 9.72, y: 4.78, w: 2.38, title: '直接价值', body: '减少返工，让训练输入和评测输入来自同一套口径。', fill: C.green2, line: 'CBE4D4' });

  addFooter(slide, 6, '先把数据摆整齐，再谈怎么训');
  finalizeSlide(slide);
}

function buildCaseToSample() {
  const slide = pptx.addSlide();
  addBase(slide, '数据如何构建：从病例到多模态训练样本', 'CASE TO SAMPLE');

  addFlowStep(slide, 0.72, 1.92, 2.0, 1.1, '病例输入', 'MRI 体数据\n影像报告\n病理 / 随访文本', C.cyan);
  addChevron(slide, 2.92, 2.32, 0.3, 0.34);
  addFlowStep(slide, 3.34, 1.92, 2.0, 1.1, '影像标准化', '统一格式\n裁剪 / 重采样\nslice pack', C.green);
  addChevron(slide, 5.54, 2.32, 0.3, 0.34);
  addFlowStep(slide, 5.96, 1.92, 2.0, 1.1, '报告结构化', '病灶位置\n诊断 / 分级\n随访结果', C.amber);
  addChevron(slide, 8.16, 2.32, 0.3, 0.34);
  addFlowStep(slide, 8.58, 1.92, 2.0, 1.1, '统一 JSONL 样本', 'images\nmessages\ntarget_struct', C.violet);
  addChevron(slide, 10.78, 2.32, 0.3, 0.34);
  addFlowStep(slide, 11.1, 1.92, 1.5, 1.1, '切分', 'patient 级\ntrain / val / test', C.red);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.02, y: 4.02, w: 8.9, h: 1.34,
    rectRadius: 0.06,
    line: { color: 'C7DDE4', pt: 1.1 },
    fill: { color: 'FFFFFF' },
  });
  slide.addText('统一样本层只保留 3 类：微调样本（主）、检索样本（辅）、模板摘要样本（可选）', {
    x: 1.3, y: 4.28, w: 8.34, h: 0.22,
    fontFace: FONTS.cn, fontSize: 12.2, bold: true, color: C.navy, margin: 0, align: 'center',
  });
  addPill(slide, '微调样本（主）', 2.1, 4.76, 1.62, C.green, C.greenLine);
  addPill(slide, '检索样本（辅）', 4.28, 4.76, 1.62, C.cyan, C.teal);
  addPill(slide, '模板摘要样本（可选）', 6.42, 4.76, 2.06, C.amber, C.amberLine);

  addMiniNote(slide, { x: 10.22, y: 3.88, w: 2.08, title: '结构化字段为什么重要', body: '它是影像、文本、训练样本和评测指标之间的中间接口。', fill: C.cyan2, line: C.line });
  addMiniNote(slide, { x: 10.22, y: 5.2, w: 2.08, title: '样本层为什么关键', body: '因为它直接决定训练能不能稳定接到数据。', fill: C.green2, line: 'CBE4D4' });

  addFooter(slide, 7, '样本层是训练接口，不是附属品');
  finalizeSlide(slide);
}

function buildModelRoute() {
  const slide = pptx.addSlide();
  addBase(slide, '模型路线：以 ms-swift 为主干的多模态微调', 'MODEL ROUTE');

  addFlowStep(slide, 0.78, 2.16, 1.86, 1.24, 'MRI slice pack', '三视图 / 切片包\n作为当前图像输入形态', C.cyan);
  addChevron(slide, 2.78, 2.58, 0.28, 0.38);
  addFlowStep(slide, 3.16, 2.16, 1.86, 1.24, 'pretrained 图像 encoder', '输出图像特征\n形成 image embedding', C.green);
  addChevron(slide, 5.16, 2.58, 0.28, 0.38);
  addFlowStep(slide, 5.54, 2.16, 1.86, 1.24, 'embedding 注入 / projector', '把图像特征映射到\n语言模型可消费空间', C.amber);
  addChevron(slide, 7.54, 2.58, 0.28, 0.38);
  addFlowStep(slide, 7.92, 2.16, 1.96, 1.24, 'Qwen3-VL + ms-swift', 'PEFT / LoRA / QLoRA\n组织多模态微调', C.violet);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.98, y: 4.08, w: 8.92, h: 1.34,
    rectRadius: 0.06,
    line: { color: 'C7DDE4', pt: 1.1 },
    fill: { color: 'FFFFFF' },
  });
  slide.addText('当前推荐的主干是：Qwen3-VL 基座 + ms-swift + PEFT/LoRA/QLoRA', {
    x: 1.22, y: 4.36, w: 8.42, h: 0.22,
    fontFace: FONTS.cn, fontSize: 12.2, bold: true, color: C.navy, margin: 0, align: 'center',
  });
  slide.addText('理由：工程链更短，和当前样本层更容易接上，也更适合有限资源下先形成第一版结果。', {
    x: 1.24, y: 4.82, w: 8.38, h: 0.2,
    fontFace: FONTS.cn, fontSize: 10.5, color: C.sub, margin: 0, align: 'center',
  });

  addMiniNote(slide, { x: 10.14, y: 1.92, w: 2.0, title: 'ms-swift 为什么适合当前主干', body: '它更适合快速组织多模态微调流程，减少第一阶段工程摩擦。', fill: C.cyan2, line: C.line });
  addMiniNote(slide, { x: 10.14, y: 3.28, w: 2.0, title: 'embedding 检索为什么只是辅助', body: '它可以做表征检查或候选召回辅助，但不是最终主目标。', fill: C.green2, line: 'CBE4D4' });
  addMiniNote(slide, { x: 10.14, y: 4.64, w: 2.0, title: '为什么不先做重型 3D 端到端', body: '因为显存、预处理和调参链太重，会拖慢闭环速度。', fill: C.red2, line: 'E2C9C9' });
  slide.addText('小字：强化学习/偏好优化可作为下一阶段增强，不进入当前主流程。', {
    x: 10.18, y: 6.06, w: 2.02, h: 0.26,
    fontFace: FONTS.cn, fontSize: 8.8, color: C.sub, margin: 0,
  });

  addFooter(slide, 8, '多模态微调才是主目标');
  finalizeSlide(slide);
}

function buildEval() {
  const slide = pptx.addSlide();
  addBase(slide, '评测怎么做：让结果可信', 'EVALUATION');

  addFlowStep(slide, 0.92, 2.02, 2.56, 1.58, '评测纪律', 'patient 级切分\n冻结公开 benchmark\n内部 held-out + 外部 benchmark', C.red);
  addChevron(slide, 3.7, 2.56, 0.38, 0.42);
  addFlowStep(slide, 4.26, 2.02, 3.02, 1.58, '第一版指标', '结构化字段 F1\nRecall@K / MRR\n微调后任务结果', C.cyan);
  addChevron(slide, 7.5, 2.56, 0.38, 0.42);
  addFlowStep(slide, 8.06, 2.02, 3.04, 1.58, '结果解释', '先判断结果是否可信\n再讨论模型是否更优', C.green);

  addMiniNote(slide, { x: 0.96, y: 4.32, w: 3.54, title: '为什么必须按 patient 级切分', body: '同一患者不同时间点、不同序列、不同文本不能同时落入 train 和 test，否则结果会被虚高。', fill: C.cyan2, line: C.line });
  addMiniNote(slide, { x: 4.88, y: 4.32, w: 3.54, title: '为什么要冻结公开 benchmark', body: '如果 benchmark 口径随着实验反复改变，不同实验之间就无法比较。', fill: C.green2, line: 'CBE4D4' });
  addMiniNote(slide, { x: 8.8, y: 4.32, w: 3.54, title: '第一版目标不是“刷分”', body: '当前重点是先得到可训练、可评测、可比较的可信结果。', fill: C.red2, line: 'E2C9C9' });

  slide.addText('一句话：切分规则不稳、benchmark 不稳，再高的分数也不可信。', {
    x: 1.0, y: 6.06, w: 11.22, h: 0.24,
    fontFace: FONTS.cn, fontSize: 12.2, bold: true, color: C.navy, align: 'center', margin: 0,
  });
  addFooter(slide, 9, '先保证结果可信，再讨论结果高低');
  finalizeSlide(slide);
}

function buildRoadmap() {
  const slide = pptx.addSlide();
  addBase(slide, '落地节奏与近期产出', 'NEAR-TERM EXECUTION');
  const x0 = 0.92;
  const stepW = 2.65;
  const gap = 0.47;
  const outW = 2.35;
  const steps = [
    ['接数据', '接入 TextBraTS / BraTS，整理原始影像与文本来源', 'study_manifest.parquet', C.cyan],
    ['做结构化', '冻结字段字典，产出统一结构化结果', 'report_structured.jsonl', C.green],
    ['生成统一样本', '把病例转成 finetune-ready 的 JSONL 输入', 'finetune-ready jsonl', C.amber],
    ['跑微调与评测', '在固定切分与固定 benchmark 下形成结果表', 'frozen eval report', C.red],
  ];
  for (let i = 0; i < steps.length; i++) {
    const x = x0 + i * (stepW + gap);
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.0, w: stepW, h: 1.18,
      rectRadius: 0.06,
      line: { color: steps[i][3], pt: 1.2 },
      fill: { color: 'FFFFFF' },
    });
    slide.addText(steps[i][0], {
      x: x + 0.16, y: 2.14, w: stepW - 0.32, h: 0.2,
      fontFace: FONTS.cn, fontSize: 13.4, bold: true, color: C.ink, align: 'center', margin: 0,
    });
    slide.addText(steps[i][1], {
      x: x + 0.18, y: 2.46, w: stepW - 0.36, h: 0.42,
      fontFace: FONTS.cn, fontSize: 10.0, color: C.sub, align: 'center', valign: 'mid', margin: 0,
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.15, y: 3.62, w: outW, h: 0.64,
      rectRadius: 0.05,
      line: { color: steps[i][3], transparency: 100 },
      fill: { color: steps[i][3], transparency: 6 },
    });
    slide.addText(steps[i][2], {
      x: x + 0.22, y: 3.83, w: outW - 0.14, h: 0.18,
      fontFace: FONTS.en, fontSize: 9.7, bold: true, color: C.ink, align: 'center', margin: 0,
    });
    if (i < steps.length - 1) addChevron(slide, x + stepW + 0.08, 2.4, 0.28, 0.34);
  }

  slide.addText('先把脑肿瘤 MRI 的多模态微调主线跑通，再扩到脑出血 CT 或更重的 3D 路线。', {
    x: 1.02, y: 5.44, w: 11.2, h: 0.24,
    fontFace: FONTS.cn, fontSize: 12.4, bold: true, color: C.navy, align: 'center', margin: 0,
  });
  addFooter(slide, 10, '先把主链路跑通，再扩范围');
  finalizeSlide(slide);
}

async function main() {
  buildCover();
  buildOriginalVision();
  buildConvergence();
  buildGoalLayers();
  buildOverview();
  buildDataLayers();
  buildCaseToSample();
  buildModelRoute();
  buildEval();
  buildRoadmap();

  const outPath = path.resolve(__dirname, '技术路线-主干链路版.pptx');
  await pptx.writeFile({ fileName: outPath });
  console.log('Wrote', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});




