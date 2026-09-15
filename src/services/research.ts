export function detectCategory(topic: string): string {
  const lower = topic.toLowerCase();
  
  // Sales keywords
  if (/цен[аы]|стоим|аренд[аыу]|сда[ет]|брон|заказ|акци|скидк|выгодн|предлож|available|price|deal|offer|msrp/i.test(lower)) {
    return 'sales';
  }
  
  // Trust keywords
  if (/подготов|мойк|обслуж|проверк|осмотр|сезон|зим|лет|maintenance|inspection|wash|clean|detail|команд|процесс|как мы/i.test(lower)) {
    return 'trust';
  }
  
  // Local keywords
  if (/ниагар|водопад|niagara|muskoka|ottawa|blue mountain|маршрут|дорог|поезд|путешеств|парковк|road trip/i.test(lower)) {
    return 'local';
  }
  
  // Interactive keywords
  if (/какую|какой|выбор|лучш|опрос|квиз|угадай|сравн|vs|или|голос|мнение|предпочит|что дума|а вы/i.test(lower)) {
    return 'interactive';
  }
  
  // Default
  return 'local';
}
