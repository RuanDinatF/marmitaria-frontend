"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login - replace with actual authentication logic
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Left side - Mascot and branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="relative w-96 h-96 mb-8 drop-shadow-2xl">
            <Image
              src="/images/marmitaria-mascot.png"
              alt="Mascote Marmitaria"
              fill
              className="object-contain animate-in fade-in zoom-in duration-700"
              priority
            />
          </div>

          <div className="text-center space-y-4 animate-in slide-in-from-bottom duration-700 delay-300">
            <h2 className="text-4xl font-bold text-balance">Bem-vindo ao Sistema de Gerenciamento</h2>
            <p className="text-xl text-orange-100 text-balance">Gerencie sua marmitaria com eficiência e praticidade</p>
            <div className="flex items-center justify-center gap-2 text-orange-100 pt-4">
              <ChefHat className="w-5 h-5" />
              <span className="text-sm font-medium">Feito com carinho para sua cozinha</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right duration-700">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-4">
              <Image src="/images/marmitaria-logo.png" alt="Logo Marmitaria" fill className="object-contain" priority />
            </div>
            <h1 className="text-2xl font-bold text-orange-900 text-center">Sistema de Gerenciamento</h1>
          </div>

          <Card className="border-orange-200 shadow-2xl backdrop-blur-sm bg-white/95">
            <CardHeader className="space-y-2 pb-6">
              <div className="flex justify-center mb-2">
                <div className="relative w-20 h-20 hidden lg:block">
                  <Image src="/images/marmitaria-logo.png" alt="Logo" fill className="object-contain" />
                </div>
              </div>
              <CardTitle className="text-3xl text-center text-orange-900 font-bold">Entrar</CardTitle>
              <CardDescription className="text-center text-base">
                Digite suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-orange-900 font-medium text-base">
                    Usuário
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border-orange-200 focus:border-orange-500 focus:ring-orange-500 h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-orange-900 font-medium text-base">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-orange-200 focus:border-orange-500 focus:ring-orange-500 h-12 text-base"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar no Sistema"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-orange-700 mt-6">© 2025 Marmitaria. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}
