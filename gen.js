// gen.js —— 每日提示词数据源生成器
// 作用：从 prompts.json（候选库）中，按"当天日期"确定性地选出 12 条，写入 prompts.daily.json。
// 特性：同一天结果稳定；跨天自动变化；零外部接口依赖，可直接被 GitHub Action 定时运行。
// 接入真·自动更新：把站点 index.html 里的 PROMPTS_URL 改为
//   https://cdn.jsdelivr.net/gh/<你的用户名>/<仓库名>@main/prompts.daily.json
// 并在仓库开启 GitHub Pages / 用 jsDelivr 访问（需支持 CORS，jsDelivr 默认支持）。

const fs = require('fs');
const path = require('path');

const CANDIDATES = path.join(__dirname, 'prompts.json');
const OUTPUT = path.join(__dirname, 'prompts.daily.json');
const PICK = 12;

function daySeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function main() {
  const list = JSON.parse(fs.readFileSync(CANDIDATES, 'utf8'));
  const seed = daySeed(todayStr());
  // 基于种子的 Fisher–Yates 洗牌，取前 PICK 条
  const arr = list.slice();
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const picked = arr.slice(0, Math.min(PICK, arr.length));
  fs.writeFileSync(OUTPUT, JSON.stringify(picked, null, 2) + '\n');
  console.log(`[gen] ${todayStr()} 选出 ${picked.length} 条 → prompts.daily.json`);
}

main();
