const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const regex = /export const CATEGORY_COLORS: Record<string, \{ bg: string; text: string; border: string; accentBg: string; accentText: string; accentBorder: string \}> = \{[\s\S]*?\};/m;

const replacement = `export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; accentBg: string; accentText: string; accentBorder: string }> = {
  All: {
    bg: 'bg-white/5',
    text: 'text-slate-300',
    border: 'border-white/10',
    accentBg: 'bg-white/10',
    accentText: 'text-white',
    accentBorder: 'border-white/20'
  },
  Mains: {
    bg: 'bg-[#0c1622]',
    text: 'text-slate-300',
    border: 'border-white/10',
    accentBg: 'bg-white/10',
    accentText: 'text-white',
    accentBorder: 'border-white/20'
  },
  Appetizers: {
    bg: 'bg-[#0c1622]',
    text: 'text-slate-300',
    border: 'border-white/10',
    accentBg: 'bg-white/10',
    accentText: 'text-white',
    accentBorder: 'border-white/20'
  },
  Desserts: {
    bg: 'bg-[#0c1622]',
    text: 'text-slate-300',
    border: 'border-white/10',
    accentBg: 'bg-white/10',
    accentText: 'text-white',
    accentBorder: 'border-white/20'
  },
  Beverages: {
    bg: 'bg-[#0c1622]',
    text: 'text-slate-300',
    border: 'border-white/10',
    accentBg: 'bg-white/10',
    accentText: 'text-white',
    accentBorder: 'border-white/20'
  }
};`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/types.ts', content);
