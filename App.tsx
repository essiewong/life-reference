
import React, { useState, useRef, useEffect } from 'react';
import { Dimension, Milestone, UserProfile, ComparisonData, LifeReport } from './types';
import { STATUS_OPTIONS, TIMING_LABELS, AGE_RANGES } from './constants';
import { generateLifeSummary } from './services/geminiService';

const LOADING_MESSAGES = [
  "正在检索时间的流向...",
  "解析生命独有的旋律...",
  "在众生轨迹中寻找你的坐标...",
  "编织属于你的岁月篇章...",
  "感悟那些被时光标记的瞬间..."
];

const App: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<Dimension>('EMOTION');
  
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [selectedStatusCode, setSelectedStatusCode] = useState<string>(STATUS_OPTIONS['EMOTION'][0].value);

  const [profile, setProfile] = useState<UserProfile>({
    birthDate: '1995-06-15',
    milestones: { EMOTION: [], CAREER: [] },
  });
  const [report, setReport] = useState<LifeReport | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  // Cycling loading messages
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleTabChange = (dim: Dimension) => {
    setActiveTab(dim);
    setSelectedStatusCode(STATUS_OPTIONS[dim][0].value);
  };

  const handleCommitMilestone = () => {
    if (!selectedRange) return;

    const newMs: Milestone = {
      id: Math.random().toString(36).substr(2, 9),
      ageRangeLabel: selectedRange,
      statusCode: selectedStatusCode
    };

    setProfile(prev => ({
      ...prev,
      milestones: {
        ...prev.milestones,
        [activeTab]: [...prev.milestones[activeTab], newMs].sort((a, b) => {
            const startA = parseInt(a.ageRangeLabel.split('-')[0]);
            const startB = parseInt(b.ageRangeLabel.split('-')[0]);
            return startA - startB;
        })
      }
    }));

    setSelectedRange(null);
  };

  const removeMilestone = (dim: Dimension, id: string) => {
    setProfile(prev => ({
      ...prev,
      milestones: {
        ...prev.milestones,
        [dim]: prev.milestones[dim].filter(m => m.id !== id)
      }
    }));
  };

  const generateReport = async () => {
    if (profile.milestones.EMOTION.length === 0 && profile.milestones.CAREER.length === 0) {
      alert("请至少记录一个人生节点");
      return;
    }
    setLoading(true);
    setLoadingMsgIdx(0);
    
    const comparisons: ComparisonData[] = [];
    
    (['EMOTION', 'CAREER'] as Dimension[]).forEach(dim => {
      profile.milestones[dim].forEach(ms => {
        const startAge = parseInt(ms.ageRangeLabel.split('-')[0]);
        const isCareer = dim === 'CAREER';
        const peakAge = isCareer ? 24 : 27;
        
        const timingCategory: ComparisonData['timingCategory'] = 
          startAge < peakAge - 2 ? 'EARLY' : (startAge > peakAge + 4 ? 'LATE' : 'MAINSTREAM');
        
        const dist = [
          { ageRange: '10-20', percentage: 10, isUserPosition: startAge < 20 },
          { ageRange: '21-25', percentage: 35, isUserPosition: startAge >= 21 && startAge <= 25 },
          { ageRange: '26-30', percentage: 30, isUserPosition: startAge >= 26 && startAge <= 30 },
          { ageRange: '31-40', percentage: 15, isUserPosition: startAge >= 31 && startAge <= 40 },
          { ageRange: '41+', percentage: 10, isUserPosition: startAge > 40 },
        ];

        comparisons.push({
          dimension: dim,
          milestoneId: ms.id,
          statusLabel: STATUS_OPTIONS[dim].find(o => o.value === ms.statusCode)?.label || '',
          ageRangeLabel: ms.ageRangeLabel,
          timingCategory,
          distribution: dist
        });
      });
    });

    const tempReport: LifeReport = { profile, comparisons, aiSummary: '' };
    const summary = await generateLifeSummary(tempReport);
    setReport({ ...tempReport, aiSummary: summary });
    setLoading(false);
    setStep(2);
  };

  const handleDownloadImage = async () => {
    if (captureRef.current) {
      const canvas = await (window as any).html2canvas(captureRef.current, {
        scale: 3,
        backgroundColor: '#fff',
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `人生参照系_报告_${profile.birthDate}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: '人生参照系',
      text: '看看我的生命足迹与众生有何不同。',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('链接已复制到剪贴板，快去分享吧！');
      } catch (err) {
        alert('分享失败，请手动复制链接。');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 px-4 font-sans text-slate-900">
      {loading && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 bg-indigo-50 rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-indigo-600 text-xl font-serif">★</span>
                 </div>
              </div>
           </div>
           <p className="text-slate-600 font-serif text-sm tracking-widest animate-pulse duration-[2000ms]">
              {LOADING_MESSAGES[loadingMsgIdx]}
           </p>
        </div>
      )}

      <div className="w-full max-w-md">
        {step === 1 ? (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header & BirthDate */}
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100">
              <header className="text-center mb-6">
                <h1 className="text-xl font-bold serif tracking-wider">人生参照系</h1>
                <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-widest">Life Baseline Tracker</p>
              </header>
              <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500">出生日期</label>
                <input 
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => setProfile(p => ({ ...p, birthDate: e.target.value }))}
                  className="bg-transparent border-none text-sm font-bold text-blue-600 outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Recording Module */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-6 space-y-5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    添加{activeTab === 'EMOTION' ? '情感' : '事业'}里程碑
                </div>

                <div className="flex bg-slate-200/50 p-1 rounded-2xl">
                  {(['EMOTION', 'CAREER'] as Dimension[]).map(d => (
                    <button
                      key={d}
                      onClick={() => handleTabChange(d)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                        activeTab === d ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
                      }`}
                    >
                      {d === 'EMOTION' ? '情感维度' : '事业维度'}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {AGE_RANGES.map(range => (
                    <button
                      key={range}
                      onClick={() => setSelectedRange(range)}
                      className={`py-3 rounded-xl text-[11px] font-bold transition-all shadow-sm flex items-center justify-center border ${
                        selectedRange === range 
                          ? 'bg-indigo-600 border-indigo-600 text-white' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-2">
                    <div className={`relative transition-all duration-300 ${!selectedRange ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                        <select 
                            value={selectedStatusCode}
                            onChange={(e) => setSelectedStatusCode(e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                        >
                            {STATUS_OPTIONS[activeTab].map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                        </div>
                    </div>

                    <button
                        disabled={!selectedRange}
                        onClick={handleCommitMilestone}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                            selectedRange 
                            ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-[0.98]' 
                            : 'bg-slate-200 text-slate-400'
                        }`}
                    >
                        + 记录阶段
                    </button>
                </div>
            </div>

            {/* Recorded Tracks */}
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-500 px-1">已记录轨迹（{activeTab === 'EMOTION' ? '情感' : '事业'}）</h3>
               <div className="space-y-3">
                  {profile.milestones[activeTab].length > 0 ? (
                    profile.milestones[activeTab].map(ms => (
                      <div key={ms.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-right-2 shadow-sm">
                         <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg min-w-[45px] text-center shrink-0">
                            {ms.ageRangeLabel}
                         </div>
                         <div className="flex-1 text-[13px] font-bold text-slate-700 overflow-hidden text-ellipsis whitespace-nowrap">
                            {STATUS_OPTIONS[activeTab].find(o => o.value === ms.statusCode)?.label}
                         </div>
                         <button 
                           onClick={() => removeMilestone(activeTab, ms.id)}
                           className="text-slate-200 hover:text-red-400 p-1 shrink-0 transition-colors"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                         </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl text-xs font-medium">
                        暂无记录，请从上方选择并点击“+ 记录阶段”
                    </div>
                  )}
               </div>
            </div>

            <button
              disabled={loading}
              onClick={generateReport}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-sm mt-4"
            >
              生成我的人生参照报告
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-500">
            <div ref={captureRef} id="capture-area" className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col text-slate-800">
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold serif leading-none">人生参照报告</h2>
                  <p className="text-[8px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-light">Born: {profile.birthDate}</p>
                </div>
                {/* Removed Archive ID section */}
              </div>

              <div className="p-6 space-y-8">
                <section className="bg-slate-50 p-4 rounded-2xl border-l-4 border-amber-400 relative">
                  <p className="text-xs text-slate-700 serif leading-relaxed">
                    {report?.aiSummary}
                  </p>
                </section>

                <div className="grid grid-cols-1 gap-8">
                  {(['CAREER', 'EMOTION'] as Dimension[]).map(dim => {
                    const dimComparisons = report?.comparisons.filter(c => c.dimension === dim);
                    if (dimComparisons?.length === 0) return null;

                    return (
                      <div key={dim} className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <span className={`w-1 h-3 rounded-full ${dim === 'CAREER' ? 'bg-blue-500' : 'bg-rose-400'}`}></span>
                             {dim === 'CAREER' ? '事业轨迹' : '情感轨迹'}
                           </h3>
                           <span className="text-[8px] text-slate-300 font-mono">Track Line</span>
                        </div>

                        <div className="space-y-6 pl-3 border-l border-slate-100 ml-1">
                          {dimComparisons?.map((comp) => (
                            <div key={comp.milestoneId} className="relative">
                              <div className={`absolute -left-[17px] top-1 w-2 h-2 rounded-full border bg-white ${dim === 'CAREER' ? 'border-blue-500' : 'border-rose-400'}`}></div>
                              
                              <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-start">
                                  <div className="text-[11px] font-bold text-slate-700 leading-tight pr-4">{comp.statusLabel}</div>
                                  <div className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{comp.ageRangeLabel}岁</div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-1 bg-slate-100 rounded-full flex gap-0.5 overflow-hidden">
                                    {comp.distribution.map((d, i) => (
                                      <div 
                                        key={i} 
                                        className={`h-full ${d.isUserPosition ? (dim === 'CAREER' ? 'bg-blue-500' : 'bg-rose-400') : 'bg-slate-200'}`}
                                        style={{ width: `${d.percentage}%`, opacity: d.isUserPosition ? 1 : 0.3 }}
                                      ></div>
                                    ))}
                                  </div>
                                  <div className={`text-[8px] font-bold shrink-0 ${
                                    comp.timingCategory === 'EARLY' ? 'text-emerald-500' :
                                    comp.timingCategory === 'MAINSTREAM' ? 'text-blue-500' :
                                    'text-amber-500'
                                  }`}>
                                    {TIMING_LABELS[comp.timingCategory]}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-slate-100 text-center flex flex-col items-center">
                    <div className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.3em]">Life Reference System</div>
                    {/* QR Code SVG removed */}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
               <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm"
                  >
                    重新探索
                  </button>
                  <button
                    onClick={handleDownloadImage}
                    className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-xs shadow-xl shadow-slate-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    保存卡片
                  </button>
               </div>
               <button
                  onClick={handleShare}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                  分享给好友
               </button>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-8 text-slate-300 text-[8px] text-center leading-loose font-medium uppercase tracking-widest">
        Time is the only currency. <br/> Spend it wisely.
      </footer>
    </div>
  );
};

export default App;
