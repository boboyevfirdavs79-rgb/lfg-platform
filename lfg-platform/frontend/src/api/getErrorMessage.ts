/**
 * NestJS + class-validator ba'zan `message` maydonini massiv qilib qaytaradi
 * (bir nechta validatsiya xatosi bo'lganda). Bu funksiya uni har doim
 * o'qish mumkin bo'lgan bitta satrga aylantiradi.
 */
export function getErrorMessage(err: any, fallback: string): string {
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.length > 0) return message;
  return fallback;
}
