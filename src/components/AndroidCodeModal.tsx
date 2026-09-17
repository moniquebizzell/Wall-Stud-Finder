import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidSourceFile } from '../data/androidFiles';
import { downloadAndroidStudioProjectZip } from '../utils/exportAndroidZip';
import {
  X,
  FileCode,
  Download,
  Copy,
  Check,
  FolderGit2,
  ExternalLink,
  Cpu,
  Layers
} from 'lucide-react';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidSourceFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      await downloadAndroidStudioProjectZip();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm select-none">
      <div
        id="android-studio-modal"
        className="w-full max-w-5xl h-[85vh] rounded-2xl bg-[#0E1015] border border-[#2A2D35] text-[#E0E0E0] shadow-2xl flex flex-col overflow-hidden font-mono"
      >
        {/* Modal Top Bar */}
        <div className="px-4 py-3 bg-[#15171D] border-b border-[#2A2D35] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3DDC84]/15 border border-[#3DDC84]/40 flex items-center justify-center text-[#3DDC84]">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider">
                  ANDROID STUDIO PROJECT EXPORT
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2A2D35] text-[#3DDC84] font-bold">
                  Kotlin + Compose
                </span>
              </div>
              <p className="text-[10px] text-[#6A6E7A]">
                Native Android project utilizing Sensor.TYPE_MAGNETIC_FIELD & VibratorManager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="download-android-zip-btn"
              onClick={handleDownloadZip}
              disabled={downloading}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#3DDC84] text-black font-bold text-xs hover:bg-[#32b86e] active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Packing .ZIP...' : 'Download Project (.ZIP)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6A6E7A] hover:text-white hover:bg-[#2A2D35] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Body: File Tree + Code Editor */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Sidebar File Tree */}
          <div className="w-full sm:w-64 bg-[#12141A] border-r border-[#2A2D35] flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3 border-b border-[#2A2D35] text-[10px] uppercase text-[#6A6E7A] font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Project Structure</span>
            </div>
            <div className="p-2 space-y-1">
              {ANDROID_PROJECT_FILES.map((file) => {
                const isActive = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-[#1C202A] text-white border border-[#3A3E4A]'
                        : 'text-[#8E92A0] hover:bg-[#181B22] hover:text-[#E0E0E0]'
                    }`}
                  >
                    <FileCode
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        file.language === 'kotlin' ? 'text-[#A97BFF]' : 'text-[#3DDC84]'
                      }`}
                    />
                    <div className="overflow-hidden">
                      <div className="font-bold truncate text-[11px]">{file.filename}</div>
                      <div className="text-[9px] text-[#6A6E7A] truncate">{file.path}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Android Studio instructions banner */}
            <div className="mt-auto p-3 bg-[#15171D] border-t border-[#2A2D35] text-[10px] text-[#6A6E7A] space-y-1.5">
              <div className="flex items-center gap-1 text-[#E0E0E0] font-bold">
                <Cpu className="w-3 h-3 text-[#3DDC84]" />
                <span>How to run on Phone:</span>
              </div>
              <p>1. Download the .zip file</p>
              <p>2. Open Android Studio → File → Open</p>
              <p>3. Connect phone & press Run (Shift+F10)</p>
            </div>
          </div>

          {/* Main Code View */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0B0E]">
            {/* File Info Bar */}
            <div className="px-4 py-2 bg-[#15171D]/60 border-b border-[#2A2D35] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-bold text-white truncate">{selectedFile.filename}</span>
                <span className="text-[10px] text-[#6A6E7A] truncate">({selectedFile.description})</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2A2D35] hover:bg-[#353945] text-white text-[11px] transition-all cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3 h-3 text-[#00FF41]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-relaxed text-[#E0E0E0] selection:bg-[#FF3E3E]/30">
              <pre className="whitespace-pre">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
