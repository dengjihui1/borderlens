export type Status = 'ready' | 'action' | 'review';

export type DocumentType =
  | 'hksar-passport'
  | 'macao-passport'
  | 'prc-passport'
  | 'other-passport';

export type Place = 'hong-kong' | 'macao' | 'mainland-china' | 'japan' | 'united-kingdom' | 'other';

export interface JourneyInput {
  document: DocumentType;
  origin: Place;
  transit?: Place | '';
  destination: Place;
  purpose: 'tourism' | 'business' | 'study-work' | 'other';
  transitEntry: 'yes' | 'no' | 'unknown';
  extras: string[];
  documentsValid: boolean;
  includeReturn: boolean;
}

export interface Source {
  title: string;
  url: string;
  checkedAt: string;
  note?: string;
}

export interface RouteStep {
  from: Place;
  to: Place;
  status: Status;
  title: string;
  summary: string;
  bring: string[];
  actions: string[];
  verify: string[];
  sources: Source[];
}

export interface JourneyResult {
  status: Status;
  headline: string;
  summary: string;
  steps: RouteStep[];
  stale: boolean;
  checkedAt: string;
}

export const DATA_CHECKED_AT = '2026-09-08';

export const SOURCES = {
  iata: {
    title: 'IATA Travel Centre / Timatic',
    url: 'https://www.iata.org/en/services/compliance/timatic/travel-documentation/',
    checkedAt: DATA_CHECKED_AT,
    note: '航空公司常用的旅行证件规则体系；最终登机决定仍由承运人作出。',
  },
  japan: {
    title: '日本外务省｜短期停留免签安排',
    url: 'https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html',
    checkedAt: DATA_CHECKED_AT,
    note: '香港和澳门条目分别受 Note 5、Note 6 的证件类型限制。',
  },
  hongKong: {
    title: '香港入境事务处｜香港旅行证件常见问题',
    url: 'https://www.immd.gov.hk/eng/faq/hk-travel-doc.html',
    checkedAt: DATA_CHECKED_AT,
  },
  macao: {
    title: '澳门特别行政区政府｜居民自助过关服务',
    url: 'https://www.gov.mo/en/services/ps-1474/',
    checkedAt: DATA_CHECKED_AT,
  },
  uk: {
    title: 'GOV.UK｜Check if you need a UK visa',
    url: 'https://www.gov.uk/check-uk-visa',
    checkedAt: DATA_CHECKED_AT,
    note: '英国资格取决于证件、居留状态和旅行目的，需在官方问答中动态核验。',
  },
} satisfies Record<string, Source>;

const placeNames: Record<Place, string> = {
  'hong-kong': '中国香港',
  macao: '中国澳门',
  'mainland-china': '中国内地',
  japan: '日本',
  'united-kingdom': '英国',
  other: '其他地区',
};

export function placeName(place: Place) {
  return placeNames[place];
}

export function isRuleDataStale(checkedAt: string, now = new Date()): boolean {
  const checked = new Date(`${checkedAt}T00:00:00Z`);
  return now.getTime() - checked.getTime() > 30 * 24 * 60 * 60 * 1000;
}

function baseStep(from: Place, to: Place): RouteStep {
  return {
    from,
    to,
    status: 'review',
    title: `${placeName(from)} → ${placeName(to)}`,
    summary: '这条路线尚未纳入首版受控规则库。',
    bring: ['本次实际使用的有效旅行证件'],
    actions: [],
    verify: ['使用目的地政府官方工具，并向承运航空公司核验登机证件要求。'],
    sources: [SOURCES.iata],
  };
}

function evaluateLeg(input: JourneyInput, from: Place, to: Place): RouteStep {
  const step = baseStep(from, to);

  if (!input.documentsValid) {
    step.status = 'action';
    step.summary = '你尚未确认所有证件在整个行程期间有效。';
    step.actions.push('逐一核对证件有效期、空白页及目的地要求的剩余有效期。');
  }

  if (to === 'japan' && input.purpose === 'tourism') {
    step.sources = [SOURCES.japan, SOURCES.iata];
    if (input.document === 'hksar-passport') {
      step.status = input.documentsValid ? 'ready' : 'action';
      step.summary = '持香港特区护照短期旅游，当前受控规则显示可按日本免签安排前往，通常获准停留 90 天。';
      step.bring = ['有效香港特区护照', '返程或续程安排', '住宿与行程证明'];
      step.verify = ['出发前再次核对日本外务省页面 Note 5 及航空公司要求。'];
      return step;
    }
    if (input.document === 'macao-passport') {
      step.status = input.documentsValid ? 'ready' : 'action';
      step.summary = '持澳门特区护照短期旅游，当前受控规则显示可按日本免签安排前往，通常获准停留 90 天。';
      step.bring = ['有效澳门特区护照', '返程或续程安排', '住宿与行程证明'];
      step.verify = ['出发前再次核对日本外务省页面 Note 6 及航空公司要求。'];
      return step;
    }
    if (input.document === 'prc-passport') {
      step.status = 'action';
      step.summary = '中国普通护照不能继承香港或澳门身份对应的日本免签待遇。';
      step.bring = ['有效中国普通护照'];
      step.actions = ['通过日本使领馆或其指定渠道确认并办理适用签证。'];
      step.verify = ['签证类别、材料和处理时间以日本官方渠道为准。'];
      return step;
    }
  }

  if (to === 'mainland-china' && from === 'hong-kong') {
    const hasId = input.extras.includes('hk-id');
    const hasPermit = input.extras.includes('home-return-permit');
    step.sources = [SOURCES.hongKong, SOURCES.iata];
    step.bring = ['香港身份证', '港澳居民来往内地通行证（回乡证）'];
    if (hasId && hasPermit && input.documentsValid) {
      step.status = 'ready';
      step.summary = '已勾选香港身份证与回乡证，符合首版的基础证件组合。';
      step.verify = ['确认所选口岸、通道及两份证件均可在行程日期使用。'];
    } else {
      step.status = 'action';
      step.summary = '进入中国内地需要区分香港一侧身份证明与内地入境证件。';
      if (!hasId) step.actions.push('补充或确认香港身份证。');
      if (!hasPermit) step.actions.push('补充或确认有效回乡证。');
    }
    return step;
  }

  if (to === 'mainland-china' && from === 'macao') {
    const hasId = input.extras.includes('macao-id');
    const hasPermit = input.extras.includes('home-return-permit');
    step.sources = [SOURCES.macao, SOURCES.iata];
    step.bring = ['澳门居民身份证', '与身份匹配的内地通行证件'];
    if (!hasId || !hasPermit) {
      step.status = 'action';
      step.summary = '首版检查到澳门居民身份证或通行证件尚未确认。';
      if (!hasId) step.actions.push('补充或确认澳门居民身份证。');
      if (!hasPermit) step.actions.push('补充或确认港澳居民来往内地通行证。');
    } else {
      step.status = 'review';
      step.summary = '基础证件已勾选，但澳门口岸、通道和自动通关资格会改变可用组合。';
    }
    step.verify = ['按实际口岸核对人工/自动通关条件；首次使用自动通关时确认是否需要登记。'];
    return step;
  }

  if (to === 'united-kingdom') {
    step.status = input.documentsValid ? 'review' : 'action';
    step.sources = [SOURCES.uk, SOURCES.iata];
    step.summary = '英国入境资格需要根据实际证件、居留状态与旅行目的在官方工具中动态判断。';
    step.bring = ['实际旅行证件', ...(input.extras.includes('uk-residence') ? ['英国居留资格证明'] : [])];
    step.actions = ['完成 GOV.UK 官方签证检查问答并保存结果。'];
    step.verify = ['返英资格、电子签证/eVisa 账户状态及承运人可读取的信息。'];
    return step;
  }

  if (to === 'hong-kong' || to === 'macao') {
    step.status = 'review';
    step.summary = '港澳入境需按实际旅行证件和居民身份分别核验，首版不做泛化推断。';
    step.sources = [to === 'hong-kong' ? SOURCES.hongKong : SOURCES.macao, SOURCES.iata];
    return step;
  }

  return step;
}

export function evaluateJourney(input: JourneyInput, now = new Date()): JourneyResult {
  const points: Place[] = [input.origin];
  if (input.transit) points.push(input.transit);
  points.push(input.destination);
  if (input.includeReturn) points.push(input.origin);

  const steps: RouteStep[] = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    steps.push(evaluateLeg(input, points[index], points[index + 1]));
  }

  if (input.transit && input.transitEntry === 'unknown') {
    const transitStep = steps[0];
    if (transitStep.status !== 'action') transitStep.status = 'review';
    transitStep.summary = '是否在转机地办理入境尚未确认，因此无法给出干净的证件结论。';
    transitStep.verify.unshift('确认是否需要提取行李、换机场或通过边检。');
  }

  if (!input.documentsValid) {
    for (const step of steps) {
      step.status = 'action';
      if (!step.actions.some((item) => item.includes('有效期'))) {
        step.actions.unshift('确认所有旅行证件在整个行程期间有效，并满足剩余有效期要求。');
      }
    }
  }

  const status: Status = steps.some((step) => step.status === 'action')
    ? 'action'
    : steps.some((step) => step.status === 'review')
      ? 'review'
      : 'ready';

  const copy = {
    ready: ['基础路线已通过', '受控规则范围内未发现必须先处理的证件缺口。'],
    action: ['出发前有待办', '至少一个边境节点存在明确的证件或签证动作。'],
    review: ['需要人工核验', '至少一个节点超出受控规则，或取决于口岸、承运人及实时政策。'],
  } as const;

  return {
    status,
    headline: copy[status][0],
    summary: copy[status][1],
    steps,
    stale: isRuleDataStale(DATA_CHECKED_AT, now),
    checkedAt: DATA_CHECKED_AT,
  };
}
