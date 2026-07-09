import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 64);
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let value = seconds;
  for (const [step, label] of units) {
    if (value < step) {
      const rounded = Math.floor(value);
      return `${rounded} ${label}${rounded === 1 ? '' : 's'} ago`;
    }
    value /= step;
  }
  return date.toLocaleDateString();
}

export function estimateReadMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function trackLabel(track: string): string {
  const map: Record<string, string> = {
    'software-engineering': 'Software Engineering',
    upsc: 'UPSC',
    'iit-jee': 'IIT-JEE',
    neet: 'NEET',
  };
  return map[track] ?? track;
}
