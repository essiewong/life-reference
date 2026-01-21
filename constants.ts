
import { Dimension } from './types';

export const STATUS_OPTIONS: Record<Dimension, { value: string; label: string }[]> = {
  EMOTION: [
    { value: 'first_love', label: '初次认真恋爱' },
    { value: 'hit', label: '情感受到明显打击' },
    { value: 'breakup', label: '重要的分手/关系结束' },
    { value: 'obsessed', label: '反复纠结同一段关系' },
    { value: 'numb', label: '对感情失去信心/麻木' },
    { value: 'recovery', label: '状态回暖/走出阴影' },
    { value: 'stable', label: '进入长期稳定关系' },
    { value: 'craving', label: '单身且渴求感情' },
    { value: 'peaceful_single', label: '单身但状态平稳' },
  ],
  CAREER: [
    { value: 'first_job', label: '开始第一份全职工作' },
    { value: 'change_job', label: '更换工作/职业跳槽' },
    { value: 'doubt', label: '对职业方向产生怀疑' },
    { value: 'upgrade', label: '职位或收入明显提升' },
    { value: 'bottleneck', label: '工作进入瓶颈期' },
    { value: 'transition', label: '完成职业转型' },
    { value: 'independent', label: '开始独立发展/创业' },
    { value: 'early_stress', label: '初期压力与不确定性' },
    { value: 'success', label: '事业取得显著成功' },
  ],
};

export const AGE_RANGES = [
  '10-15', '16-20', '21-25', '26-30', '31-35',
  '36-40', '41-45', '46-50', '51-55', '56-60'
];

export const TIMING_LABELS = {
  EARLY: '先行 (偏早)',
  MAINSTREAM: '同行 (主流)',
  LATE: '沉淀 (偏晚)',
};
