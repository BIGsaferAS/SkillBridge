"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loginType, setLoginType] = useState<"CORPORATE" | "INDIVIDUAL">("CORPORATE")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Geçersiz e-posta veya şifre.")
      } else {
        const sessionRes = await fetch("/api/auth/session")
        const sessionData = await sessionRes.json()
        
        if (sessionData?.user?.role === "SUPER_ADMIN") {
          router.push("/super-admin")
        } else if (sessionData?.user?.role === "COMPANY_MANAGER" || sessionData?.user?.role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }
    } catch (err) {
      setError("Beklenmeyen bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-10 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="mx-auto w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-6">S</div>
          <h2 className="text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
            SkillBridge AI
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Yapay Zeka Destekli İşe Alım
          </p>
        </div>

        <div className="flex rounded-md shadow-sm mb-6 bg-zinc-100 dark:bg-zinc-800 p-1">
          <button
            onClick={() => setLoginType("CORPORATE")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginType === "CORPORATE" ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >
            Kurumsal Giriş
          </button>
          <button
            onClick={() => setLoginType("INDIVIDUAL")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginType === "INDIVIDUAL" ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >
            Bireysel Aday
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-500 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 placeholder-zinc-500 text-zinc-900 dark:text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder={loginType === "CORPORATE" ? "Şirket E-posta Adresi" : "Kişisel E-posta Adresi"}
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 placeholder-zinc-500 text-zinc-900 dark:text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Şifre"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-md disabled:opacity-50"
            >
              {isLoading ? "Giriş Yapılıyor..." : "Sisteme Giriş Yap"}
            </button>
          </div>
          
          {loginType === "INDIVIDUAL" && (
            <div className="text-center mt-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Hesabınız yok mu?{" "}
                <Link href="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
                  Bireysel Aday Kaydı Oluştur
                </Link>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
