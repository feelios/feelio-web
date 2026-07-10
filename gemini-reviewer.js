/* eslint-disable */
import 'dotenv/config';
import { execSync } from 'child_process';
import { GoogleGenerativeAI } from '@google/generative-ai';

// .env 파일에서 보안 처리된 API 키를 불러옵니다.
const API_KEY = process.env.GEMINI_API_KEY;

async function runReview() {
  console.log("🔍 1. Git에서 변경된 코드(Diff)를 가져오는 중...");
  
  try {
    // main 브랜치와 현재 작업 중인 코드의 차이를 뽑아냅니다.
    // (만약 아직 commit을 안 한 변경사항을 보려면 'git diff HEAD'를 써도 됩니다)
    const diffText = execSync('git diff main').toString();

    if (!diffText) {
      console.log("✅ 변경된 코드가 없습니다.");
      return;
    }

    console.log("🤖 2. 제미나이에게 코드 리뷰를 요청하는 중 (잠시만 기다려주세요)...");
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    // 모델 이름을 현재 사용 가능한 gemini-2.5-flash 로 변경합니다.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    너는 우리 팀의 깐깐한 프론트엔드 시니어 개발자야.
    아래의 변경된 코드(diff)를 보고 다음을 찾아줘:
    1. React 네이밍 컨벤션 오류
    2. 불필요한 리렌더링 요소나 예외 처리 누락
    3. UI 레이아웃이 깨질 만한 잠재적 CSS 오류

    변경된 코드:
    ${diffText}
    `;

    const result = await model.generateContent(prompt);
    
    console.log("\n==========================================");
    console.log("🎯 [AI 시니어 개발자의 리뷰 결과]");
    console.log("==========================================\n");
    console.log(result.response.text());

  } catch (error) {
    console.error("❌ 실행 중 오류가 발생했습니다:", error.message);
  }
}

runReview();