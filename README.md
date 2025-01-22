# 마작 점수 계산기 (Mahjong Score Calculator)

리치 마작의 점수를 계산하는 웹 애플리케이션입니다.

![버전](https://img.shields.io/badge/version-0.0.1-blue.svg)

## 소개

이 프로젝트는 리치 마작의 점수 계산을 도와주는 웹 애플리케이션입니다. 
복잡한 점수 계산을 자동화하여 사용자가 쉽게 점수를 확인할 수 있습니다.

## 기능

- 패 선택 및 조합 구성
- 역 판정
- 자동 점수 계산

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

```

## 배포

이 프로젝트는 다음 플랫폼에 배포할 수 있습니다:

- Vercel (권장)
- Netlify
- GitHub Pages
- 기타 정적 호스팅 서비스

## 기술 스택

- Svelte + SvelteKit
- TypeScript
- Vite

## 프로젝트 구조

```
mahjong-score-calculator/
├── src/                    
│   ├── lib/                
│   │   ├── busu.ts            # 부수 계산 로직
│   │   ├── calculateScore.ts  # 점수 계산 로직
│   │   ├── constants.ts       # 상수 정의
│   │   ├── pesan.ts          # 패산 분석 로직
│   │   └── yaku.ts           # 역 판정 로직
│   └── routes/
│       ├── score/            # 점수 계산 페이지
│       ├── scorerule/        # 점수 계산표 페이지
│       ├── +layout.svelte    # 공통 레이아웃
│       └── +page.svelte      # 메인 페이지
└── static/
    ├── img/                  # 마작패 이미지
    └── style.css            # 전역 스타일
```

## 라이선스

MIT License

Copyright (c) 2024 [psj1561]

이 소프트웨어는 무료로 사용, 복사, 수정, 배포할 수 있으며, 소프트웨어의 사용으로 인한 어떠한 책임도 지지 않습니다.

### 이미지 라이선스
마작패 이미지 [작혼 이미지 소스]