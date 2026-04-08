export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const HERO_IMAGES: string[] = [
  "/image-4.png",
  "/image-1.png",
  "/image-2.png",
  "/image-3.png",
  "/image-7.png",
  "/image-5.png",
  "/image-6.png",
  "/image-8.png",
  "/image-10.png",
  "/image-9.png",
  "/image-11.png",
  "/image-12.png"
];

export function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addMonths(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

export function isSameDay(first: Date | null, second: Date | null) {
  if (!first || !second) return false;
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function buildMonthGrid(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const slots: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (slots.length % 7 !== 0) slots.push(null);
  return slots;
}

export function getImageForMonth(monthIndex: number) {
  if (HERO_IMAGES.length === 0) return "";
  return HERO_IMAGES[monthIndex % HERO_IMAGES.length];
}

export function getEventKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function getNoteKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function getRangeNoteKey(startDate: Date, endDate: Date) {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  return `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}_${end.getFullYear()}-${end.getMonth()}-${end.getDate()}`;
}

export function isDateInRange(date: Date, startDate: Date | null, endDate: Date | null) {
  if (!startDate || !endDate) return false;
  const d = normalizeDate(date).getTime();
  const start = normalizeDate(startDate).getTime();
  const end = normalizeDate(endDate).getTime();
  return d >= start && d <= end;
}