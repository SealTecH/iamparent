export function getDayId(isoDate: string): string {
  return new Date(isoDate).setHours(0,0,0,0).toString();
}
