import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// For now, we'll use a simple configuration with a few common translations.
// In a real application, you would likely have a more robust setup,
// possibly loading translations from JSON files.
const resources = {
  en: {
    translation: {
      "Ghars": "Ghars",
      "Weeks": "Weeks",
      "Leaderboard": "Leaderboard",
      "Login": "Login",
      "Logout": "Logout",
      "Dashboard": "Dashboard",
      "Admin Panel": "Admin Panel",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.save": "Save",
      "common.confirm": "Confirm",
      "common.saveChanges": "Save Changes",
      "common.create": "Create",
    }
  },
  ar: {
    translation: {
        "Ghars": "غرس",
        "Weeks": "الأسابيع",
        "Leaderboard": "لوحة المتصدرين",
        "Login": "تسجيل الدخول",
        "Logout": "تسجيل الخروج",
        "Dashboard": "لوحة التحكم",
        "Admin Panel": "لوحة الإدارة",
        "common.cancel": "إلغاء",
        "common.delete": "حذف",
        "common.save": "حفظ",
        "common.confirm": "تأكيد",
        "common.saveChanges": "حفظ التغييرات",
        "common.create": "إنشاء",
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'ar', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;
