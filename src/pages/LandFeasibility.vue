<template>
  <main class="feasibility" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <header class="assessment-hero">
      <div>
        <p class="eyebrow">{{ copy.eyebrow }}</p>
        <h1>{{ copy.title }}</h1>
        <p>{{ copy.subtitle }}</p>
      </div>
      <div class="hero-actions">
        <span class="country">⌖ Tunisie</span
        ><button
          @click="printReport"
          :disabled="!result || stale || locationBlocked"
        >
          {{ copy.print }}</button
        ><button
          @click="download"
          :disabled="!result || stale || locationBlocked"
        >
          {{ copy.download }}
        </button>
      </div>
    </header>
    <div v-if="error" class="notice danger" role="alert">{{ error }}</div>
    <div
      v-if="locationBlocked"
      class="notice danger location-exclusion"
      role="alert"
    >
      <strong>{{ copy.locationBlockedTitle }}</strong>
      <p>{{ locationMessage }}</p>
      <p class="micro">{{ copy.locationPointScope }}</p>
      <a href="#land-analysis">{{ copy.selectDifferentLocation }} ↑</a>
    </div>
    <div v-if="stale" class="notice warning" role="status">
      {{ copy.stale }}
    </div>
    <div class="assessment-grid">
      <aside class="facts-column">
        <form id="land-analysis" @submit.prevent="analyze" class="input-form">
          <section class="panel">
            <div class="section-heading">
              <span class="section-icon">⌖</span>
              <h2>{{ copy.location }}</h2>
            </div>
            <div class="coordinate-fields">
              <label
                >{{ copy.latitude
                }}<input
                  v-model="form.lat"
                  type="number"
                  min="30"
                  max="38"
                  step="any"
                  required /></label
              ><label
                >{{ copy.longitude
                }}<input
                  v-model="form.lon"
                  type="number"
                  min="7"
                  max="12"
                  step="any"
                  required
              /></label>
            </div>
            <dl class="stat-list">
              <div>
                <dt>{{ copy.surface }}</dt>
                <dd>{{ display(parcelArea, "ha", 2) }}</dd>
              </div>
              <div>
                <dt>{{ copy.altitude }}</dt>
                <dd>
                  {{
                    display(
                      result?.apiInsights?.terrain?.elevationMeters,
                      "m",
                      0,
                    )
                  }}
                </dd>
              </div>
            </dl>
          </section>
          <section class="panel">
            <div class="section-heading">
              <span class="section-icon">◉</span>
              <h2>{{ copy.environment }}</h2>
            </div>
            <dl class="stat-list">
              <div v-for="item in environment" :key="item.key">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
            <p class="micro" v-if="result">
              {{ result.indicators?.date_range || "NASA POWER · 2014–2024" }}
            </p>
          </section>
          <section class="panel">
            <div class="section-heading">
              <span class="section-icon">♧</span>
              <h2>{{ copy.soil }}</h2>
            </div>
            <p class="micro">{{ copy.observed }} · {{ copy.unknown }} = —</p>
            <div class="lab-fields">
              <label v-for="field in soilFields" :key="field.key"
                >{{ copy[field.label]
                }}<input
                  v-model="form[field.key]"
                  type="number"
                  step="any"
                  :min="field.min"
                  :max="field.max"
                  placeholder="—"
              /></label>
            </div>
            <label class="water-field"
              >{{ copy.water
              }}<select v-model="form.waterAccess">
                <option value="unknown">{{ copy.unknown }}</option>
                <option value="true">{{ copy.yes }}</option>
                <option value="false">{{ copy.no }}</option>
              </select></label
            >
            <button
              class="primary analyze-button"
              type="submit"
              :disabled="loading || locationChecking || locationBlocked"
              :title="locationBlocked ? locationMessage : undefined"
            >
              {{ loading ? copy.analyzing : copy.analyze }}
              <span v-if="!loading">↗</span>
            </button>
            <p v-if="isGuest" class="micro">
              <router-link to="/login">{{ copy.signin }}</router-link>
            </p>
          </section>
        </form>
      </aside>
      <section class="map-column">
        <div class="map-panel panel">
          <div class="map-heading">
            <span class="eyebrow">{{ copy.mapTitle }}</span
            ><select v-model="mapType" :aria-label="copy.mapTitle">
              <option value="satellite">{{ copy.satellite }}</option>
              <option value="standard">{{ copy.standard }}</option>
            </select>
          </div>
          <div
            ref="mapContainer"
            class="parcel-map"
            :aria-label="copy.mapTitle"
          ></div>
          <div class="map-tools">
            <button :class="{ active: !drawing }" @click="cancelDrawing">
              ⌖ {{ copy.point }}</button
            ><button :class="{ active: drawing }" @click="startDrawing">
              ◇ {{ copy.draw }}</button
            ><button
              v-if="drawing"
              @click="finishDrawing"
              :disabled="vertices.length < 3"
            >
              ✓ {{ copy.finish }}</button
            ><button v-if="vertices.length || parcel" @click="clearParcel">
              × {{ copy.clear }}
            </button>
          </div>
          <p class="map-hint">{{ drawing ? copy.drawHint : copy.mapHint }}</p>
          <div class="map-area" v-if="parcelArea">
            {{ display(parcelArea, "ha", 2) }}
            <span
              >· {{ vertices.length }}
              {{ $i18n.locale === "fr" ? "sommets" : "vertices" }}</span
            >
          </div>
          <div v-if="mapError" class="map-failure" role="status">
            {{ copy.mapError }}
          </div>
        </div>
        <p v-if="locationChecking" class="notice" role="status">
          {{ copy.locationChecking }}
        </p>
        <p
          v-else-if="locationCheck && !locationBlocked"
          class="notice warning"
          role="status"
        >
          {{
            locationCheck.status === "unavailable"
              ? copy.locationUnavailable
              : copy.locationUnverified
          }}
        </p>
        <section class="panel verification">
          <div class="section-heading">
            <span class="section-icon">✓</span>
            <h2>{{ copy.evidence }}</h2>
          </div>
          <p class="micro">{{ copy.pointScope }}</p>
          <div class="next-actions">
            <p
              v-for="key in result?.nextActions || [
                'rootZoneSoil',
                'waterVolume',
                'waterQuality',
                'fieldVerification',
              ]"
              :key="key"
            >
              <span>↗</span>{{ copy[key] }}
            </p>
          </div>
          <template v-if="result"
            ><p class="land-use">
              {{
                result.landUseCheck?.isAgricultureAvailable === false
                  ? copy.excludedLand
                  : copy.unknownLand
              }}
            </p>
            <p class="micro" v-if="result.landUseCheck?.nearbyWater">
              {{ copy.nearWater }}
            </p>
            <p class="micro" v-if="result.landUseCheck?.nearbyBuildings">
              {{ copy.nearBuildings }}
            </p></template
          >
        </section>
      </section>
      <section class="results-column">
        <section class="panel potential-panel">
          <div class="section-heading">
            <span class="section-icon">✧</span>
            <h2>{{ copy.result }}</h2>
          </div>
          <div v-if="locationBlocked" class="empty-state">
            <h3>{{ copy.locationBlockedTitle }}</h3>
            <p>{{ locationMessage }}</p>
          </div>
          <template v-else-if="result">
            <div class="potential-summary">
              <div
                class="score-ring"
                :style="{ '--score': bestCrop ? bestCrop.score + '%' : '0%' }"
              >
                <strong>{{ bestCrop ? bestCrop.score : "—" }}</strong
                ><span>/100</span>
              </div>
              <div>
                <p class="eyebrow">{{ copy.score }}</p>
                <h3>
                  {{
                    bestCrop ? copy[bestCrop.cropKey] : copy.scoreUnavailable
                  }}
                </h3>
                <p>{{ copy.scoreNote }}</p>
              </div>
            </div>
            <p class="confidence">◌ {{ copy.confidence }}</p>
            <div
              v-if="result.siteAssessment?.status === 'insufficient_data'"
              class="notice warning"
            >
              {{ copy.noClimate }}
            </div>
            <div v-if="result.analysisWarning" class="notice warning">
              {{ copy.externalWarning }}
            </div>
            <p v-if="saveWarning" class="notice warning">
              {{ copy.saveWarning }}
            </p>
            <div class="crop-heading">
              <h3>{{ copy.potential }}</h3>
              <span>{{ crops.length }} {{ copy.options }}</span>
            </div>
            <button
              v-for="crop in crops"
              :key="crop.cropKey"
              class="crop-row"
              :class="{ selected: selectedCrop === crop.cropKey }"
              @click="selectedCrop = crop.cropKey"
            >
              <span class="crop-monogram" :class="crop.cropKey">{{
                cropSymbols[crop.cropKey]
              }}</span
              ><span class="crop-name"
                >{{ copy[crop.cropKey]
                }}<small :class="crop.status">{{
                  copy[crop.status]
                }}</small></span
              >
              <span class="crop-meter"
                ><span
                  :style="{ width: (crop.score ?? 0) + '%' }"
                  :class="crop.status"
                ></span></span
              ><span class="crop-score"
                >{{ crop.score ?? "—" }}<small>/100</small></span
              >
            </button>
          </template>
          <div v-else class="empty-state">
            <div class="empty-orbit">✧</div>
            <p class="eyebrow">{{ copy.run }}</p>
            <h3>{{ copy.empty }}</h3>
            <p>{{ copy.emptyText }}</p>
            <span class="empty-rule"></span>
          </div>
        </section>
        <section class="panel diagnosis" v-if="activeCrop">
          <div class="section-heading">
            <span class="section-icon">≋</span>
            <h2>{{ copy.details }} · {{ copy[activeCrop.cropKey] }}</h2>
          </div>
          <span class="status-badge" :class="activeCrop.status">{{
            copy[activeCrop.status]
          }}</span>
          <p v-if="activeCrop.provisional" class="micro">
            {{ copy.provisional }}
          </p>
          <h4 v-if="activeCrop.exclusions?.length">{{ copy.exclusions }}</h4>
          <ul>
            <li v-for="key in activeCrop.exclusions" :key="key">
              {{ copy.exclusionNames[key] || key }}
            </li>
          </ul>
          <h4>{{ copy.missing }}</h4>
          <ul>
            <li v-for="key in activeCrop.missingInputs" :key="key">
              {{ copy.missingNames[key] || key }}
            </li>
          </ul>
          <div class="table-scroll">
            <table class="factor-table">
              <thead>
                <tr>
                  <th>{{ copy.factor }}</th>
                  <th>{{ copy.measurement }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="factor in activeCrop.factors" :key="factor.factor">
                  <td>
                    {{
                      copy[
                        {
                          ph: "ph",
                          slope: "slope",
                          rain: "rain",
                          temp: "temperature",
                          hot: "heatDays",
                          frost: "frostDays",
                        }[factor.factor]
                      ] ||
                      copy.missingNames[
                        factor.factor === "hot" ? "heatDays" : "frostDays"
                      ]
                    }}<small>{{ copy[factor.status] }}</small>
                  </td>
                  <td>{{ display(factor.value, "", 1) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section class="investment-teaser panel">
          <p class="eyebrow">{{ copy.finance }}</p>
          <h3>{{ copy.financeIntro }}</h3>
          <a href="#investment-scenario">{{ copy.calculate }} ↓</a>
        </section>
      </section>
    </div>
    <section class="panel source-panel" v-if="result">
      <div class="section-heading">
        <span class="section-icon">◎</span>
        <h2>{{ copy.diagnosis }}</h2>
      </div>
      <div class="diagnostic-grid">
        <dl class="stat-list">
          <div>
            <dt>{{ copy.ph }}</dt>
            <dd>
              {{ display(result.apiInsights?.derivedInputs?.soilPh, "", 1) }}
              <small>{{
                result.apiInsights?.provenance?.soilPh === "user-entered"
                  ? copy.observed
                  : copy.modeled
              }}</small>
            </dd>
          </div>
          <div>
            <dt>{{ copy.slope }}</dt>
            <dd>
              {{ display(result.apiInsights?.derivedInputs?.slopeMax, "%", 1) }}
              <small>{{
                result.apiInsights?.provenance?.slopeMax === "user-entered"
                  ? copy.observed
                  : copy.modeled
              }}</small>
            </dd>
          </div>
          <div>
            <dt>{{ copy.soilDepth }}</dt>
            <dd>{{ display(result.apiInsights?.soil?.ph, "", 1) }}</dd>
          </div>
        </dl>
        <div>
          <p class="eyebrow">{{ copy.sources }}</p>
          <div class="provider-tags">
            <span
              v-for="provider in result.providerStatuses"
              :key="provider.provider"
              :class="provider.status"
              ><i></i>{{ provider.provider }} ·
              {{ copy[provider.status] }}</span
            >
          </div>
          <p class="micro">
            {{ new Date(result.generatedAt).toLocaleString($i18n.locale) }} ·
            {{ result.site.lat }}, {{ result.site.lon }}
          </p>
        </div>
      </div>
      <div class="risk-summary" v-if="result.risks?.length">
        <div v-for="risk in result.risks" :key="risk.type">
          <span>{{ copy["risk" + risk.type] || risk.type }}</span
          ><strong>{{ copy["risk" + risk.level] || risk.level }}</strong>
        </div>
      </div>
    </section>
    <section id="investment-scenario" class="panel finance-panel">
      <div class="finance-heading">
        <div>
          <p class="eyebrow">TND · {{ copy.scenario }}</p>
          <h2>{{ copy.finance }}</h2>
          <p>{{ copy.financeIntro }}</p>
        </div>
        <span class="outline-badge">{{ copy.observed }}</span>
      </div>
      <div
        v-if="financeGate !== 'ready'"
        id="finance-eligibility-note"
        class="notice warning"
        role="status"
      >
        <p>{{ copy[financeGate] }}</p>
        <button
          v-if="
            !loading &&
            ['financeRunAnalysis', 'stale', 'financeMissingEvidence'].includes(
              financeGate,
            )
          "
          type="button"
          class="primary"
          @click="analyze"
        >
          {{ copy.analyze }} ↗
        </button>
        <a v-else-if="!loading" href="#land-analysis"
          >{{ copy.reviewLandAnalysis }} ↑</a
        >
      </div>
      <form @submit.prevent="calculateFinance" class="finance-form">
        <label
          >{{ copy.crop
          }}<select
            v-model="financial.cropKey"
            required
            :disabled="financeGate !== 'ready'"
            :aria-describedby="
              financeGate !== 'ready' ? 'finance-eligibility-note' : undefined
            "
          >
            <option value="" disabled>
              {{
                eligibleCrops.length
                  ? copy.financeSelectCrop
                  : copy.financeEmptyCrop
              }}
            </option>
            <option
              v-for="crop in eligibleCrops"
              :key="crop.cropKey"
              :value="crop.cropKey"
            >
              {{ copy[crop.cropKey] }}
            </option>
          </select></label
        >
        <label v-for="field in financeFields" :key="field.key"
          >{{ copy[field.key]
          }}<input
            v-model="financial[field.key]"
            type="number"
            :min="field.min"
            :max="field.max"
            :step="field.step || 'any'"
            :required="field.key !== 'availableWaterM3'"
            :readonly="field.key === 'areaHa' && !!parcel"
            placeholder="—"
        /></label>
        <label class="quote-source"
          >{{ copy.priceSource
          }}<input
            v-model="financial.priceSource"
            required
            maxlength="240" /></label
        ><label
          >{{ copy.quoteDate
          }}<input v-model="financial.quoteDate" type="date" required
        /></label>
        <button
          class="primary"
          :disabled="estimating || financeGate !== 'ready'"
          :title="financeGate !== 'ready' ? copy[financeGate] : undefined"
        >
          {{ estimating ? copy.calculating : copy.calculate }} ↗
        </button>
      </form>
      <p class="micro">{{ copy.financeScope }}</p>
      <p v-if="financeError" class="notice danger" role="alert">
        {{ financeError }}
      </p>
      <p v-if="estimateStale" class="notice warning">{{ copy.financeStale }}</p>
      <template v-if="estimate && !estimateStale && !stale">
        <div
          v-if="estimate.waterStatus !== 'covered_by_entered_supply'"
          class="notice warning"
        >
          {{
            estimate.waterStatus === "deficit"
              ? copy.waterDeficit
              : copy.waterUnknown
          }}
        </div>
        <div class="investment-stats">
          <div>
            <small>{{ copy.investment }}</small
            ><strong>{{ money(estimate.investment) }}</strong>
          </div>
          <div>
            <small>{{ copy.payback }}</small
            ><strong>{{
              estimate.scenarios.base.paybackYear
                ? estimate.scenarios.base.paybackYear + " " + copy.years
                : copy.noPayback
            }}</strong>
          </div>
          <div>
            <small>{{ copy.npv }}</small
            ><strong>{{ money(estimate.scenarios.base.npv) }}</strong>
          </div>
          <div>
            <small>{{ copy.revenue }}</small
            ><strong>{{
              money(estimate.scenarios.base.rows.at(-1).revenue)
            }}</strong>
          </div>
        </div>
        <div class="planting-summary">
          <span
            >{{ copy.usableArea }}
            <b>{{ display(estimate.usableHa, "ha", 2) }}</b></span
          ><span
            >{{ copy.treeCount }}
            <b>{{ display(estimate.treeCount, "", 0) }}</b></span
          ><span
            >{{ copy.waterDemand }}
            <b>{{ display(estimate.annualWaterM3, "m³", 0) }}</b></span
          >
        </div>
        <p class="micro">{{ copy.sensitivity }}</p>
        <div class="financial-comparison">
          <div v-for="(scenario, key) in estimate.scenarios" :key="key">
            <h3>{{ copy[key] }}</h3>
            <p>
              {{ copy.npv }} <strong>{{ money(scenario.npv) }}</strong>
            </p>
            <p>
              {{ copy.payback }}
              <strong>{{
                scenario.paybackYear
                  ? scenario.paybackYear + " " + copy.years
                  : copy.noPayback
              }}</strong>
            </p>
            <p>
              ROI · {{ financial.horizonYears }} {{ copy.years }}
              <strong>{{ display(scenario.roiPct, "%", 1) }}</strong>
            </p>
            <p>
              IRR <strong>{{ display(scenario.irrPct, "%", 1) }}</strong>
            </p>
          </div>
        </div>
        <h3 class="chart-title">{{ copy.cashflow }}</h3>
        <div class="cashflow-chart">
          <svg viewBox="0 0 1000 220" role="img" :aria-label="copy.cashflow">
            <line
              x1="10"
              :y1="chartZero"
              x2="990"
              :y2="chartZero"
              stroke="#cbd5ce"
              stroke-dasharray="5 5"
            />
            <polyline
              :points="chartPoints"
              fill="none"
              stroke="#237650"
              stroke-width="3"
            />
            <circle
              v-for="point in chartDots"
              :key="point.x"
              :cx="point.x"
              :cy="point.y"
              r="3"
              fill="#237650"
            />
          </svg>
          <div>
            <span>0</span
            ><span
              >{{ copy.year }} {{ estimate.assumptions.horizonYears }}</span
            >
          </div>
        </div>
        <details class="cashflow-details">
          <summary>{{ copy.cashflow }} · {{ copy.details }}</summary>
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{{ copy.year }}</th>
                  <th>{{ copy.revenue }}</th>
                  <th>{{ copy.operatingCost }}</th>
                  <th>{{ copy.net }}</th>
                  <th>{{ copy.cumulative }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in estimate.scenarios.base.rows" :key="row.year">
                  <td>{{ row.year }}</td>
                  <td>{{ money(row.revenue) }}</td>
                  <td>{{ money(row.operatingCost) }}</td>
                  <td>{{ money(row.cashFlow) }}</td>
                  <td>{{ money(row.cumulative) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </template>
    </section>
    <section v-if="!isGuest" class="panel history-panel">
      <div class="section-heading">
        <h2>{{ copy.history }}</h2>
        <button @click="loadHistory">↻</button>
      </div>
      <p class="micro" v-if="!history.length">{{ copy.historyEmpty }}</p>
      <div class="history-list">
        <button
          v-for="entry in history"
          :key="entry._id"
          @click="selectHistory(entry)"
        >
          <span>{{ entry.lat.toFixed(4) }}, {{ entry.lon.toFixed(4) }}</span
          ><small>{{ new Date(entry.createdAt).toLocaleDateString() }}</small>
        </button>
      </div>
    </section>
    <footer class="assessment-footer">
      <span>VerdOlive</span>
      <p>{{ copy.pointScope }}</p>
      <p>{{ copy.confidence }}</p>
    </footer>
  </main>
</template>

<script>
import { markRaw } from "vue";
import AuthService from "../services/AuthService";
import GeoAIService from "../services/GeoAIService";
import { feasibilityText } from "../utils/feasibilityText";
import {
  financeAvailability,
  validFinanceCrop,
} from "../utils/financeAvailability";
let leafletPromise;
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    script.onerror = () => {
      leafletPromise = null;
      reject(new Error("MAP_UNAVAILABLE"));
    };
    document.head.appendChild(script);
  });
  return leafletPromise;
}
const emptyForm = () => ({
  lat: "34.7406",
  lon: "10.7603",
  soilPh: "",
  slopeMax: "",
  waterAccess: "unknown",
  waterSalinity: "",
  soilSalinity: "",
  organicMatter: "",
});
const fieldList = [
  ["areaHa", 0.01, 10000],
  ["usablePct", 1, 100],
  ["spacingRowM", 1, 30],
  ["spacingTreeM", 1, 30],
  ["establishmentPerHa", 0, 1000000],
  ["annualFixedPerHa", 0, 1000000],
  ["harvestPerKg", 0, 10000],
  ["yieldKgHa", 0, 100000],
  ["pricePerKg", 0, 10000],
  ["firstHarvestYear", 1, 20, 1],
  ["matureYear", 1, 25, 1],
  ["horizonYears", 5, 30, 1],
  ["discountPct", 0, 50],
  ["annualWaterM3Ha", 0, 100000],
  ["waterCostM3", 0, 100],
  ["availableWaterM3", 0, 1000000000],
  ["contingencyPct", 0, 50],
];
export default {
  name: "LandFeasibility",
  data() {
    return {
      form: emptyForm(),
      result: null,
      loading: false,
      locationCheck: null,
      locationCheckedKey: null,
      locationChecking: false,
      locationTimer: null,
      locationRequest: 0,
      error: "",
      saveWarning: null,
      requestSnapshot: null,
      parcel: null,
      vertices: [],
      drawing: false,
      mapType: "satellite",
      map: null,
      mapLayer: null,
      marker: null,
      boundary: null,
      mapError: false,
      selectedCrop: "olive",
      history: [],
      estimating: false,
      financeError: "",
      estimate: null,
      estimateSnapshot: null,
      financial: {
        cropKey: "",
        areaHa: "",
        usablePct: 90,
        spacingRowM: "",
        spacingTreeM: "",
        establishmentPerHa: "",
        annualFixedPerHa: "",
        harvestPerKg: "",
        yieldKgHa: "",
        pricePerKg: "",
        firstHarvestYear: "",
        matureYear: "",
        horizonYears: 25,
        discountPct: 8,
        annualWaterM3Ha: "",
        waterCostM3: "",
        availableWaterM3: "",
        contingencyPct: 10,
        priceSource: "",
        quoteDate: "",
      },
      cropSymbols: {
        olive: "◒",
        almond: "◐",
        date_palm: "♧",
        pistachio: "◑",
        orange: "●",
        lemon: "●",
        fig: "◕",
        pomegranate: "◉",
      },
      soilFields: [
        { key: "soilPh", label: "ph", min: 3, max: 10.5 },
        { key: "slopeMax", label: "slope", min: 0, max: 100 },
        { key: "waterSalinity", label: "ec", min: 0, max: 50 },
        { key: "soilSalinity", label: "soilEc", min: 0, max: 50 },
        { key: "organicMatter", label: "organic", min: 0, max: 100 },
      ],
      financeFields: fieldList.map(([key, min, max, step]) => ({
        key,
        min,
        max,
        step,
      })),
    };
  },
  computed: {
    locationKey() {
      return `${this.form.lat},${this.form.lon}`;
    },
    currentLocationCheck() {
      if (this.locationCheckedKey === this.locationKey)
        return this.locationCheck;
      if (!this.stale && this.result) return this.result.landUseCheck;
      return null;
    },
    locationBlocked() {
      return this.currentLocationCheck?.isAgricultureAvailable === false;
    },
    locationMessage() {
      const kind = this.currentLocationCheck?.classification;
      return this.copy[
        kind === "sea"
          ? "locationSea"
          : kind === "water"
            ? "locationWater"
            : kind === "built_up"
              ? "locationBuilding"
              : "locationOther"
      ];
    },
    copy() {
      return feasibilityText(this.$i18n.locale);
    },
    isGuest() {
      return !AuthService.isLoggedIn();
    },
    inputKey() {
      return JSON.stringify({ form: this.form, parcel: this.parcel });
    },
    stale() {
      return !!this.result && this.requestSnapshot !== this.inputKey;
    },
    estimateStale() {
      return (
        !!this.estimate &&
        this.estimateSnapshot !== JSON.stringify(this.financial)
      );
    },
    crops() {
      return this.result?.version === "feasibility-1" &&
        Array.isArray(this.result.recommendations)
        ? this.result.recommendations
        : [];
    },
    eligibleCrops() {
      if (this.locationBlocked) return [];
      return this.crops.filter((c) =>
        ["conditional", "recommended"].includes(c.status),
      );
    },
    financeGate() {
      if (this.locationBlocked) return "locationFinanceBlocked";
      if (this.locationChecking) return "locationChecking";
      return financeAvailability({
        loading: this.loading,
        result: this.result,
        stale: this.stale,
        crops: this.crops,
      });
    },
    bestCrop() {
      return this.eligibleCrops[0] || null;
    },
    activeCrop() {
      if (this.locationBlocked) return null;
      return (
        this.crops.find((c) => c.cropKey === this.selectedCrop) ||
        this.crops[0] ||
        null
      );
    },
    parcelArea() {
      if (!this.parcel) return null;
      let area = 0;
      const ring = this.parcel.coordinates[0],
        rad = (n) => (n * Math.PI) / 180;
      for (let i = 0; i < ring.length - 1; i++)
        area +=
          rad(ring[i + 1][0] - ring[i][0]) *
          (2 + Math.sin(rad(ring[i][1])) + Math.sin(rad(ring[i + 1][1])));
      return Math.abs((area * 6371008.8 ** 2) / 2) / 10000;
    },
    environment() {
      const i = this.result?.indicators,
        w = this.result?.apiInsights?.openMeteo;
      return [
        {
          key: "rain",
          label: this.copy.rain,
          value: this.display(i?.annual_rainfall_mm_est, "mm", 0),
        },
        {
          key: "temperature",
          label: this.copy.temperature,
          value: this.display(i?.mean_temp_c_est, "°C", 1),
        },
        {
          key: "humidity",
          label: this.copy.humidity,
          value: this.display(w?.current?.humidityPct, "%", 0),
        },
        {
          key: "wind",
          label: this.copy.wind,
          value: this.display(w?.current?.windKph, "km/h", 0),
        },
        {
          key: "recentRain",
          label: this.copy.recentRain,
          value: this.display(w?.history?.totalRainMm, "mm", 1),
        },
      ];
    },
    chartDots() {
      if (!this.estimate) return [];
      const rows = this.estimate.scenarios.base.rows,
        values = rows.map((r) => r.cumulative),
        min = Math.min(...values, 0),
        max = Math.max(...values, 1),
        range = max - min || 1;
      return rows.map((r, index) => ({
        x: 10 + (index / (rows.length - 1)) * 980,
        y: 200 - ((r.cumulative - min) / range) * 180,
      }));
    },
    chartPoints() {
      return this.chartDots.map((p) => `${p.x},${p.y}`).join(" ");
    },
    chartZero() {
      if (!this.estimate) return 200;
      const values = this.estimate.scenarios.base.rows.map((r) => r.cumulative),
        min = Math.min(...values, 0),
        max = Math.max(...values, 1);
      return 200 - ((0 - min) / (max - min || 1)) * 180;
    },
  },
  watch: {
    eligibleCrops: {
      immediate: true,
      handler(crops) {
        this.financial.cropKey = validFinanceCrop(
          crops,
          this.financial.cropKey,
        );
      },
    },
    "form.lat"() {
      this.syncMarker();
      this.scheduleLocationCheck();
    },
    "form.lon"() {
      this.syncMarker();
      this.scheduleLocationCheck();
    },
    mapType() {
      this.updateMapLayer();
    },
    parcelArea(value) {
      if (value) this.financial.areaHa = Number(value.toFixed(4));
    },
    selectedCrop(key) {
      if (this.eligibleCrops.some((c) => c.cropKey === key))
        this.financial.cropKey = key;
    },
  },
  async mounted() {
    this.scheduleLocationCheck();
    try {
      const L = await loadLeaflet();
      if (!this.$refs.mapContainer) return;
      this.map = markRaw(
        L.map(this.$refs.mapContainer).setView(
          [Number(this.form.lat), Number(this.form.lon)],
          13,
        ),
      );
      this.updateMapLayer();
      this.syncMarker();
      this.map.on("click", (e) => {
        if (this.loading) return;
        if (this.drawing) {
          if (this.vertices.length >= 100) return;
          this.vertices.push([e.latlng.lng, e.latlng.lat]);
          this.renderBoundary();
        } else {
          this.form.lat = e.latlng.lat.toFixed(6);
          this.form.lon = e.latlng.lng.toFixed(6);
        }
      });
    } catch {
      this.mapError = true;
    }
    if (!this.isGuest) await this.loadHistory();
  },
  beforeUnmount() {
    clearTimeout(this.locationTimer);
    this.locationRequest++;
    this.map?.remove();
  },
  methods: {
    scheduleLocationCheck() {
      clearTimeout(this.locationTimer);
      this.locationRequest++;
      this.locationCheck = null;
      this.locationCheckedKey = null;
      this.locationChecking = false;
      const lat = Number(this.form.lat),
        lon = Number(this.form.lon);
      if (
        this.form.lat === "" ||
        this.form.lon === "" ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        lat < 30 ||
        lat > 38 ||
        lon < 7 ||
        lon > 12
      )
        return;
      this.locationChecking = true;
      this.locationTimer = setTimeout(() => this.checkSelectedLocation(), 600);
    },
    async checkSelectedLocation() {
      const key = this.locationKey,
        request = ++this.locationRequest;
      this.locationChecking = true;
      try {
        const result = await GeoAIService.checkLocation(
          Number(this.form.lat),
          Number(this.form.lon),
        );
        if (request !== this.locationRequest || key !== this.locationKey)
          return;
        this.locationCheck = result;
        this.locationCheckedKey = key;
        if (result.isAgricultureAvailable === false) this.estimate = null;
      } catch {
        if (request !== this.locationRequest || key !== this.locationKey)
          return;
        this.locationCheck = {
          classification: "unknown",
          status: "unavailable",
          isAgricultureAvailable: null,
        };
        this.locationCheckedKey = key;
      } finally {
        if (request === this.locationRequest) this.locationChecking = false;
      }
    },
    display(value, unit = "", digits = 1) {
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        !Number.isFinite(Number(value))
      )
        return "—";
      return (
        new Intl.NumberFormat(this.$i18n.locale, {
          maximumFractionDigits: digits,
        }).format(Number(value)) + (unit ? " " + unit : "")
      );
    },
    money(value) {
      return this.display(value, "TND", 0);
    },
    updateMapLayer() {
      if (!this.map || !window.L) return;
      this.mapLayer?.remove();
      this.mapLayer = markRaw(
        window.L.tileLayer(
          this.mapType === "satellite"
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              this.mapType === "satellite"
                ? "Tiles © Esri"
                : "© OpenStreetMap contributors",
          },
        ).addTo(this.map),
      );
    },
    syncMarker() {
      if (!this.map || !window.L) return;
      const lat = Number(this.form.lat),
        lon = Number(this.form.lon);
      if (
        this.form.lat === "" ||
        this.form.lon === "" ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180
      )
        return;
      if (this.marker) this.marker.setLatLng([lat, lon]);
      else
        this.marker = markRaw(
          window.L.circleMarker([lat, lon], {
            radius: 7,
            color: "#fff",
            weight: 3,
            fillColor: "#b5c685",
            fillOpacity: 1,
          }).addTo(this.map),
        );
      if (
        lat >= 30 &&
        lat <= 38 &&
        lon >= 7 &&
        lon <= 12 &&
        !this.map.getBounds().contains([lat, lon])
      ) {
        this.map.panTo([lat, lon], { animate: false });
      }
    },
    renderBoundary() {
      this.boundary?.remove();
      if (this.vertices.length && this.map)
        this.boundary = markRaw(
          window.L.polygon(
            this.vertices.map((p) => [p[1], p[0]]),
            {
              color: "#f4f4d9",
              weight: 2,
              fillColor: "#99ba7c",
              fillOpacity: 0.18,
              dashArray: this.drawing ? "5 5" : null,
            },
          ).addTo(this.map),
        );
    },
    startDrawing() {
      if (this.loading) return;
      this.vertices = [];
      this.parcel = null;
      this.drawing = true;
      this.renderBoundary();
    },
    cancelDrawing() {
      if (this.drawing && !this.parcel) {
        this.vertices = [];
        this.renderBoundary();
      }
      this.drawing = false;
    },
    finishDrawing() {
      if (this.vertices.length < 3) return;
      this.parcel = {
        type: "Polygon",
        coordinates: [
          [...this.vertices.map((p) => [...p]), [...this.vertices[0]]],
        ],
      };
      this.drawing = false;
      this.renderBoundary();
    },
    clearParcel() {
      if (this.loading) return;
      this.vertices = [];
      this.parcel = null;
      this.financial.areaHa = "";
      this.drawing = false;
      this.boundary?.remove();
      this.boundary = null;
    },
    errorText(error) {
      const code = error.response?.data?.code || "";
      if (code === "OUTSIDE_SUPPORTED_REGION") return this.copy.unsupported;
      if (/PARCEL|POINT_OUTSIDE/.test(code)) return this.copy.parcelError;
      return this.copy.error;
    },
    async analyze() {
      if (this.loading) return;
      if (this.locationBlocked || this.locationChecking) return;
      this.loading = true;
      this.error = "";
      this.saveWarning = null;
      try {
        if (this.drawing) throw new Error("FINISH_BOUNDARY");
        const snapshot = this.inputKey;
        const c = {},
          s = {};
        if (this.form.waterAccess !== "unknown")
          c.water_access = this.form.waterAccess === "true";
        for (const [key, target] of [
          ["slopeMax", "slope_max"],
          ["waterSalinity", "water_ec_dS_m"],
        ])
          if (this.form[key] !== "") c[target] = Number(this.form[key]);
        for (const [key, target] of [
          ["soilPh", "ph"],
          ["soilSalinity", "ec_dS_m"],
          ["organicMatter", "organic_matter"],
        ])
          if (this.form[key] !== "") s[target] = Number(this.form[key]);
        const response = await GeoAIService.analyze({
          lat: Number(this.form.lat),
          lon: Number(this.form.lon),
          constraints: c,
          soil_test: s,
          parcel: this.parcel,
        });
        if (response.result?.version !== "feasibility-1")
          throw new Error("LEGACY_BACKEND");
        this.result = response.result;
        this.requestSnapshot = snapshot;
        this.saveWarning = response.saveWarning;
        this.selectedCrop =
          this.bestCrop?.cropKey || this.crops[0]?.cropKey || "olive";
        this.estimate = null;
        if (!this.isGuest) await this.loadHistory();
      } catch (error) {
        this.error =
          error.message === "LEGACY_BACKEND"
            ? this.copy.legacy
            : error.message === "FINISH_BOUNDARY"
              ? this.copy.parcelError
              : this.errorText(error);
      } finally {
        this.loading = false;
      }
    },
    async calculateFinance() {
      this.financeError = "";
      if (
        this.locationBlocked ||
        this.locationChecking ||
        !this.result ||
        this.stale ||
        !this.eligibleCrops.some((c) => c.cropKey === this.financial.cropKey)
      ) {
        this.financeError = this.copy.financialNeedsAnalysis;
        return;
      }
      this.estimating = true;
      try {
        const snapshot = JSON.stringify(this.financial),
          payload = { ...this.financial };
        for (const field of this.financeFields)
          payload[field.key] =
            this.financial[field.key] === ""
              ? null
              : Number(this.financial[field.key]);
        const response = await GeoAIService.estimate(payload);
        this.estimate = response.result;
        this.estimateSnapshot = snapshot;
      } catch (error) {
        this.financeError = this.errorText(error);
      } finally {
        this.estimating = false;
      }
    },
    async loadHistory() {
      try {
        const response = await GeoAIService.getHistory();
        this.history = response.data || [];
      } catch {
        this.saveWarning = "HISTORY_UNAVAILABLE";
      }
    },
    selectHistory(entry) {
      if (entry.result?.version !== "feasibility-1") {
        this.error = this.copy.legacy;
        return;
      }
      const input = entry.result.inputSnapshot;
      this.form = {
        ...emptyForm(),
        lat: String(input.lat),
        lon: String(input.lon),
        soilPh: input.soil_test.ph ?? "",
        soilSalinity: input.soil_test.ec_dS_m ?? "",
        organicMatter: input.soil_test.organic_matter ?? "",
        slopeMax: input.constraints.slope_max ?? "",
        waterSalinity: input.constraints.water_ec_dS_m ?? "",
        waterAccess:
          input.constraints.water_access === null
            ? "unknown"
            : String(input.constraints.water_access),
      };
      this.parcel = input.parcel?.geometry || null;
      this.vertices = this.parcel
        ? this.parcel.coordinates[0].slice(0, -1)
        : [];
      this.drawing = false;
      this.renderBoundary();
      this.map?.setView([input.lat, input.lon], 13);
      this.result = entry.result;
      this.requestSnapshot = this.inputKey;
      this.estimate = null;
      this.error = "";
      this.selectedCrop = this.bestCrop?.cropKey || this.crops[0]?.cropKey;
    },
    printReport() {
      if (!this.result || this.stale) return;
      window.print();
    },
    download() {
      if (!this.result || this.stale) return;
      const blob = new Blob(
        [
          JSON.stringify(
            {
              analysis: this.result,
              investment: !this.estimateStale ? this.estimate : null,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "verdolive-analysis.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
  },
};
</script>
<style scoped src="../assets/feasibility.css"></style>
