import React from 'react';
import { X, Layers, Cpu, Sparkles, Music, Smartphone } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface LayerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LayerGuideModal: React.FC<LayerGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const layers = [
    {
      num: '01',
      title: 'ARQUITECTURA TIPOGRÁFICA',
      subtitle: 'STROKE + SOLID HIERARCHY',
      icon: Layers,
      accent: '#FFFFFF',
      desc: 'Letras geométricas hiperamplias con contorno vectorial sin relleno (THIAGOVSC) superpuestas a un bloque sólido blanco de alto impacto (OFICIAL). Logra presencia editorial de alta costura.',
    },
    {
      num: '02',
      title: 'SUJETO CYBORG Y CHICLE PINK',
      subtitle: 'BIOMECHANICAL FASHION ARTWORK',
      icon: Cpu,
      accent: '#F03BBE',
      desc: 'Composición de retrato futurista con implantes biomecánicos, pelo fucsia eléctrico y un elemento orgánico inesperado: una pompa de chicle translúcida que equilibra el tono cyber con un carácter desenfadado y magnético.',
    },
    {
      num: '03',
      title: 'ATMÓSFERA NEÓN & VIGNETTE',
      subtitle: 'MAGENTA → FUCHSIA → VIOLET',
      icon: Sparkles,
      accent: '#D92CFF',
      desc: 'Gradientes radiales desenfocados a 140px con textura de grano de película cinematográfica de 35mm. Contraste profundo con fondo carbón casi negro (#08070D).',
    },
    {
      num: '04',
      title: 'MOTOR SINTETIZADOR HI-FI',
      subtitle: 'LIVE WEBAUDIO SYNTHESIS',
      icon: Music,
      accent: '#7136FF',
      desc: 'Generador de síntesis sustractiva analógica con osciladores sub-bass, acordes menores pentatónicos y visualizador de ondas en tiempo real que reacciona a los hercios generados.',
    },
    {
      num: '05',
      title: 'REPRODUCTOR VERTICAL 9:16',
      subtitle: 'SMARTPHONE HARDWARE FRAME',
      icon: Smartphone,
      accent: '#D92CFF',
      desc: 'Chasis curvo que emula dispositivos móviles insignia con controles táctiles, selector de miniaturas 01-04, métricas dinámicas de Instagram y enlaces de alta conversión.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#100A18] border border-white/20 p-6 sm:p-8 md:p-10 shadow-[0_20px_70px_rgba(217,44,255,0.2)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
          <div>
            <span className="text-[11px] font-mono-tech tracking-[0.25em] text-[#D92CFF] uppercase font-bold">
              DESGLOSE DE CAPAS CREATIVAS
            </span>
            <h3 className="font-condensed font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-wide">
              GUÍA DE CAPAS // THIAGOVSC
            </h3>
          </div>

          <button
            onClick={() => {
              audioEngine.playClickFx();
              onClose();
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-[#D92CFF] text-white transition-colors cursor-pointer"
            aria-label="Cerrar Guía"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layers List */}
        <div className="space-y-4">
          {layers.map((layer) => {
            const Icon = layer.icon;

            return (
              <div
                key={layer.num}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all flex flex-col sm:flex-row items-start gap-4 sm:gap-6"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                  style={{ backgroundColor: `${layer.accent}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: layer.accent }} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono-tech font-bold" style={{ color: layer.accent }}>
                      CAPA {layer.num}
                    </span>
                    <span className="text-[10px] font-mono-tech tracking-[0.2em] text-[#92909B] uppercase">
                      {layer.subtitle}
                    </span>
                  </div>

                  <h4 className="font-condensed font-extrabold text-xl sm:text-2xl text-white uppercase tracking-wide mb-2">
                    {layer.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-[#92909B] font-sans leading-relaxed">
                    {layer.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono-tech text-[#92909B]">
          <span>DIRECCIÓN DE ARTE: THIAGOVSC 2026</span>
          <button
            onClick={() => {
              audioEngine.playClickFx();
              onClose();
            }}
            className="text-white hover:text-[#D92CFF] uppercase tracking-[0.15em] cursor-pointer"
          >
            ENTENDIDO [ CERRAR ]
          </button>
        </div>
      </div>
    </div>
  );
};
