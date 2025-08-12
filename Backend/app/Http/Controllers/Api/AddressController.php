<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;

class AddressController extends Controller
{
    /**
     * Load merged (sáp nhập) dataset from storage/app/addresses_merged.json
     * Supports two formats:
     *  - Flat: { provinces: [], districts: [], wards: [] }
     *  - Hierarchical: [ { Id, Name, Districts: [ { Id, Name, Wards: [...] } ] } ]
     */
    private function loadMergedData(): array
    {
        try {
            if (!Storage::disk('local')->exists('addresses_merged.json')) {
                return [];
            }
            $raw = Storage::disk('local')->get('addresses_merged.json');
            $json = json_decode($raw, true);
            if (!$json) return [];

            // If already flat
            if (isset($json['provinces']) && isset($json['districts']) && isset($json['wards'])) {
                return [
                    'provinces' => is_array($json['provinces']) ? $json['provinces'] : [],
                    'districts' => is_array($json['districts']) ? $json['districts'] : [],
                    'wards' => is_array($json['wards']) ? $json['wards'] : [],
                ];
            }

            // If hierarchical, normalize to flat
            if (is_array($json) && isset($json[0])) {
                $provinces = [];
                $districts = [];
                $wards = [];
                foreach ($json as $p) {
                    $pid = $p['Id'] ?? ($p['code'] ?? null);
                    $pname = $p['Name'] ?? ($p['name'] ?? '');
                    if ($pid !== null) {
                        $provinces[] = [
                            'code' => (string)$pid,
                            'name' => $pname,
                        ];
                    }
                    if (isset($p['Districts']) && is_array($p['Districts'])) {
                        foreach ($p['Districts'] as $d) {
                            $did = $d['Id'] ?? ($d['code'] ?? null);
                            $dname = $d['Name'] ?? ($d['name'] ?? '');
                            if ($did !== null) {
                                $districts[] = [
                                    'code' => (string)$did,
                                    'name' => $dname,
                                    'province_code' => (string)$pid,
                                ];
                            }
                            if (isset($d['Wards']) && is_array($d['Wards'])) {
                                foreach ($d['Wards'] as $w) {
                                    $wid = $w['Id'] ?? ($w['code'] ?? null);
                                    $wname = $w['Name'] ?? ($w['name'] ?? '');
                                    if ($wid !== null) {
                                        $wards[] = [
                                            'code' => (string)$wid,
                                            'name' => $wname,
                                            'district_code' => (string)$did,
                                        ];
                                    }
                                }
                            }
                        }
                    }
                }
                return [ 'provinces' => $provinces, 'districts' => $districts, 'wards' => $wards ];
            }
        } catch (\Throwable $e) {
            // ignore and fallback
        }
        return [];
    }

    public function provincesMerged()
    {
        try {
            $cacheKey = 'addresses_merged_provinces';
            $cached = Cache::get($cacheKey);
            if (is_array($cached) && !empty($cached)) return response()->json($cached, 200);

            $data = $this->loadMergedData();
            $provinces = $data['provinces'] ?? [];
            Cache::put($cacheKey, $provinces, now()->addHours(24));
            return response()->json($provinces, 200);
        } catch (\Throwable $e) {
            return response()->json([], 200);
        }
    }

    public function districtsMerged($provinceId)
    {
        try {
            $cacheKey = 'addresses_merged_districts_' . $provinceId;
            $cached = Cache::get($cacheKey);
            if (is_array($cached) && !empty($cached)) return response()->json($cached, 200);

            $data = $this->loadMergedData();
            $pidStr = (string)$provinceId;
            $list = array_values(array_filter(($data['districts'] ?? []), function($d) use ($pidStr){
                return (string)($d['province_code'] ?? '') === $pidStr;
            }));
            Cache::put($cacheKey, $list, now()->addHours(24));
            return response()->json($list, 200);
        } catch (\Throwable $e) {
            return response()->json([], 200);
        }
    }

    public function wardsMerged($districtId)
    {
        try {
            $cacheKey = 'addresses_merged_wards_' . $districtId;
            $cached = Cache::get($cacheKey);
            if (is_array($cached) && !empty($cached)) return response()->json($cached, 200);

            $data = $this->loadMergedData();
            $didStr = (string)$districtId;
            $list = array_values(array_filter(($data['wards'] ?? []), function($w) use ($didStr){
                return (string)($w['district_code'] ?? '') === $didStr;
            }));
            Cache::put($cacheKey, $list, now()->addHours(24));
            return response()->json($list, 200);
        } catch (\Throwable $e) {
            return response()->json([], 200);
        }
    }
    public function provinces()
    {
        try {
            // Try with trailing slash
            $res = Http::withOptions(['verify' => false])->timeout(12)->get('https://provinces.open-api.vn/api/p/');
            if ($res->ok()) {
                $json = $res->json();
                // API usually returns array; if object with 'results' in the future, normalize
                if (is_array($json)) {
                    if (!empty($json)) {
                        Cache::put('addresses_provinces', $json, now()->addHours(24));
                        return response()->json($json, 200);
                    }
                }
            }
            // Fallback: without trailing slash
            $res2 = Http::withOptions(['verify' => false])->timeout(12)->get('https://provinces.open-api.vn/api/p');
            if ($res2->ok()) {
                $json2 = $res2->json();
                if (is_array($json2)) {
                    if (!empty($json2)) {
                        Cache::put('addresses_provinces', $json2, now()->addHours(24));
                        return response()->json($json2, 200);
                    }
                }
            }
            // Mirror fallback (GitHub raw)
            $cached = Cache::get('addresses_provinces');
            if ($cached && is_array($cached) && !empty($cached)) {
                return response()->json($cached, 200);
            }
            $mirror = Http::withOptions(['verify' => false])->timeout(15)->get('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
            if ($mirror->ok()) {
                $full = $mirror->json();
                if (is_array($full)) {
                    $pros = array_map(function($p) {
                        return [
                            'name' => $p['Name'] ?? '',
                            'code' => $p['Id'] ?? null,
                            'codename' => $p['Name'] ?? '',
                        ];
                    }, $full);
                    Cache::put('addresses_provinces', $pros, now()->addHours(24));
                    return response()->json($pros, 200);
                }
            }
            // If both fail, return empty array to avoid breaking UI
            return response()->json([], 200);
        } catch (\Throwable $e) {
            // Do not block the UI; return empty list on errors
            $cached = Cache::get('addresses_provinces', []);
            return response()->json($cached, 200);
        }
    }

    public function districts($provinceId)
    {
        try {
            // Preferred approach: fetch all districts and filter by province_code (robust across API variants)
            $pid = intval($provinceId);
            $resAll = Http::withOptions(['verify' => false])->timeout(12)->get('https://provinces.open-api.vn/api/d');
            if ($resAll->ok()) {
                $all = $resAll->json();
                if (is_array($all)) {
                    $filtered = array_values(array_filter($all, function($d) use ($pid, $provinceId) {
                        $code = isset($d['province_code']) ? intval($d['province_code']) : null;
                        // match by int; also allow string equality as fallback
                        return $code === $pid || (string)$d['province_code'] === (string)$provinceId;
                    }));
                    if (!empty($filtered)) {
                        Cache::put('addresses_districts_'.$provinceId, $filtered, now()->addHours(24));
                        return response()->json($filtered, 200);
                    }
                }
            }

            // Fallback: previous methods
            $districts = [];
            $res = Http::withOptions(['verify' => false])->timeout(10)->get("https://provinces.open-api.vn/api/p/{$pid}?depth=2");
            if ($res->ok()) {
                $json = $res->json();
                if (is_array($json) && isset($json[0])) { $json = $json[0]; }
                $districts = is_array($json) ? ($json['districts'] ?? []) : [];
            }
            if (empty($districts)) {
                $res2 = Http::withOptions(['verify' => false])->timeout(10)->get('https://provinces.open-api.vn/api/p', ['code' => $provinceId, 'depth' => 2]);
                if ($res2->ok()) {
                    $json2 = $res2->json();
                    if (is_array($json2) && isset($json2[0])) { $json2 = $json2[0]; }
                    $districts = is_array($json2) ? ($json2['districts'] ?? []) : [];
                }
            }
            if (empty($districts)) {
                $codePadded = str_pad((string)$provinceId, 2, '0', STR_PAD_LEFT);
                $res3 = Http::withOptions(['verify' => false])->timeout(10)->get('https://provinces.open-api.vn/api/p', ['code' => $codePadded, 'depth' => 2]);
                if ($res3->ok()) {
                    $json3 = $res3->json();
                    if (is_array($json3) && isset($json3[0])) { $json3 = $json3[0]; }
                    $districts = is_array($json3) ? ($json3['districts'] ?? []) : [];
                }
            }
            if (empty($districts)) {
                // Mirror fallback by provinceId
                $cached = Cache::get('addresses_districts_'.$provinceId);
                if (is_array($cached) && !empty($cached)) {
                    return response()->json($cached, 200);
                }
                $mirror = Http::withOptions(['verify' => false])->timeout(15)->get('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
                if ($mirror->ok()) {
                    $full = $mirror->json();
                    if (is_array($full)) {
                        // Find province by Id: match by int or exact string (handles '01' vs '1')
                        $pidStr = (string)$provinceId;
                        $pidInt = intval($provinceId);
                        $p = null;
                        foreach ($full as $prov) {
                            $provIdStr = (string)($prov['Id'] ?? '');
                            $provIdInt = intval($prov['Id'] ?? -1);
                            if ($provIdInt === $pidInt || $provIdStr === $pidStr) { $p = $prov; break; }
                        }
                        $filtered = [];
                        if ($p && isset($p['Districts']) && is_array($p['Districts'])) {
                            $filtered = array_map(function($d){
                                return [
                                    'code' => $d['Id'] ?? null,
                                    'name' => $d['Name'] ?? '',
                                    'province_code' => $d['ProvinceId'] ?? null,
                                ];
                            }, $p['Districts']);
                        }
                        Cache::put('addresses_districts_'.$provinceId, $filtered, now()->addHours(24));
                        return response()->json($filtered, 200);
                    }
                }
            }
            return response()->json($districts, 200);
        } catch (\Throwable $e) {
            $cached = Cache::get('addresses_districts_'.$provinceId, []);
            return response()->json($cached, 200);
        }
    }

    public function wards($districtId)
    {
        try {
            // Preferred approach: fetch all wards and filter by district_code
            $did = intval($districtId);
            $resAll = Http::withOptions(['verify' => false])->timeout(12)->get('https://provinces.open-api.vn/api/w');
            if ($resAll->ok()) {
                $all = $resAll->json();
                if (is_array($all)) {
                    $filtered = array_values(array_filter($all, function($w) use ($did, $districtId) {
                        $code = isset($w['district_code']) ? intval($w['district_code']) : null;
                        return $code === $did || (string)$w['district_code'] === (string)$districtId;
                    }));
                    if (!empty($filtered)) {
                        Cache::put('addresses_wards_'.$districtId, $filtered, now()->addHours(24));
                        return response()->json($filtered, 200);
                    }
                }
            }

            // Fallback: previous methods
            $wards = [];
            $res = Http::withOptions(['verify' => false])->timeout(10)->get("https://provinces.open-api.vn/api/d/{$did}?depth=2");
            if ($res->ok()) {
                $json = $res->json();
                if (is_array($json) && isset($json[0])) { $json = $json[0]; }
                $wards = is_array($json) ? ($json['wards'] ?? []) : [];
            }
            if (empty($wards)) {
                $res2 = Http::withOptions(['verify' => false])->timeout(10)->get('https://provinces.open-api.vn/api/d', ['code' => $districtId, 'depth' => 2]);
                if ($res2->ok()) {
                    $json2 = $res2->json();
                    if (is_array($json2) && isset($json2[0])) { $json2 = $json2[0]; }
                    $wards = is_array($json2) ? ($json2['wards'] ?? []) : [];
                }
            }
            if (empty($wards)) {
                $codePadded = str_pad((string)$districtId, 3, '0', STR_PAD_LEFT);
                $res3 = Http::withOptions(['verify' => false])->timeout(10)->get('https://provinces.open-api.vn/api/d', ['code' => $codePadded, 'depth' => 2]);
                if ($res3->ok()) {
                    $json3 = $res3->json();
                    if (is_array($json3) && isset($json3[0])) { $json3 = $json3[0]; }
                    $wards = is_array($json3) ? ($json3['wards'] ?? []) : [];
                }
            }
            if (empty($wards)) {
                $cached = Cache::get('addresses_wards_'.$districtId);
                if (is_array($cached) && !empty($cached)) {
                    return response()->json($cached, 200);
                }
                // Mirror fallback: find district in full JSON
                $mirror = Http::withOptions(['verify' => false])->timeout(15)->get('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
                if ($mirror->ok()) {
                    $full = $mirror->json();
                    if (is_array($full)) {
                        $didStr = (string)$districtId;
                        $wardsList = [];
                        foreach ($full as $prov) {
                            if (!isset($prov['Districts']) || !is_array($prov['Districts'])) continue;
                            foreach ($prov['Districts'] as $dist) {
                                $distIdStr = (string)($dist['Id'] ?? '');
                                $distIdInt = intval($dist['Id'] ?? -1);
                                if ($distIdInt === intval($districtId) || $distIdStr === $didStr) {
                                    if (isset($dist['Wards']) && is_array($dist['Wards'])) {
                                        $wardsList = array_map(function($w){
                                            return [
                                                'code' => $w['Id'] ?? null,
                                                'name' => $w['Name'] ?? '',
                                                'district_code' => $w['DistrictID'] ?? null,
                                            ];
                                        }, $dist['Wards']);
                                    }
                                    break 2;
                                }
                            }
                        }
                        Cache::put('addresses_wards_'.$districtId, $wardsList, now()->addHours(24));
                        return response()->json($wardsList, 200);
                    }
                }
            }
            return response()->json($wards, 200);
        } catch (\Throwable $e) {
            $cached = Cache::get('addresses_wards_'.$districtId, []);
            return response()->json($cached, 200);
        }
    }
}
