import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sign Language Enterprise Platform',
  description: 'Bi-Directional Sign Language Communication Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col overflow-hidden`}>
        {/* Top Enterprise Navigation Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] z-20">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-blue-700/50">
              SL
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-800">SignComm <span className="text-slate-400 font-normal">Enterprise</span></h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
             <button className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-1 -mb-1">Interpreter Workspace</button>
             <button className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Dictionaries</button>
             <button className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Model Analytics</button>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 flex items-center shadow-inner">
               <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Global Network Online
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white">US</div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden relative">
          {children}
        </main>
      </body>
    </html>
  )
}
