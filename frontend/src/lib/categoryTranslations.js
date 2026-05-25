// Localized labels for category-like data (board, sub-categories, reviews, petitions, life info, occupations)
// Looked up by type + id; falls back to Korean then to id.

export const CAT_T = {
  ko: {
    board: {
      housing: "주거문제", labor: "노동문제", korean: "한국어학습", daily: "일상생활",
      visa: "비자/이민", legal: "법률/행정", education: "자녀교육",
      experience: "실전경험", discrimination: "사회적차별", health: "건강/의료/복지",
    },
    sub: {
      "find-home": "주택찾기", "rent-deposit": "전세·월세", "tenant-rights": "임차인권리",
      "employment": "취업", "wages": "임금", "work-env": "노동환경",
      "daily-korean": "실생활한국어", "topik": "시험준비", "exchange": "스터디·언어교환",
      "food": "음식·요리", "culture": "문화·취미", "health-daily": "건강·의료",
      "visa-types": "비자종류", "visa-extension": "비자연장", "documents": "절차·서류",
      "immigration-law": "이민법률", "labor-law": "노동법률", "other-law": "기타법률",
      "school": "학교정보", "parenting": "육아·양육", "lang-edu": "언어교육",
      "reviews": "후기·리뷰", "lawsuit": "소송승리", "success": "성공경험",
      "work-disc": "직장차별", "housing-disc": "주거차별", "other-disc": "기타차별",
      "hospital": "의료·병원", "insurance": "건강보험", "welfare": "복지정보",
    },
    review: { restaurant: "식당", market: "마트", housing: "주거", workplace: "직장", hospital: "병원" },
    petition: { labor: "노동", housing: "주거", visa: "비자", discrimination: "차별", medical: "의료", education: "교육", admin: "행정", other: "기타" },
    lifeinfo: { emergency: "긴급 도움", visa: "비자/체류/출입국", admin: "행정·공공서비스", medical: "의료·건강", labor: "노동·취업", legal: "법률·권리구제", support: "상담센터·지원기관", "korean-edu": "한국어·교육", family: "가족·아동·여성" },
    occupation: { student: "학생", worker: "직장인", "self-employed": "자영업", "job-seeking": "구직중", homemaker: "주부", other: "기타" },
  },
  en: {
    board: { housing: "Housing", labor: "Labor", korean: "Korean Learning", daily: "Daily Life", visa: "Visa/Immigration", legal: "Legal/Admin", education: "Children's Education", experience: "Real Experience", discrimination: "Discrimination", health: "Health/Welfare" },
    sub: { "find-home": "Find Home", "rent-deposit": "Rent/Deposit", "tenant-rights": "Tenant Rights", "employment": "Employment", "wages": "Wages", "work-env": "Work Environment", "daily-korean": "Daily Korean", "topik": "Exam Prep", "exchange": "Language Exchange", "food": "Food & Cooking", "culture": "Culture & Hobby", "health-daily": "Health & Medical", "visa-types": "Visa Types", "visa-extension": "Visa Extension", "documents": "Procedures", "immigration-law": "Immigration Law", "labor-law": "Labor Law", "other-law": "Other Law", "school": "School Info", "parenting": "Parenting", "lang-edu": "Language Education", "reviews": "Reviews", "lawsuit": "Lawsuit Wins", "success": "Success Stories", "work-disc": "Workplace", "housing-disc": "Housing", "other-disc": "Other", "hospital": "Hospital", "insurance": "Insurance", "welfare": "Welfare" },
    review: { restaurant: "Restaurant", market: "Market", housing: "Housing", workplace: "Workplace", hospital: "Hospital" },
    petition: { labor: "Labor", housing: "Housing", visa: "Visa", discrimination: "Discrimination", medical: "Medical", education: "Education", admin: "Admin", other: "Other" },
    lifeinfo: { emergency: "Emergency", visa: "Visa & Stay", admin: "Public Services", medical: "Medical", labor: "Labor & Jobs", legal: "Legal Aid", support: "Support Centers", "korean-edu": "Korean & Education", family: "Family & Women" },
    occupation: { student: "Student", worker: "Worker", "self-employed": "Self-employed", "job-seeking": "Job Seeking", homemaker: "Homemaker", other: "Other" },
  },
  vi: {
    board: { housing: "Nhà ở", labor: "Lao động", korean: "Học tiếng Hàn", daily: "Đời sống", visa: "Visa", legal: "Pháp luật", education: "Giáo dục con", experience: "Kinh nghiệm", discrimination: "Phân biệt", health: "Sức khỏe" },
    sub: { "find-home": "Tìm nhà", "rent-deposit": "Tiền cọc", "tenant-rights": "Quyền thuê", "employment": "Việc làm", "wages": "Tiền lương", "work-env": "Môi trường làm việc", "daily-korean": "Tiếng Hàn hằng ngày", "topik": "Ôn thi", "exchange": "Trao đổi ngôn ngữ", "food": "Ẩm thực", "culture": "Văn hóa", "health-daily": "Sức khỏe", "visa-types": "Loại visa", "visa-extension": "Gia hạn visa", "documents": "Thủ tục", "immigration-law": "Luật di trú", "labor-law": "Luật lao động", "other-law": "Luật khác", "school": "Trường học", "parenting": "Nuôi dạy con", "lang-edu": "Giáo dục ngôn ngữ", "reviews": "Đánh giá", "lawsuit": "Thắng kiện", "success": "Câu chuyện thành công", "work-disc": "Công sở", "housing-disc": "Nhà ở", "other-disc": "Khác", "hospital": "Bệnh viện", "insurance": "Bảo hiểm", "welfare": "Phúc lợi" },
    review: { restaurant: "Nhà hàng", market: "Chợ", housing: "Nhà ở", workplace: "Công sở", hospital: "Bệnh viện" },
    petition: { labor: "Lao động", housing: "Nhà ở", visa: "Visa", discrimination: "Phân biệt", medical: "Y tế", education: "Giáo dục", admin: "Hành chính", other: "Khác" },
    lifeinfo: { emergency: "Khẩn cấp", visa: "Visa & Cư trú", admin: "Dịch vụ công", medical: "Y tế", labor: "Lao động", legal: "Hỗ trợ pháp lý", support: "Trung tâm hỗ trợ", "korean-edu": "Tiếng Hàn & Giáo dục", family: "Gia đình & Phụ nữ" },
    occupation: { student: "Sinh viên", worker: "Nhân viên", "self-employed": "Tự kinh doanh", "job-seeking": "Đang tìm việc", homemaker: "Nội trợ", other: "Khác" },
  },
  zh: {
    board: { housing: "住房问题", labor: "劳动问题", korean: "韩语学习", daily: "日常生活", visa: "签证/移民", legal: "法律/行政", education: "子女教育", experience: "实战经验", discrimination: "社会歧视", health: "健康/医疗/福利" },
    sub: { "find-home": "找房", "rent-deposit": "租金/押金", "tenant-rights": "租客权利", "employment": "就业", "wages": "工资", "work-env": "工作环境", "daily-korean": "日常韩语", "topik": "考试准备", "exchange": "语言交换", "food": "美食烹饪", "culture": "文化爱好", "health-daily": "健康医疗", "visa-types": "签证类型", "visa-extension": "签证延期", "documents": "手续文件", "immigration-law": "移民法", "labor-law": "劳动法", "other-law": "其他法律", "school": "学校信息", "parenting": "育儿", "lang-edu": "语言教育", "reviews": "评测", "lawsuit": "诉讼胜诉", "success": "成功经历", "work-disc": "职场歧视", "housing-disc": "住房歧视", "other-disc": "其他歧视", "hospital": "医院医疗", "insurance": "健康保险", "welfare": "福利信息" },
    review: { restaurant: "餐厅", market: "超市", housing: "住房", workplace: "职场", hospital: "医院" },
    petition: { labor: "劳动", housing: "住房", visa: "签证", discrimination: "歧视", medical: "医疗", education: "教育", admin: "行政", other: "其他" },
    lifeinfo: { emergency: "紧急求助", visa: "签证/居留/出入境", admin: "行政/公共服务", medical: "医疗健康", labor: "劳动就业", legal: "法律维权", support: "咨询支援机构", "korean-edu": "韩语教育", family: "家庭/儿童/女性" },
    occupation: { student: "学生", worker: "上班族", "self-employed": "个体经营", "job-seeking": "求职中", homemaker: "家庭主妇", other: "其他" },
  },
  ja: {
    board: { housing: "住居問題", labor: "労働問題", korean: "韓国語学習", daily: "日常生活", visa: "ビザ/移民", legal: "法律/行政", education: "子供教育", experience: "実戦経験", discrimination: "社会的差別", health: "健康/医療/福祉" },
    sub: { "find-home": "住宅探し", "rent-deposit": "家賃·敷金", "tenant-rights": "賃借人の権利", "employment": "就職", "wages": "賃金", "work-env": "労働環境", "daily-korean": "日常韓国語", "topik": "試験対策", "exchange": "言語交換", "food": "食·料理", "culture": "文化·趣味", "health-daily": "健康·医療", "visa-types": "ビザ種類", "visa-extension": "ビザ延長", "documents": "手続き·書類", "immigration-law": "移民法", "labor-law": "労働法", "other-law": "その他法律", "school": "学校情報", "parenting": "育児", "lang-edu": "言語教育", "reviews": "レビュー", "lawsuit": "訴訟勝訴", "success": "成功体験", "work-disc": "職場差別", "housing-disc": "住居差別", "other-disc": "その他差別", "hospital": "医療·病院", "insurance": "健康保険", "welfare": "福祉情報" },
    review: { restaurant: "レストラン", market: "スーパー", housing: "住居", workplace: "職場", hospital: "病院" },
    petition: { labor: "労働", housing: "住居", visa: "ビザ", discrimination: "差別", medical: "医療", education: "教育", admin: "行政", other: "その他" },
    lifeinfo: { emergency: "緊急支援", visa: "ビザ/滞在", admin: "行政·公共", medical: "医療·健康", labor: "労働·就業", legal: "法律·権利", support: "相談·支援", "korean-edu": "韓国語·教育", family: "家族·子供·女性" },
    occupation: { student: "学生", worker: "会社員", "self-employed": "自営業", "job-seeking": "求職中", homemaker: "主婦", other: "その他" },
  },
  fil: {
    board: { housing: "Pabahay", labor: "Paggawa", korean: "Pag-aaral ng Korean", daily: "Pang-araw-araw", visa: "Visa", legal: "Legal", education: "Edukasyon ng Anak", experience: "Karanasan", discrimination: "Diskriminasyon", health: "Kalusugan" },
    sub: { "find-home": "Maghanap ng Bahay", "rent-deposit": "Upa/Deposito", "tenant-rights": "Karapatan ng Nangungupahan", "employment": "Trabaho", "wages": "Sahod", "work-env": "Kapaligiran sa Trabaho", "daily-korean": "Korean sa Araw-araw", "topik": "Paghahanda sa Eksamen", "exchange": "Palitan ng Wika", "food": "Pagkain", "culture": "Kultura", "health-daily": "Kalusugan", "visa-types": "Uri ng Visa", "visa-extension": "Extension ng Visa", "documents": "Mga Dokumento", "immigration-law": "Batas sa Imigrasyon", "labor-law": "Batas sa Paggawa", "other-law": "Ibang Batas", "school": "Impormasyon ng Paaralan", "parenting": "Pagpapalaki", "lang-edu": "Edukasyon sa Wika", "reviews": "Mga Review", "lawsuit": "Panalo sa Kaso", "success": "Tagumpay", "work-disc": "Sa Trabaho", "housing-disc": "Sa Pabahay", "other-disc": "Iba pa", "hospital": "Ospital", "insurance": "Insurance", "welfare": "Welfare" },
    review: { restaurant: "Restawran", market: "Palengke", housing: "Pabahay", workplace: "Trabaho", hospital: "Ospital" },
    petition: { labor: "Paggawa", housing: "Pabahay", visa: "Visa", discrimination: "Diskriminasyon", medical: "Medikal", education: "Edukasyon", admin: "Administrasyon", other: "Iba pa" },
    lifeinfo: { emergency: "Emergency", visa: "Visa at Pananatili", admin: "Pampublikong Serbisyo", medical: "Medikal", labor: "Trabaho", legal: "Legal na Tulong", support: "Support Centers", "korean-edu": "Korean at Edukasyon", family: "Pamilya at Kababaihan" },
    occupation: { student: "Estudyante", worker: "Empleyado", "self-employed": "Sariling Negosyo", "job-seeking": "Naghahanap ng Trabaho", homemaker: "Maybahay", other: "Iba pa" },
  },
  km: {
    board: { housing: "បញ្ហាលំនៅឋាន", labor: "បញ្ហាការងារ", korean: "រៀនកូរ៉េ", daily: "ជីវភាពប្រចាំថ្ងៃ", visa: "ទិដ្ឋាការ", legal: "ច្បាប់", education: "ការសិក្សា", experience: "បទពិសោធន៍", discrimination: "ការរើសអើង", health: "សុខភាព" },
    sub: { "find-home": "ស្វែងរកលំនៅឋាន", "rent-deposit": "តម្លៃ​ជួល", "tenant-rights": "សិទ្ធិអ្នកជួល", "employment": "ការងារ", "wages": "ប្រាក់ឈ្នួល", "work-env": "បរិយាកាសការងារ", "daily-korean": "កូរ៉េ​ប្រចាំថ្ងៃ", "topik": "ត្រៀម​ប្រឡង", "exchange": "ផ្លាស់ប្តូរ​ភាសា", "food": "ម្ហូប", "culture": "វប្បធម៌", "health-daily": "សុខភាព", "visa-types": "ប្រភេទ​ទិដ្ឋាការ", "visa-extension": "បន្ត​ទិដ្ឋាការ", "documents": "ឯកសារ", "immigration-law": "ច្បាប់​អន្តោប្រវេសន៍", "labor-law": "ច្បាប់ការងារ", "other-law": "ច្បាប់​ផ្សេងៗ", "school": "ព័ត៌មាន​សាលា", "parenting": "ការ​ចិញ្ចឹម​កូន", "lang-edu": "ការ​អប់រំ​ភាសា", "reviews": "ការវាយតម្លៃ", "lawsuit": "ឈ្នះ​បណ្ដឹង", "success": "ភាព​ជោគជ័យ", "work-disc": "នៅ​កន្លែង​ការងារ", "housing-disc": "លំនៅឋាន", "other-disc": "ផ្សេងៗ", "hospital": "មន្ទីរពេទ្យ", "insurance": "ធានារ៉ាប់រង", "welfare": "សុខុមាល​ភាព" },
    review: { restaurant: "ភោជនីយដ្ឋាន", market: "ផ្សារ", housing: "លំនៅឋាន", workplace: "កន្លែង​ការងារ", hospital: "មន្ទីរពេទ្យ" },
    petition: { labor: "ការងារ", housing: "លំនៅឋាន", visa: "ទិដ្ឋាការ", discrimination: "ការ​រើសអើង", medical: "វេជ្ជសាស្ត្រ", education: "ការ​អប់រំ", admin: "រដ្ឋបាល", other: "ផ្សេងៗ" },
    lifeinfo: { emergency: "ជំនួយ​បន្ទាន់", visa: "ទិដ្ឋាការ​និង​ការស្នាក់នៅ", admin: "សេវាសាធារណៈ", medical: "សុខភាព", labor: "ការងារ", legal: "ច្បាប់", support: "មជ្ឈមណ្ឌល​គាំទ្រ", "korean-edu": "ភាសា​កូរ៉េ​និង​ការ​អប់រំ", family: "គ្រួសារ​និង​ស្ត្រី" },
    occupation: { student: "សិស្ស", worker: "បុគ្គលិក", "self-employed": "អាជីវកម្ម​ផ្ទាល់ខ្លួន", "job-seeking": "ស្វែងរក​ការងារ", homemaker: "មេផ្ទះ", other: "ផ្សេងៗ" },
  },
  th: {
    board: { housing: "ปัญหาที่อยู่อาศัย", labor: "ปัญหาแรงงาน", korean: "การเรียนภาษาเกาหลี", daily: "ชีวิตประจำวัน", visa: "วีซ่า", legal: "กฎหมาย", education: "การศึกษาบุตร", experience: "ประสบการณ์", discrimination: "การเลือกปฏิบัติ", health: "สุขภาพ" },
    sub: { "find-home": "หาบ้าน", "rent-deposit": "ค่าเช่า/มัดจำ", "tenant-rights": "สิทธิผู้เช่า", "employment": "การจ้างงาน", "wages": "ค่าจ้าง", "work-env": "สภาพแวดล้อมการทำงาน", "daily-korean": "เกาหลีในชีวิตประจำวัน", "topik": "เตรียมสอบ", "exchange": "แลกเปลี่ยนภาษา", "food": "อาหาร", "culture": "วัฒนธรรม", "health-daily": "สุขภาพ", "visa-types": "ประเภทวีซ่า", "visa-extension": "ต่อวีซ่า", "documents": "เอกสาร", "immigration-law": "กฎหมายตรวจคนเข้าเมือง", "labor-law": "กฎหมายแรงงาน", "other-law": "กฎหมายอื่นๆ", "school": "ข้อมูลโรงเรียน", "parenting": "การเลี้ยงดูบุตร", "lang-edu": "การศึกษาภาษา", "reviews": "รีวิว", "lawsuit": "ชนะคดี", "success": "เรื่องสำเร็จ", "work-disc": "ที่ทำงาน", "housing-disc": "ที่อยู่อาศัย", "other-disc": "อื่นๆ", "hospital": "โรงพยาบาล", "insurance": "ประกันสุขภาพ", "welfare": "สวัสดิการ" },
    review: { restaurant: "ร้านอาหาร", market: "ตลาด", housing: "ที่พัก", workplace: "ที่ทำงาน", hospital: "โรงพยาบาล" },
    petition: { labor: "แรงงาน", housing: "ที่อยู่อาศัย", visa: "วีซ่า", discrimination: "การเลือกปฏิบัติ", medical: "การแพทย์", education: "การศึกษา", admin: "การบริหาร", other: "อื่นๆ" },
    lifeinfo: { emergency: "ฉุกเฉิน", visa: "วีซ่าและการพำนัก", admin: "บริการสาธารณะ", medical: "การแพทย์", labor: "แรงงาน", legal: "ความช่วยเหลือทางกฎหมาย", support: "ศูนย์สนับสนุน", "korean-edu": "ภาษาเกาหลีและการศึกษา", family: "ครอบครัวและสตรี" },
    occupation: { student: "นักเรียน", worker: "พนักงาน", "self-employed": "ประกอบอาชีพอิสระ", "job-seeking": "กำลังหางาน", homemaker: "แม่บ้าน", other: "อื่นๆ" },
  },
  mn: {
    board: { housing: "Орон сууцны асуудал", labor: "Хөдөлмөрийн асуудал", korean: "Солонгос хэл", daily: "Өдөр тутмын амьдрал", visa: "Виз/Цагаачлал", legal: "Хууль", education: "Хүүхдийн боловсрол", experience: "Бодит туршлага", discrimination: "Ялгаварлал", health: "Эрүүл мэнд" },
    sub: { "find-home": "Орон сууц олох", "rent-deposit": "Түрээс", "tenant-rights": "Түрээслэгчийн эрх", "employment": "Ажил эрхлэлт", "wages": "Цалин", "work-env": "Ажлын орчин", "daily-korean": "Өдөр тутмын солонгос", "topik": "Шалгалтын бэлтгэл", "exchange": "Хэл солилцоо", "food": "Хоол", "culture": "Соёл", "health-daily": "Эрүүл мэнд", "visa-types": "Визний төрөл", "visa-extension": "Виз сунгах", "documents": "Бичиг баримт", "immigration-law": "Цагаачлалын хууль", "labor-law": "Хөдөлмөрийн хууль", "other-law": "Бусад хууль", "school": "Сургуулийн мэдээ", "parenting": "Хүүхэд асрах", "lang-edu": "Хэлний боловсрол", "reviews": "Үнэлгээ", "lawsuit": "Хэрэг ялах", "success": "Амжилт", "work-disc": "Ажлын газар", "housing-disc": "Орон сууц", "other-disc": "Бусад", "hospital": "Эмнэлэг", "insurance": "Даатгал", "welfare": "Халамж" },
    review: { restaurant: "Ресторан", market: "Зах", housing: "Орон сууц", workplace: "Ажлын байр", hospital: "Эмнэлэг" },
    petition: { labor: "Хөдөлмөр", housing: "Орон сууц", visa: "Виз", discrimination: "Ялгаварлал", medical: "Эмнэлэг", education: "Боловсрол", admin: "Захиргаа", other: "Бусад" },
    lifeinfo: { emergency: "Яаралтай тусламж", visa: "Виз/Оршин суух", admin: "Нийтийн үйлчилгээ", medical: "Эрүүл мэнд", labor: "Хөдөлмөр", legal: "Хууль зүйн тусламж", support: "Дэмжлэгийн төв", "korean-edu": "Солонгос хэл, боловсрол", family: "Гэр бүл, эмэгтэйчүүд" },
    occupation: { student: "Оюутан", worker: "Ажилтан", "self-employed": "Хувиараа эрхлэгч", "job-seeking": "Ажил хайж буй", homemaker: "Гэрийн эзэгтэй", other: "Бусад" },
  },
  ru: {
    board: { housing: "Жильё", labor: "Труд", korean: "Корейский язык", daily: "Повседневная жизнь", visa: "Виза/Иммиграция", legal: "Право", education: "Образование детей", experience: "Опыт", discrimination: "Дискриминация", health: "Здоровье" },
    sub: { "find-home": "Поиск жилья", "rent-deposit": "Аренда/Залог", "tenant-rights": "Права арендатора", "employment": "Трудоустройство", "wages": "Зарплата", "work-env": "Условия труда", "daily-korean": "Бытовой корейский", "topik": "Подготовка к экзамену", "exchange": "Языковой обмен", "food": "Еда", "culture": "Культура", "health-daily": "Здоровье", "visa-types": "Виды визы", "visa-extension": "Продление визы", "documents": "Документы", "immigration-law": "Иммиграционное право", "labor-law": "Трудовое право", "other-law": "Другое право", "school": "Школы", "parenting": "Воспитание", "lang-edu": "Языковое образование", "reviews": "Отзывы", "lawsuit": "Победа в суде", "success": "Успехи", "work-disc": "На работе", "housing-disc": "В жилье", "other-disc": "Другое", "hospital": "Больница", "insurance": "Медстраховка", "welfare": "Льготы" },
    review: { restaurant: "Ресторан", market: "Магазин", housing: "Жильё", workplace: "Работа", hospital: "Больница" },
    petition: { labor: "Труд", housing: "Жильё", visa: "Виза", discrimination: "Дискриминация", medical: "Медицина", education: "Образование", admin: "Управление", other: "Другое" },
    lifeinfo: { emergency: "Экстренная помощь", visa: "Виза и пребывание", admin: "Госуслуги", medical: "Здоровье", labor: "Труд", legal: "Юр. помощь", support: "Центры поддержки", "korean-edu": "Корейский и образование", family: "Семья и женщины" },
    occupation: { student: "Студент", worker: "Работник", "self-employed": "Самозанятый", "job-seeking": "В поиске работы", homemaker: "Домохозяин", other: "Другое" },
  },
  uz: {
    board: { housing: "Uy-joy", labor: "Mehnat", korean: "Koreys tilini o'rganish", daily: "Kundalik hayot", visa: "Viza/Migratsiya", legal: "Huquq", education: "Bola ta'limi", experience: "Tajriba", discrimination: "Kamsitish", health: "Sog'liq" },
    sub: { "find-home": "Uy topish", "rent-deposit": "Ijara/Garov", "tenant-rights": "Ijarachi huquqlari", "employment": "Ish bilan ta'minlash", "wages": "Maosh", "work-env": "Ish muhiti", "daily-korean": "Kundalik koreys", "topik": "Imtihonga tayyorgarlik", "exchange": "Til almashuvi", "food": "Ovqat", "culture": "Madaniyat", "health-daily": "Sog'liq", "visa-types": "Viza turlari", "visa-extension": "Vizani uzaytirish", "documents": "Hujjatlar", "immigration-law": "Migratsiya qonuni", "labor-law": "Mehnat qonuni", "other-law": "Boshqa huquq", "school": "Maktab ma'lumotlari", "parenting": "Bola tarbiyasi", "lang-edu": "Til ta'limi", "reviews": "Sharhlar", "lawsuit": "Sud g'alabasi", "success": "Muvaffaqiyat", "work-disc": "Ishda", "housing-disc": "Uy-joyda", "other-disc": "Boshqa", "hospital": "Shifoxona", "insurance": "Sug'urta", "welfare": "Imtiyozlar" },
    review: { restaurant: "Restoran", market: "Bozor", housing: "Uy-joy", workplace: "Ish joyi", hospital: "Shifoxona" },
    petition: { labor: "Mehnat", housing: "Uy-joy", visa: "Viza", discrimination: "Kamsitish", medical: "Tibbiyot", education: "Ta'lim", admin: "Boshqaruv", other: "Boshqa" },
    lifeinfo: { emergency: "Favqulodda yordam", visa: "Viza va istiqomat", admin: "Davlat xizmatlari", medical: "Sog'liq", labor: "Mehnat", legal: "Huquqiy yordam", support: "Yordam markazlari", "korean-edu": "Koreys tili va ta'lim", family: "Oila va ayollar" },
    occupation: { student: "Talaba", worker: "Xodim", "self-employed": "Tadbirkor", "job-seeking": "Ish qidiruvchi", homemaker: "Uy bekasi", other: "Boshqa" },
  },
};

export function tCat(type, id, lang) {
  if (!id) return "";
  return (CAT_T[lang] && CAT_T[lang][type] && CAT_T[lang][type][id])
    || (CAT_T.ko[type] && CAT_T.ko[type][id])
    || id;
}
