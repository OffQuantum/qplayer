import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowedEmailsEnv = process.env.ALLOWED_EMAILS;
      
      if (!allowedEmailsEnv) {
        console.error("ALLOWED_EMAILS environment variable is not set.");
        return false;
      }

      const allowedEmails = allowedEmailsEnv.split(',').map(email => email.trim().toLowerCase());
      
      if (user.email && allowedEmails.includes(user.email.toLowerCase())) {
        return true; // Giriş başarılı
      }
      
      // Kullanıcı listede yoksa özel hata sayfasına yönlendirilir
      return "/auth/error?error=AccessDenied";
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/auth/signin');
      
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      return isLoggedIn; // Giriş yapmadıysa otomatik olarak pages.signIn'e yönlendirir
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', // Hata olduğunda gösterilecek sayfa
  },
  secret: process.env.AUTH_SECRET,
});
