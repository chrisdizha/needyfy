
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      common: {
        email: 'Email',
        password: 'Password',
        login: 'Log In',
        register: 'Sign Up',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        close: 'Close',
        open: 'Open',
        select: 'Select',
        upload: 'Upload',
        download: 'Download',
        share: 'Share',
        copy: 'Copy',
        paste: 'Paste',
        cut: 'Cut',
        undo: 'Undo',
        redo: 'Redo',
        refresh: 'Refresh',
        reset: 'Reset',
        clear: 'Clear',
        apply: 'Apply',
        ok: 'OK',
        yes: 'Yes',
        no: 'No',
        optional: 'Optional',
        required: 'Required',
        name: 'Name',
        description: 'Description',
        category: 'Category',
        price: 'Price',
        location: 'Location',
        date: 'Date',
        time: 'Time',
        duration: 'Duration',
        status: 'Status',
        message: 'Message',
        phone: 'Phone',
        address: 'Address',
        city: 'City',
        country: 'Country',
        zipCode: 'Zip Code',
        website: 'Website',
        profile: 'Profile',
        settings: 'Settings',
        help: 'Help',
        about: 'About',
        contact: 'Contact',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        cookies: 'Cookie Policy',
        language: 'Language',
        currency: 'Currency',
        timezone: 'Timezone',
        notifications: 'Notifications',
        security: 'Security',
        billing: 'Billing',
        subscription: 'Subscription',
        account: 'Account',
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        reports: 'Reports',
        users: 'Users',
        admin: 'Admin',
        support: 'Support'
      },
      hero: {
        tagline: 'Rent Anything, Anytime',
        subtitle: 'Connect. Share. Thrive.',
        searchPlaceholder: 'What do you need to rent?',
        locationPlaceholder: 'Enter your location',
        datesPlaceholder: 'Select dates',
        topCategories: 'Popular Categories'
      },
      categories: {
        construction: 'Construction Tools',
        vehicles: 'Vehicles & Transport',
        electronics: 'Electronics',
        eventEquipment: 'Event Equipment',
        homeGarden: 'Home & Garden',
        photography: 'Photography Equipment'
      },
      errors: {
        searchRequired: 'Please enter a search term',
        invalidCredentials: 'Invalid email or password',
        accountCreated: 'Account created successfully',
        emailVerificationSent: 'Verification email sent',
        emailVerified: 'Email verified successfully',
        loginRequired: 'Please log in to continue',
        accessDenied: 'Access denied',
        sessionExpired: 'Your session has expired',
        loggedOut: 'You have been logged out',
        weakPassword: 'Password must be at least 8 characters',
        emailInUse: 'This email is already registered',
        userNotFound: 'User not found',
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        confirmPasswordRequired: 'Please confirm your password',
        passwordMismatch: 'Passwords do not match',
        firstNameRequired: 'First name is required',
        lastNameRequired: 'Last name is required',
        validEmailRequired: 'Please enter a valid email address'
      },
      auth: {
        welcomeBack: 'Welcome back',
        signInMessage: 'Enter your credentials to access your account',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        firstName: 'First Name',
        lastName: 'Last Name',
        forgotPassword: 'Forgot your password?',
        rememberMe: 'Remember me',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out',
        createAccount: 'Create Account',
        alreadyHaveAccount: 'Already have an account?',
        dontHaveAccount: "Don't have an account?",
        continueWith: 'Or continue with',
        agreeToTerms: 'I agree to the Terms of Service and Privacy Policy',
        resetPassword: 'Reset Password',
        backToLogin: 'Back to Login',
        checkEmail: 'Check your email',
        resetLinkSent: 'A password reset link has been sent to your email',
        newPassword: 'New Password',
        updatePassword: 'Update Password',
        passwordUpdated: 'Password updated successfully'
      },
      navigation: {
        home: 'Home',
        categories: 'Categories',
        howItWorks: 'How It Works',
        pricing: 'Pricing',
        blog: 'Blog',
        rewards: 'Rewards',
        listEquipment: 'List Equipment',
        myEquipment: 'My Equipment',
        myBookings: 'My Bookings',
        messages: 'Messages',
        earnings: 'Earnings',
        disputes: 'Disputes'
      }
    }
  },
  es: {
    translation: {
      common: {
        email: 'Correo electrónico',
        password: 'Contraseña',
        login: 'Iniciar sesión',
        register: 'Registrarse',
        submit: 'Enviar',
        cancel: 'Cancelar',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        view: 'Ver',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        confirm: 'Confirmar',
        back: 'Atrás',
        next: 'Siguiente',
        previous: 'Anterior',
        search: 'Buscar'
      },
      hero: {
        tagline: 'Alquila Cualquier Cosa, En Cualquier Momento',
        subtitle: 'Conecta. Comparte. Prospera.',
        searchPlaceholder: '¿Qué necesitas alquilar?',
        locationPlaceholder: 'Ingresa tu ubicación',
        datesPlaceholder: 'Selecciona fechas',
        topCategories: 'Categorías Populares'
      },
      categories: {
        construction: 'Herramientas de Construcción',
        vehicles: 'Vehículos y Transporte',
        electronics: 'Electrónicos',
        eventEquipment: 'Equipo para Eventos',
        homeGarden: 'Hogar y Jardín',
        photography: 'Equipo de Fotografía'
      },
      errors: {
        searchRequired: 'Por favor ingresa un término de búsqueda'
      },
      auth: {
        welcomeBack: 'Bienvenido de nuevo',
        signInMessage: 'Ingresa tus credenciales para acceder a tu cuenta',
        email: 'Correo electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar contraseña',
        firstName: 'Nombre',
        lastName: 'Apellido',
        forgotPassword: '¿Olvidaste tu contraseña?',
        rememberMe: 'Recordarme',
        signIn: 'Iniciar sesión',
        signUp: 'Registrarse',
        signOut: 'Cerrar sesión',
        createAccount: 'Crear cuenta',
        alreadyHaveAccount: '¿Ya tienes una cuenta?',
        dontHaveAccount: '¿No tienes una cuenta?',
        continueWith: 'O continúa con'
      },
      navigation: {
        home: 'Inicio',
        categories: 'Categorías',
        howItWorks: 'Cómo funciona',
        pricing: 'Precios',
        blog: 'Blog',
        rewards: 'Recompensas',
        listEquipment: 'Listar equipo'
      }
    }
  },
  fr: {
    translation: {
      common: {
        email: 'E-mail',
        password: 'Mot de passe',
        login: 'Se connecter',
        register: "S'inscrire",
        submit: 'Soumettre',
        cancel: 'Annuler',
        save: 'Sauvegarder',
        delete: 'Supprimer',
        edit: 'Modifier',
        view: 'Voir',
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        confirm: 'Confirmer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        search: 'Rechercher'
      },
      hero: {
        tagline: 'Louez Tout, À Tout Moment',
        subtitle: 'Connectez. Partagez. Prospérez.',
        searchPlaceholder: 'Que voulez-vous louer?',
        locationPlaceholder: 'Entrez votre emplacement',
        datesPlaceholder: 'Sélectionnez les dates',
        topCategories: 'Catégories Populaires'
      },
      categories: {
        construction: 'Outils de Construction',
        vehicles: 'Véhicules et Transport',
        electronics: 'Électronique',
        eventEquipment: 'Équipement d\'Événement',
        homeGarden: 'Maison et Jardin',
        photography: 'Équipement Photo'
      },
      errors: {
        searchRequired: 'Veuillez entrer un terme de recherche'
      },
      auth: {
        welcomeBack: 'Bon retour',
        signInMessage: 'Entrez vos identifiants pour accéder à votre compte',
        email: 'E-mail',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        firstName: 'Prénom',
        lastName: 'Nom',
        forgotPassword: 'Mot de passe oublié ?',
        rememberMe: 'Se souvenir de moi',
        signIn: 'Se connecter',
        signUp: "S'inscrire",
        signOut: 'Se déconnecter',
        createAccount: 'Créer un compte',
        alreadyHaveAccount: 'Vous avez déjà un compte ?',
        dontHaveAccount: "Vous n'avez pas de compte ?",
        continueWith: 'Ou continuez avec'
      },
      navigation: {
        home: 'Accueil',
        categories: 'Catégories',
        howItWorks: 'Comment ça marche',
        pricing: 'Tarifs',
        blog: 'Blog',
        rewards: 'Récompenses',
        listEquipment: 'Lister équipement'
      }
    }
  },
  de: {
    translation: {
      common: {
        email: 'E-Mail',
        password: 'Passwort',
        login: 'Anmelden',
        register: 'Registrieren',
        submit: 'Absenden',
        cancel: 'Abbrechen',
        save: 'Speichern',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        view: 'Ansehen',
        loading: 'Lädt...',
        error: 'Fehler',
        success: 'Erfolg',
        confirm: 'Bestätigen',
        back: 'Zurück',
        next: 'Weiter',
        previous: 'Vorherige',
        search: 'Suchen'
      },
      hero: {
        tagline: 'Miete Alles, Jederzeit',
        subtitle: 'Verbinden. Teilen. Gedeihen.',
        searchPlaceholder: 'Was möchten Sie mieten?',
        locationPlaceholder: 'Geben Sie Ihren Standort ein',
        datesPlaceholder: 'Termine auswählen',
        topCategories: 'Beliebte Kategorien'
      },
      categories: {
        construction: 'Bauwerkzeuge',
        vehicles: 'Fahrzeuge und Transport',
        electronics: 'Elektronik',
        eventEquipment: 'Veranstaltungsausrüstung',
        homeGarden: 'Haus und Garten',
        photography: 'Fotoausrüstung'
      },
      errors: {
        searchRequired: 'Bitte geben Sie einen Suchbegriff ein'
      },
      auth: {
        welcomeBack: 'Willkommen zurück',
        signInMessage: 'Geben Sie Ihre Anmeldedaten ein, um auf Ihr Konto zuzugreifen',
        email: 'E-Mail',
        password: 'Passwort',
        confirmPassword: 'Passwort bestätigen',
        firstName: 'Vorname',
        lastName: 'Nachname',
        forgotPassword: 'Passwort vergessen?',
        rememberMe: 'Angemeldet bleiben',
        signIn: 'Anmelden',
        signUp: 'Registrieren',
        signOut: 'Abmelden',
        createAccount: 'Konto erstellen',
        alreadyHaveAccount: 'Haben Sie bereits ein Konto?',
        dontHaveAccount: 'Haben Sie noch kein Konto?',
        continueWith: 'Oder fortfahren mit'
      },
      navigation: {
        home: 'Startseite',
        categories: 'Kategorien',
        howItWorks: 'Wie es funktioniert',
        pricing: 'Preise',
        blog: 'Blog',
        rewards: 'Belohnungen',
        listEquipment: 'Ausrüstung auflisten'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
