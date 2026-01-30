export type PartCategory = 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'case' | 'cooling';

export interface Part {
  id: string;
  category: PartCategory;
  brand: string;
  name: string;
  price: number;
  specs: Record<string, string | number | boolean | undefined>;
}

export interface Build {
  id?: string;
  name?: string;
  parts: {
    cpu?: Part | null;
    gpu?: Part | null;
    motherboard?: Part | null;
    ram?: Part | null;
    storage?: Part | null;
    psu?: Part | null;
    case?: Part | null;
    cooling?: Part | null;
  };
  currency: 'INR';
  createdAt?: string;
}

export type IssueSeverity = 'pass' | 'warn' | 'fail';

export interface Issue {
  id: string;
  severity: IssueSeverity;
  category: PartCategory | 'general';
  title: string;
  detail: string;
  suggestedFix: string;
  affectedParts: PartCategory[];
}

export interface CompatibilityReport {
  estimatedWattage: number;
  recommendedPSU: number;
  issues: Issue[];
  score: number;
  totalPrice: number;
  partsCount: number;
}

function getNumericSpec(part: Part | null | undefined, key: string): number {
  if (!part) return 0;
  const val = part.specs[key];
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseInt(val, 10) || 0;
  return 0;
}

function getStringSpec(part: Part | null | undefined, key: string): string {
  if (!part) return '';
  const val = part.specs[key];
  if (typeof val === 'string') return val.toLowerCase().trim();
  return '';
}

export function evaluateCompatibility(build: Build): CompatibilityReport {
  const issues: Issue[] = [];
  const { cpu, gpu, motherboard, ram, psu, cooling } = build.parts;
  const caseUnit = build.parts.case;

  // Calculate total price
  const totalPrice = Object.values(build.parts).reduce((sum, part) => {
    return sum + (part?.price || 0);
  }, 0);

  // Count parts
  const partsCount = Object.values(build.parts).filter(Boolean).length;

  // Calculate estimated wattage
  const cpuTdp = getNumericSpec(cpu, 'tdp');
  const gpuTdp = getNumericSpec(gpu, 'tdp');
  const overhead = 80;
  const estimatedWattage = cpuTdp + gpuTdp + overhead;
  const recommendedPSU = Math.ceil(estimatedWattage * 1.2);

  // Check 1: CPU socket matches motherboard socket
  if (cpu && motherboard) {
    const cpuSocket = getStringSpec(cpu, 'socket');
    const mbSocket = getStringSpec(motherboard, 'socket');

    if (cpuSocket && mbSocket) {
      if (cpuSocket === mbSocket) {
        issues.push({
          id: 'socket-match',
          severity: 'pass',
          category: 'cpu',
          title: 'CPU Socket Compatible',
          detail: `${cpu.brand} ${cpu.name} (${cpuSocket.toUpperCase()}) is compatible with ${motherboard.brand} ${motherboard.name}`,
          suggestedFix: 'No action needed',
          affectedParts: ['cpu', 'motherboard'],
        });
      } else {
        issues.push({
          id: 'socket-mismatch',
          severity: 'fail',
          category: 'cpu',
          title: 'CPU Socket Mismatch',
          detail: `CPU requires ${cpuSocket.toUpperCase()} socket but motherboard has ${mbSocket.toUpperCase()}`,
          suggestedFix: `Replace motherboard with one that supports ${cpuSocket.toUpperCase()} socket, or choose a different CPU`,
          affectedParts: ['cpu', 'motherboard'],
        });
      }
    }
  }

  // Check 2: RAM type matches motherboard ramType
  if (ram && motherboard) {
    const ramType = getStringSpec(ram, 'type') || getStringSpec(ram, 'ramType');
    const mbRamType = getStringSpec(motherboard, 'ram_type') || getStringSpec(motherboard, 'ramType');

    if (ramType && mbRamType) {
      if (ramType === mbRamType) {
        issues.push({
          id: 'ram-match',
          severity: 'pass',
          category: 'ram',
          title: 'RAM Type Compatible',
          detail: `${ramType.toUpperCase()} RAM is compatible with your motherboard`,
          suggestedFix: 'No action needed',
          affectedParts: ['ram', 'motherboard'],
        });
      } else {
        issues.push({
          id: 'ram-mismatch',
          severity: 'fail',
          category: 'ram',
          title: 'RAM Type Mismatch',
          detail: `Your RAM is ${ramType.toUpperCase()} but motherboard requires ${mbRamType.toUpperCase()}`,
          suggestedFix: `Replace RAM with ${mbRamType.toUpperCase()} modules, or choose a motherboard that supports ${ramType.toUpperCase()}`,
          affectedParts: ['ram', 'motherboard'],
        });
      }
    }
  }

  // Check 3: PSU wattage >= estimatedWattage * 1.2
  if (psu && estimatedWattage > 0) {
    const psuWattage = getNumericSpec(psu, 'wattage');

    if (psuWattage > 0) {
      if (psuWattage >= recommendedPSU) {
        issues.push({
          id: 'psu-adequate',
          severity: 'pass',
          category: 'psu',
          title: 'PSU Wattage Adequate',
          detail: `${psuWattage}W PSU provides sufficient headroom for ${estimatedWattage}W system`,
          suggestedFix: 'No action needed',
          affectedParts: ['psu'],
        });
      } else if (psuWattage >= estimatedWattage) {
        issues.push({
          id: 'psu-low-headroom',
          severity: 'warn',
          category: 'psu',
          title: 'Low PSU Headroom',
          detail: `${psuWattage}W PSU meets minimum but recommended is ${recommendedPSU}W for stability`,
          suggestedFix: `Consider upgrading to a ${recommendedPSU}W or higher PSU for better efficiency and future upgrades`,
          affectedParts: ['psu'],
        });
      } else {
        issues.push({
          id: 'psu-insufficient',
          severity: 'fail',
          category: 'psu',
          title: 'Insufficient PSU Wattage',
          detail: `${psuWattage}W PSU cannot power ${estimatedWattage}W system. Risk of instability or shutdown`,
          suggestedFix: `Upgrade to at least ${recommendedPSU}W PSU immediately`,
          affectedParts: ['psu'],
        });
      }
    }
  }

  // Check 4: CPU without iGPU and no GPU
  if (cpu && !gpu) {
    const hasIgpu = getStringSpec(cpu, 'igpu') !== 'no' && getStringSpec(cpu, 'integrated_graphics') !== 'false';
    const cpuName = cpu.name.toLowerCase();
    const isNoIgpuCpu = cpuName.includes('f') || cpuName.includes('kf') || cpuName.includes('x3d');

    if (!hasIgpu || isNoIgpuCpu) {
      issues.push({
        id: 'no-graphics',
        severity: 'warn',
        category: 'gpu',
        title: 'No Graphics Output',
        detail: `${cpu.brand} ${cpu.name} has no integrated graphics and no discrete GPU selected`,
        suggestedFix: 'Add a discrete GPU to enable display output',
        affectedParts: ['cpu', 'gpu'],
      });
    }
  }

  // Check 5: GPU length vs case clearance
  if (gpu && caseUnit) {
    const gpuLength = getNumericSpec(gpu, 'length_mm') || getNumericSpec(gpu, 'length');
    const maxGpuLength = getNumericSpec(caseUnit, 'max_gpu_length') || getNumericSpec(caseUnit, 'maxGpuLength');

    if (gpuLength > 0 && maxGpuLength > 0) {
      if (gpuLength <= maxGpuLength) {
        issues.push({
          id: 'gpu-fits',
          severity: 'pass',
          category: 'gpu',
          title: 'GPU Fits Case',
          detail: `${gpuLength}mm GPU fits within ${maxGpuLength}mm case clearance`,
          suggestedFix: 'No action needed',
          affectedParts: ['gpu', 'case'],
        });
      } else {
        issues.push({
          id: 'gpu-too-long',
          severity: 'warn',
          category: 'gpu',
          title: 'GPU May Not Fit',
          detail: `${gpuLength}mm GPU exceeds ${maxGpuLength}mm case clearance by ${gpuLength - maxGpuLength}mm`,
          suggestedFix: 'Choose a shorter GPU or a larger case with more clearance',
          affectedParts: ['gpu', 'case'],
        });
      }
    }
  }

  // Check 6: CPU cooler TDP rating
  if (cpu && cooling) {
    const cpuTdpVal = getNumericSpec(cpu, 'tdp');
    const coolerTdp = getNumericSpec(cooling, 'tdp_rating') || getNumericSpec(cooling, 'tdpRating');

    if (cpuTdpVal > 0 && coolerTdp > 0) {
      if (coolerTdp >= cpuTdpVal) {
        issues.push({
          id: 'cooler-adequate',
          severity: 'pass',
          category: 'cooling',
          title: 'Cooler TDP Adequate',
          detail: `${coolerTdp}W cooler can handle ${cpuTdpVal}W CPU`,
          suggestedFix: 'No action needed',
          affectedParts: ['cpu', 'cooling'],
        });
      } else {
        issues.push({
          id: 'cooler-weak',
          severity: 'warn',
          category: 'cooling',
          title: 'Cooler May Be Insufficient',
          detail: `${coolerTdp}W cooler rating is below ${cpuTdpVal}W CPU TDP`,
          suggestedFix: `Consider a cooler rated for at least ${cpuTdpVal}W or higher for optimal temperatures`,
          affectedParts: ['cpu', 'cooling'],
        });
      }
    }
  }

  // Calculate score
  const failCount = issues.filter((i) => i.severity === 'fail').length;
  const warnCount = issues.filter((i) => i.severity === 'warn').length;
  const passCount = issues.filter((i) => i.severity === 'pass').length;

  let score = 100;
  score -= failCount * 30;
  score -= warnCount * 10;
  score = Math.max(0, Math.min(100, score));

  // Bonus for passing checks
  if (passCount > 0 && failCount === 0) {
    score = Math.min(100, score + passCount * 5);
  }

  return {
    estimatedWattage,
    recommendedPSU,
    issues,
    score,
    totalPrice,
    partsCount,
  };
}
