"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/toaster"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  FileText,
  Settings,
  LogOut,
  Menu,
  ChefHat,
  ClipboardList,
} from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ShoppingCart, label: "Vendas", href: "/dashboard/vendas" },
  { icon: Package, label: "Produtos", href: "/dashboard/produtos" },
  { icon: ClipboardList, label: "Insumos", href: "/dashboard/insumos" },
  { icon: Users, label: "Clientes", href: "/dashboard/clientes" },
  { icon: Wallet, label: "Caixa", href: "/dashboard/caixa" },
  { icon: FileText, label: "Relatórios", href: "/dashboard/relatorios" },
  { icon: Settings, label: "Configurações", href: "/dashboard/configuracoes" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    router.push("/")
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-orange-600 to-orange-700">
      {/* Logo */}
      <div className="p-6 border-b border-orange-500">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image src="/images/marmitaria-logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div className="text-white">
            <h2 className="font-bold text-lg">Marmitaria</h2>
            <p className="text-xs text-orange-100">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? "bg-white text-orange-900 hover:bg-white hover:text-orange-900"
                      : "text-white hover:bg-orange-500/50 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="p-4 border-t border-orange-500">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-white">
            <p className="font-medium text-sm">Administrador</p>
            <p className="text-xs text-orange-100">admin@marmitaria.com</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white hover:bg-orange-500/50 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <Sidebar />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-700 border-b border-orange-500">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image src="/images/marmitaria-logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <div className="text-white">
              <h2 className="font-bold">Marmitaria</h2>
              <p className="text-xs text-orange-100">Sistema de Gestão</p>
            </div>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-orange-500/50">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-72 pt-16 lg:pt-0">
        <div className="min-h-screen">{children}</div>
      </main>
      <Toaster />
    </div>
  )
}
