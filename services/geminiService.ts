
import { GoogleGenAI } from "@google/genai";
import { LifeReport } from "../types";
import { TIMING_LABELS } from "../constants";

export const generateLifeSummary = async (report: LifeReport): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const emotionData = report.comparisons
    .filter(c => c.dimension === 'EMOTION')
    .map(c => `${c.ageRangeLabel}岁发生[${c.statusLabel}](${TIMING_LABELS[c.timingCategory]})`)
    .join('; ');
    
  const careerData = report.comparisons
    .filter(c => c.dimension === 'CAREER')
    .map(c => `${c.ageRangeLabel}岁发生[${c.statusLabel}](${TIMING_LABELS[c.timingCategory]})`)
    .join('; ');

  const prompt = `
    作为一名资深生命教练，请为用户的这份“人生轨迹图”撰写一份深刻的总结。
    
    用户出生日期：${report.profile.birthDate}
    情感轨迹：${emotionData || '未记录'}
    事业轨迹：${careerData || '未记录'}
    
    要求：
    1. 洞察力：通过事业与情感的节点顺序、节奏快慢，找出其中的关联或人生模式。
    2. 风格：人文感、温暖、充满哲理。
    3. 字数：80-120字。
    4. 禁忌：不要列举数据，要讲关于“时间与选择”的本质。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return (response.text || "每一处停留，都是时间在为你准备下一场更好的奔赴。").trim();
  } catch (error) {
    console.error("Gemini summary failed:", error);
    return "在漫长的生命里，快慢并无标准。你留下的每一个刻度，都是属于你独一无二的生命参照系。";
  }
};
