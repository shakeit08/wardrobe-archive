# Wardrobe Archive · 남자의 옷장

인물 없는 남자 코디 이미지 12종과 의상 태그를 모아 둔 정적 웹사이트입니다.

## 기능
- 계절 및 스타일 필터, 한글·영문 검색
- 이미지 확대 및 PNG 다운로드
- 의상 태그 복사
- 브라우저에 저장되는 즐겨찾기
- 모바일 2열 레이아웃

## GitHub Pages 설정
저장소 Settings → Pages → Build and deployment에서 Deploy from a branch를 선택하고, main 브랜치의 /(root)를 저장합니다.

## 코디 추가
1. images/에 이미지 파일을 추가합니다.
2. data.js의 OUTFITS 배열에 고유 id, name, season, style, prompt, desc, image, keywords를 추가합니다.
3. 커밋하면 Pages가 새 파일을 배포합니다.

## 이미지 사용
상세 화면의 다운로드 버튼으로 PNG를 저장한 뒤 이미지 생성 도구의 의상 레퍼런스로 선택합니다. 이미지와 태그가 생성 결과를 보장하지는 않습니다.

계정·서버·API 키 없이 동작합니다. 즐겨찾기는 현재 브라우저에만 저장됩니다.
