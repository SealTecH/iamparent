export function generateDayIdToday():string {
  return new Date().setHours(0,0,0,0).toString();
}
