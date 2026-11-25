---
name: 3go-photospot-ai
description: 동네네컷 원정대의 Safety Lock(보행 잠금), QR 스팟 스캐너, 온디바이스 MediaPipe 2인 협동 포즈 판정, HTML5 Canvas 네컷·쿠폰 합성을 구현할 때 사용합니다.
---

# 동네네컷 원정대 온디바이스 AI 스킬

## 지침 (Instructions)

1. **개인정보 유출 제로 원칙**
   - 카메라 영상 스트림과 MediaPipe 포즈 랜드마크 좌표는 절대 서버로 전송하지 않고 브라우저 클라이언트 메모리 내에서만 처리한다.

2. **Safety Lock (보행 중 화면 잠금)**
   - `window.addEventListener('devicemotion', ...)`으로 가속도 변화량을 감지한다.
   - 임계치 초과 시 화면 전체에 반투명 블러 오버레이(`backdrop-blur-md bg-black/75`)와 큰 경고 문구("안전하게 멈춘 뒤 촬영해 주세요")를 띄운다.
   - 데모 스위처의 `simulateWalking` 상태와 연동해 PC/발표장에서도 즉시 시연 가능하게 만든다.

3. **온디바이스 2인 협동 포즈 판정**
   - `@mediapipe/tasks-vision`의 `PoseLandmarker`를 브라우저에서 로드한다 (`numPoses: 2`).
   - 포즈 미션 예시:
     - `STRETCH`: 양손을 머리 위로 뻗은 스트레칭 자세 판정.
     - `BIG_HEART`: 2인의 양손목 랜드마크가 머리 위에서 근접할 때 성공 판정.
     - `MASCOT_POSE`: 지역 마스코트 지정 포즈 판정.
     - `HIGH_FIVE`: 2인의 손목 랜드마크 간 유클리드 거리가 임계치 이하일 때 성공 판정.
   - 카메라 권한이 없거나 발표장 조명이 어두울 때를 대비해 **[데모용 즉시 촬영(3초 카운트다운)]** 보조 버튼을 하단에 작게 제공한다.

4. **HTML5 Canvas 네컷 + 로컬 상권 쿠폰 합성**
   - 4컷 촬영 완료 시 오프스크린 `<canvas>`(1080×1920)에 4장의 사진, `src/config/region.config.ts`의 지역 특화 프레임, 촬영 날짜, 스팟명, 그리고 하단에 **원정대 보급소(골목 상점) 할인 바코드**를 렌더링한다.
   - `canvas.toDataURL('image/png')`로 즉시 기기 다운로드 버튼을 제공하며, 사용자가 명시적으로 **[마을 갤러리에 자랑하기]**를 누를 때만 DB에 저장한다.
