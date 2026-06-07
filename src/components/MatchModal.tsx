import { motion, AnimatePresence } from "motion/react";
import { Pet, UserProfile } from "../types";
import { Heart, MessageSquare, ArrowRight, Sparkles } from "lucide-react";

interface MatchModalProps {
  pet: Pet | null;
  user: UserProfile;
  onClose: () => void;
  onStartChat: () => void;
}

export default function MatchModal({ pet, user, onClose, onStartChat }: MatchModalProps) {
  if (!pet) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 rounded-3xl overflow-hidden">
        {/* Confetti / Sparkle animations */}
        <div className="absolute inset-0 pointer-events-none opacity-35">
          <div className="absolute top-12 left-12 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
          <div className="absolute top-24 right-16 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
          <div className="absolute bottom-32 left-20 w-4 h-4 bg-sky-400 rounded-full animate-pulse" />
          <div className="absolute bottom-16 right-12 w-3 h-3 bg-purple-400 rounded-full animate-ping" />
        </div>

        {/* Glowing Hearts */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative text-rose-500 mb-6 flex justify-center"
        >
          <Heart size={80} fill="currentColor" className="animate-pulse filter drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]" />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <Sparkles size={28} className="animate-spin text-amber-200" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center px-4"
        >
          <h3 className="text-3xl font-display font-black text-rose-100 tracking-tight leading-none uppercase">
            É um Match!
          </h3>
          <p className="text-rose-200 text-sm mt-2 font-medium">
            Você e o <span className="text-white font-bold">{pet.name}</span> se escolheram!
          </p>
        </motion.div>

        {/* Overlapping Avatars */}
        <div className="relative w-full max-w-[260px] h-36 flex items-center justify-center my-8">
          {/* User Avatar (Slides in from Left) */}
          <motion.div
            initial={{ opacity: 0, x: -100, rotate: -15 }}
            animate={{ opacity: 1, x: -25, rotate: -6 }}
            transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.3 }}
            className="absolute z-20 w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden hover:z-40"
          >
            <img
              src={user.profilePic}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Glowing heart connector */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="absolute z-30 bg-rose-500 text-white rounded-full p-2.5 shadow-lg border border-rose-400 rotate-[12deg]"
          >
            <Heart size={16} fill="currentColor" />
          </motion.div>

          {/* Pet Avatar (Slides in from Right) */}
          <motion.div
            initial={{ opacity: 0, x: 100, rotate: 15 }}
            animate={{ opacity: 1, x: 25, rotate: 6 }}
            transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.4 }}
            className="absolute z-10 w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden hover:z-40"
          >
            <img
              src={pet.photo}
              alt={pet.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        {/* Conversational prompt */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-rose-100/80 px-6 leading-relaxed max-w-xs mb-8"
        >
          O abridor diz que o {pet.name} ficou super entusiasmado e de rabinho abanando ao ver seu interesse! Comece uma conversa.
        </motion.p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3 px-4">
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            id="btn-match-start-chat"
            onClick={onStartChat}
            className="w-full bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white py-3.5 rounded-full font-display font-bold text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare size={16} fill="currentColor" />
            <span>Mandar um "Oi, {pet.name}!"</span>
            <ArrowRight size={14} />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            id="btn-match-keep-swiping"
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/15 text-white/90 py-3 rounded-full font-sans font-medium text-xs tracking-wide transition active:scale-98 cursor-pointer"
          >
            Continuar Deslizando
          </motion.button>
        </div>
      </div>
    </AnimatePresence>
  );
}
