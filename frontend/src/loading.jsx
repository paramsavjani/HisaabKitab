"use client"

export default function LoadingPage() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden z-50 text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(34,197,94,0.06), rgba(0,0,0,0) 60%), radial-gradient(1000px 500px at 110% 10%, rgba(59,130,246,0.06), rgba(0,0,0,0) 55%), linear-gradient(180deg, #0a0a0b 0%, #050505 100%)",
      }}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex flex-col items-center space-y-8">
          {/* Brand */}
          <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 tracking-wide">
            Hisaab <span className="text-white">Kitab</span>
          </div>

          <div className="relative mt-2">
            {/* Outer rotating ring */}
            <div className="w-40 h-40 rounded-full border-4 border-white/10 relative">
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-300/90 border-r-cyan-300/60 animate-spin"
                style={{ animationDuration: "1s" }}
              />
            </div>

            {/* Middle ring */}
            <div className="absolute inset-3 w-32 h-32 rounded-full border-3 border-white/10">
              <div
                className="absolute inset-0 rounded-full border-3 border-transparent border-b-emerald-200/80 border-l-cyan-300/50 animate-spin"
                style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
              />
            </div>

            {/* Inner ring */}
            <div className="absolute inset-8 w-24 h-24 rounded-full border-2 border-white/10">
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/70 animate-spin"
                style={{ animationDuration: "0.8s" }}
              />
            </div>

            {/* Center pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full animate-pulse opacity-80" />
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-white/5 blur-xl animate-pulse" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-light tracking-wider">Initializing</h2>
            <p className="text-gray-400 text-sm font-medium">Setting up your experience...</p>
          </div>

          {/* Progress shimmer */}
          <div className="w-56 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 animate-[shimmer_1.4s_infinite] rounded-full" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-spin, .animate-pulse { animation: none !important; }
        }
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
      `}</style>
    </div>
  )
}
