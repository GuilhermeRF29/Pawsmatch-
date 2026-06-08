import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "motion/react";
import { Pet } from "../types";
import { Heart, X, Star, MapPin, Bone, Shield, Info, Phone, Calendar } from "lucide-react";

interface SwipeCardProps {
  key?: string;
  pet: Pet;
  onSwipe: (direction: "left" | "right" | "super") => void;
  isTopCard: boolean;
}

export default function SwipeCard({ pet, onSwipe, isTopCard }: SwipeCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  
  // Motion values to track drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transforms for rotation and opacity overlays based on drag offset
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  
  // Custom label opacities
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const superOpacity = useTransform(y, [-80, 0], [1, 0]);

  const controls = useAnimation();

  const handleDragEnd = async (_event: any, info: any) => {
    const swipeThreshold = 140;
    const verticalThreshold = -120;
    
    if (info.offset.x > swipeThreshold) {
      // Swipe Right (Like)
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.12 } });
      onSwipe("right");
    } else if (info.offset.x < -swipeThreshold) {
      // Swipe Left (Nope)
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.12 } });
      onSwipe("left");
    } else if (info.offset.y < verticalThreshold) {
      // Swipe Up (Super Like)
      await controls.start({ y: -500, opacity: 0, transition: { duration: 0.12 } });
      onSwipe("super");
    } else {
      // Snap back
      controls.start({ x: 0, y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const handleAction = async (direction: "left" | "right" | "super") => {
    if (!isTopCard) return;
    
    if (direction === "right") {
      await controls.start({ x: 500, opacity: 0, rotate: 15, transition: { duration: 0.15 } });
    } else if (direction === "left") {
      await controls.start({ x: -500, opacity: 0, rotate: -15, transition: { duration: 0.15 } });
    } else {
      await controls.start({ y: -500, opacity: 0, transition: { duration: 0.15 } });
    }
    onSwipe(direction);
  };

  return (
    <div className={`absolute inset-0 select-none ${isTopCard ? "z-20 cursor-grab active:cursor-grabbing" : "z-10 scale-95 opacity-60 pointer-events-none translate-y-2"}`}>
      <motion.div
        drag={isTopCard}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, y, rotate, opacity }}
        className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-rose-50 flex flex-col"
        layoutId={`pet-${pet.id}`}
      >
        {/* Overlay Labels for tactile gesture feedback */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-12 left-10 z-30 border-4 border-emerald-500 text-emerald-500 font-display text-3xl font-extrabold uppercase px-4 py-1.5 rounded-xl rotate-[-20deg]"
        >
          ADOTAR 💚
        </motion.div>
        
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-12 right-10 z-30 border-4 border-rose-500 text-rose-500 font-display text-3xl font-extrabold uppercase px-4 py-1.5 rounded-xl rotate-[20deg]"
        >
          PASSAR 💔
        </motion.div>

        <motion.div
          style={{ opacity: superOpacity }}
          className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30 border-4 border-sky-500 text-sky-500 font-display text-2xl font-extrabold uppercase px-4 py-1.5 rounded-xl text-center"
        >
          SUPER MATCH ⭐
        </motion.div>

        {/* Pet Image Banner Area */}
        <div className="relative flex-1 bg-neutral-900 overflow-hidden">
          <img
            src={pet.photo}
            alt={pet.name}
            className="w-full h-full object-cover select-none pointer-events-none transform transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
          />
          
          {/* Subtle vignette gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Quick Info Tags on top left */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm text-white ${pet.type === "Cachorro" ? "bg-orange-500" : pet.type === "Gato" ? "bg-purple-500" : "bg-sky-500"}`}>
              {pet.type}
            </span>
            <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white shadow-sm border border-white/10">
              {pet.breed}
            </span>
          </div>

          {/* Location on top right */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1 shadow-sm border border-white/10">
            <MapPin size={12} className="text-rose-400" />
            <span>{pet.location}</span>
          </div>

          {/* Essential Info Overlay (Name, biological specs) */}
          <div className="absolute bottom-4 inset-x-0 px-6 text-white flex flex-col pointer-events-auto">
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-display font-black tracking-tight drop-shadow">
                  {pet.name}
                </h2>
                <span className="text-2xl font-light text-rose-200 drop-shadow">
                  {pet.age}
                </span>
              </div>
              <button
                id={`btn-info-${pet.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(!showInfo);
                }}
                className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition text-white border border-white/10"
              >
                <Info size={18} />
              </button>
            </div>

            {/* Quick badges under name */}
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="text-xs bg-white/15 px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/5 font-medium">
                <Bone size={12} className="text-orange-300" />
                {pet.size}
              </span>
              <span className="text-xs bg-white/15 px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/5 font-medium">
                <Shield size={12} className="text-teal-300" />
                {pet.gender}
              </span>
              <span className="text-xs bg-white/15 px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/5 font-medium">
                <Phone size={12} className="text-sky-300" />
                {pet.shelterName}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Info Drawer (Expanded description & bios) */}
        {showInfo && (
          <div className="bg-rose-50/95 backdrop-blur px-6 py-5 max-h-[190px] overflow-y-auto border-t border-rose-100 flex flex-col shrink-0 text-gray-700 pointer-events-auto">
            <div className="flex items-center justify-between font-semibold border-b border-rose-200/50 pb-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-[#ff4b6e] font-display">História de Amor & Adoção</span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar size={12} />
                <span>Disponível</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 font-sans italic">
              "{pet.bio}"
            </p>
            <div className="mt-3 pt-2.5 border-t border-rose-200/50 flex flex-col gap-1 text-[11px] text-slate-500">
              <div className="flex justify-between">
                <span>Abrigo Salvador:</span>
                <span className="font-semibold text-slate-700">{pet.shelterName}</span>
              </div>
              <div className="flex justify-between">
                <span>E-mail para Ficha:</span>
                <span className="font-semibold text-slate-700">{pet.contactEmail}</span>
              </div>
            </div>
          </div>
        )}

        {/* Static controls row ONLY at the very bottom of the card for ease of click */}
        {isTopCard && !showInfo && (
          <div className="py-2.5 sm:py-4 bg-white border-t border-slate-50 flex items-center justify-center gap-6 sm:gap-8 shrink-0">
            <button
              id={`bt-nope-${pet.id}`}
              onClick={() => handleAction("left")}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-50 border border-rose-100 hover:bg-rose-100/80 active:scale-95 transition flex items-center justify-center text-rose-500 shadow-md hover:shadow-lg hover:text-rose-600 cursor-pointer"
              title="Passar vez"
            >
              <X size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
            </button>
            <button
              id={`bt-super-${pet.id}`}
              onClick={() => handleAction("super")}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-50 border border-sky-100 hover:bg-sky-100/80 active:scale-95 transition flex items-center justify-center text-sky-500 shadow-md hover:shadow-lg hover:text-sky-600 cursor-pointer"
              title="Super Gostei! ⭐"
            >
              <Star size={18} className="sm:w-5 sm:h-5" fill="currentColor" />
            </button>
            <button
              id={`bt-like-${pet.id}`}
              onClick={() => handleAction("right")}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/80 active:scale-95 transition flex items-center justify-center text-emerald-500 shadow-md hover:shadow-lg hover:text-emerald-600 cursor-pointer"
              title="Quero Adotar!"
            >
              <Heart size={20} className="sm:w-6 sm:h-6" fill="currentColor" strokeWidth={0} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
