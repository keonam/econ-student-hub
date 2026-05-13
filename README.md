# Econ Student Hub

Next.js App Router와 Tailwind CSS로 만든 경제학과 대학생용 개인 학업/커리어 허브입니다. 현재 데이터는 브라우저 `localStorage`에 저장되며, AI 기능은 `/api/ai` 서버 route를 통해 분리되어 있습니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://127.0.0.1:3000` 또는 `http://localhost:3000`을 엽니다.

## 환경변수

AI 기능은 OpenAI Responses API를 서버 route에서 호출합니다. 프로젝트 루트에 `.env.local`을 만들고 아래 값을 설정하세요.

```bash
OPENAI_API_KEY=
OPENAI_ECON_TUTOR_PROMPT_ID=
OPENAI_MODEL=gpt-5
```

실제 API Key 값은 README, 소스 코드, GitHub Actions workflow, 클라이언트용 `NEXT_PUBLIC_*` 변수에 적지 않습니다. 로컬 또는 EC2 서버의 `.env.local`에만 저장하세요.

`OPENAI_API_KEY`는 브라우저로 전달되지 않고 `src/app/api/ai/route.ts`에서만 사용됩니다. 모델을 바꾸고 싶으면 `OPENAI_MODEL` 값을 변경하면 됩니다.
AI Econ Tutor는 Prompt Builder의 Prompt ID를 `OPENAI_ECON_TUTOR_PROMPT_ID`로 읽고, Prompt variables는 `question`, `level`, `mode`, `category` 이름으로 전달합니다.

## 현재 폴더 구조

```text
src/
  app/
    api/
      ai/
        route.ts          # 공통 AI API route
    globals.css
    layout.tsx
    page.tsx
  components/
    ai/
      AiResponseCard.tsx       # 재사용 가능한 AI 응답 카드
      CareerApplicationList.tsx # Career Tracker 지원 카드/AI 분석 목록
      CareerCoachPanel.tsx     # AI Career Coach 입력/경험 DB/응답 패널
      EconTutorHistory.tsx     # AI Tutor 질문 기록
      EconTutorQuestionForm.tsx
      NewsExplainerPanel.tsx   # AI News Explainer 입력/응답 패널
      DataProjectList.tsx
      DataProjectWizard.tsx
      DataSourcePanel.tsx
      ReportAssistantForm.tsx
      ReportEthicsPanel.tsx
      ReportProjectList.tsx
    AiEconTutorSection.tsx
    AiDataProjectCoachSection.tsx
    AiReportAssistantSection.tsx
    CareerSection.tsx
    CoursesSection.tsx
    Dashboard.tsx
    EconStudentHub.tsx
    NewsSection.tsx
    PortfolioSection.tsx
    ResearchSection.tsx
    ui.tsx
  lib/
    ai/
      client.ts         # 클라이언트 공통 AI 요청/에러 처리
      career-coach.ts   # 커리어 코치 섹션/입력/draft 파싱
      econ-tutor.ts      # Tutor 스타일/카테고리/섹션 설정
      features.ts         # AI 기능별 prompt/config
      data-project-coach.ts # 데이터 프로젝트 설계/출처/helper
      news-explainer.ts   # 뉴스 분석 섹션/저장 draft 파싱
      report-assistant.ts # 리포트 계획 섹션/할 일 생성
      openai.ts           # AI provider 호출부
    cn.ts
    date.ts
    id.ts
    sample-data.ts
    url.ts              # 외부 링크 http/https 안전성 검사
  types/
    ai.ts                 # AI 요청/응답/기록 타입
  types.ts                # 기존 학업/커리어 도메인 타입
```

## AI 기능 확장 설계

공통 AI route는 `feature` 값으로 기능을 구분합니다.

- `econTutor`: 개념 설명, 수식 해석, 현실 예시, 시험 대비 요약
- `newsExplainer`: 뉴스 요약, 경제 개념, 말하기 포인트, 태그 추천
- `researchAssistant`: 연구 질문, 가설, 데이터, 분석 방법 제안
- `careerCoach`: 진로 로드맵, 공고 분석, 자기소개서 소재, 면접 답변 초안 생성
- `reportAssistant`: 리포트 주제, 목차, 자료 조사 계획, 자동 할 일 생성
- `dataProjectCoach`: 데이터 분석 프로젝트 주제, 변수, 방법, 포트폴리오 카드 생성

나중에 Supabase로 이전할 때는 `AiInteractionRecord`, `EconTutorHistoryItem`, `ReportProject`, `DataProject`, `CareerAiAnalysis`를 별도 테이블로 두고, 기존 `courses`, `news`, `research`, `portfolio`, `careers` 테이블과 느슨하게 연결하는 구조가 좋습니다.

AI Tutor 질문 기록은 별도 localStorage key인 `econ-student-hub:ai-tutor-history:v1`에 저장합니다.

AI News Explainer 분석 결과는 저장된 `EconNewsItem.aiAnalysis`에 함께 저장됩니다. URL만 입력한 경우 AI가 원문을 직접 읽었다고 가정하지 않으며, 정확한 분석이 필요하면 기사 본문을 붙여넣는 흐름을 사용합니다.

AI Report Assistant의 저장 프로젝트는 `HubData.reports`에 저장됩니다. 프로젝트에는 진행 상태, AI 계획, 자동 생성 할 일이 포함됩니다.

Data Project Coach의 저장 프로젝트는 `HubData.dataProjects`에 저장됩니다. 생성된 포트폴리오 카드 초안은 기존 `Portfolio` 목록으로 추가할 수 있습니다.

AI Career Coach 분석 결과는 `CareerItem.aiAnalysis`에 저장됩니다. Career Tracker는 포트폴리오, 리서치 로그, 데이터 프로젝트, 과목 과제, 기존 지원 항목을 경험 DB로 보여주며, 선택한 소재를 자기소개서/면접 분석 입력에 붙여넣을 수 있습니다.

AI API route는 서버에서만 `OPENAI_API_KEY`를 읽고, 클라이언트는 `/api/ai`만 호출합니다. 입력은 서버에서 길이를 제한하고, OpenAI 호출은 timeout을 둡니다. 사용자가 저장한 외부 링크는 렌더링 전에 `http`/`https`만 허용합니다.

## AWS EC2 배포

GitHub `main` 브랜치에 push되면 `.github/workflows/deploy.yml` workflow가 EC2 Ubuntu 서버에 SSH로 접속해 배포합니다. EC2에서는 PM2가 Next.js 앱을 `localhost:3000`에서 실행하고, Nginx가 80번 포트 요청을 `localhost:3000`으로 프록시합니다.

### GitHub Secrets

Repository Settings → Secrets and variables → Actions에 아래 값을 등록합니다.

| Secret | 필수 | 예시 | 설명 |
| --- | --- | --- | --- |
| `EC2_HOST` | 예 | `3.34.185.49` 또는 `ec2-3-34-185-49.ap-northeast-2.compute.amazonaws.com` | EC2 퍼블릭 IPv4 또는 퍼블릭 DNS |
| `EC2_USER` | 예 | `ubuntu` | Ubuntu AMI 기본 사용자 |
| `EC2_SSH_KEY` | 예 | `-----BEGIN ...` 전체 내용 | EC2 접속용 private key 파일 내용 전체 |
| `EC2_APP_DIR` | 아니오 | `/home/ubuntu/econ-student-hub` | EC2 안의 프로젝트 폴더 경로. 없으면 `/home/<EC2_USER>/econ-student-hub` 사용 |

`EC2_SSH_KEY`에는 로컬 경로가 아니라 private key 파일의 내용을 그대로 넣습니다. 예를 들어 `D:/DEV/aws/econ-student-hub-key.pem` 파일을 열어 `BEGIN`부터 `END`까지 전체 내용을 등록합니다. `.pem`, `.env`, AWS Access Key, OpenAI API Key는 절대 커밋하지 않습니다.

EC2 퍼블릭 IP가 자동 할당 IP라면 인스턴스 재시작 때 바뀔 수 있습니다. 운영용으로는 Elastic IP를 붙이고 `EC2_HOST`를 그 값으로 등록하는 편이 안전합니다.

### EC2 서버 최초 세팅

GitHub Actions workflow가 `git`, `curl`, `nginx`, Node.js 20, `npm`, `pm2`를 배포 시 자동으로 확인하고 설치합니다. 수동으로 먼저 준비하려면 EC2에 접속해 아래 명령을 실행합니다.

```bash
sudo apt update
sudo apt install -y ca-certificates curl git nginx

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

AI 기능을 사용하려면 EC2 프로젝트 폴더에 `.env.local`을 만들고 아래처럼 서버 환경변수를 설정합니다.

```bash
OPENAI_API_KEY=
OPENAI_ECON_TUTOR_PROMPT_ID=
OPENAI_MODEL=gpt-5
```

`.env.local`은 서버에만 두고 GitHub에 커밋하지 않습니다.

### 수동 배포

저장소가 아직 없다면 clone합니다.

```bash
cd /home/ubuntu
git clone https://github.com/<OWNER>/<REPO>.git econ-student-hub
cd /home/ubuntu/econ-student-hub
```

이미 clone되어 있다면 최신 `main`을 가져옵니다.

```bash
cd /home/ubuntu/econ-student-hub
git checkout main
git pull --ff-only origin main
```

락파일에 맞춰 의존성을 설치하고 빌드합니다.

```bash
if [ -f pnpm-lock.yaml ]; then
  corepack enable
  pnpm install --frozen-lockfile
  pnpm run build
elif [ -f yarn.lock ]; then
  corepack enable
  yarn install --frozen-lockfile
  yarn build
else
  npm ci
  npm run build
fi
```

PM2로 앱을 실행합니다.

```bash
pm2 describe econ-student-hub >/dev/null 2>&1 \
  && pm2 restart econ-student-hub --update-env \
  || pm2 start npm --name econ-student-hub -- start -- -p 3000

sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME"
pm2 save
```

### Nginx 설정

`/etc/nginx/sites-available/econ-student-hub` 파일을 생성합니다.

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

기존 default site와 충돌하지 않도록 비활성화하고 Nginx를 검증/재시작합니다.

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sfn /etc/nginx/sites-available/econ-student-hub /etc/nginx/sites-enabled/econ-student-hub
sudo nginx -t
sudo systemctl enable nginx
sudo ufw allow 80/tcp || true
sudo systemctl restart nginx
```

EC2 보안 그룹에서는 80번 포트를 열고, 22번 SSH 포트는 가능한 본인 IP로 제한하세요.

### 자동 배포

1. GitHub Secrets에 `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`를 등록합니다.
2. 선택적으로 `EC2_APP_DIR`를 등록합니다.
3. 변경사항을 `main` 브랜치에 push합니다.
4. GitHub Actions가 EC2에 SSH 접속합니다.
5. 프로젝트 폴더가 있으면 `git pull --ff-only origin main`, 없으면 clone을 실행합니다.
6. 락파일에 맞춰 `npm`, `pnpm`, `yarn` 중 하나로 의존성을 설치합니다.
7. production build를 실행합니다.
8. PM2에 `econ-student-hub` 프로세스가 있으면 restart, 없으면 새로 start합니다.
9. Nginx reverse proxy를 검증하고 reload합니다.
10. `curl http://127.0.0.1:3000`, `curl http://127.0.0.1`, `pm2 status`, `nginx` 상태를 확인합니다.

### 운영 확인 명령

```bash
pm2 status
pm2 logs econ-student-hub --lines 100
sudo systemctl status nginx
sudo tail -n 100 /var/log/nginx/error.log
curl -I http://localhost:3000
curl -I http://localhost
```

### 자주 발생하는 오류

- `Permission denied (publickey)`: GitHub Secret `EC2_SSH_KEY` 값이 private key 전체 내용인지 확인하고, EC2 보안 그룹에서 22번 포트가 허용되어 있는지 확인합니다.
- `npm is not found` 또는 Node 버전 오류: Node.js 20 설치가 실패했을 수 있습니다. `node -v`, `npm -v`를 확인합니다.
- `git pull --ff-only` 실패: EC2 서버의 작업트리에 수동 변경사항이 있거나 브랜치가 갈라진 상태입니다. 필요한 변경을 백업한 뒤 서버 작업트리를 정리합니다.
- `EADDRINUSE: port 3000`: 다른 프로세스가 3000번 포트를 사용 중입니다. `sudo lsof -i :3000` 또는 `pm2 status`로 확인합니다.
- `502 Bad Gateway`: PM2 앱이 죽었거나 Nginx가 잘못된 포트로 프록시 중입니다. `pm2 logs econ-student-hub`와 `sudo nginx -t`를 확인합니다.
- 외부에서 80번 포트 timeout: EC2 보안 그룹 inbound rule에 `HTTP 80`이 열려 있는지, 인스턴스에 연결된 보안 그룹이 맞는지, `sudo ufw status`에서 80/tcp가 허용되어 있는지 확인합니다.
- AI 기능에서 API key 오류: EC2의 프로젝트 폴더에 `.env.local`이 있는지, PM2 restart 시 `--update-env`가 적용됐는지 확인합니다.

## 테스트

```bash
npm run build
```

AI API route 확인:

```bash
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d "{\"feature\":\"econTutor\",\"input\":\"IS-LM 모형을 쉽게 설명해줘\",\"category\":\"macroeconomics\",\"answerStyle\":\"freshman\"}"
```

Career Coach route 확인:

```bash
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d "{\"feature\":\"careerCoach\",\"input\":\"관심 진로: 리서치\n보유 역량: Python, Excel\n경험: 계량경제학 프로젝트\n지원 공고: RA 인턴\"}"
```

환경변수가 없으면 `OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다.` 오류가 정상적으로 표시됩니다.

## 참고

- OpenAI Responses API: https://platform.openai.com/docs/api-reference/responses

## API Key 관리

- 클라이언트 컴포넌트에서는 OpenAI API를 직접 호출하지 않습니다.
- OpenAI 요청은 Next.js server route인 `src/app/api/ai/route.ts`를 통해서만 처리합니다.
- 서버 route는 `process.env.OPENAI_API_KEY`만 읽습니다.
- AI Econ Tutor의 Prompt Builder ID는 `process.env.OPENAI_ECON_TUTOR_PROMPT_ID`로만 읽습니다.
- `NEXT_PUBLIC_OPENAI_API_KEY` 같은 공개 환경변수는 사용하지 않습니다.
- 실제 API Key 값은 로컬 또는 EC2 `.env.local`에만 저장하고, `.env`, `.env.local`, `.env.production`은 커밋하지 않습니다.
- EC2 배포 환경에서는 AI 기능을 사용하기 전에 `/home/ubuntu/econ-student-hub/.env.local`에 `OPENAI_API_KEY`가 있어야 하고, AI Econ Tutor에는 `OPENAI_ECON_TUTOR_PROMPT_ID`도 필요합니다.
