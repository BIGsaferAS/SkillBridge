import fs from 'fs';

const newCompetencies = [
  // 1. Bilişsel Yetkinlikler (Cognitive)
  {
    category: "Bilişsel Yetkinlikler",
    name: "Analitik Düşünme",
    description: "Veriyi parçalara ayırarak neden–sonuç ilişkisi kurma.",
    levelA: "Neden-sonuç çıkarımı yapamaz, yoğun yönlendirme ister.",
    levelB: "Sadece basit durumlarda kısmen neden-sonuç çıkarımı yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart problemlerde beklenen düzeyde analiz yapar.",
    levelD: "Karmaşık durumlarda analiz yeteneği güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik problemlerde örnek düzeydedir, kurumsal standart geliştirir."
  },
  {
    category: "Bilişsel Yetkinlikler",
    name: "Sayısal Düşünme",
    description: "İstatistiksel ve nicel bilgileri analiz etme.",
    levelA: "Sayısal veride doğru hesap/yorum yapamaz.",
    levelB: "Sadece basit durumlarda kısmen sayısal verilerle hesap yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart sayısal veride doğru çıktı üretir.",
    levelD: "Karmaşık sayısal verileri analiz etmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik sayısal veride yöntem ve standart geliştirir."
  },
  {
    category: "Bilişsel Yetkinlikler",
    name: "Sözel Anlama",
    description: "Yazılı/sözlü ifadeleri doğru yorumlama.",
    levelA: "Metin/konuşmada doğru anlamlandırma görülmez.",
    levelB: "Sadece basit metinlerde/konuşmalarda kısmen anlamlandırma yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart metinlerde beklenen düzeyde sonuç çıkarır.",
    levelD: "Karmaşık metin ve konuşmaları yorumlamada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik metin/konuşmalarda kurumsal yöntem geliştirir."
  },
  {
    category: "Bilişsel Yetkinlikler",
    name: "Eleştirel Düşünme",
    description: "Varsayımları sorgulama, tarafsız analiz yapma.",
    levelA: "Kanıtları sorgulama ve önyargısız yaklaşım görülmez.",
    levelB: "Sadece basit durumlarda varsayımları sorgular, tutarsızdır ve yakın takip ister.",
    levelC: "Standart varsayımları beklenen düzeyde değerlendirir.",
    levelD: "Karmaşık durumlarda tarafsız analizde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik durumlarda iyi uygulamayı kurum genelinde yaygınlaştırır."
  },
  {
    category: "Bilişsel Yetkinlikler",
    name: "Problem Çözme",
    description: "Kök nedeni belirleyip uygulanabilir çözüm üretme.",
    levelA: "Kök nedeni bulma ve çözüm geliştirme görülmez.",
    levelB: "Sadece basit sorunlarda kök nedeni kısmen bulup çözebilir, tutarsızdır ve yakın takip ister.",
    levelC: "Standart işlerde kök nedeni bulur ve doğru çıktı üretir.",
    levelD: "Karmaşık sorunlarda kök neden analizinde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik işlerde yöntem geliştirir, kuruma yaygınlaştırır."
  },
  {
    category: "Bilişsel Yetkinlikler",
    name: "Öğrenme Çevikliği",
    description: "Yeni durumlara adapte olma, deneyimden öğrenme.",
    levelA: "Yeni durumlarda hızlı öğrenme ve aktarım görülmez.",
    levelB: "Sadece basit yeniliklerde kısmen adapte olup öğrenir, tutarsızdır ve yakın takip ister.",
    levelC: "Standart yeni durumlarda beklenen düzeyde öğrenir ve uygular.",
    levelD: "Karmaşık yeni durumlara adapte olmada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik yeni durumlarda yöntem geliştirir ve öncülük eder."
  },
  {
    category: "Bilişsel Yetkinlikler",
    name: "Karar Verme",
    description: "Riskleri değerlendirerek zamanında karar alma.",
    levelA: "Belirsizlikte risk analizi ve karar alma görülmez.",
    levelB: "Sadece basit belirsizliklerde kısmen karar alır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart belirsizliklerde zamanında ve doğru karar alır.",
    levelD: "Karmaşık riskli durumlarda karar almada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik belirsizliklerde yöntem geliştirir ve kuruma yayar."
  },
  {
    category: "Bilişsel Yetkinlikler",
    name: "Bütünsel Düşünme",
    description: "Süreçler arası bağlantıları ve büyük resmi görme.",
    levelA: "Parçalar arası etkiyi ve bütünsel yapıyı göremez.",
    levelB: "Sadece basit süreçler arasındaki bağlantıları kısmen görür, tutarsızdır ve yakın takip ister.",
    levelC: "Standart süreçlerde parçalar arası etkiyi doğru değerlendirir.",
    levelD: "Karmaşık süreçlerde büyük resmi görmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik süreçlerde iyi uygulamayı kurum genelinde yaygınlaştırır."
  },
  {
    category: "Bilişsel Yetkinlikler",
    name: "Yaratıcı Düşünme",
    description: "Alışılmadık ve yenilikçi çözümler üretme.",
    levelA: "İyileştirme ararken alışılmadık fikir üretemez.",
    levelB: "Sadece basit durumlarda kısmen yenilikçi fikirler sunar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart iyileştirmelerde beklenen düzeyde fikir üretir.",
    levelD: "Karmaşık problemlerde yenilikçi çözümlerde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik durumlarda yöntem geliştirir ve kültürü yaygınlaştırır."
  },
  {
    category: "Bilişsel Yetkinlikler",
    name: "Dikkat ve Odaklanma",
    description: "Uzun süreli görevlerde dikkati sürdürme.",
    levelA: "Uzun işlerde dikkati sürdürme and hatasızlık görülmez.",
    levelB: "Sadece basit ve kısa süreli işlerde odaklanır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart uzun işlerde zamanında ve doğru çıktı üretir.",
    levelD: "Karmaşık ve uzun süreli işlerde dikkati sürdürmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik uzun işlerde standart geliştirir, kuruma yayar."
  },

  // 2. Teknik Yetkinlikler (Technical)
  {
    category: "Teknik Yetkinlikler",
    name: "Arıza Giderme",
    description: "Sorunları sistematik analiz edip teknik çözüm bulma.",
    levelA: "Teknik sorunda kök neden analizi ve kalıcı çözüm görülmez.",
    levelB: "Sadece basit teknik sorunları kısmen çözer, tutarsızdır ve yakın takip ister.",
    levelC: "Standart teknik sorunlarda doğru ve zamanında aksiyon alır.",
    levelD: "Karmaşık teknik arızaları gidermede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik teknik sorunlarda kurumsal standart ve yöntem geliştirir."
  },
  {
    category: "Teknik Yetkinlikler",
    name: "Veri Okuryazarlığı",
    description: "Veriyi doğru toplama, doğrulama ve raporlama.",
    levelA: "Raporlama/ölçümde veriyi toplama ve kullanma görülmez.",
    levelB: "Sadece basit verileri kısmen toplar ve raporlar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart raporlamada kurallara uyar, doğru çıktı üretir.",
    levelD: "Karmaşık veri analizinde ve doğrulamada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik ölçümlerde yöntem geliştirir ve kuruma yayar."
  },
  {
    category: "Teknik Yetkinlikler",
    name: "Süreç Odaklılık",
    description: "Darboğazları görme ve iyileştirme önerme.",
    levelA: "İş akışlarında süreç adımlarını ve darboğazları göremez.",
    levelB: "Sadece basit iş akışlarında adımları kısmen takip eder, tutarsızdır ve yakın takip ister.",
    levelC: "Standart iş akışlarında süreç adımlarını görünür kılar.",
    levelD: "Karmaşık süreçlerde darboğazları görmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik iş akışlarında yöntem/standart geliştirir."
  },
  {
    category: "Teknik Yetkinlikler",
    name: "Planlama & Org.",
    description: "Zamanı, kaynakları ve öncelikleri yönetme.",
    levelA: "Görev yönetiminde öncelik ve takvim planlaması yoktur.",
    levelB: "Sadece basit günlük planlama yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart görev yönetiminde zamanında ve doğru plan yapar.",
    levelD: "Karmaşık projelerin planlanması ve organizasyonunda güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik görev yönetiminde kurumsal standart geliştirir."
  },
  {
    category: "Teknik Yetkinlikler",
    name: "Kalite ve Detay",
    description: "Standartlara uyma, işi ilk seferde doğru yapma.",
    levelA: "Teslimat ve standart uyumu çoğunlukla görülmez.",
    levelB: "Sadece basit işlerde standartlara kısmen uyar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart teslimatlarda kurallara uyar, doğru iş üretir.",
    levelD: "Karmaşık teslimatlarda kalite ve detay duyarlılığı güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik teslimatlarda kurum genelinde standart geliştirir."
  },
  {
    category: "Teknik Yetkinlikler",
    name: "Dijital Yetkinlik",
    description: "Teknolojik araçları etkin ve güvenli kullanma.",
    levelA: "Dijital araç kullanımı ve veri güvenliği uyumu görülmez.",
    levelB: "Sadece basit dijital araçları kısmen kullanır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart dijital araçları etkin kullanır, kurallara uyar.",
    levelD: "Karmaşık dijital sistemleri kullanmada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik dijital araçlarda yöntem/standart geliştirir."
  },
  {
    category: "Teknik Yetkinlikler",
    name: "Sürekli İyileştirme",
    description: "Süreçlerde küçük ama etkili (Kaizen) değişimler yapma.",
    levelA: "Operasyonda küçük sürekli iyileştirmeler tasarlayamaz.",
    levelB: "Sadece basit iyileştirme fikirleri sunar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart operasyonlarda beklenen düzeyde Kaizen uygular.",
    levelD: "Karmaşık süreçlerde sürekli iyileştirme uygulamada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik operasyonel iyileştirme yöntemleri geliştirir."
  },
  {
    category: "Teknik Yetkinlikler",
    name: "Performans Takibi",
    description: "KPI takibi yapma ve sapmalara önlem alma.",
    levelA: "Hedef takibinde KPI izleme and aksiyon alma görülmez.",
    levelB: "Sadece basit KPI'ları kısmen takip eder, tutarsızdır ve yakın takip ister.",
    levelC: "Standart hedef takibini doğru ve zamanında yapar.",
    levelD: "Karmaşık KPI takibinde ve sapmaları yönetmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik KPI takibinde yöntem geliştirir ve kuruma yayar."
  },
  {
    category: "Teknik Yetkinlikler",
    name: "Risk Önleyici Düşünme",
    description: "Riskleri öngörüp kriz çıkmadan planlama yapma.",
    levelA: "Riskli işlerde risk öngörüsü ve planlama görülmez.",
    levelB: "Sadece basit risk durumlarında kısmen önlem alır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart riskli işlerde beklenen düzeyde önleyici plan yapar.",
    levelD: "Karmaşık durumlarda risk analizi ve yönetiminde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik riskli durumlarda kurumsal standart geliştirir."
  },

  // 3. Temel Yetkinlikler (Core)
  {
    category: "Temel Yetkinlikler",
    name: "İletişim",
    description: "Açık, net, saygılı ve etkin iletişim kurma.",
    levelA: "Günlük iletişimde netlik ve saygı çoğunlukla görülmez.",
    levelB: "Sadece basit durumlarda kısmen açık iletişim kurar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart günlük iletişimde doğru ve zamanında iletişim kurur.",
    levelD: "Karmaşık iletişim durumlarında ve krizlerde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik iletişim süreçlerinde kurum genelinde standart belirler."
  },
  {
    category: "Temel Yetkinlikler",
    name: "Takım Çalışması",
    description: "Ortak amaç için işbirliği ve bilgi paylaşımı.",
    levelA: "Ekip çalışmalarında işbirliği ve paylaşım görülmez.",
    levelB: "Sadece basit ekip görevlerinde kısmen uyumludur, tutarsızdır ve yakın takip ister.",
    levelC: "Standart ekip çalışmalarında uyumludur, kurallara uyar.",
    levelD: "Karmaşık ekip çalışmalarında işbirliğinde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik ekip çalışmalarında iyi uygulamaları kuruma yayar."
  },
  {
    category: "Temel Yetkinlikler",
    name: "Sonuç Odaklılık",
    description: "Hedefe ulaşmak için planlı ve kararlı ilerleme.",
    levelA: "Hedefe ulaşmak için planlı ve kararlı ilerleme.",
    levelB: "Sadece basit hedeflerde kısmen çıktı üretir, tutarsızdır ve yakın takip ister.",
    levelC: "Standart hedefli işlerde zamanında ve doğru çıktı üretir.",
    levelD: "Karmaşık hedeflere ulaşmada ve kararlılıkta güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik hedefli işlerde yöntem geliştirir, kuruma yayar."
  },
  {
    category: "Temel Yetkinlikler",
    name: "Uyum Sağlama",
    description: "Değişen koşullara esneklik, belirsizlikte sakinlik.",
    levelA: "Değişimde esnek davranma ve belirsizliği yönetme yoktur.",
    levelB: "Sadece basit değişikliklerde kısmen uyum sağlar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart değişim süreçlerinde beklenen düzeyde uyum sağlar.",
    levelD: "Karmaşık değişim ve belirsizlikleri yönetmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik değişim süreçlerinde yöntem geliştirir ve liderlik eder."
  },
  {
    category: "Temel Yetkinlikler",
    name: "Müşteri Odaklılık",
    description: "İç/dış müşterinin ihtiyacını anlama, güven verme.",
    levelA: "Paydaş ilişkilerinde ihtiyacı anlayıp çözüm üretemez.",
    levelB: "Sadece basit müşteri taleplerini kısmen karşılar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart paydaş ilişkilerinde doğru ve zamanında çözüm üretir.",
    levelD: "Karmaşık paydaş ilişkilerinde güven oluşturmada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik paydaş ilişkilerinde kurumsal yöntem geliştirir."
  },
  {
    category: "Temel Yetkinlikler",
    name: "Etik",
    description: "Dürüst, adil, sorumluluk sahibi ve gizliliğe uygun çalışma.",
    levelA: "Güven gerektiren işlerde dürüstlük ve gizlilik görülmez.",
    levelB: "Sadece basit etik durumlarda kurallara kısmen uyar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart güven gerektiren işlerde kurallara tam uyar.",
    levelD: "Karmaşık durumlarda etik değerlere bağlılığı güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik etik durumlarda kurumsal standart ve yöntem geliştirir."
  },
  {
    category: "Temel Yetkinlikler",
    name: "Eğitim ve Gelişim",
    description: "Kendi gelişimine yatırım yapma, geri bildirimi kullanma.",
    levelA: "Geri bildirimle gelişme ve öğrenmeyi sürdürme görülmez.",
    levelB: "Sadece basit kişisel gelişim adımları atar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart kişisel gelişim süreçlerinde beklenen düzeydedir.",
    levelD: "Kendi ve başkalarının gelişiminde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik gelişim süreçlerinde yöntem geliştirir, kuruma yayar."
  },
  {
    category: "Temel Yetkinlikler",
    name: "İnisiyatif Alma",
    description: "Sorumluluk üstlenme, fırsatları görüp harekete geçme.",
    levelA: "Fırsat/sorun anında sorumluluk alıp harekete geçmez.",
    levelB: "Sadece basit durumlarda kısmen sorumluluk alır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart durumlarda zamanında sorumluluk alıp çıktı üretir.",
    levelD: "Karmaşık durumlarda inisiyatif alıp harekete geçmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik sorunlarda sorumluluk alır, kurumsal yöntem geliştirir."
  },
  {
    category: "Temel Yetkinlikler",
    name: "İş Disiplini",
    description: "Çalışma düzenine, İSG ve kalite kurallarına uyum.",
    levelA: "Takip, zamanında teslim ve kurallara uyum görülmez.",
    levelB: "Sadece basit kurallara kısmen uyar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart iş düzeninde kurallara tam uyar, zamanında teslim eder.",
    levelD: "Karmaşık iş disiplini ve kurallara uyumda güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik iş düzeni ve İSG süreçlerinde standart geliştirir."
  },
  {
    category: "Temel Yetkinlikler",
    name: "Önceliklendirme",
    description: "Zaman/enerji yönetimi, gerçekçi taahhütler planlama.",
    levelA: "Yoğun gündem altında önceliklendirme yapamaz, odak dağılır.",
    levelB: "Sadece basit günlük işlerde önceliklendirme yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart yoğun gündemde odağını korur, zamanında teslim eder.",
    levelD: "Karmaşık ve yoğun iş ortamlarında önceliklendirmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik yoğun ortamlarda yöntem geliştirir ve kuruma yayar."
  },

  // 4. Yönetsel Yetkinlikler (Managerial)
  {
    category: "Yönetsel Yetkinlikler",
    name: "Stratejik Düşünme",
    description: "Büyük resmi görme, uzun vadeli hedef-plan dengesi.",
    levelA: "Yönetsel planlamada büyük resmi ve öncelikleri göremez.",
    levelB: "Sadece basit yönetsel durumlarda kısmen büyük resmi görür, tutarsızdır ve yakın takip ister.",
    levelC: "Standart yönetsel planlamada beklenen düzeyde öncelik belirler.",
    levelD: "Karmaşık yönetsel durumlarda stratejik planlamada güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik planlamalarda kurumsal strateji ve yöntem geliştirir."
  },
  {
    category: "Yönetsel Yetkinlikler",
    name: "Vizyoner Liderlik",
    description: "İnsanları ortak hedefe odaklama, ilham verme.",
    levelA: "Ekip yönetiminde ilham verme ve hizalama görülmez.",
    levelB: "Sadece basit ekipleri kısmen hizalar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart ekipleri ortak hedefe başarıyla hizalar.",
    levelD: "Karmaşık ekiplere ilham verme ve yön göstermede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik durumlarda ilham verir, iyi uygulamaları kuruma yayar."
  },
  {
    category: "Yönetsel Yetkinlikler",
    name: "Sorumluluk Alma",
    description: "Veriye dayalı karar alıp sonuçlarını üstlenme.",
    levelA: "Kritik kararlarda veriye dayanma ve sahiplenme görülmez.",
    levelB: "Sadece basit kararlarda sorumluluk alır, tutarsızdır ve yakın takip ister.",
    levelC: "Standart kritik kararlarda sorumluluk alır, doğru çıktı üretir.",
    levelD: "Karmaşık kararlarda sorumluluk almada ve sahiplenmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik durumlarda sorumluluk alır, kurumsal standart geliştirir."
  },
  {
    category: "Yönetsel Yetkinlikler",
    name: "Delegasyon",
    description: "Doğru kişiye doğru işi verme, güvenle kontrol etme.",
    levelA: "İş dağıtımında doğru kişiyi seçme ve güvenle takip yoktur.",
    levelB: "Sadece basit iş dağıtımlarında kısmen takip yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart iş dağıtımında kurallara uyar, zamanında takip eder.",
    levelD: "Karmaşık iş dağıtımı ve delegasyonda güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik delegasyon süreçlerinde kurumsal yöntem geliştirir."
  },
  {
    category: "Yönetsel Yetkinlikler",
    name: "Koçluk & Gelişim",
    description: "Geri bildirimle ekibin potansiyelini açığa çıkarma.",
    levelA: "İnsan gelişiminde geri bildirim verme ve büyütme görülmez.",
    levelB: "Sadece basit durumlarda kısmen koçluk yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart insan gelişim süreçlerini beklenen düzeyde yürütür.",
    levelD: "Karmaşık gelişim ve koçluk süreçlerinde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik insan gelişimi süreçlerinde kurumsal standart geliştirir."
  },
  {
    category: "Yönetsel Yetkinlikler",
    name: "Değişim Yönetimi",
    description: "Değişimi şeffaf anlatma, direnci yönetme.",
    levelA: "Dönüşüm süreçlerinde değişimi anlatma ve direnç yönetimi yoktur.",
    levelB: "Sadece basit değişimlerde şeffaflık sağlar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart dönüşüm projelerinde beklenen düzeyde uyum sağlar.",
    levelD: "Karmaşık değişim süreçlerini yönetmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik dönüşümlerde liderlik eder, kurumsal yöntem geliştirir."
  },
  {
    category: "Yönetsel Yetkinlikler",
    name: "Finansal Bakış",
    description: "Bütçe, gider ve maliyet-fayda yönetimi.",
    levelA: "İş performansında maliyet-fayda odaklı kaynak yönetimi yoktur.",
    levelB: "Sadece basit harcamalarda bütçeyi kısmen yönetir, tutarsızdır ve yakın takip ister.",
    levelC: "Standart iş performansında bütçeyi doğru yönetir.",
    levelD: "Karmaşık finansal süreçlerde kaynak yönetiminde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik finansal/kaynak süreçlerinde kurumsal standart üretir."
  },
  {
    category: "Yönetsel Yetkinlikler",
    name: "İlişki Yönetimi",
    description: "Paydaşlarla güvene dayalı işbirliği geliştirme.",
    levelA: "Paydaş yönetiminde güven kurma ve işbirliği görülmez.",
    levelB: "Sadece basit paydaş ilişkilerini yönetir, tutarsızdır ve yakın takip ister.",
    levelC: "Standart paydaş süreçlerinde uyumlu ve zamanında iş yapar.",
    levelD: "Karmaşık paydaş yönetiminde işbirliğini geliştirmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik paydaş yönetiminde kurumsal ağlar ve yöntem geliştirir."
  },
  {
    category: "Yönetsel Yetkinlikler",
    name: "İnovasyon",
    description: "Süreçleri sorgulama, yenilikçi fikirleri teşvik etme.",
    levelA: "Yenilik kültüründe fikirleri teşvik etme ve uygulama yoktur.",
    levelB: "Sadece basit fikirleri kısmen teşvik eder, tutarsızdır ve yakın takip ister.",
    levelC: "Standart yenilik süreçlerinde kurallara uyar, çıktı üretir.",
    levelD: "Karmaşık yenilik süreçlerini teşvik etmede güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik yenilik süreçlerinde kurumsal kültür ve yöntem geliştirir."
  },
  {
    category: "Yönetsel Yetkinlikler",
    name: "Kriz Yönetimi",
    description: "Kriz anında soğukkanlı yönlendirme ve öğrenim çıkarma.",
    levelA: "Kriz anında risk yönetimi ve soğukkanlılık görülmez.",
    levelB: "Sadece basit kriz anlarında yönlendirme yapar, tutarsızdır ve yakın takip ister.",
    levelC: "Standart kriz anlarında kurallara uyar, doğru yönlendirir.",
    levelD: "Karmaşık kriz ve risk yönetiminde güçlüdür, proaktiftir ve başkalarına mentorluk yapar.",
    levelE: "Kritik kriz anlarında kurumsal yön belirler ve standart geliştirir."
  },

  // 5. Özel Geliştirici Yetkinlikleri (Developer competencies kept for compat)
  {
    category: "Teknik Yetkinlikler",
    name: "Frontend Geliştirme",
    description: "Tasarım arayüzlerini responsive, mobil uyumlu ve performanslı bir şekilde koda dökme; API entegrasyonu ve form doğrulamalarını yönetme.",
    levelA: "Tasarımları koda dökme, mobil uyumluluk ve API entegrasyonu çoğunlukla gerçekleştirilemez. Sık hata yapılır; yoğun rehberlik gerekir.",
    levelB: "Basit arayüzleri koda dökme ve API entegrasyonunu kısmen yapar, ancak uyumluluk sorunları yaşar. Sık kontrol ve şablon desteği ister.",
    levelC: "Standart arayüz tasarımlarını pikseli pikseline responsive koda döker ve API entegrasyonlarını sorunsuz tamamlar. Kurallara ve standartlara uyar.",
    levelD: "Karmaşık ve dinamik arayüzleri yüksek performansla kodlar, gelişmiş durum yönetimi ve API entegrasyonları kurar. Başkalarına teknik destek sağlar.",
    levelE: "Kritik ön yüz mimarileri, performans optimizasyonları ve mikro-frontend yapıları tasarlar; standartları belirler. İyi uygulamaları kurum genelinde yayar."
  },
  {
    category: "Teknik Yetkinlikler",
    name: "Backend Geliştirme",
    description: "Güvenli, hızlı ve ölçeklenebilir API mimarileri tasarlama; yetkilendirme (Auth), iş mantığı servisleri ve hata/loglama altyapılarını kurgulama.",
    levelA: "API geliştirme, iş mantığı kurma ve güvenlik yetkilendirmeleri çoğunlukla gerçekleştirilemez. Sık çökmeler yaşanır; yoğun yönlendirme gerekir.",
    levelB: "Basit API'ler ve temel iş mantıklarını kısmen yazar, ancak güvenlik ve hata yönetiminde eksikleri vardır. Şablon ve sık kontrol ister.",
    levelC: "Standart REST/GraphQL API'leri, JWT/OAuth yetkilendirmelerini ve hata yönetimi akışlarını beklenen düzeyde yazar. Kurallara uyar.",
    levelD: "Karmaşık iş mantıklarını, yüksek performanslı API mimarilerini ve gelişmiş hata loglama sistemlerini kurgular. Proaktif iyileştirmeler yapar.",
    levelE: "Kritik mikroservis mimarileri, yüksek işlem hacimli API optimizasyonları ve güvenlik standards geliştirir. Yöntem ve standart belirler."
  },
  {
    category: "Teknik Yetkinlikler",
    name: "Veri Tabanı Yönetimi",
    description: "Veri tabanı şemalarını tasarlama, tablolar arası ilişkileri kurma, migrations yönetimi ve sorgu optimizasyonu (indexing) sağlama.",
    levelA: "Veri tabanı şeması çıkarma, migrations yönetme ve sorguları optimize etme çoğunlukla gerçekleştirilemez. Yoğun yönlendirme gerekir.",
    levelB: "Basit tablo ilişkilerini ve temel sorguları kısmen yazar, ancak büyük verilerde performans sorunu yaşar. Sık kontrol ve rehberlik ister.",
    levelC: "Standart ilişkisel veri tabanı şemalarını tasarlar, migration'ları hatasız yönetir ve standart sorgu indekslemelerini beklenen düzeyde yapar.",
    levelD: "Karmaşık şemaları ve tablo ilişkilerini tasarlar, performans darboğazlarını analiz ederek gelişmiş sorgu optimizasyonları sunar.",
    levelE: "Kurumsal ölçekte veri tabanı mimarileri, otomatik yedekleme/kurtarma planları ve veri güvenliği standartları geliştirir. Standartları koyar."
  },
  {
    category: "Teknik Yetkinlikler",
    name: "UI/UX Tasarım",
    description: "Kullanıcı deneyimini mükemmelleştirme, kullanıcı akışlarını (user flows) basitleştirme ve ortak tasarım sistemini (Design System) kurup yönetme.",
    levelA: "Görsel eksikleri saptama, kullanıcı akışlarını sadeleştirme ve ortak tasarım sistemi kurma çoğunlukla gerçekleştirilemez. Yoğun yönlendirme gerekir.",
    levelB: "Basit ekran tasarımlarını ve temel akışları kısmen hazırlar, ancak tutarsızlıklar ve UX engelleri bulunur. Sık kontrol ve rehberlik ister.",
    levelC: "Arayüzdeki görsel kusurları giderir, kullanıcı akışlarını basitleştirir ve ortak bileşen kütüphanesini (Design System) beklenen düzeyde yönetir.",
    levelD: "Karmaşık kullanıcı akış şemalarını tasarlar, gelişmiş kullanıcı araştırmaları yaparak dönüşüm oranlarını artıracak UX çözümleri üretir.",
    levelE: "Marka kimliğine uygun sıfırdan kapsamlı tasarım sistemleri, vizyoner kullanıcı deneyimi modelleri ve tasarım standartları geliştirir."
  }
];

let mdContent = '';
for (const comp of newCompetencies) {
  mdContent += `| ${comp.category} | ${comp.name} | ${comp.description} | ${comp.levelA} | ${comp.levelB} | ${comp.levelC} | ${comp.levelD} | ${comp.levelE} |\n`;
}

fs.writeFileSync('./comps.md', mdContent, 'utf-8');
console.log("comps.md has been successfully generated!");
