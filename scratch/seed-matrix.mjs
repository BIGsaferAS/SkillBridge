import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Translation map from old competency names to new ones
const nameMap = {
  "Sayısal Akıl / Nicel Düşünme": "Sayısal Düşünme",
  "Sözel Akıl / Dilsel Anlama": "Sözel Anlama",
  "Bütünsel / Sistemsel Düşünme": "Bütünsel Düşünme",
  "Yenilikçi / Yaratıcı Düşünme": "Yaratıcı Düşünme",
  "Teknik Problem Çözme (Arıza Giderme)": "Arıza Giderme",
  "Veri ile Çalışma (Data Literacy)": "Veri Okuryazarlığı",
  "Planlama ve Organizasyon": "Planlama & Org.",
  "Kalite ve Detay Duyarlılığı": "Kalite ve Detay",
  "Sürekli İyileştirme (Kaizen)": "Sürekli İyileştirme",
  "Sonuç ve Performans Takibi": "Performans Takibi",
  "Risk ve Önleyici Düşünme": "Risk Önleyici Düşünme",
  "Uyum Sağlama (Adaptasyon)": "Uyum Sağlama",
  "Müşteri / Paydaş Odaklılık": "Müşteri Odaklılık",
  "Etik ve Güvenilirlik": "Etik",
  "Öğrenme ve Gelişim": "Eğitim ve Gelişim",
  "İş Disiplini & Sorumluluk": "İş Disiplini",
  "Öz Yönetim & Önceliklendirme (Öneri)": "Önceliklendirme",
  "Karar Verme ve Sorumluluk Alma": "Sorumluluk Alma",
  "Delegasyon ve Yetki Devri": "Delegasyon",
  "Koçluk ve Ekip Geliştirme": "Koçluk & Gelişim",
  "Finansal ve İş Odaklılık": "Finansal Bakış",
  "İlişki ve Paydaş Yönetimi": "İlişki Yönetimi",
  "İnovasyon ve Sürekli İyileştirme": "İnovasyon",
  "Kriz ve Risk Yönetimi": "Kriz Yönetimi",
  "Karar Alma": "Karar Verme"
};

// 39 core competencies defined in the user request
const newCompetencies = [
  // 1. Bilişsel Yetkinlikler (Cognitive)
  {
    name: "Analitik Düşünme",
    category: "BİLİŞSEL",
    description: "Veriyi parçalara ayırarak neden–sonuç ilişkisi kurma.",
    levelA: "Neden-sonuç çıkarımı yapamaz, yoğun yönlendirme ister.",
    levelB: "Sadece basit durumlarda kısmen neden-sonuç çıkarımı yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart problemlerde beklenen düzeyde analiz yapar.",
    levelD: "Karmaşık durumlarda analiz yeteneği güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik problemlerde örnek düzeydedir, kurumsal standart geliştirir."
  },
  {
    name: "Sayısal Düşünme",
    category: "BİLİŞSEL",
    description: "İstatistiksel ve nicel bilgileri analiz etme.",
    levelA: "Sayısal veride doğru hesap/yorum yapamaz.",
    levelB: "Sadece basit durumlarda kısmen sayısal verilerle hesap yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart sayısal veride doğru çıktı üretir.",
    levelD: "Karmaşık sayısal verileri analiz etmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik sayısal veride yöntem ve standart geliştirir."
  },
  {
    name: "Sözel Anlama",
    category: "BİLİŞSEL",
    description: "Yazılı/sözlü ifadeleri doğru yorumlama.",
    levelA: "Metin/konuşmada doğru anlamlandırma görülmez.",
    levelB: "Sadece basit metinlerde/konuşmalarda kısmen anlamlandırma yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart metinlerde beklenen düzeyde sonuç çıkarır.",
    levelD: "Karmaşık metin ve konuşmaları yorumlamada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik metin/konuşmalarda kurumsal yöntem geliştirir."
  },
  {
    name: "Eleştirel Düşünme",
    category: "BİLİŞSEL",
    description: "Varsayımları sorgulama, tarafsız analiz yapma.",
    levelA: "Kanıtları sorgulama ve önyargısız yaklaşım görülmez.",
    levelB: "Sadece basit durumlarda varsayımları sorgular, tutarsızdır ve yakın takip ister.",
    levelC: "Standart varsayımları beklenen düzeyde değerlendirir.",
    levelD: "Karmaşık durumlarda tarafsız analizde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik durumlarda iyi uygulamayı kurum genelinde yaygınlaştırır."
  },
  {
    name: "Problem Çözme",
    category: "BİLİŞSEL",
    description: "Kök nedeni belirleyip uygulanabilir çözüm üretme.",
    levelA: "Kök nedeni bulma ve çözüm geliştirme görülmez.",
    levelB: "Sadece basit sorunlarda kök nedeni kısmen bulup çözebilir, tutarsızdır ve yakın takip ister.",
    levelC: "Standart işlerde kök nedeni bulur ve doğru çıktı üretir.",
    levelD: "Karmaşık sorunlarda kök neden analizinde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik işlerde yöntem geliştirir, kuruma yaygınlaştırır."
  },
  {
    name: "Öğrenme Çevikliği",
    category: "BİLİŞSEL",
    description: "Yeni durumlara adapte olma, deneyimden öğrenme.",
    levelA: "Yeni durumlarda hızlı öğrenme ve aktarım görülmez.",
    levelB: "Sadece basit yeniliklerde kısmen adapte olup öğrenir, tutarsızdır ve yakın takip ister.",
    levelC: "Standart yeni durumlarda beklenen düzeyde öğrenir ve uygular.",
    levelD: "Karmaşık yeni durumlara adapte olmada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik yeni durumlarda yöntem geliştirir ve öncülük eder."
  },
  {
    name: "Karar Verme",
    category: "BİLİŞSEL",
    description: "Riskleri değerlendirerek zamanında karar alma.",
    levelA: "Belirsizlikte risk analizi ve karar alma görülmez.",
    levelB: "Sadece basit belirsizliklerde kısmen karar alır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart belirsizliklerde zamanında ve doğru karar alır.",
    levelD: "Karmaşık riskli durumlarda karar almada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik belirsizliklerde yöntem geliştirir ve kuruma yayar."
  },
  {
    name: "Bütünsel Düşünme",
    category: "BİLİŞSEL",
    description: "Süreçler arası bağlantıları ve büyük resmi görme.",
    levelA: "Parçalar arası etkiyi ve bütünsel yapıyı göremez.",
    levelB: "Sadece basit süreçler arasındaki bağlantıları kısmen görür, tutarsızdır ve yakın takip ister.",
    levelC: "Standart süreçlerde parçalar arası etkiyi doğru değerlendirir.",
    levelD: "Karmaşık süreçlerde büyük resmi görmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik süreçlerde iyi uygulamayı kurum genelinde yaygınlaştırır."
  },
  {
    name: "Yaratıcı Düşünme",
    category: "BİLİŞSEL",
    description: "Alışılmadık ve yenilikçi çözümler üretme.",
    levelA: "İyileştirme ararken alışılmadık fikir üretemez.",
    levelB: "Sadece basit durumlarda kısmen yenilikçi fikirler sunar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart iyileştirmelerde beklenen düzeyde fikir üretir.",
    levelD: "Karmaşık problemlerde yenilikçi çözümlerde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik durumlarda yöntem geliştirir ve kültürü yaygınlaştırır."
  },
  {
    name: "Dikkat ve Odaklanma",
    category: "BİLİŞSEL",
    description: "Uzun süreli görevlerde dikkati sürdürme.",
    levelA: "Uzun işlerde dikkati sürdürme and hatasızlık görülmez.",
    levelB: "Sadece basit ve kısa süreli işlerde odaklanır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart uzun işlerde zamanında ve doğru çıktı üretir.",
    levelD: "Karmaşık ve uzun süreli işlerde dikkati sürdürmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik uzun işlerde standart geliştirir, kuruma yayar."
  },

  // 2. Teknik Yetkinlikler (Technical)
  {
    name: "Arıza Giderme",
    category: "TEKNİK",
    description: "Sorunları sistematik analiz edip teknik çözüm bulma.",
    levelA: "Teknik sorunda kök neden analizi ve kalıcı çözüm görülmez.",
    levelB: "Sadece basit teknik sorunları kısmen çözer, tutarsızdır ve yakın takip ister.",
    levelC: "Standart teknik sorunlarda doğru ve zamanında aksiyon alır.",
    levelD: "Karmaşık teknik arızaları gidermede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik teknik sorunlarda kurumsal standart ve yöntem geliştirir."
  },
  {
    name: "Veri Okuryazarlığı",
    category: "TEKNİK",
    description: "Veriyi doğru toplama, doğrulama ve raporlama.",
    levelA: "Raporlama/ölçümde veriyi toplama ve kullanma görülmez.",
    levelB: "Sadece basit verileri kısmen toplar ve raporlar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart raporlamada kurallara uyar, doğru çıktı üretir.",
    levelD: "Karmaşık veri analizinde ve doğrulamada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik ölçümlerde yöntem geliştirir ve kuruma yayar."
  },
  {
    name: "Süreç Odaklılık",
    category: "TEKNİK",
    description: "Darboğazları görme ve iyileştirme önerme.",
    levelA: "İş akışlarında süreç adımlarını ve darboğazları göremez.",
    levelB: "Sadece basit iş akışlarında adımları kısmen takip eder, tutarsızdır ve yakın takip ister.",
    levelC: "Standart iş akışlarında süreç adımlarını görünür kılar.",
    levelD: "Karmaşık süreçlerde darboğazları görmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik iş akışlarında yöntem/standart geliştirir."
  },
  {
    name: "Planlama & Org.",
    category: "TEKNİK",
    description: "Zamanı, kaynakları ve öncelikleri yönetme.",
    levelA: "Görev yönetiminde öncelik ve takvim planlaması yoktur.",
    levelB: "Sadece basit günlük planlama yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart görev yönetiminde zamanında ve doğru plan yapar.",
    levelD: "Karmaşık projelerin planlanması ve organizasyonunda güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik görev yönetiminde kurumsal standart geliştirir."
  },
  {
    name: "Kalite ve Detay",
    category: "TEKNİK",
    description: "Standartlara uyma, işi ilk seferde doğru yapma.",
    levelA: "Teslimat ve standart uyumu çoğunlukla görülmez.",
    levelB: "Sadece basit işlerde standartlara kısmen uyar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart teslimatlarda kurallara uyar, doğru iş üretir.",
    levelD: "Karmaşık teslimatlarda kalite ve detay duyarlılığı güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik teslimatlarda kurum genelinde standart geliştirir."
  },
  {
    name: "Dijital Yetkinlik",
    category: "TEKNİK",
    description: "Teknolojik araçları etkin ve güvenli kullanma.",
    levelA: "Dijital araç kullanımı ve veri güvenliği uyumu görülmez.",
    levelB: "Sadece basit dijital araçları kısmen kullanır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart dijital araçları etkin kullanır, kurallara uyar.",
    levelD: "Karmaşık dijital sistemleri kullanmada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik dijital araçlarda yöntem/standart geliştirir."
  },
  {
    name: "Sürekli İyileştirme",
    category: "TEKNİK",
    description: "Süreçlerde küçük ama etkili (Kaizen) değişimler yapma.",
    levelA: "Operasyonda küçük sürekli iyileştirmeler tasarlayamaz.",
    levelB: "Sadece basit iyileştirme fikirleri sunar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart operasyonlarda beklenen düzeyde Kaizen uygular.",
    levelD: "Karmaşık süreçlerde sürekli iyileştirme uygulamada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik operasyonel iyileştirme yöntemleri geliştirir."
  },
  {
    name: "Performans Takibi",
    category: "TEKNİK",
    description: "KPI takibi yapma ve sapmalara önlem alma.",
    levelA: "Hedef takibinde KPI izleme ve aksiyon alma görülmez.",
    levelB: "Sadece basit KPI'ları kısmen takip eder, tutarsızdır ve yakın takip ister.",
    levelC: "Standart hedef takibini doğru ve zamanında yapar.",
    levelD: "Karmaşık KPI takibinde ve sapmaları yönetmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik KPI takibinde yöntem geliştirir ve kuruma yayar."
  },
  {
    name: "Risk Önleyici Düşünme",
    category: "TEKNİK",
    description: "Riskleri öngörüp kriz çıkmadan planlama yapma.",
    levelA: "Riskli işlerde risk öngörüsü ve planlama görülmez.",
    levelB: "Sadece basit risk durumlarında kısmen önlem alır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart riskli işlerde beklenen düzeyde önleyici plan yapar.",
    levelD: "Karmaşık durumlarda risk analizi ve yönetiminde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik riskli durumlarda kurumsal standart geliştirir."
  },

  // 3. Temel Yetkinlikler (Core)
  {
    name: "İletişim",
    category: "TEMEL",
    description: "Açık, net, saygılı ve etkin iletişim kurma.",
    levelA: "Günlük iletişimde netlik ve saygı çoğunlukla görülmez.",
    levelB: "Sadece basit durumlarda kısmen açık iletişim kurar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart günlük iletişimde doğru ve zamanında iletişim kurur.",
    levelD: "Karmaşık iletişim durumlarında ve krizlerde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik iletişim süreçlerinde kurum genelinde standart belirler."
  },
  {
    name: "Takım Çalışması",
    category: "TEMEL",
    description: "Ortak amaç için işbirliği ve bilgi paylaşımı.",
    levelA: "Ekip çalışmalarında işbirliği ve paylaşım görülmez.",
    levelB: "Sadece basit ekip görevlerinde kısmen uyumludur, tutarsızdır ve yakın takip ister.",
    levelC: "Standart ekip çalışmalarında uyumludur, kurallara uyar.",
    levelD: "Karmaşık ekip çalışmalarında işbirliğinde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik ekip çalışmalarında iyi uygulamaları kuruma yayar."
  },
  {
    name: "Sonuç Odaklılık",
    category: "TEMEL",
    description: "Hedefe ulaşmak için planlı ve kararlı ilerleme.",
    levelA: "Hedefe ulaşmak için planlı ve kararlı ilerleme.",
    levelB: "Sadece basit hedeflerde kısmen çıktı üretir, tutarsızdır ve yakın takip ister.",
    levelC: "Standart hedefli işlerde zamanında ve doğru çıktı üretir.",
    levelD: "Karmaşık hedeflere ulaşmada ve kararlılıkta güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik hedefli işlerde yöntem geliştirir, kuruma yayar."
  },
  {
    name: "Uyum Sağlama",
    category: "TEMEL",
    description: "Değişen koşullara esneklik, belirsizlikte sakinlik.",
    levelA: "Değişimde esnek davranma ve belirsizliği yönetme yoktur.",
    levelB: "Sadece basit değişikliklerde kısmen uyum sağlar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart değişim süreçlerinde beklenen düzeyde uyum sağlar.",
    levelD: "Karmaşık değişim ve belirsizlikleri yönetmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik değişim süreçlerinde yöntem geliştirir ve liderlik eder."
  },
  {
    name: "Müşteri Odaklılık",
    category: "TEMEL",
    description: "İç/dış müşterinin ihtiyacını anlama, güven verme.",
    levelA: "Paydaş ilişkilerinde ihtiyacı anlayıp çözüm üretemez.",
    levelB: "Sadece basit müşteri taleplerini kısmen karşılar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart paydaş ilişkilerinde doğru ve zamanında çözüm üretir.",
    levelD: "Karmaşık paydaş ilişkilerinde güven oluşturmada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik paydaş ilişkilerinde kurumsal yöntem geliştirir."
  },
  {
    name: "Etik",
    category: "TEMEL",
    description: "Dürüst, adil, sorumluluk sahibi ve gizliliğe uygun çalışma.",
    levelA: "Güven gerektiren işlerde dürüstlük ve gizlilik görülmez.",
    levelB: "Sadece basit etik durumlarda kurallara kısmen uyar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart güven gerektiren işlerde kurallara tam uyar.",
    levelD: "Karmaşık durumlarda etik değerlere bağlılığı güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik etik durumlarda kurumsal standart ve yöntem geliştirir."
  },
  {
    name: "Eğitim ve Gelişim",
    category: "TEMEL",
    description: "Kendi gelişimine yatırım yapma, geri bildirimi kullanma.",
    levelA: "Geri bildirimle gelişme ve öğrenmeyi sürdürme görülmez.",
    levelB: "Sadece basit kişisel gelişim adımları atar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart kişisel gelişim süreçlerinde beklenen düzeydedir.",
    levelD: "Kendi ve başkalarının gelişiminde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik gelişim süreçlerinde yöntem geliştirir, kuruma yayar."
  },
  {
    name: "İnisiyatif Alma",
    category: "TEMEL",
    description: "Sorumluluk üstlenme, fırsatları görüp harekete geçme.",
    levelA: "Fırsat/sorun anında sorumluluk alıp harekete geçmez.",
    levelB: "Sadece basit durumlarda kısmen sorumluluk alır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart durumlarda zamanında sorumluluk alıp çıktı üretir.",
    levelD: "Karmaşık durumlarda inisiyatif alıp harekete geçmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik sorunlarda sorumluluk alır, kurumsal yöntem geliştirir."
  },
  {
    name: "İş Disiplini",
    category: "TEMEL",
    description: "Çalışma düzenine, İSG ve kalite kurallarına uyum.",
    levelA: "Takip, zamanında teslim ve kurallara uyum görülmez.",
    levelB: "Sadece basit kurallara kısmen uyar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart iş düzeninde kurallara tam uyar, zamanında teslim eder.",
    levelD: "Karmaşık iş disiplini ve kurallara uyumda güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik iş düzeni ve İSG süreçlerinde standart geliştirir."
  },
  {
    name: "Önceliklendirme",
    category: "TEMEL",
    description: "Zaman/enerji yönetimi, gerçekçi taahhütler planlama.",
    levelA: "Yoğun gündem altında önceliklendirme yapamaz, odak dağılır.",
    levelB: "Sadece basit günlük işlerde önceliklendirme yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart yoğun gündemde odağını korur, zamanında teslim eder.",
    levelD: "Karmaşık ve yoğun iş ortamlarında önceliklendirmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik yoğun ortamlarda yöntem geliştirir ve kuruma yayar."
  },

  // 4. Yönetsel Yetkinlikler (Managerial)
  {
    name: "Stratejik Düşünme",
    category: "YÖNETSEL",
    description: "Büyük resmi görme, uzun vadeli hedef-plan dengesi.",
    levelA: "Yönetsel planlamada büyük resmi ve öncelikleri göremez.",
    levelB: "Sadece basit yönetsel durumlarda kısmen büyük resmi görür, tutarsızdır ve yakın takip ister.",
    levelC: "Standart yönetsel planlamada beklenen düzeyde öncelik belirler.",
    levelD: "Karmaşık yönetsel durumlarda stratejik planlamada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik planlamalarda kurumsal strateji ve yöntem geliştirir."
  },
  {
    name: "Vizyoner Liderlik",
    category: "YÖNETSEL",
    description: "İnsanları ortak hedefe odaklama, ilham verme.",
    levelA: "Ekip yönetiminde ilham verme ve hizalama görülmez.",
    levelB: "Sadece basit ekipleri kısmen hizalar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart ekipleri ortak hedefe başarıyla hizalar.",
    levelD: "Karmaşık ekiplere ilham verme ve yön göstermede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik durumlarda ilham verir, iyi uygulamaları kuruma yayar."
  },
  {
    name: "Sorumluluk Alma",
    category: "YÖNETSEL",
    description: "Veriye dayalı karar alıp sonuçlarını üstlenme.",
    levelA: "Kritik kararlarda veriye dayanma ve sahiplenme görülmez.",
    levelB: "Sadece basit kararlarda sorumluluk alır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart kritik kararlarda sorumluluk alır, doğru çıktı üretir.",
    levelD: "Karmaşık kararlarda sorumluluk almada ve sahiplenmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik durumlarda sorumluluk alır, kurumsal standart geliştirir."
  },
  {
    name: "Delegasyon",
    category: "YÖNETSEL",
    description: "Doğru kişiye doğru işi verme, güvenle kontrol etme.",
    levelA: "İş dağıtımında doğru kişiyi seçme ve güvenle takip yoktur.",
    levelB: "Sadece basit iş dağıtımlarında kısmen takip yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart iş dağıtımında kurallara uyar, zamanında takip eder.",
    levelD: "Karmaşık iş dağıtımı ve delegasyonda güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik delegasyon süreçlerinde kurumsal yöntem geliştirir."
  },
  {
    name: "Koçluk & Gelişim",
    category: "YÖNETSEL",
    description: "Geri bildirimle ekibin potansiyelini açığa çıkarma.",
    levelA: "İnsan gelişiminde geri bildirim verme ve büyütme görülmez.",
    levelB: "Sadece basit durumlarda kısmen koçluk yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart insan gelişim süreçlerini beklenen düzeyde yürütür.",
    levelD: "Karmaşık gelişim ve koçluk süreçlerinde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik insan gelişimi süreçlerinde kurumsal standart geliştirir."
  },
  {
    name: "Değişim Yönetimi",
    category: "YÖNETSEL",
    description: "Değişimi şeffaf anlatma, direnci yönetme.",
    levelA: "Dönüşüm süreçlerinde değişimi anlatma ve direnç yönetimi yoktur.",
    levelB: "Sadece basit değişimlerde şeffaflık sağlar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart dönüşüm projelerinde beklenen düzeyde uyum sağlar.",
    levelD: "Karmaşık değişim süreçlerini yönetmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik dönüşümlerde liderlik eder, kurumsal yöntem geliştirir."
  },
  {
    name: "Finansal Bakış",
    category: "YÖNETSEL",
    description: "Bütçe, gider ve maliyet-fayda yönetimi.",
    levelA: "İş performansında maliyet-fayda odaklı kaynak yönetimi yoktur.",
    levelB: "Sadece basit harcamalarda bütçeyi kısmen yönetir, tutarsızdır ve yakın takip ister.",
    levelC: "Standart iş performansında bütçeyi doğru yönetir.",
    levelD: "Karmaşık finansal süreçlerde kaynak yönetiminde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik finansal/kaynak süreçlerinde kurumsal standart üretir."
  },
  {
    name: "İlişki Yönetimi",
    category: "YÖNETSEL",
    description: "Paydaşlarla güvene dayalı işbirliği geliştirme.",
    levelA: "Paydaş yönetiminde güven kurma ve işbirliği görülmez.",
    levelB: "Sadece basit paydaş ilişkilerini yönetir, tutarsızdır ve yakın takip ister.",
    levelC: "Standart paydaş süreçlerinde uyumlu ve zamanında iş yapar.",
    levelD: "Karmaşık paydaş yönetiminde işbirliğini geliştirmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik paydaş yönetiminde kurumsal ağlar ve yöntem geliştirir."
  },
  {
    name: "İnovasyon",
    category: "YÖNETSEL",
    description: "Süreçleri sorgulama, yenilikçi fikirleri teşvik etme.",
    levelA: "Yenilik kültüründe fikirleri teşvik etme ve uygulama yoktur.",
    levelB: "Sadece basit fikirleri kısmen teşvik eder, tutarsızdır ve yakın takip ister.",
    levelC: "Standart yenilik süreçlerinde kurallara uyar, çıktı üretir.",
    levelD: "Karmaşık yenilik süreçlerini teşvik etmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik yenilik süreçlerinde kurumsal kültür ve yöntem geliştirir."
  },
  {
    name: "Kriz Yönetimi",
    category: "YÖNETSEL",
    description: "Kriz anında soğukkanlı yönlendirme ve öğrenim çıkarma.",
    levelA: "Kriz anında risk yönetimi ve soğukkanlılık görülmez.",
    levelB: "Sadece basit kriz anlarında yönlendirme yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart kriz anlarında kurallara uyar, doğru yönlendirir.",
    levelD: "Karmaşık kriz ve risk yönetiminde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik kriz anlarında kurumsal yön belirler ve standart geliştirir."
  }
];

async function main() {
  console.log("--- STARTING MATRIX INTEGRATION ---");

  // 1. Update Questions table using nameMap
  console.log("Updating Question competencies...");
  let questionUpdateCount = 0;
  for (const [oldName, newName] of Object.entries(nameMap)) {
    const updated = await prisma.question.updateMany({
      where: { competency: oldName },
      data: { competency: newName }
    });
    if (updated.count > 0) {
      console.log(`Updated ${updated.count} questions from "${oldName}" to "${newName}"`);
      questionUpdateCount += updated.count;
    }
  }
  console.log(`Total questions updated: ${questionUpdateCount}`);

  // 2. Update Tests table using nameMap (competencies JSON string)
  console.log("Updating Test competencies JSON lists...");
  const tests = await prisma.test.findMany();
  let testUpdateCount = 0;
  for (const test of tests) {
    if (test.competencies) {
      try {
        let list = JSON.parse(test.competencies);
        if (Array.isArray(list)) {
          let changed = false;
          const newList = list.map(c => {
            if (nameMap[c]) {
              changed = true;
              return nameMap[c];
            }
            return c;
          });
          if (changed) {
            await prisma.test.update({
              where: { id: test.id },
              data: { competencies: JSON.stringify(newList) }
            });
            console.log(`Updated test "${test.title}" competencies list:`, newList);
            testUpdateCount++;
          }
        }
      } catch (e) {
        console.error(`Error updating test ${test.id} JSON:`, e);
      }
    }
  }
  console.log(`Total tests updated: ${testUpdateCount}`);

  // 3. Keep the 4 custom developer competencies (Frontend, Backend, DB, UI/UX)
  console.log("Fetching custom developer competencies to preserve...");
  const devComps = await prisma.competency.findMany({
    where: {
      name: {
        in: ["Frontend Geliştirme", "Backend Geliştirme", "Veri Tabanı Yönetimi", "UI/UX Tasarım"]
      }
    }
  });
  console.log(`Found ${devComps.length} developer competencies.`);

  // 4. Delete deprecated or renamed competencies
  console.log("Deleting old competencies...");
  // Core names we want to keep are newCompetencies names + developer competencies names
  const namesToKeep = [...newCompetencies.map(c => c.name), ...devComps.map(c => c.name)];
  const deleteResult = await prisma.competency.deleteMany({
    where: {
      name: {
        notIn: namesToKeep
      }
    }
  });
  console.log(`Deleted ${deleteResult.count} deprecated competencies.`);

  // 5. Upsert 39 new competencies
  console.log("Upserting 39 new competencies...");
  for (const comp of newCompetencies) {
    const causeEffect = `Sebep: ${comp.name} becerisinin uygulanması. Sonuç: ${comp.category} alanında yüksek performans ve hata azaltımı.`;
    await prisma.competency.upsert({
      where: { name: comp.name },
      update: {
        description: comp.description,
        category: comp.category,
        causeEffect: causeEffect,
        levelA: comp.levelA,
        levelB: comp.levelB,
        levelC: comp.levelC,
        levelD: comp.levelD,
        levelE: comp.levelE
      },
      create: {
        name: comp.name,
        category: comp.category,
        description: comp.description,
        causeEffect: causeEffect,
        levelA: comp.levelA,
        levelB: comp.levelB,
        levelC: comp.levelC,
        levelD: comp.levelD,
        levelE: comp.levelE
      }
    });
    console.log(`Upserted core competency: ${comp.name}`);
  }

  // 6. Ensure 4 developer competencies are present and updated with standard level templates if they are missing
  console.log("Re-verifying developer competencies...");
  const devCompsData = [
    {
      name: "Frontend Geliştirme",
      category: "TEKNİK",
      description: "Tasarım arayüzlerini responsive, mobil uyumlu ve performanslı bir şekilde koda dökme; API entegrasyonu ve form doğrulamalarını yönetme.",
      levelA: "Tasarımları koda dökme, mobil uyumluluk ve API entegrasyonu çoğunlukla gerçekleştirilemez. Sık hata yapılır; yoğun rehberlik gerekir.",
      levelB: "Basit arayüzleri koda dökme ve API entegrasyonunu kısmen yapar, ancak uyumluluk sorunları yaşar. Sık kontrol ve şablon desteği ister.",
      levelC: "Standart arayüz tasarımlarını pikseli pikseline responsive koda döker ve API entegrasyonlarını sorunsuz tamamlar. Kurallara ve standartlara uyar.",
      levelD: "Karmaşık ve dinamik arayüzleri yüksek performansla kodlar, gelişmiş durum yönetimi ve API entegrasyonları kurar. Başkalarına teknik destek sağlar.",
      levelE: "Kritik ön yüz mimarileri, performans optimizasyonları ve mikro-frontend yapıları tasarlar; standartları belirler. İyi uygulamaları kurum genelinde yayar."
    },
    {
      name: "Backend Geliştirme",
      category: "TEKNİK",
      description: "Güvenli, hızlı ve ölçeklenebilir API mimarileri tasarlama; yetkilendirme (Auth), iş mantığı servisleri ve hata/loglama altyapılarını kurgulama.",
      levelA: "API geliştirme, iş mantığı kurma ve güvenlik yetkilendirmeleri çoğunlukla gerçekleştirilemez. Sık çökmeler yaşanır; yoğun yönlendirme gerekir.",
      levelB: "Basit API'ler ve temel iş mantıklarını kısmen yazar, ancak güvenlik ve hata yönetiminde eksikleri vardır. Şablon ve sık kontrol ister.",
      levelC: "Standart REST/GraphQL API'leri, JWT/OAuth yetkilendirmelerini ve hata yönetimi akışlarını beklenen düzeyde yazar. Kurallara uyar.",
      levelD: "Karmaşık iş mantıklarını, yüksek performanslı API mimarilerini ve gelişmiş hata loglama sistemlerini kurgular. Proaktif iyileştirmeler yapar.",
      levelE: "Kritik mikroservis mimarileri, yüksek işlem hacimli API optimizasyonları ve güvenlik standartları geliştirir. Yöntem ve standart belirler."
    },
    {
      name: "Veri Tabanı Yönetimi",
      category: "TEKNİK",
      description: "Veri tabanı şemalarını tasarlama, tablolar arası ilişkileri kurma, migrations yönetimi ve sorgu optimizasyonu (indexing) sağlama.",
      levelA: "Veri tabanı şeması çıkarma, migrations yönetme ve sorguları optimize etme çoğunlukla gerçekleştirilemez. Yoğun yönlendirme gerekir.",
      levelB: "Basit tablo ilişkilerini ve temel sorguları kısmen yazar, ancak büyük verilerde performans sorunu yaşar. Sık kontrol ve rehberlik ister.",
      levelC: "Standart ilişkisel veri tabanı şemalarını tasarlar, migration'ları hatasız yönetir ve standart sorgu indekslemelerini beklenen düzeyde yapar.",
      levelD: "Karmaşık şemaları ve tablo ilişkilerini tasarlar, performans darboğazlarını analiz ederek gelişmiş sorgu optimizasyonları sunar.",
      levelE: "Kurumsal ölçekte veri tabanı mimarileri, otomatik yedekleme/kurtarma planları ve veri güvenliği standartları geliştirir. Standartları koyar."
    },
    {
      name: "UI/UX Tasarım",
      category: "TEKNİK",
      description: "Kullanıcı deneyimini mükemmelleştirme, kullanıcı akışlarını (user flows) basitleştirme ve ortak tasarım sistemini (Design System) kurup yönetme.",
      levelA: "Görsel eksikleri saptama, kullanıcı akışlarını sadeleştirme ve ortak tasarım sistemi kurma çoğunlukla gerçekleştirilemez. Yoğun yönlendirme gerekir.",
      levelB: "Basit ekran tasarımlarını ve temel akışları kısmen hazırlar, ancak tutarsızlıklar ve UX engelleri bulunur. Sık kontrol ve rehberlik ister.",
      levelC: "Arayüzdeki görsel kusurları giderir, kullanıcı akışlarını basitleştirir ve ortak bileşen kütüphanesini (Design System) beklenen düzeyde yönetir.",
      levelD: "Karmaşık kullanıcı akış şemalarını tasarlar, gelişmiş kullanıcı araştırmaları yaparak dönüşüm oranlarını artıracak UX çözümleri üretir.",
      levelE: "Marka kimliğine uygun sıfırdan kapsamlı tasarım sistemleri, vizyoner kullanıcı deneyimi modelleri ve tasarım standartları geliştirir."
    }
  ];

  for (const comp of devCompsData) {
    const causeEffect = `Sebep: ${comp.name} becerisinin uygulanması. Sonuç: ${comp.category} alanında yüksek performans ve hata azaltımı.`;
    await prisma.competency.upsert({
      where: { name: comp.name },
      update: {
        description: comp.description,
        category: comp.category,
        causeEffect: causeEffect,
        levelA: comp.levelA,
        levelB: comp.levelB,
        levelC: comp.levelC,
        levelD: comp.levelD,
        levelE: comp.levelE
      },
      create: {
        name: comp.name,
        category: comp.category,
        description: comp.description,
        causeEffect: causeEffect,
        levelA: comp.levelA,
        levelB: comp.levelB,
        levelC: comp.levelC,
        levelD: comp.levelD,
        levelE: comp.levelE
      }
    });
    console.log(`Upserted developer competency: ${comp.name}`);
  }

  // 7. Print total competency count in database
  const totalCount = await prisma.competency.count();
  console.log(`--- SEED COMPLETE ---`);
  console.log(`Total Competencies in DB: ${totalCount} (should be 43: 39 core + 4 developer comps)`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
