export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand/marketing (desktop only) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #08312a 0%, #0a4a3a 50%, #0d5c48 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10" style={{ background: '#00e47c' }} />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: '#00e47c' }} />

        <div className="relative z-10 max-w-sm text-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl font-bold text-white">PR</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">PharmaRep CRM</h1>
          <p className="text-lg mb-8" style={{ color: '#a7f3d0' }}>
            O CRM feito para representantes farmacêuticos
          </p>

          {/* Feature bullets */}
          <ul className="space-y-4 text-left">
            {[
              { icon: '📋', text: 'Gerencie HCPs e visitas de forma eficiente' },
              { icon: '📊', text: 'Acompanhe seu pipeline de vendas em tempo real' },
              { icon: '💊', text: 'Controle de amostras e estoque integrado' },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                <span className="text-sm leading-relaxed" style={{ color: '#d1fae5' }}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-4 py-8 lg:px-12">
        {/* Mobile logo (only shown on small screens) */}
        <div className="lg:hidden mb-8 text-center">
          <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 shadow-sm">
            <span className="text-xl font-bold text-white">PR</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary">PharmaRep CRM</h1>
          <p className="text-sm text-text-muted mt-1">CRM para representantes farmacêuticos</p>
        </div>

        <div className="w-full max-w-md bg-surface shadow-md rounded-xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
