import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';

interface AndroidPermissionModalProps {
  isOpen: boolean;
  onGrant: () => void;
  onDeny: () => void;
}

export const AndroidPermissionModal: React.FC<AndroidPermissionModalProps> = ({
  isOpen,
  onGrant,
  onDeny,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div
        id="android-permission-sheet"
        className="w-full max-w-sm rounded-[28px] bg-[#1E2026] border border-[#2E323D] text-[#E0E0E0] shadow-2xl overflow-hidden p-6 flex flex-col gap-4 font-sans animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-full bg-[#FF3E3E]/10 border border-[#FF3E3E]/30 flex items-center justify-center text-[#FF3E3E]">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-medium text-white tracking-tight">
            Allow Metal Detector to access physical sensors?
          </h3>
          <p className="text-xs text-[#8E92A0] leading-relaxed">
            The application needs high-rate access to the device's internal 3-axis magnetometer sensor to measure magnetic flux density and detect nearby ferrous objects.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2 text-sm font-medium">
          <button
            id="perm-while-using"
            onClick={onGrant}
            className="w-full py-3 px-4 rounded-full bg-[#E0E0E0] text-[#121316] hover:bg-white active:scale-[0.98] transition-all cursor-pointer text-center font-semibold"
          >
            While using the app
          </button>
          <button
            id="perm-only-this-time"
            onClick={onGrant}
            className="w-full py-3 px-4 rounded-full bg-[#2A2D37] text-[#E0E0E0] hover:bg-[#353945] active:scale-[0.98] transition-all cursor-pointer text-center font-semibold"
          >
            Only this time
          </button>
          <button
            id="perm-dont-allow"
            onClick={onDeny}
            className="w-full py-3 px-4 rounded-full bg-transparent text-[#8E92A0] hover:text-[#C0C4D0] active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Don't allow
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6A6E7A] font-mono">
          <ShieldCheck className="w-3 h-3 text-[#00FF41]" />
          <span>Android 15 Permission Model • Hardware Level</span>
        </div>
      </div>
    </div>
  );
};
