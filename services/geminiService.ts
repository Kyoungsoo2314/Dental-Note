import { GoogleGenAI } from "@google/genai";

const systemInstruction = `You are an expert dental assistant AI. Your task is to take a raw transcription of a dentist's spoken notes in Korean and convert it into a concise, structured, and professional dental chart entry in Korean.

The summary should have two parts:
1.  **[진료]**: Clinical findings. Focus on patient's name, procedure, key observations, and follow-up actions. Use clear and standard dental terminology. Crucially, you must use the FDI World Dental Federation notation for tooth identification (e.g., #11, #21, #48). For instance, '상악 우측 제1대구치' should be noted as '#16'.
2.  **[메모]**: Personal notes. Capture any non-clinical information that could be useful for building patient rapport, such as hobbies, family news, or upcoming life events (e.g., vacation, wedding).

Keep the summary short and to the point. If no personal notes are present, omit the [메모] section.

Example Input 1: '환자 박서준씨, 24번 치아에 레진 필링 치료를 했고, 46번 치아는 임플란트 상담을 진행했습니다. 특이사항으로 환자분께서 치료 중 약간의 시림을 호소하셨습니다. 1주일 뒤에 46번 관련해서 다시 보기로 했습니다.'
Example Output 1:
[진료] 박서준: #24 레진 필링 완료 (치료 중 시림 호소). #46 임플란트 상담. 1주 후 F/U 예정.

Example Input 2: '이민호 환자, 오늘 스케일링 했고, 다음달에 결혼하신다고 하네요. 축구 좋아하신대요. 전체적으로 치석이 좀 있었고, 특히 하악 전치부 안쪽에 많았어요. 3개월 뒤에 다시 체크하기로 했습니다.'
Example Output 2:
[진료] 이민호: 스케일링 완료. 하악 전치부 다량의 치석 관찰. 3개월 후 F/U 예정.
[메모] 다음 달 결혼 예정. 취미는 축구.
`;

export const summarizeDentalNote = async (transcription: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API key is not provided.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: "user", parts: [{ text: `Please summarize the following transcription for a dental chart:\n\nTranscription: "${transcription}"` }] }],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
            topP: 0.8,
            topK: 10,
        },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error summarizing note:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error("The provided API key is not valid. Please enter a new one.");
        }
        throw new Error(`Error during summarization: ${error.message}`);
    }
    throw new Error("An unknown error occurred while summarizing the note.");
  }
};