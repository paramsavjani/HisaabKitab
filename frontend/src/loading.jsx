"use client"

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center overflow-hidden z-50">
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
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-40 h-40 rounded-full border-4 border-gray-700/50 relative">
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-gray-300 animate-spin"
                style={{ animationDuration: "1s" }}
              />
            </div>

            {/* Middle ring */}
            <div className="absolute inset-3 w-32 h-32 rounded-full border-3 border-gray-600/30">
              <div
                className="absolute inset-0 rounded-full border-3 border-transparent border-b-gray-200 border-l-gray-400 animate-spin"
                style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
              />
            </div>

            {/* Inner ring */}
            <div className="absolute inset-8 w-24 h-24 rounded-full border-2 border-gray-500/20">
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/80 animate-spin"
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
            <h2 className="text-2xl font-light text-white tracking-wider">Initializing</h2>
            <p className="text-gray-400 text-sm font-medium">Setting up your experience...</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
