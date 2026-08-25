import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'fr' | 'en' | 'ar'

export const LANGUAGES: { code: Lang; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'fr', label: 'FR', dir: 'ltr' },
  { code: 'en', label: 'EN', dir: 'ltr' },
  { code: 'ar', label: 'AR', dir: 'rtl' },
]

// Translation keys used across the customer-facing site (home, request,
// track) and shared nav/footer elements. Admin dashboard stays French,
// since that's the agent's working language.
const dict = {
  nav_track: { fr: 'Suivre', en: 'Track', ar: 'Suivi' },
  nav_services: { fr: 'Services', en: 'Services', ar: 'الخدمات' },
  nav_contact: { fr: 'Contact', en: 'Contact', ar: 'اتصل بنا' },

  hero_kicker: { fr: 'Votre coursier personnel · Marrakech', en: 'Your personal courier · Marrakech', ar: 'ساعي التوصيل الشخصي الخاص بك · مراكش' },
  hero_supporting: {
    fr: 'Restaurants • Supermarchés • Pharmacie • Pressing • Marché • Administrations • Courses & livraisons',
    en: 'Restaurants • Supermarkets • Pharmacy • Dry cleaning • Market • Administration • Errands & deliveries',
    ar: 'مطاعم • سوبر ماركت • صيدلية • تنظيف جاف • سوق • إدارات • مهمات وتوصيل',
  },
  hero_body: {
    fr: 'Une seule personne de confiance pour toutes vos courses du quotidien. Demande en moins d\'une minute, prix affiché avant de confirmer.',
    en: 'One trusted person to handle all your everyday errands. Request in under a minute, price shown before you confirm.',
    ar: 'شخص واحد تثق به لجميع مهماتك اليومية. اطلب في أقل من دقيقة، والسعر يظهر قبل التأكيد.',
  },
  cta_request: { fr: 'Demander une livraison', en: 'Request a delivery', ar: 'اطلب توصيلاً' },
  cta_whatsapp: { fr: 'Nous contacter sur WhatsApp', en: 'Contact us on WhatsApp', ar: 'تواصل معنا عبر واتساب' },

  how_it_works_title: { fr: 'Comment ça marche', en: 'How it works', ar: 'كيف يعمل' },
  how_1_title: { fr: 'Vous faites votre demande', en: 'You make your request', ar: 'تقدم طلبك' },
  how_1_body: { fr: 'Remplissez le formulaire en moins d\'une minute.', en: 'Fill out the form in under a minute.', ar: 'املأ النموذج في أقل من دقيقة.' },
  how_2_title: { fr: 'Le livreur accepte et réalise la mission', en: 'The courier accepts and completes the mission', ar: 'يقبل السائق وينفذ المهمة' },
  how_2_body: { fr: 'Récupération, achats ou démarche : tout est pris en charge.', en: 'Pickup, purchases, or errands — all handled for you.', ar: 'استلام، شراء أو مهمة إدارية — كل شيء يُنجز من أجلك.' },
  how_3_title: { fr: 'Vous recevez votre livraison', en: 'You receive your delivery', ar: 'تستلم توصيلتك' },
  how_3_body: { fr: 'Suivi en temps réel jusqu\'à la remise.', en: 'Track it live until it\'s in your hands.', ar: 'تتبع مباشر حتى التسليم.' },

  services_title: { fr: 'Nos services', en: 'Our services', ar: 'خدماتنا' },
  services_subtitle: {
    fr: 'Bien plus que la livraison de repas.',
    en: 'Much more than food delivery.',
    ar: 'أكثر بكثير من توصيل الطعام.',
  },

  pricing_title: { fr: 'Tarifs simples', en: 'Simple pricing', ar: 'أسعار بسيطة' },
  pricing_from: { fr: 'À partir de', en: 'Starting at', ar: 'ابتداءً من' },
  pricing_upto: { fr: 'Jusqu\'à 5 km', en: 'Up to 5 km', ar: 'حتى 5 كم' },
  pricing_extra: { fr: 'Puis +5 DH / km supplémentaire', en: 'Then +5 DH / extra km', ar: 'ثم +5 درهم / كم إضافي' },
  pricing_calc_label: { fr: 'Estimez votre trajet', en: 'Estimate your trip', ar: 'قدّر رحلتك' },
  pricing_calc_distance: { fr: 'Distance (km)', en: 'Distance (km)', ar: 'المسافة (كم)' },
  pricing_calc_fee: { fr: 'Frais de livraison estimés', en: 'Estimated delivery fee', ar: 'رسوم التوصيل المقدرة' },
  pricing_note: {
    fr: 'Le coût des produits ou achats est toujours séparé et confirmé après la mission.',
    en: 'Product or purchase costs are always separate and confirmed after the mission.',
    ar: 'تكلفة المنتجات أو المشتريات منفصلة دائمًا وتُؤكَّد بعد المهمة.',
  },

  why_title: { fr: 'Pourquoi nous choisir', en: 'Why choose us', ar: 'لماذا تختارنا' },
  why_1: { fr: 'Un seul livreur, toujours le même', en: 'One courier, always the same person', ar: 'ساعٍ واحد، دائمًا نفس الشخص' },
  why_2: { fr: 'Prix clair avant de confirmer', en: 'Clear price before you confirm', ar: 'سعر واضح قبل التأكيد' },
  why_3: { fr: 'Suivi en temps réel', en: 'Real-time tracking', ar: 'تتبع لحظي' },
  why_4: { fr: 'Disponible sur WhatsApp', en: 'Available on WhatsApp', ar: 'متوفر على واتساب' },

  footer_areas: { fr: 'Zones desservies', en: 'Service areas', ar: 'مناطق الخدمة' },
  footer_hours: { fr: 'Horaires', en: 'Hours', ar: 'ساعات العمل' },
  footer_rights: { fr: 'Tous droits réservés.', en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' },

  contact_title: { fr: 'Nous contacter', en: 'Contact us', ar: 'تواصل معنا' },
  contact_body: {
    fr: 'Une question, une demande spéciale ? Écrivez-nous directement sur WhatsApp ou appelez.',
    en: 'A question or a special request? Message us directly on WhatsApp or call.',
    ar: 'لديك سؤال أو طلب خاص؟ راسلنا مباشرة على واتساب أو اتصل بنا.',
  },
} as const

export type TranslationKey = keyof typeof dict

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
  dir: 'ltr' | 'rtl'
}>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => dict[key].fr,
  dir: 'ltr',
})

const LS_LANG_KEY = 'touts8_delivery_lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(LS_LANG_KEY)
    return (saved as Lang) || 'fr'
  })

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? 'ltr'

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = lang
  }, [dir, lang])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem(LS_LANG_KEY, l)
  }

  function t(key: TranslationKey): string {
    return dict[key]?.[lang] ?? dict[key]?.fr ?? key
  }

  return <LangContext.Provider value={{ lang, setLang, t, dir }}>{children}</LangContext.Provider>
}

export function useLanguage() {
  return useContext(LangContext)
}
