export const translations = {
  fr: {
    nav: {
      features: "Fonctionnalités",
      howItWorks: "Comment ça marche",
      sandbox: "Simulateur Vocal",
      nurseRole: "Espace Infirmier",
      about: "Notre Impact",
      testimonials: "Témoignages",
      login: "Espace Soignant",
      start: "Demander un accès",
      lang: "Français"
    },
    hero: {
      badge: "Système Médical Embarqué · Haut Atlas & Zones Isolées",
      titleLine1: "Sécuriser chaque grossesse dans le",
      titleLine2: "Maroc profond.",
      subtitle: "Dar Al Oumouma est la première plateforme clinique hors-ligne d'assistance prénatale. Dictée vocale en Darija marocain, dépistage immédiat de la pré-éclampsie et télé-expertise directe avec les CHR régionaux.",
      ctaDemo: "Tester le simulateur vocal",
      ctaLearn: "Découvrir la technologie",
      stats: {
        femmes: "15 420+ suivis prénataux",
        centres: "48 dispensaires ruraux",
        precision: "98.4% détection alerte",
        offline: "100% hors-réseau (PWA)"
      },
      alertCard: {
        title: "Dépistage Pré-éclampsie",
        patient: "Fatima Z. (32 sem.) · Douar Aït Ourir",
        finding: "Tension 15/9 + Albuminurie 2+ + Céphale",
        risk: "Risque Majeur Détecté",
        action: "Transfert URGENT CHR Marrakech"
      },
      voiceCard: {
        title: "Dictée Vocale Darija en Direct",
        transcript: "« Fiya sda3 f ras kbir o kankhaf men tansion »",
        translated: "Céphales sévères signalées · Modèle SFT Darija"
      }
    },
    nurseSection: {
      tag: "SOIGNANTS EN PREMIÈRE LIGNE",
      title: "Un copilote pensé pour l'infirmier et la sage-femme aux côtés de la patiente",
      subtitle: "Dans les douars isolés, l'infirmier de santé rurale est souvent le seul recours médical à des dizaines de kilomètres à la ronde.",
      nurseName: "Hassan Oubella · Infirmier Major de Santé Rurale",
      nurseLoc: "Dispensaire d'Igherm, Province de Taroudant",
      nurseQuote: "« Assis aux côtés de la patiente avec la tablette, j'écoute ses symptômes en Darija. L'assistant convertit l'échange en bilan prénatal clair, calcule le risque de pré-éclampsie et génère l'ordonnance selon les normes du Ministère. »",
      feat1: "Saisie et dictée vocale en Darija directement aux côtés de la maman",
      feat2: "Analyse instantanée des constantes vitales (Tension, Albuminurie, Hauteur Utérine)",
      feat3: "Validation en un clic et émission de la fiche de liaison vers le médecin référent"
    },
    sandbox: {
      tag: "DÉMONSTRATION INTERACTIVE",
      title: "Testez l'Anamnèse Vocale en Darija en temps réel",
      subtitle: "Cliquez sur une consultation type du Haut Atlas pour observer l'analyse médicale instantanée.",
      case1: {
        label: "Cas 1: Tension élevée (32 sem.)",
        audio: "« Fiya sda3 f ras kbir o kankhaf men tansion... »",
        symptoms: "Céphales pulsatiles, phosphenes, PA 15/9, œdème des membres inférieurs",
        triage: "ALERTE ROUGE · Risque Pré-éclampsie sévère",
        recommendation: "Transfert immédiat CHR avec perfusion sulfate de magnésium selon protocole PNSG.",
        constants: { pa: "15/9 mmHg", albumin: "++", term: "32 SA", pulse: "92 bpm" }
      },
      case2: {
        label: "Cas 2: Asthénie & Paleur (24 sem.)",
        audio: "« Kanjiyya bzaf w 9albi kaydrob sria3 mli kankhadam... »",
        symptoms: "Fatigue intense, dyspnée d'effort, conjonctives pâles, Hb mesurée 8.5 g/dL",
        triage: "ALERTE ORANGE · Anémie Sévère du T2",
        recommendation: "Supplémentation fer ferreux IV/Oral + bilan NFS complet à programmer.",
        constants: { pa: "11/7 mmHg", albumin: "Négatif", term: "24 SA", pulse: "104 bpm" }
      },
      case3: {
        label: "Cas 3: Suivi de Routine (16 sem.)",
        audio: "« Kankhss b chwya d l-wja3 f karch walakin l-biybi kay7rak normal... »",
        symptoms: "Légères tiraillements ligamentaires, HU conforme, BCF audibles 145 bpm",
        triage: "VERT · Grossesse Physiologique",
        recommendation: "Poursuite de la supplémentation acide folique/fer, rdv CPN3 dans 4 semaines.",
        constants: { pa: "12/8 mmHg", albumin: "Négatif", term: "16 SA", pulse: "78 bpm" }
      }
    },
    features: {
      tag: "CAPACITÉS CLINIQUES",
      title: "Conçu pour les défis réels des sages-femmes rurales",
      subtitle: "Pas de gadgets. Des fonctionnalités cliniques robustes créées avec les professionnels de santé du terrain.",
      f1: {
        title: "Anamnèse Vocale Darija & Amazigh",
        desc: "Retranscription directe de la parole de la patiente en Darija marocaine. Structuration automatique des symptômes dans le dossier CPN."
      },
      f2: {
        title: "Dépistage Automatique des Alertes",
        desc: "Algorithme d'analyse conforme au Protocole National de Surveillance de la Grossesse (PNSG Maroc) pour repérer la pré-éclampsie et l'hémorragie."
      },
      f3: {
        title: "Architecture 100% Hors-Ligne",
        desc: "Fonctionne sans aucune couverture réseau 3G/4G dans les dispensaires isolés. Synchronisation chiffrée automatique dès le retour de connexion."
      },
      f4: {
        title: "Carnet de Suivi & Télé-expertise CHR",
        desc: "Émission instantanée des fiches de transfert urgentes et liaison sécurisée avec le médecin gynécologue référent du CHR régional."
      }
    },
    architecture: {
      tag: "INGÉNIERIE SOUVERAINE",
      title: "Fonctionnement garanti en zone de rupture réseau",
      s1Title: "1. Capture en Douar",
      s1Desc: "Enregistrement ou saisie sur tablette durcie dans le dispensaire local sans internet.",
      s2Title: "2. Inférence Locale",
      s2Desc: "Le modèle d'IA médical s'exécute en local sur l'appareil (Edge AI) en moins de 2 secondes.",
      s3Title: "3. Synchro Securisée",
      s3Desc: "Dès l'accès au réseau ou à la caravane médicale, synchronisation conforme CNDP."
    },
    howItWorks: {
      tag: "PROTOCOLE CLINIQUE",
      title: "3 étapes simples pour sécuriser la consultation",
      subtitle: "Une intégration fluide qui s'adapte au rythme de la sage-femme sans alourdir sa charge de travail.",
      step1: {
        num: "01",
        title: "Dictée Vocale ou Saisie des Constantes",
        desc: "La sage-femme s'entretient avec la patiente en Darija et relève la tension, le poids et la hauteur utérine."
      },
      step2: {
        num: "02",
        title: "Analyse Instantanée & Tri de Risque",
        desc: "L'assistant analyse les constantes, compare aux seuils pathologiques et affiche un statut Vert / Orange / Rouge clair."
      },
      step3: {
        num: "03",
        title: "Fiche de Consultation & Télé-expertise",
        desc: "Génération automatique du compte-rendu, ordonnance de référence et fiche de liaison vers l'hôpital."
      }
    },
    about: {
      tag: "NOTRE IMPACT EN ZONES ISOLÉES",
      title: "Réduire la mortalité maternelle dans le Haut Atlas et le Souss",
      p1: "Dans les douars enclavés des provinces d'Al Haouz, Taroudant, Azilal ou Tinghir, le premier hôpital régional se trouve parfois à plus de 4 heures de piste. Les sages-femmes et infirmiers y accomplissent un travail héroïque avec des moyens limités.",
      p2: "Dar Al Oumouma a été développé sur le terrain avec le soutien des professionnels de santé locaux pour doter chaque soignant d'un copilote médical capable de comprendre le langage des patientes, d'anticiper les complications fatales et d'assurer une prise en charge rapide.",
      quote: "« Notre promesse est qu'aucune mère dans un douar isolé ne voie sa vie compromise par manque de dépistage précoce. »",
      founder: "Direction Médicale & Scientifique Dar Al Oumouma Maroc"
    },
    testimonials: {
      tag: "RETOURS DU TERRAIN MAROCAIN",
      title: "Approuvé par les sages-femmes et médecins référents",
      t1: {
        quote: "Dar Al Oumouma est devenu notre outil quotidien à Oukaïmeden. La compréhension directe des expressions en Darija et le calcul automatique du risque de pré-éclampsie m'ont permis de transférer deux mères à temps vers Marrakech.",
        author: "Khadija Mansouri",
        role: "Sage-Femme Principale · Centre de Santé Rurale",
        loc: "Province d'Al Haouz"
      },
      t2: {
        quote: "Depuis l'hôpital régional, je reçois des fiches de liaison parfaitement structurées préparées par les infirmiers des dispensaires distants. La validation des cas complexes se fait en quelques minutes.",
        author: "Dr. Amine Tazi",
        role: "Médecin Spécialiste en Gynécologie-Obstétrique",
        loc: "CHR Marrakech-Safi"
      },
      t3: {
        quote: "Pendant nos caravanes médicales dans la montagne sans réseau, l'application fonctionne à 100% hors-ligne. C'est le premier outil réellement pensé pour la réalité du Maroc profond.",
        author: "Hassan Oubella",
        role: "Infirmier Chef de Santé Rurale",
        loc: "Cercle d'Igherm, Taroudant"
      }
    },
    cta: {
      title: "Équipez vos centres de santé ruraux avec l'assistant médical d'excellence",
      subtitle: "Rejoignez le programme pilote déployé dans les dispensaires du Royaume du Maroc.",
      btn1: "Demander un accès démo",
      btn2: "Contacter le Collège Médical",
      note: "Conforme aux recommandations du Ministère de la Santé & Loi CNDP 09-08"
    },
    footer: {
      desc: "Plateforme clinique d'assistance prénatale par IA pour les professionnels de santé en zones rurales au Maroc.",
      col1Title: "Plateforme Clinique",
      links1: ["Anamnèse Vocale Darija", "Dépistage Pré-éclampsie", "Mode Hors-Ligne PWA", "Télé-expertise CHR"],
      col2Title: "Conformité & Protocoles",
      links2: ["Protocole National PNSG", "Sécurité CNDP 09-08", "Guide Sage-Femme", "Intégration Hôpitaux"],
      col3Title: "Contact & Siège",
      address: "Casablanca & Technopark Marrakech, Maroc",
      email: "contact@dar-oumouma.ma",
      rights: "© 2026 Dar Al Oumouma. Tous droits réservés. Santé Maternelle Rurale."
    }
  },
  ar: {
    nav: {
      features: "المميزات السريرية",
      howItWorks: "كيف يعمل",
      sandbox: "محاكي التشخيص",
      nurseRole: "فضاء الممرض",
      about: "أثرنا الميداني",
      testimonials: "شهادات",
      login: "فضاء المهنيين",
      start: "طلب وصول تجريبي",
      lang: "العربية"
    },
    hero: {
      badge: "نظام طبي مدمج · الأطلس الكبير والمناطق النائية",
      titleLine1: "تأمين كل حمل في",
      titleLine2: "أعماق المغرب القروي.",
      subtitle: "دار الأمومة هي أول منصة سريرية تعمل بدون إنترنت لرعاية الحوامل. إملاء صوتي بالدارجة المغربية، كشف فوري عن تسمم الحمل، وخبرة طبية مباشرة مع المستشفيات الجهوية.",
      ctaDemo: "تجربة المحاكي الصوتي",
      ctaLearn: "اكتشف التكنولوجيا",
      stats: {
        femmes: "+15,420 متابعة حمل",
        centres: "48 مستوصف قروي",
        precision: "98.4% دقة التنبيه",
        offline: "100% بدون شبكة (PWA)"
      },
      alertCard: {
        title: "كشف تسمم الحمل",
        patient: "فاطمة الزهراء (32 أسبوع) · دوار أيت اورير",
        finding: "ضغط الدم 15/9 + زلال 2+ + صداع حاد",
        risk: "خطر مرتفع جداً",
        action: "نقل مستعجل للمستشفى الجهوي بمراكش"
      },
      voiceCard: {
        title: "تفريغ صوتي مباشر بالدارجة",
        transcript: "« فيها صداع في الرأس كبير وخايفة من الطنسيون »",
        translated: "تم تسجيل صداع حاد · نموذج الدارجة الطبية"
      }
    },
    nurseSection: {
      tag: "أطقم الصحة بالخط الأول",
      title: "مساعد مصمم للممرض والقابلة بجانب المريضة",
      subtitle: "في الدواوير المعزولة، الممرض القروي هو الملجأ الطبي الوحيد على بعد عشرات الكيلومترات.",
      nurseName: "حسن أوبلا · ممرض رئيس للصحة القروية",
      nurseLoc: "مستوصف إغرم، إقليم تارودانت",
      nurseQuote: "« أثناء جلوسي بجانب المريضة مع اللوحة الرقمية، أستمع لأعراضها بالدارجة. يحول المساعد الحديث إلى تقرير حمل واضح، يحسب خطر تسمم الحمل ويصدر الوصفة وفق معايير وزارة الصحة. »",
      feat1: "تسجيل صوتي بالدارجة مباشرة بجانب الأم الحامل",
      feat2: "تحليل فوري للمؤشرات الحيوية (الضغط، الزلال، ارتفاع الرحم)",
      feat3: "مصادقة بنقرة واحدة وإرسال بطاقة التوجيه للطبيب المشرف"
    },
    sandbox: {
      tag: "العرض التفاعلي المباشر",
      title: "جرب التشخيص الصوتي بالدارجة في الحين",
      subtitle: "انقر على إحدى حالات الفحص بالأطلس الكبير لمشاهدة التحليل الطبي الفوري.",
      case1: {
        label: "الحالة 1: ضغط مرتفع (32 أسبوع)",
        audio: "« فيها صداع في الرأس كبير وخايفة من الطنسيون... »",
        symptoms: "صداع نابض، ضغط الدم 15/9، انتفاخ الأطراف السفلى",
        triage: "تنبيه أحمر · خطر تسمم الحمل الحاد",
        recommendation: "نقل فوري للمستشفى الجهوي مع حقن سلفات المغنيسيوم وفق البروتوكول الوطني.",
        constants: { pa: "15/9 mmHg", albumin: "++", term: "32 أسبوع", pulse: "92 نبضة/د" }
      },
      case2: {
        label: "الحالة 2: عياء وشحوب (24 أسبوع)",
        audio: "« كانحس بالعياء بزاف وقلبي كايضرب سريع ملي كانتحرك... »",
        symptoms: "تعب شديد، ضيق تنفس عند الجهد، الهيموغلوبين 8.5 g/dL",
        triage: "تنبيه برتقالي · فقر دم حاد في الثلث الثاني",
        recommendation: "وصف الحديد عبر الوريد/الفم + برمجة تحليل دم كامل.",
        constants: { pa: "11/7 mmHg", albumin: "سلبي", term: "24 أسبوع", pulse: "104 نبضة/د" }
      },
      case3: {
        label: "الحالة 3: فحص روتيني (16 أسبوع)",
        audio: "« كانحس بشوية د الوجع ف الكرش ولكن الجنين كايتحرك عادي... »",
        symptoms: "آلام أربطة خفيفة، ارتفاع الرحم طبيعي، دقات قلب الجنين 145",
        triage: "أخضر · حمل طبيعي متوازن",
        recommendation: "مواصلة حمض الفوليك والحديد، موعد الفحص القادم بعد 4 أسابيع.",
        constants: { pa: "12/8 mmHg", albumin: "سلبي", term: "16 أسبوع", pulse: "78 نبضة/د" }
      }
    },
    features: {
      tag: "القدرات السريرية",
      title: "مصمم للتحديات الحقيقية للقابلات بالقرى",
      subtitle: "أدوات سريرية متينة تم تطويرها جنباً إلى جنب مع الأطقم الطبية الميدانية.",
      f1: {
        title: "تشخيص صوتي بالدارجة والأمازيغية",
        desc: "تحويل مباشر لحديث المريضة بالدارجة المغربية إلى تقرير طبي منظم وفق المعايير الوطنية."
      },
      f2: {
        title: "كشف آلي لمؤشرات الخطر",
        desc: "خوارزمية سريرية مطابقة للبروتوكول الوطني لمتابعة الحمل لرصد تسمم الحمل والنزيف."
      },
      f3: {
        title: "بنية تعمل 100% بدون إنترنت",
        desc: "يعمل بكفاءة عالية في المستوصفات المعزولة بدون تغطية 3G/4G، مع مزامنة مشفرة فور توفر الشبكة."
      },
      f4: {
        title: "بطاقة متابعة وخبرة عن بُعد",
        desc: "إصدار فوري لبطاقات التوجيه المستعجل وتواصل آمن مع الطبيب المشرف بالمستشفى الجهوي."
      }
    },
    architecture: {
      tag: "الهندسة السيادية",
      title: "عمل مضمون حتى عند انقطاع الشبكة الكامل",
      s1Title: "1. التسجيل بالمستوصف",
      s1Desc: "إدخال البيانات على اللوحة الطبية بالمستوصف المحلي بدون إنترنت.",
      s2Title: "2. المعالجة المحلية",
      s2Desc: "معالجة نموذج الذكاء الاصطناعي محلياً على الجهاز في أقل من ثانيتين.",
      s3Title: "3. المزامنة الآمنة",
      s3Desc: "مزامنة المعطيات وفق معايير CNDP فور وصول القافلة الطبية للشبكة."
    },
    howItWorks: {
      tag: "البروتوكول السريري",
      title: "3 خطوات بسيطة لتأمين الفحص الطبي",
      subtitle: "اندماج سلس مع عمل القابلة دون زيادة أعباء التسجيل الورقي.",
      step1: {
        num: "01",
        title: "التسجيل الصوتي أو المؤشرات",
        desc: "تتحدث القابلة مع المريضة بالدارجة وتسجل قياس الضغط، الوزن وارتفاع الرحم."
      },
      step2: {
        num: "02",
        title: "التحليل الفوري وتصنيف الخطر",
        desc: "يقوم المساعد بمقارنة المؤشرات بالمعايير الطبية وعرض حالة الخطر: أخضر / برتقالي / أحمر."
      },
      step3: {
        num: "03",
        title: "تقرير الفحص والتوجيه الطبي",
        desc: "توليد تلقائي لتقرير الفحص، الوصفة الطبية، وبطاقة التوجيه للمستشفى عند الحاجة."
      }
    },
    about: {
      tag: "أثرنا في المناطق المعزولة",
      title: "الحد من وفيات الأمهات بالأطلس الكبير وسوس",
      p1: "في الدواوير المعزولة بأقاليم الحوز، تارودانت، أزيلال وتنغير، يبعد أقرب مستشفى جهوي بأكثر من 4 ساعات من المسالك الجبلية. يقوم الممرضون والقابلات هناك بعمل بطولي بموارد محدودة.",
      p2: "تم تطوير دار الأمومة ميدانياً بدعم من الأطباء المحليين لتزويد كل كادر صحي بمساعد طبي يفهم لغة المريضات، يستبق المضاعفات الخطيرة، ويضمن التكفل السريع.",
      quote: "« وعدنا هو ألا تفقد أي أم في دوار ناء حياتها بسبب غياب التشخيص المبكر. »",
      founder: "الهيئة الطبية والعلمية لدار الأمومة بالمغرب"
    },
    testimonials: {
      tag: "شهادات من الميدان المغربي",
      title: "معتمد من طرف القابلات والأطباء المشرفين",
      t1: {
        quote: "أصبح دار الأمومة أداتنا اليومية في أوكايمدن. الفهم المباشر للدارجة والحساب التلقائي لخطر ارتفاع الضغط مكّناني من توجيه أمين في الوقت المناسب إلى مراكش.",
        author: "خديجة منصوري",
        role: "قابلة رئيسية · المركز الصحي القروي",
        loc: "إقليم الحوز"
      },
      t2: {
        quote: "من المستشفى الجهوي، أتوصل ببطاقات توجيه منظمة بدقة أعدها ممرضو المستوصفات النائية. المصادقة على الحالات المعقدة تتم في دقائق.",
        author: "د. أمين التازي",
        role: "طبيب متخصص في أمراض النساء والتوليد",
        loc: "المستشفى الجهوي مراكش-أسفي"
      },
      t3: {
        quote: "خلال قوافلنا الطبية في الجبال بدون شبكة، التطبيق يعمل 100% بدون إنترنت. إنه أول تطبيق مصمم بالفعل لواقع المغرب العميق.",
        author: "حسن أوبلا",
        role: "ممرض رئيس للصحة القروية",
        loc: "دائرة إغرم، تارودانت"
      }
    },
    cta: {
      title: "زودوا مراكزكم الصحية القروية بأحدث مساعد طبي متخصص",
      subtitle: "انضموا إلى البرنامج التجريبي المعتمد بمستوصفات المملكة المغربية.",
      btn1: "طلب تجربة ميدانية",
      btn2: "التواصل مع الهيئة الطبية",
      note: "مطابق لتوصيات وزارة الصحة وقانون حماية المعطيات CNDP 09-08"
    },
    footer: {
      desc: "منصة سريرية لرعاية الحوامل بالذكاء الاصطناعي مخصصة لمهنيي الصحة بالمناطق القروية بالمغرب.",
      col1Title: "المنصة السريرية",
      links1: ["التشخيص بالدارجة", "كشف تسمم الحمل", "العمل بدون إنترنت PWA", "الخبرة الطبية الجهوية"],
      col2Title: "المطابقة والبروتوكولات",
      links2: ["البروتوكول الوطني PNSG", "حماية المعطيات CNDP", "دليل القابلة", "الربط بالمستشفيات"],
      col3Title: "التواصل والمقر",
      address: "الدار البيضاء وتكنوبارك مراكش، المغرب",
      email: "contact@dar-oumouma.ma",
      rights: "© 2026 دار الأمومة. جميع الحقوق محفوظة. صحة الأم القروية."
    }
  }
}
