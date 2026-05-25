// Static data used across IMTA: countries, districts, life info, board categories
// All Korean labels are primary; English labels included for bilingual display.

export const COUNTRIES = [
  { code: "KR", name: "Korea", korean: "대한민국", flag: "🇰🇷" },
  { code: "VN", name: "Vietnam", korean: "베트남", flag: "🇻🇳" },
  { code: "CN", name: "China", korean: "중국", flag: "🇨🇳" },
  { code: "US", name: "USA", korean: "미국", flag: "🇺🇸" },
  { code: "JP", name: "Japan", korean: "일본", flag: "🇯🇵" },
  { code: "PH", name: "Philippines", korean: "필리핀", flag: "🇵🇭" },
  { code: "KH", name: "Cambodia", korean: "캄보디아", flag: "🇰🇭" },
  { code: "TH", name: "Thailand", korean: "태국", flag: "🇹🇭" },
  { code: "MN", name: "Mongolia", korean: "몽골", flag: "🇲🇳" },
  { code: "RU", name: "Russia", korean: "러시아", flag: "🇷🇺" },
  { code: "UZ", name: "Uzbekistan", korean: "우즈베키스탄", flag: "🇺🇿" },
  { code: "MM", name: "Myanmar", korean: "미얀마", flag: "🇲🇲" },
  { code: "ID", name: "Indonesia", korean: "인도네시아", flag: "🇮🇩" },
  { code: "NP", name: "Nepal", korean: "네팔", flag: "🇳🇵" },
  { code: "BD", name: "Bangladesh", korean: "방글라데시", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", korean: "스리랑카", flag: "🇱🇰" },
  { code: "PK", name: "Pakistan", korean: "파키스탄", flag: "🇵🇰" },
  { code: "IN", name: "India", korean: "인도", flag: "🇮🇳" },
  { code: "KZ", name: "Kazakhstan", korean: "카자흐스탄", flag: "🇰🇿" },
  { code: "KG", name: "Kyrgyzstan", korean: "키르기스스탄", flag: "🇰🇬" },
  { code: "TJ", name: "Tajikistan", korean: "타지키스탄", flag: "🇹🇯" },
  { code: "TM", name: "Turkmenistan", korean: "투르크메니스탄", flag: "🇹🇲" },
  { code: "AF", name: "Afghanistan", korean: "아프가니스탄", flag: "🇦🇫" },
  { code: "IR", name: "Iran", korean: "이란", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", korean: "이라크", flag: "🇮🇶" },
  { code: "TR", name: "Turkey", korean: "튀르키예", flag: "🇹🇷" },
  { code: "EG", name: "Egypt", korean: "이집트", flag: "🇪🇬" },
  { code: "MA", name: "Morocco", korean: "모로코", flag: "🇲🇦" },
  { code: "NG", name: "Nigeria", korean: "나이지리아", flag: "🇳🇬" },
  { code: "ET", name: "Ethiopia", korean: "에티오피아", flag: "🇪🇹" },
  { code: "KE", name: "Kenya", korean: "케냐", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", korean: "남아프리카공화국", flag: "🇿🇦" },
  { code: "GH", name: "Ghana", korean: "가나", flag: "🇬🇭" },
  { code: "SN", name: "Senegal", korean: "세네갈", flag: "🇸🇳" },
  { code: "MY", name: "Malaysia", korean: "말레이시아", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", korean: "싱가포르", flag: "🇸🇬" },
  { code: "TW", name: "Taiwan", korean: "대만", flag: "🇹🇼" },
  { code: "HK", name: "Hong Kong", korean: "홍콩", flag: "🇭🇰" },
  { code: "LA", name: "Laos", korean: "라오스", flag: "🇱🇦" },
  { code: "BT", name: "Bhutan", korean: "부탄", flag: "🇧🇹" },
  { code: "MV", name: "Maldives", korean: "몰디브", flag: "🇲🇻" },
  { code: "GB", name: "United Kingdom", korean: "영국", flag: "🇬🇧" },
  { code: "FR", name: "France", korean: "프랑스", flag: "🇫🇷" },
  { code: "DE", name: "Germany", korean: "독일", flag: "🇩🇪" },
  { code: "IT", name: "Italy", korean: "이탈리아", flag: "🇮🇹" },
  { code: "ES", name: "Spain", korean: "스페인", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", korean: "포르투갈", flag: "🇵🇹" },
  { code: "NL", name: "Netherlands", korean: "네덜란드", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", korean: "벨기에", flag: "🇧🇪" },
  { code: "SE", name: "Sweden", korean: "스웨덴", flag: "🇸🇪" },
  { code: "NO", name: "Norway", korean: "노르웨이", flag: "🇳🇴" },
  { code: "FI", name: "Finland", korean: "핀란드", flag: "🇫🇮" },
  { code: "DK", name: "Denmark", korean: "덴마크", flag: "🇩🇰" },
  { code: "PL", name: "Poland", korean: "폴란드", flag: "🇵🇱" },
  { code: "UA", name: "Ukraine", korean: "우크라이나", flag: "🇺🇦" },
  { code: "CA", name: "Canada", korean: "캐나다", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", korean: "멕시코", flag: "🇲🇽" },
  { code: "BR", name: "Brazil", korean: "브라질", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", korean: "아르헨티나", flag: "🇦🇷" },
  { code: "CL", name: "Chile", korean: "칠레", flag: "🇨🇱" },
  { code: "PE", name: "Peru", korean: "페루", flag: "🇵🇪" },
  { code: "AU", name: "Australia", korean: "호주", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", korean: "뉴질랜드", flag: "🇳🇿" },
  { code: "OTHER", name: "Other", korean: "기타", flag: "🌍" },
];

export const SEOUL_DISTRICTS = [
  "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
  "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구",
  "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구", "기타",
];

export const OCCUPATIONS = [
  { value: "student", korean: "학생", english: "Student" },
  { value: "worker", korean: "직장인", english: "Worker" },
  { value: "self-employed", korean: "자영업", english: "Self-employed" },
  { value: "job-seeking", korean: "구직중", english: "Job Seeking" },
  { value: "homemaker", korean: "주부", english: "Homemaker" },
  { value: "other", korean: "기타", english: "Other" },
];

export const BOARD_CATEGORIES = [
  {
    id: "housing", icon: "🏠", korean: "주거문제", english: "Housing",
    subs: [
      { id: "find-home", korean: "주택찾기", english: "Find Home" },
      { id: "rent-deposit", korean: "전세·월세", english: "Rent/Deposit" },
      { id: "tenant-rights", korean: "임차인권리", english: "Tenant Rights" },
    ],
  },
  {
    id: "labor", icon: "💼", korean: "노동문제", english: "Labor",
    subs: [
      { id: "employment", korean: "취업", english: "Employment" },
      { id: "wages", korean: "임금", english: "Wages" },
      { id: "work-env", korean: "노동환경", english: "Work Environment" },
    ],
  },
  {
    id: "korean", icon: "📚", korean: "한국어학습", english: "Korean Learning",
    subs: [
      { id: "daily-korean", korean: "실생활한국어", english: "Daily Korean" },
      { id: "topik", korean: "시험준비", english: "Exam Prep" },
      { id: "exchange", korean: "스터디·언어교환", english: "Language Exchange" },
    ],
  },
  {
    id: "daily", icon: "🌟", korean: "일상생활", english: "Daily Life",
    subs: [
      { id: "food", korean: "음식·요리", english: "Food/Cooking" },
      { id: "culture", korean: "문화·취미", english: "Culture/Hobby" },
      { id: "health-daily", korean: "건강·의료", english: "Health/Medical" },
    ],
  },
  {
    id: "visa", icon: "📋", korean: "비자/이민", english: "Visa/Immigration",
    subs: [
      { id: "visa-types", korean: "비자종류", english: "Visa Types" },
      { id: "visa-extension", korean: "비자연장", english: "Visa Extension" },
      { id: "documents", korean: "절차·서류", english: "Procedures/Documents" },
    ],
  },
  {
    id: "legal", icon: "⚖️", korean: "법률/행정", english: "Legal/Admin",
    subs: [
      { id: "immigration-law", korean: "이민법률", english: "Immigration Law" },
      { id: "labor-law", korean: "노동법률", english: "Labor Law" },
      { id: "other-law", korean: "기타법률", english: "Other Law" },
    ],
  },
  {
    id: "education", icon: "👶", korean: "자녀교육", english: "Children's Education",
    subs: [
      { id: "school", korean: "학교정보", english: "School Info" },
      { id: "parenting", korean: "육아·양육", english: "Parenting" },
      { id: "lang-edu", korean: "언어교육", english: "Language Education" },
    ],
  },
  {
    id: "experience", icon: "🏆", korean: "실전경험", english: "Real Experience",
    subs: [
      { id: "reviews", korean: "후기·리뷰", english: "Reviews" },
      { id: "lawsuit", korean: "소송승리", english: "Lawsuit Wins" },
      { id: "success", korean: "성공경험", english: "Success Stories" },
    ],
  },
  {
    id: "discrimination", icon: "🚫", korean: "사회적차별", english: "Discrimination",
    subs: [
      { id: "work-disc", korean: "직장차별", english: "Workplace" },
      { id: "housing-disc", korean: "주거차별", english: "Housing" },
      { id: "other-disc", korean: "기타차별", english: "Other" },
    ],
  },
  {
    id: "health", icon: "🏥", korean: "건강/의료/복지", english: "Health/Welfare",
    subs: [
      { id: "hospital", korean: "의료·병원", english: "Hospital" },
      { id: "insurance", korean: "건강보험", english: "Health Insurance" },
      { id: "welfare", korean: "복지정보", english: "Welfare Info" },
    ],
  },
];

export const REVIEW_CATEGORIES = [
  { id: "restaurant", icon: "🍽️", korean: "식당", english: "Restaurant" },
  { id: "market", icon: "🛒", korean: "마트", english: "Market" },
  { id: "housing", icon: "🏠", korean: "주거", english: "Housing" },
  { id: "workplace", icon: "💼", korean: "직장", english: "Workplace" },
  { id: "hospital", icon: "🏥", korean: "병원", english: "Hospital" },
];

export const PETITION_CATEGORIES = [
  { id: "labor", korean: "노동", english: "Labor" },
  { id: "housing", korean: "주거", english: "Housing" },
  { id: "visa", korean: "비자", english: "Visa" },
  { id: "discrimination", korean: "차별", english: "Discrimination" },
  { id: "medical", korean: "의료", english: "Medical" },
  { id: "education", korean: "교육", english: "Education" },
  { id: "admin", korean: "행정", english: "Admin" },
  { id: "other", korean: "기타", english: "Other" },
];

export const REACTION_TYPES = [
  { id: "helpful", emoji: "👍", korean: "도움돼요", english: "Helpful" },
  { id: "trustworthy", emoji: "✅", korean: "믿을 수 있어요", english: "Trustworthy" },
  { id: "unhelpful", emoji: "👎", korean: "도움 안돼요", english: "Unhelpful" },
  { id: "untrustworthy", emoji: "❌", korean: "믿기 어려워요", english: "Untrustworthy" },
];
