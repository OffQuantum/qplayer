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
  },
  pages: {
    error: '/auth/error', // Hata olduğunda gösterilecek sayfa
  },
  secret: process.env.AUTH_SECRET,
});
