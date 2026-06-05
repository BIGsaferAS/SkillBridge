export function generatePrompt(
  sector: string,
  department: string,
  role: string,
  competencies: string[]
): string {
  const compStr = competencies.join(', ');
  return `Bu değerlendirme, ${sector} sektöründe yer alan ${department} departmanındaki ${role} rolünün yetkinliklerini ölçmek için hazırlanmıştır. Adayın/Çalışanın ${compStr} konularındaki performansı, aşağıdaki kriterlere göre puanlanacaktır.`;
}
