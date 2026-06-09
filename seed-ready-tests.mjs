import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const readyTests = [
  {
    title: "Kurumsal (B2B) Satış Uzmanı - İtiraz ve Kriz Yönetimi",
    description: "Bu simülasyon B2B SaaS satış süreçlerindeki fiyat itirazları, rakip analizleri ve teknik gümrük/güvenlik blokajlarının stratejik yönetimini ölçer.",
    sector: "Yazılım & Teknoloji",
    department: "Satış",
    roleName: "Kıdemli Uzman (Senior)",
    difficulty: "Zor",
    competencies: ["Stratejik İletişim", "Kriz Yönetimi"],
    scenarioText: "Global bir finans kurumuna yönelik stratejik kurumsal yazılım (B2B SaaS) satış sürecini yöneten Kıdemli Satış Temsilcisi, yeri aydır süren ve MEDDPICC metodolojisiyle titizlikle yürütülen bir fırsatın son aşamasına gelmiştir. Süreç boyunca müşterinin operasyonel verimsizliklerinden kaynaklanan eylemsizlik maliyeti (Cost of Inaction), getiri oranı (ROI) ve toplam sahip olma maliyeti (TCO) vurgulanarak değer odaklı bir strateji izlenmiştir. Ancak, canlı veriyle gerçekleştirilen Proof of Concept (PoC) testleri sırasında yaşanan beklenmedik ve kritik bir sistem kesintisi, projenin teknik güvenilirliğine ağır bir darbe indirir. Projenin içerideki en büyük savunucusu olan Şampiyon'un (IT Başkan Yardımcısı) ani istifasıyla süreç tamamen çıkmaza girer. Yerine atanan yeni yönetici, 'Maliyetiniz çok yüksek ve rakibinizin çözümü pazar standartlarına göre daha risksiz duruyor' diyerek projeyi iptal etme sinyalleri verir. Eş zamanlı olarak, Bilgi Güvenliği Yöneticisi (CISO), PoC sırasındaki kesintiyi gerekçe göstererek mevcut mimarinin güvenlik uyumluluklarına risk oluşturduğunu öne sürer ve projeyi bloke eder. Satış temsilcisi; sarsılmış teknik güven, fiyat itirazı ve kaybedilmiş bir iç ittifakla karşı karşıyadır.",
    questions: [
      {
        competency: "Stratejik İletişim",
        text: "Yeni yöneticinin 'Maliyetiniz çok yüksek' itirazını ve rakip ürün tercihini aşmak için izlemeniz gereken en etkili satış stratejisi hangisidir?",
        options: [
          "Fiyatı koruyarak rakibin zayıf olduğu teknik alanları ön plana çıkarmak ve eylemsizlik durumunda oluşacak mali kayıpları ROI raporlarıyla yeniden sunmak.",
          "Anlaşmayı kaybetmemek adına hemen %30 oranında indirim yapmak ve yeni yöneticinin bütçe onayını almak için fiyat teklifini revize etmek.",
          "Müşterinin itirazlarını görmezden gelerek sadece ürünün teknik özelliklerini anlatan yeni bir sunum hazırlamak ve süreci uzatmak.",
          "Rakip firmanın ürününü kötüleyen bir karşılaştırma tablosu hazırlayıp yeni yöneticiye sunmak ve onların yazılımının hatalarını anlatmak."
        ],
        correctAnswer: "Fiyatı koruyarak rakibin zayıf olduğu teknik alanları ön plana çıkarmak ve eylemsizlik durumunda oluşacak mali kayıpları ROI raporlarıyla yeniden sunmak.",
        explanation: "Değer odaklı satışta hemen indirime gitmek ürünün değer algısını düşürür. Fiyatı koruyup, rakibin zayıf olduğu teknik alanlara odaklanmak (Trap Setting) ve eylemsizlik maliyetini (Cost of Inaction) hatırlatmak en profesyonel yaklaşımdır."
      },
      {
        competency: "Kriz Yönetimi",
        text: "CISO'nun PoC kesintisini gerekçe göstererek koyduğu güvenlik blokajını kaldırmak ve projeyi kurtarmak için ne yapmalısınız?",
        options: [
          "PoC kesintisini sistemin genel hatası değil küçük bir sunucu problemi olarak nitelendirip CISO'nun endişelerini önemsizleştirmek.",
          "Kesintinin kök neden analizi ve iyileştirme planını CISO ile paylaşmak; riskleri azaltmak için aşamalı bir geçiş (Phased Rollout) planı sunmak.",
          "CISO ile doğrudan görüşmek yerine üst yönetimdeki diğer tanıdık yöneticileri devreye sokarak CISO üzerinde idari baskı kurmaya çalışmak.",
          "CISO'ya tüm güvenlik testlerinin başarıyla geçeceğini garanti eden yazılı bir taahhütname verip sistem kurulumunu doğrudan tamamlamak."
        ],
        correctAnswer: "Kesintinin kök neden analizi ve iyileştirme planını CISO ile paylaşmak; riskleri azaltmak için aşamalı bir geçiş (Phased Rollout) planı sunmak.",
        explanation: "Teknik krizlerde şeffaflık esastır. Root Cause Analysis (RCA) ve Remediation Plan sunulmalı, CISO'nun güvenlik endişelerini gidermek üzere aşamalı geçiş veya MVP önerilmelidir."
      },
      {
        competency: "Stratejik İletişim",
        text: "İstifa eden şampiyonunuzun (IT Başkan Yardımcısı) yokluğunda, yeni yönetici ve diğer karar vericilerle ilişkileri yeniden yapılandırmak için nasıl bir yol izlemelisiniz?",
        options: [
          "Karar vericilere doğrudan ulaşmaya çalışmaktan vazgeçip, sadece alt kademedeki teknik personel üzerinden bilgi akışı sağlamak.",
          "Yeni IT Başkan Yardımcısının eski kararları eleştirmesini engellemek için projenin geçmişteki tüm onay belgelerini resmi yazı ile sunmak.",
          "Şirket içi çapraz iletişim (multithreading) bağlarını kullanarak satın alma ve IT tarafındaki diğer destekçilerle yeni yöneticiye ortak gitmek.",
          "Yeni yöneticinin projeyi istemediğini varsayarak satışı sonlandırmak ve başka potansiyel müşteri arayışlarına odaklanmak."
        ],
        correctAnswer: "Şirket içi çapraz iletişim (multithreading) bağlarını kullanarak satın alma ve IT tarafındaki diğer destekçilerle yeni yöneticiye ortak gitmek.",
        explanation: "Tek bir destekçiye (şampiyona) bağımlı kalmak satışı riske atar. Multithreading yaklaşımı ile IT, finans ve satın alma birimlerindeki diğer paydaşları devreye sokarak yeni yöneticiyi ikna etmek gerekir."
      }
    ]
  },
  {
    title: "Kıdemli Yazılım Mühendisi Teknik Liderlik Simülasyonu",
    description: "Bu test, yüksek trafikli anlarda oluşabilecek veritabanı deadlock ve mimari krizlerinin soğukkanlılıkla ve modern yazılım paternleri ile çözülmesini ölçer.",
    sector: "Teknoloji, Bilişim ve Elektronik",
    department: "Yazılım / Mühendislik",
    roleName: "Kıdemli Uzman (Senior)",
    difficulty: "Zor",
    competencies: ["Problem Çözme", "Kriz Yönetimi"],
    scenarioText: "Şirketinizin en büyük e-ticaret platformunda, yılın en yoğun alışveriş gününün (Black Friday) başlamasına sadece 2 saat kalmıştır. Canlı ortamda yapılan son testlerde, ödeme mikroservisinin aşırı yük altında veri tabanında deadlock (kilitlenme) durumuna düştüğü ve isteklerin %40'ının zaman aşımına (timeout) uğrayarak başarısız olduğu gözlemlenmiştir. Veri tabanı yöneticisi (DBA) sunucu kapasitesinin zaten maksimumda olduğunu ve dikey büyümenin (vertical scaling) çözüm olmayacağını belirtmektedir. Bu esnada pazarlama departmanı milyonlarca liralık reklam kampanyalarını tetiklemiştir ve geri dönüşü olmayan bir sürece girilmiştir. Teknik lider olarak sistemi ayakta tutmak ve müşterilerin ödeme yapabilmesini sağlamak zorundasınız.",
    questions: [
      {
        competency: "Problem Çözme",
        text: "Deadlock sorununu çözmek ve ödeme sisteminin tamamen çökmesini engellemek için acil olarak alacağınız teknik aksiyon ne olmalıdır?",
        options: [
          "Tüm sistem trafiğini kapatıp veri tabanını sıfırlamak ve tüm tabloları optimize edene kadar platformu bakıma almak.",
          "Deadlock yaratan veritabanı işlemlerini izole etmek, geçici kuyruk mekanizması (Message Queue) ile işlemleri sıraya almak ve Circuit Breaker devreye sokmak.",
          "Deadlock durumunun geçmesini beklemek ve kullanıcıların sayfayı yenilemelerini (refresh) öneren bir uyarı mesajı yayınlamak.",
          "Ödeme mikroservisinin kodunu tamamen baştan yazmak için acil bir yazılım geliştirme sprinti başlatıp tüm ekibi buna atamak."
        ],
        correctAnswer: "Deadlock yaratan veritabanı işlemlerini izole etmek, geçici kuyruk mekanizması (Message Queue) ile işlemleri sıraya almak ve Circuit Breaker devreye sokmak.",
        explanation: "Kriz anında doğrudan kuyruk mekanizması ve Circuit Breaker (Devre Kesici) kullanımı, aşırı yükü kontrol altına alır ve veritabanı deadlock'larını önler."
      },
      {
        competency: "Kriz Yönetimi",
        text: "Kriz anında pazarlama ve üst yönetim ekiplerinin sürekli durum raporu talep etmesi ve üzerinizde baskı oluşturması karşısında nasıl bir iletişim stratejisi izlersiniz?",
        options: [
          "Yönetime ve pazarlama ekibine hiçbir bilgi vermeyerek tüm iletişimi kesmek ve sadece kod yazmaya odaklanmak.",
          "Her 10 dakikada bir teknik detayları içeren karmaşık raporlar göndermek ve yönetimin teknik kararlara dahil olmasını istemek.",
          "Belirli aralıklarla net durum güncellemeleri yapan tek bir sözcü belirlemek ve iş etki düzeyini iş diliyle açıklayarak güven vermek.",
          "Pazarlama ekibini suçlayarak kampanyayı bu kadar erken başlattıkları için teknik sorunlar yaşandığını dile getirmek."
        ],
        correctAnswer: "Belirli aralıklarla net durum güncellemeleri yapan tek bir sözcü belirlemek ve iş etki düzeyini iş diliyle açıklayarak güven vermek.",
        explanation: "Kriz yönetiminde karmaşayı önlemek için tek kanal iletişimi kurulmalı ve yönetimle teknik jargondan uzak, işin etkisini ve çözüm süresini belirten sade güncellemeler paylaşılmalıdır."
      },
      {
        competency: "Problem Çözme",
        text: "Bu kriz atlatıldıktan sonra, benzer bir altyapısal deadlock sorununun gelecekte yaşanmaması için mimari düzeyde atılması gereken en sürdürülebilir adım nedir?",
        options: [
          "Platformun veritabanını tamamen kaldırmak ve tüm verileri lokal dosya sisteminde tutacak bir yapıya geçiş yapmak.",
          "Yazma ve okuma işlemlerini ayırmak (CQRS / Read Replica mimarisi), transactional limitleri daraltmak ve yük testlerini otomatikleştirmek.",
          "Yazılımcıların kod yazarken veritabanı bağlantısı yapmalarını yasaklamak ve veriyi sadece bellek üzerinde (in-memory) tutmak.",
          "Gelecek yıllarda büyük indirim kampanyaları yapmaktan kaçınarak sistem yükünü doğal yollarla sınırlamak."
        ],
        correctAnswer: "Yazma ve okuma işlemlerini ayırmak (CQRS / Read Replica mimarisi), transactional limitleri daraltmak ve yük testlerini otomatikleştirmek.",
        explanation: "CQRS, Read-Write ayrımı (Read Replicas) ve veritabanı transaction optimizasyonu deadlock'ları önlemek için en kalıcı mimari çözümlerdir."
      }
    ]
  },
  {
    title: "Finansal Analist - Bütçe ve Risk Değerlendirmesi Simülasyonu",
    description: "Bu simülasyon, gelir tablosundaki karlar ile nakit akışındaki tıkanıklık çelişkilerini analiz etme ve kısa vadeli likidite krizlerini yönetme becerisini ölçer.",
    sector: "Finans, Bankacılık ve Sigortacılık",
    department: "Finans ve Muhasebe",
    roleName: "Uzman",
    difficulty: "Orta",
    competencies: ["Veri Analizi", "Problem Çözme"],
    scenarioText: "Çalıştığınız holdingin yeni yatırım yaptığı yenilenebilir enerji projesinin üçüncü çeyrek finansal raporlarını analiz ediyorsunuz. Analizleriniz sırasında, projenin nakit akışında (cash flow) ciddi bir daralma olduğunu, ancak gelir tablosunda (income statement) yüksek karlar gösterildiğini fark ettiniz. Detaylı incelemede, tahsil edilmemiş büyük alacakların 'gerçekleşen gelir' olarak kaydedildiğini ve bu durumun şirketin likidite (ödeme gücü) riskini gizlediğini tespit ettiniz. Önümüzdeki ay vadesi gelen büyük bir borç ödemesi bulunmaktadır ve eğer acil önlem alınmazsa şirket temerrüde düşebilir. Yönetim kurulu ise bu karlı tabloya güvenerek yeni bir satın alma projesi için bütçe onaylama aşamasındadır.",
    questions: [
      {
        competency: "Veri Analizi",
        text: "Gelir tablosundaki karlılık ile nakit akışındaki tıkanıklık arasındaki bu çelişkiyi yönetime nasıl sunmalısınız?",
        options: [
          "Yönetim kuruluna kar durumunu onaylayan bir sunum yapmak ve nakit sıkışıklığı detaylarını daha sonraki dönemlere bırakmak.",
          "Likidite tablosunu ve alacakların yaşlandırma raporunu netleştirerek, borç ödeme kapasitesini gösteren acil durum analizi sunmak.",
          "Şirketin muhasebe departmanını hatalı kayıt girmekle suçlayıp denetleme kuruluna resmi şikayet dilekçesi yazmak.",
          "Yeni satın alma projesine doğrudan karşı çıkarak herhangi bir finansal rapor sunmadan yatırımı bloke etmeye çalışmak."
        ],
        correctAnswer: "Likidite tablosunu ve alacakların yaşlandırma raporunu netleştirerek, borç ödeme kapasitesini gösteren acil durum analizi sunmak.",
        explanation: "Finansal analizde gerçeği yansıtmak ve riskleri veriyle ortaya koymak esastır. Alacak yaşlandırma ve likidite analizleriyle yaklaşan borç ödeme krizini ve temerrüt riskini göstermek gerekir."
      },
      {
        competency: "Problem Çözme",
        text: "Önümüzdeki ay vadesi gelen borç ödemesini karşılamak ve kısa vadeli nakit krizini çözmek için önerilmesi gereken en rasyonel finansal aksiyon hangisidir?",
        options: [
          "Bankalardan çok yüksek faizli ve kısa vadeli yeni krediler çekerek borcu borçla kapatmaya çalışmak.",
          "Şirketin elindeki tüm duran varlıkları (ofis, araç vb.) acil olarak piyasa değerinin çok altında satışa çıkarmak.",
          "Alacakların iskonto ettirilerek faktoring yoluyla tahsil edilmesi veya tedarikçilerle vade uzatımı için müzakere yapılması.",
          "Çalışanların maaş ödemelerini geçici olarak askıya alıp buradaki bütçeyi borç ödemesine aktarmak."
        ],
        correctAnswer: "Alacakların iskonto ettirilerek faktoring yoluyla tahsil edilmesi veya tedarikçilerle vade uzatımı için müzakere yapılması.",
        explanation: "Kısa vadeli likidite sıkışıklığında alacakların faktoring/iskonto ile nakde çevrilmesi veya tedarikçi vadelerinin uzatılması işletme sermayesini korumak için en standart çözümdür."
      },
      {
        competency: "Veri Analizi",
        text: "Gelecekte bu tür bir nakit akışı-karlılık uyumsuzluğu yaşanmaması için hangi finansal kontrol mekanizmasının kurulmasını önerirsiniz?",
        options: [
          "Tüm satışların sadece nakit para ile yapılmasını zorunlu kılmak ve vadeli satışı tamamen yasaklamak.",
          "Yönetimin finansal raporları incelemesini engellemek ve kararların sadece operasyonel ekiplerce alınmasını sağlamak.",
          "Tahakkuk esaslı muhasebenin yanında nakit bazlı bütçe takibi (Cash Flow Forecasting) ve alacak sigortası sistemlerini devreye almak.",
          "Şirketin tüm muhasebe yazılımlarını iptal edip kayıtları sadece elle tutulan defterlerde takip etmek."
        ],
        correctAnswer: "Tahakkuk esaslı muhasebenin yanında nakit bazlı bütçe takibi (Cash Flow Forecasting) ve alacak sigortası sistemlerini devreye almak.",
        explanation: "Nakit akışı tahmini (Cash Flow Forecasting) ve alacak sigortası, şirketlerin alacak vadeleri ile borç vadelerini eşleştirmesini ve ödeme krizlerini önlemesini sağlar."
      }
    ]
  },
  {
    title: "İK Müdürü - Stratejik Yetenek Kazanımı ve Uyum Simülasyonu",
    description: "Bu test, kilit rollerde tek bir kişiye bağımlılığı giderme ve işveren markasını agresif dış transferlere karşı koruma stratejilerini ölçer.",
    sector: "Hizmet, Sağlık ve Eğitim",
    department: "İnsan Kaynakları",
    roleName: "Müdür",
    difficulty: "Orta",
    competencies: ["Liderlik", "Problem Çözme"],
    scenarioText: "Şirketinizin kritik projelerini yürüten Yazılım Mimarı, rakip bir firmadan çok daha yüksek bir ücret teklifi aldığını belirterek istifasını sunmuştur. Bu çalışan, şirketin çekirdek sistem kodlarını tek başına yazmış olup, yerine hızlıca birini bulmak oldukça zordur. Gitmesi durumunda mevcut iki büyük müşteri projesi durma noktasına gelecektir. Ek olarak, çalışanın iş sözleşmesinde rekabet yasağı maddesi bulunmasına rağmen, bu yasanın hukuki yaptırımı ülkede zayıftır ve rakip firma çalışana hukuki koruma garantisi vermiştir. İnsan Kaynakları Müdürü olarak hem bu yetenek kaybını yönetmeli hem de operasyonların kesintiye uğramasını engellemelisiniz.",
    questions: [
      {
        competency: "Problem Çözme",
        text: "Yazılım Mimarının istifasını ve bunun getireceği operasyonel riski en aza indirmek için ilk aşamada atacağınız adım ne olmalıdır?",
        options: [
          "Çalışanın derhal şirketle ilişkisini kesmek, bilgisayarına el koymak ve tüm erişim yetkilerini o anda iptal etmek.",
          "Kritik projelerin teslim sürelerini incelemek, çalışanla kalması için makul bir karşı teklif (retention) ve bilgi transferi (onboarding/handover) süresi müzakere etmek.",
          "Çalışana rakip firmaya geçmesi durumunda dava açılacağını belirten sert bir ihtarname gönderip iletişimi sonlandırmak.",
          "Diğer çalışanların bu durumdan etkilenmesini önlemek amacıyla istifa haberini gizli tutmak ve hiçbir açıklama yapmamak."
        ],
        correctAnswer: "Kritik projelerin teslim sürelerini incelemek, çalışanla kalması için makul bir karşı teklif (retention) ve bilgi transferi (onboarding/handover) süresi müzakere etmek.",
        explanation: "Stratejik İK yönetiminde kilit çalışanların kaybında acil olarak retention (tutundurma) teklifi değerlendirilir veya en azından projelerin aksamaması için bilgi transferi (handover) süreci planlanır."
      },
      {
        competency: "Liderlik",
        text: "Kilit rollerde tek bir kişiye bağımlılığı (single point of failure) ortadan kaldırmak için orta vadede hangi İK stratejisini hayata geçirmelisiniz?",
        options: [
          "Şirketteki tüm yazılımcıların aynı kod blokları üzerinde çalışmasını zorunlu kılmak ve bireysel uzmanlaşmayı tamamen yasaklamak.",
          "Yedekleme planı (Succession Planning) hazırlamak, iş tanımlarını dokümante etmek ve çapraz eğitim (cross-training) süreçlerini başlatmak.",
          "İstifa etme potansiyeli olan çalışanları tespit edip, onlar istifa etmeden önce şirketten uzaklaştırmak.",
          "Kritik rollere sadece stajyer düzeyinde alımlar yaparak maliyetleri ve bağımlılık riskini azaltmak."
        ],
        correctAnswer: "Yedekleme planı (Succession Planning) hazırlamak, iş tanımlarını dokümante etmek ve çapraz eğitim (cross-training) süreçlerini başlatmak.",
        explanation: "Yedekleme planlaması (Succession Planning) ve çapraz eğitimler, organizasyonun kilit personel ayrılıklarından minimum seviyede etkilenmesini sağlar."
      },
      {
        competency: "Liderlik",
        text: "Rakip firmaların çalışanlarınızı agresif ücret politikalarıyla transfer etmeye çalışması karşısında işveren markasını korumak için nasıl bir aksiyon almalısınız?",
        options: [
          "Sadece maaş artışlarına odaklanarak şirketin tüm bütçesini ücret artışlarına yönlendirmek.",
          "Ücretlerin yanında yan haklar, uzaktan çalışma esnekliği, kariyer yolu netliği ve gelişim bütçesi içeren bütünsel bir değer önerisi (EVP) sunmak.",
          "Diğer şirketlerle centilmenlik anlaşmaları imzalayarak birbirinizden çalışan almayı tamamen yasaklamaya çalışmak.",
          "Dış pazardaki ücret artışlarını takip etmeyi bırakarak mevcut şirket içi dengeleri aynen korumak."
        ],
        correctAnswer: "Ücretlerin yanında yan haklar, uzaktan çalışma esnekliği, kariyer yolu netliği ve gelişim bütçesi içeren bütünsel bir değer önerisi (EVP) sunmak.",
        explanation: "Çalışan Değer Önerisi (Employee Value Proposition - EVP), yetenekleri elde tutmak için sadece nakit maaşın ötesinde gelişim, esneklik ve kültür gibi unsurları da içeren en güçlü İK aracıdır."
      }
    ]
  },
  {
    title: "Lojistik Takım Lideri - Operasyonel Kriz Simülasyonu",
    description: "Bu test, tedarik zinciri evrak/gümrük uyuşmazlığı krizlerinin, fabrika üretim hatlarını durdurmadan çözülmesini ve sürdürülebilir düzeltici eylemleri ölçer.",
    sector: "Lojistik & Tedarik",
    department: "Tedarik Zinciri ve Lojistik",
    roleName: "Takım Lideri",
    difficulty: "Orta",
    competencies: ["Kriz Yönetimi", "Problem Çözme"],
    scenarioText: "Şirketinizin en önemli otomotiv müşterisine gidecek olan kritik yedek parça sevkiyatını taşıyan tır, gümrük kapısında beklenmedik bir evrak uyuşmazlığı nedeniyle durdurulmuştur. Parçaların fabrikaya ulaşmaması durumunda, müşterinin üretim hattı 12 saat içinde duracaktır. Bu durumun şirkete cezai faturası saatlik 50.000 Dolar olup, ayrıca ciddi bir itibar kaybına yol açacaktır. Gümrük yetkilileri resmi incelemenin en az 3 iş günü süreceğini belirtmektedir. Lojistik Takım Lideri olarak bu krizi çözmeli ve hattın durmasını engellemelisiniz.",
    questions: [
      {
        competency: "Kriz Yönetimi",
        text: "Fabrika üretim hattının durmasını engellemek amacıyla acil olarak atılması gereken operasyonel adım hangisidir?",
        options: [
          "Gümrükteki tırın işlemlerinin tamamlanmasını beklemek ve müşteriye gecikme yaşanacağını e-posta ile bildirmek.",
          "Gümrük kapısına bizzat giderek yetkililerle resmi olmayan yollardan süreci hızlandırmaya çalışmak.",
          "Depodaki yedek stokları kontrol edip, kritik parçaları en hızlı alternatif taşıma türüyle (hava kargo veya ekspres kurye) sevk etmek.",
          "Otomotiv müşterisine fabrikadaki üretim hatlarını geçici olarak durdurmalarını ve bakıma almalarını önermek."
        ],
        correctAnswer: "Depodaki yedek stokları kontrol edip, kritik parçaları en hızlı alternatif taşıma türüyle (hava kargo veya ekspres kurye) sevk etmek.",
        explanation: "Üretim durma riski olduğunda lojistikte en öncelikli adım alternatif hızlı sevk (premium freight - örn. hava kargo) yöntemini kullanarak yedek stokları ulaştırmaktır."
      },
      {
        competency: "Kriz Yönetimi",
        text: "Kriz süresince gümrükteki aksaklığın ve ek nakliye maliyetlerinin finansal etkisini yönetime ve müşteriye nasıl raporlarsınız?",
        options: [
          "Ek nakliye maliyetlerini gizlemek amacıyla faturaları farklı kalemler altında muhasebeleştirmek.",
          "Krizin nedenini, alınan acil aksiyonu, ek maliyeti ve hattın durmasının engellenmesiyle kurtarılan cezai bedeli net rakamlarla sunmak.",
          "Müşteriyi ve yönetimi arayarak gümrük sisteminin yetersizliğinden şikayet etmek ve sorumluluğu üstlenmemek.",
          "Kriz tamamen çözülene kadar hiçbir finansal bilgi paylaşımında bulunmamak."
        ],
        correctAnswer: "Krizin nedenini, alınan acil aksiyonu, ek maliyeti ve hattın durmasının engellenmesiyle kurtarılan cezai bedeli net rakamlarla sunmak.",
        explanation: "Finansal kriz raporlamasında şeffaflık ve 'kurtarılan değer' (cost avoidance) analizi sunulması, ek harcama kararlarının rasyonelliğini kanıtlar."
      },
      {
        competency: "Problem Çözme",
        text: "Bu tür gümrük ve evrak krizlerinin gelecekte tekrarlanmaması için tedarik zinciri süreçlerinde yapılması gereken kalıcı iyileştirme nedir?",
        options: [
          "Gümrük gerektiren tüm uluslararası satışları iptal edip sadece iç pazara odaklanmak.",
          "Tüm evrak işlerini dış kaynaklı (outsource) bir aracıya devredip şirket içindeki takibi tamamen sonlandırmak.",
          "Evrak hazırlama süreçlerini dijitalleştirmek, gümrük öncesi otomatik kontrol (pre-clearance) ve çift imza onay mekanizması kurmak.",
          "Her tır için tüm evraklardan onar adet yedek kopya basıp tır şoförüne teslim etmek."
        ],
        correctAnswer: "Evrak hazırlama süreçlerini dijitalleştirmek, gümrük öncesi otomatik kontrol (pre-clearance) ve çift imza onay mekanizması kurmak.",
        explanation: "Süreç kontrolü ve dijital ön kontrol (pre-clearance) mekanizmaları evrak hatalarından kaynaklanan gecikme risklerini minimize eder."
      }
    ]
  }
];

async function seed() {
  console.log("Starting Seeding of Ready Tests...");
  try {
    for (const testData of readyTests) {
      // Check if test with same title already exists
      const existing = await prisma.test.findFirst({
        where: {
          title: testData.title,
          companyId: null
        }
      });

      if (existing) {
        console.log(`Test already exists: "${testData.title}". Skipping.`);
        continue;
      }

      console.log(`Creating test: "${testData.title}"...`);
      await prisma.test.create({
        data: {
          companyId: null,
          title: testData.title,
          description: testData.description,
          sector: testData.sector,
          department: testData.department,
          roleName: testData.roleName,
          difficulty: testData.difficulty,
          competencies: JSON.stringify(testData.competencies),
          scenarioText: testData.scenarioText,
          timeLimitSec: 900,
          questions: {
            create: testData.questions.map(q => ({
              type: "MULTIPLE_CHOICE",
              competency: q.competency,
              text: q.text,
              options: JSON.stringify(q.options),
              correctAnswer: q.correctAnswer,
              explanation: q.explanation
            }))
          }
        }
      });
      console.log(`Successfully created: "${testData.title}".`);
    }
    console.log("Finished Seeding Ready Tests successfully!");
  } catch (error) {
    console.error("Error seeding ready tests:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
