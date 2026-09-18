import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Download,
  Terminal,
  ShieldCheck,
  FileText,
  Layers,
  Sparkles,
  Rocket
} from 'lucide-react';
import { downloadAndroidStudioProjectZip } from '../utils/exportAndroidZip';

interface GooglePlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GooglePlayModal: React.FC<GooglePlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'commands' | 'listing' | 'datasafety'>('steps');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const keytoolCmd = `keytool -genkey -v -keystore release.keystore -alias metaldetector -keyalg RSA -keysize 2048 -validity 10000`;
  const gradleBuildCmd = `./gradlew bundleRelease`;
  const appTitle = `Industrial Metal Detector & Stud Finder`;
  const shortDesc = `Industrial magnetic flux meter and ferrous stud finder with 50Hz dial gauge.`;
  const fullDesc = `Industrial Metal Detector & Stud Finder transforms your Android smartphone into a precision electromagnetic flux density (EMF) instrument and wall stud locator using native hardware sensors.

KEY FEATURES:
• High-Precision 270° Circular Analog Dial Gauge
• Real-time combined magnetic flux: ||B|| = √(x² + y² + z²) in microteslas (µT)
• Standard 70 µT detection threshold with dynamic visual indicators
• Wall Stud & AC Conduit locator with proximity target lock
• High-frequency 50Hz sensor polling (Sensor.TYPE_MAGNETIC_FIELD)
• Low-latency tone beeps & continuous waveform haptic vibrations
• Ambient background calibration (Tare baseline zero-out)
• 100% Offline & Private: No internet permission, zero ads, zero tracking.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#101218] border border-[#262A36] rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#151720] border-b border-[#232734]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3DDC84]/15 border border-[#3DDC84]/40 flex items-center justify-center text-[#3DDC84]">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Push to Google Play Console
              </h2>
              <p className="text-[11px] text-[#8E92A0]">
                Package: <code className="text-[#3DDC84]">com.industrial.metaldetector</code> • Target SDK 35
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8E92A0] hover:text-white hover:bg-[#1E222D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#232734] bg-[#12141A] text-xs">
          {[
            { id: 'steps', label: '1. Release Roadmap' },
            { id: 'commands', label: '2. Build Bundle (.aab)' },
            { id: 'listing', label: '3. Store Listing Copy' },
            { id: 'datasafety', label: '4. Data Safety Form' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 border-b-2 font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#3DDC84] text-[#3DDC84] bg-[#181B24]'
                  : 'border-transparent text-[#8E92A0] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-[#E0E0E0]">
          {/* TAB 1: ROADMAP */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#171A23] border border-[#262A38] flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#3DDC84] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white">Direct Production Readiness</div>
                  <p className="text-[#A0A4B4] leading-relaxed text-[11px]">
                    The native Android project is configured with <strong>Target SDK 35 (Android 15)</strong>, Jetpack Compose 1.6, and optimized ProGuard shrink rules matching Google Play’s latest store submission standards.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#14161F] border border-[#202430] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#3DDC84] text-black font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-white">Download Android Studio Project (.zip)</div>
                    <p className="text-[11px] text-[#8E92A0]">
                      Export the complete Kotlin/Compose project including all Gradle manifests, vectors, and layouts.
                    </p>
                    <button
                      onClick={() => downloadAndroidStudioProjectZip()}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3DDC84] text-black font-bold text-[11px] hover:bg-[#32b86e] transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Project .zip</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#14161F] border border-[#202430] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#3DDC84] text-black font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-white">Generate Signed Bundle (.aab)</div>
                    <p className="text-[11px] text-[#8E92A0]">
                      Create your cryptographic upload keystore and run <code className="text-[#3DDC84]">./gradlew bundleRelease</code> to generate <code className="text-white">app-release.aab</code>.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#14161F] border border-[#202430] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#3DDC84] text-black font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-white">Upload to Google Play Console</div>
                    <p className="text-[11px] text-[#8E92A0]">
                      Open Google Play Console, click <strong>Create app</strong>, upload the generated <code className="text-white">app-release.aab</code> bundle, paste store metadata, and submit for rollout.
                    </p>
                    <a
                      href="https://play.google.com/console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C202C] border border-[#2C3142] text-white font-bold text-[11px] hover:bg-[#252A3A] transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#3DDC84]" />
                      <span>Open play.google.com/console</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMMANDS */}
          {activeTab === 'commands' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#3DDC84]" />
                    STEP 1: Generate Release Keystore
                  </span>
                  <button
                    onClick={() => handleCopy(keytoolCmd, 'keytool')}
                    className="flex items-center gap-1 text-[11px] text-[#3DDC84] hover:underline cursor-pointer"
                  >
                    {copiedKey === 'keytool' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'keytool' ? 'Copied!' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#090A0E] border border-[#202432] text-[#3DDC84] overflow-x-auto text-[11px] font-mono leading-relaxed">
                  {keytoolCmd}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#3DDC84]" />
                    STEP 2: Build App Bundle (.aab)
                  </span>
                  <button
                    onClick={() => handleCopy(gradleBuildCmd, 'gradle')}
                    className="flex items-center gap-1 text-[11px] text-[#3DDC84] hover:underline cursor-pointer"
                  >
                    {copiedKey === 'gradle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'gradle' ? 'Copied!' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#090A0E] border border-[#202432] text-[#3DDC84] overflow-x-auto text-[11px] font-mono leading-relaxed">
                  {gradleBuildCmd}
                </pre>
                <div className="text-[10px] text-[#8E92A0]">
                  Output file location: <code className="text-white">android/app/build/outputs/bundle/release/app-release.aab</code>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#151822] border border-[#232734] text-[11px] text-[#A0A4B4] space-y-1">
                <div className="font-bold text-white">Need to test directly on device before publishing?</div>
                <div>Run <code className="text-[#3DDC84]">./gradlew installRelease</code> with USB debugging enabled.</div>
              </div>
            </div>
          )}

          {/* TAB 3: STORE LISTING */}
          {activeTab === 'listing' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8E92A0]">App Title (max 30 chars):</span>
                  <button
                    onClick={() => handleCopy(appTitle, 'title')}
                    className="flex items-center gap-1 text-[11px] text-[#3DDC84] hover:underline cursor-pointer"
                  >
                    {copiedKey === 'title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-[#090A0E] border border-[#202432] text-white text-[11px] font-bold">
                  {appTitle}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8E92A0]">Short Description (max 80 chars):</span>
                  <button
                    onClick={() => handleCopy(shortDesc, 'short')}
                    className="flex items-center gap-1 text-[11px] text-[#3DDC84] hover:underline cursor-pointer"
                  >
                    {copiedKey === 'short' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-[#090A0E] border border-[#202432] text-white text-[11px]">
                  {shortDesc}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8E92A0]">Full Description:</span>
                  <button
                    onClick={() => handleCopy(fullDesc, 'full')}
                    className="flex items-center gap-1 text-[11px] text-[#3DDC84] hover:underline cursor-pointer"
                  >
                    {copiedKey === 'full' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Full Description</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-[#090A0E] border border-[#202432] text-white text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {fullDesc}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: DATA SAFETY */}
          {activeTab === 'datasafety' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#151822] border border-[#242836] space-y-2">
                <div className="flex items-center gap-2 text-white font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#3DDC84]" />
                  <span>Google Play Data Safety Questionnaire Answers</span>
                </div>
                <p className="text-[11px] text-[#A0A4B4] leading-relaxed">
                  Google Play requires every developer to complete the Data Safety section. Because this app is an offline physical measurement utility, your answers are straightforward:
                </p>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#0D0F14] border border-[#202430] flex items-center justify-between">
                  <span className="text-[#E0E0E0]">Does your app collect or share any user data?</span>
                  <span className="text-[#3DDC84] font-bold bg-[#3DDC84]/15 px-2 py-0.5 rounded border border-[#3DDC84]/30">NO</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D0F14] border border-[#202430] flex items-center justify-between">
                  <span className="text-[#E0E0E0]">Is all of the user data collected encrypted in transit?</span>
                  <span className="text-[#8E92A0] font-bold">N/A (No data collected)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D0F14] border border-[#202430] flex items-center justify-between">
                  <span className="text-[#E0E0E0]">Do you provide a way for users to request data deletion?</span>
                  <span className="text-[#8E92A0] font-bold">N/A (No data collected)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D0F14] border border-[#202430] flex items-center justify-between">
                  <span className="text-[#E0E0E0]">Requires Internet permission?</span>
                  <span className="text-[#3DDC84] font-bold bg-[#3DDC84]/15 px-2 py-0.5 rounded border border-[#3DDC84]/30">NO (Zero network access)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#151720] border-t border-[#232734]">
          <button
            onClick={() => downloadAndroidStudioProjectZip()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C202C] hover:bg-[#252A3A] text-white text-xs font-bold border border-[#2C3142] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#3DDC84]" />
            <span>Export Project .zip</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href="https://play.google.com/console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3DDC84] hover:bg-[#32b86e] text-black text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Open Play Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
