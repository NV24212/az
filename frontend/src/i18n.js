import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "Login": "Login",
          "Weeks": "Weeks",
          "Leaderboard": "Leaderboard",
          "Dashboard": "Dashboard",
          "Admin Panel": "Admin Panel",
          "Ghars": "Ghars",
          "Logout": "Logout",
        }
      },
      ar: {
        translation: {
          "Login": "تسجيل الدخول",
          "Weeks": "الأسابيع",
          "Leaderboard": "المتصدرين",
          "Dashboard": "لوحة التحكم",
          "Admin Panel": "لوحة الإدارة",
          "Ghars": "غرس",
          "Logout": "تسجيل الخروج",
        }
      }
    },
    lng: "ar",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
