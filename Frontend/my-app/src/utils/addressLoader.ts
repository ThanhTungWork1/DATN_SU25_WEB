// Utility to load Vietnam address data
// 1) Try local JSON (assets/addresses.json)
// 2) If incomplete, fetch remote dataset and normalize
// 3) Cache to localStorage to avoid repeated network calls

export interface Province { code: string | number; name: string }
export interface District { code: string | number; name: string; province_code: string | number }
export interface Ward { code: string | number; name: string; district_code: string | number }
export interface AddressData { provinces: Province[]; districts: District[]; wards: Ward[] }

const LOCAL_STORAGE_KEY = "vn_addresses_v2";

function isComplete(data: AddressData | null): boolean {
  if (!data) return false;
  // Relax threshold: provinces >= 63 is enough to consider complete
  return (data.provinces?.length || 0) >= 63;
}

function normalizeLocal(raw: any): AddressData {
  const provinces = (raw?.provinces || []).map((p: any) => ({ code: p.code, name: p.name }));
  const districts = (raw?.districts || []).map((d: any) => ({ code: d.code, name: d.name, province_code: d.province_code }));
  const wards = (raw?.wards || []).map((w: any) => ({ code: w.code, name: w.name, district_code: w.district_code }));
  return { provinces, districts, wards };
}

function normalizeRemote(raw: any): AddressData {
  // Expected remote structure: [{ Name, Code, Districts: [{ Name, Code, Wards: [{ Name, Code }] }] }]
  const provinces: Province[] = [];
  const districts: District[] = [];
  const wards: Ward[] = [];
  if (Array.isArray(raw)) {
    for (const p of raw) {
      const pCode = p?.Code ?? p?.code ?? p?.id;
      const pName = p?.Name ?? p?.name;
      if (!pCode || !pName) continue;
      provinces.push({ code: pCode, name: pName });
      if (Array.isArray(p?.Districts)) {
        for (const d of p.Districts) {
          const dCode = d?.Code ?? d?.code ?? d?.id;
          const dName = d?.Name ?? d?.name;
          if (!dCode || !dName) continue;
          districts.push({ code: dCode, name: dName, province_code: pCode });
          if (Array.isArray(d?.Wards)) {
            for (const w of d.Wards) {
              const wCode = w?.Code ?? w?.code ?? w?.id;
              const wName = w?.Name ?? w?.name;
              if (!wCode || !wName) continue;
              wards.push({ code: wCode, name: wName, district_code: dCode });
            }
          }
        }
      }
    }
  }
  return { provinces, districts, wards };
}

async function fetchRemote(): Promise<AddressData | null> {
  try {
    // Public dataset of Vietnam administrative divisions
    const url = "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Remote dataset fetch failed: ${res.status}`);
    const raw = await res.json();
    const normalized = normalizeRemote(raw);
    if (!isComplete(normalized)) throw new Error("Remote dataset incomplete after normalize");
    return normalized;
  } catch (e) {
    console.warn("Address remote fetch failed:", e);
    return null;
  }
}

export async function getAddresses(): Promise<AddressData> {
  // 0) From cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as AddressData;
      if (isComplete(parsed)) return parsed;
    }
  } catch {}

  // 1) Local JSON (TRY LOCAL FULL RAW FIRST, use immediately if present)
  let localData: AddressData = { provinces: [], districts: [], wards: [] };
  try {
    // 1.a) Hierarchical raw dataset (preferred)
    try {
      const fullRaw = await import("../assets/addresses_full_raw.json");
      localData = normalizeRemote((fullRaw as any).default || fullRaw);
      if (localData.provinces?.length) {
        console.info('[addressLoader] Using local full raw dataset (addresses_full_raw.json)', {
          provinces: localData.provinces.length,
          districts: localData.districts.length,
          wards: localData.wards.length,
        });
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localData)); } catch {}
        return localData;
      }
    } catch (e) {
      console.warn('[addressLoader] Failed to load addresses_full_raw.json', e);
    }

    // 1.b) Flattened full dataset
    try {
      const fullFlat = await import("../assets/addresses_full.json");
      localData = normalizeLocal((fullFlat as any).default || fullFlat);
      if (localData.provinces?.length) {
        console.info('[addressLoader] Using local full flat dataset (addresses_full.json)', {
          provinces: localData.provinces.length,
          districts: localData.districts.length,
          wards: localData.wards.length,
        });
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localData)); } catch {}
        return localData;
      }
    } catch {}

    // 1.c) Sample minimal dataset
    const mod = await import("../assets/addresses.json");
    localData = normalizeLocal(mod.default || mod);
    console.info('[addressLoader] Using sample dataset (addresses.json)', {
      provinces: localData.provinces.length,
      districts: localData.districts.length,
      wards: localData.wards.length,
    });
  } catch (e) {
    console.warn("Cannot load local addresses.json:", e);
  }
  try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localData)); } catch {}
  console.info('[addressLoader] Cached dataset to localStorage (from local fallback)', LOCAL_STORAGE_KEY);
  return localData;

  // 2) Remote fallback
  const remote = await fetchRemote();
  if (remote && isComplete(remote)) {
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remote)); } catch {}
    console.info('[addressLoader] Using remote dataset and cached', {
      provinces: remote.provinces.length,
      districts: remote.districts.length,
      wards: remote.wards.length,
    });
    return remote as AddressData;
  }

  // 3) As a last resort, return whatever we have locally
  return localData;
}
