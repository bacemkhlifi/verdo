<template>
    <div class="container mx-auto px-4 py-24 my-16">
        <div class="text-center mb-16 px-8 py-4">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">{{ $t('opportunities.title') }}</h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                {{ $t('opportunities.subtitle') }}
            </p>
        </div>

        <div class="flex justify-center gap-8 mb-8 border-b border-gray-200">
            <button v-for="filter in filters" :key="filter.id" @click="activeFilter = filter.id" :class="[
                'pb-4 font-medium transition-colors duration-200',
                activeFilter === filter.id
                    ? 'text-olive-dark border-b-2 border-olive-dark'
                    : 'text-gray-500 hover:text-olive-dark'
            ]">
                {{ filter.name }}
            </button>
        </div>

        <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center text-gray-600 shadow-sm">
            {{ $t('opportunities.loadingApproved') }}
        </div>

        <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700 shadow-sm">
            {{ error }}
        </div>

        <div v-else-if="!filteredFarms.length" class="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center text-gray-600 shadow-sm">
            {{ $t('opportunities.emptyApproved') }}
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article
                v-for="farm in filteredFarms"
                :key="farm.id"
                class="farm-card bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl group cursor-pointer"
                @click="openFarmDetails(farm)"
            >
                <div class="relative h-56 overflow-hidden">
                    <img :src="farm.image" :alt="farm.name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div class="status-ribbon bg-green-600" :class="$i18n.locale === 'ar' ? 'left-[-35px]' : 'right-[-35px]'">
                        {{ farm.status.name }}
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div class="p-6 space-y-4">
                    <div class="flex items-center gap-2 text-gray-600" :class="{ 'flex-row-reverse': $i18n.locale === 'ar' }">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-olive-dark" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                        </svg>
                        <span class="text-sm font-medium">{{ farm.location }}</span>
                    </div>

                    <h3 class="text-2xl font-bold text-gray-900 group-hover:text-olive-dark transition-colors duration-300">
                        {{ farm.name }}
                    </h3>

                    <div class="space-y-3 pt-2">
                        <div class="flex justify-between items-center property-row" :class="{ 'flex-row-reverse': $i18n.locale === 'ar' }">
                            <span class="text-gray-600 text-sm">{{ $t('opportunities.farm.crop') }}</span>
                            <span class="px-3 py-1.5 bg-olive-dark bg-opacity-10 text-olive-dark rounded-full text-sm font-medium">
                                {{ farm.crop }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center property-row" :class="{ 'flex-row-reverse': $i18n.locale === 'ar' }">
                            <span class="text-gray-600 text-sm">{{ $t('opportunities.farm.stage') }}</span>
                            <span class="px-3 py-1.5 bg-olive-dark bg-opacity-10 text-olive-dark rounded-full text-sm font-medium">
                                {{ translateStage(farm.stage) }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center property-row" :class="{ 'flex-row-reverse': $i18n.locale === 'ar' }">
                            <span class="text-gray-600 text-sm">{{ $t('opportunities.farm.ownershipType') }}</span>
                            <span class="px-3 py-1.5 bg-olive-dark bg-opacity-10 text-olive-dark rounded-full text-sm font-medium">
                                {{ translateOwnershipType(farm.ownershipType) }}
                            </span>
                        </div>
                    </div>
                </div>
            </article>
        </div>

        <div v-if="selectedFarm" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeFarmDetails">
            <div class="min-h-screen px-4 flex items-center justify-center">
                <div class="fixed inset-0 bg-black/80 transition-opacity"></div>
                <div class="relative inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl overflow-hidden">
                    <button @click="closeFarmDetails" class="absolute right-4 top-4 z-10 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow">
                        {{ $t('opportunities.close') }}
                    </button>
                    <img :src="selectedFarm.image" :alt="selectedFarm.name" class="h-80 w-full object-cover" />
                    <div class="p-8">
                        <h3 class="text-3xl font-bold text-gray-900">{{ selectedFarm.name }}</h3>
                        <p class="mt-2 text-gray-600">{{ selectedFarm.location }}</p>
                        <div class="mt-6 grid gap-4 md:grid-cols-3">
                            <div class="rounded-xl bg-gray-50 p-4">
                                <p class="text-xs font-semibold uppercase text-gray-500">{{ $t('opportunities.size') }}</p>
                                <p class="mt-2 text-lg font-semibold text-gray-900">{{ selectedFarm.size || $t('opportunities.notProvided') }}</p>
                            </div>
                            <div class="rounded-xl bg-gray-50 p-4">
                                <p class="text-xs font-semibold uppercase text-gray-500">{{ $t('opportunities.stage') }}</p>
                                <p class="mt-2 text-lg font-semibold text-gray-900">{{ translateStage(selectedFarm.stage) }}</p>
                            </div>
                            <div class="rounded-xl bg-gray-50 p-4">
                                <p class="text-xs font-semibold uppercase text-gray-500">{{ $t('opportunities.model') }}</p>
                                <p class="mt-2 text-lg font-semibold text-gray-900">{{ translateOwnershipType(selectedFarm.ownershipType) }}</p>
                            </div>
                        </div>
                        <p v-if="selectedFarm.notes" class="mt-6 text-sm leading-6 text-gray-600">{{ selectedFarm.notes }}</p>
                        <div v-if="investmentError" class="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {{ investmentError }}
                        </div>
                        <form class="mt-6 flex flex-col gap-3 sm:flex-row" @submit.prevent="investInSelectedFarm">
                            <input
                                v-model="investmentAmount"
                                type="number"
                                min="1"
                                step="1"
                                required
                                :placeholder="$t('opportunities.investmentAmountPlaceholder')"
                                class="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-olive-dark focus:outline-none focus:ring-1 focus:ring-olive-dark"
                            />
                            <button
                                type="submit"
                                :disabled="investing"
                                class="rounded-md bg-olive-dark px-5 py-2 text-sm font-medium text-white hover:bg-olive-medium disabled:opacity-60"
                            >
                                {{ investing ? $t('opportunities.investing') : $t('opportunities.invest') }}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AuthService from '../services/AuthService';
import LandService from '../services/LandService';
import InvestmentService from '../services/InvestmentService';
import fallbackImage from '../assets/olive_field.jpg';

export default {
    name: 'Opportunities',
    data() {
        return {
            activeFilter: 'all',
            selectedFarm: null,
            farms: [],
            loading: false,
            error: '',
            investmentAmount: '',
            investmentError: '',
            investing: false,
        }
    },
    computed: {
        isInvestor() {
            return AuthService.isInvestor();
        },
        filters() {
            return [
                { id: 'all', name: this.$t('opportunities.filters.all') },
                { id: 'unplanted', name: this.$t('opportunities.filters.unplanted') },
                { id: 'developing', name: this.$t('opportunities.filters.developing') },
                { id: 'mature', name: this.$t('opportunities.filters.mature') }
            ]
        },
        filteredFarms() {
            if (this.activeFilter === 'all') return this.farms;
            return this.farms.filter(farm => {
                if (this.activeFilter === 'unplanted') return farm.stage === 'Unplanted';
                if (this.activeFilter === 'developing') return farm.stage === 'Developing';
                if (this.activeFilter === 'mature') return farm.stage === 'Mature';
                return true;
            });
        }
    },
    async created() {
        await this.loadApprovedLands();
    },
    methods: {
        async loadApprovedLands() {
            this.loading = true;
            this.error = '';
            try {
                const response = await LandService.getApprovedLands();
                this.farms = (response.data || []).map((land) => ({
                    id: land._id,
                    name: land.name,
                    location: land.location,
                    image: fallbackImage,
                    status: { id: 'available', name: this.$t('opportunities.farm.status.available') },
                    crop: land.hasTrees ? this.$t('opportunities.existingTrees') : this.$t('opportunities.openLand'),
                    stage: land.hasTrees ? 'Developing' : 'Unplanted',
                    ownershipType: 'Full ownership',
                    notes: land.notes,
                    size: land.size,
                    owner: land.owner,
                }));
            } catch (error) {
                this.error = error.response?.data?.message || error.message || this.$t('opportunities.errors.loadFailed');
            } finally {
                this.loading = false;
            }
        },
        translateStage(stage) {
            const normalized = String(stage || '').toLowerCase();
            const map = {
                unplanted: this.$t('opportunities.farm.stageValues.unplanted'),
                developing: this.$t('opportunities.farm.stageValues.developing'),
                mature: this.$t('opportunities.farm.stageValues.mature'),
            };
            return map[normalized] || this.$t('geoai.options.unknown');
        },
        translateOwnershipType(type) {
            const normalized = String(type || '').toLowerCase();
            const map = {
                'full ownership': this.$t('opportunities.farm.ownershipModels.full'),
                loan: this.$t('opportunities.farm.ownershipModels.loan'),
            };
            return map[normalized] || this.$t('geoai.options.unknown');
        },
        openFarmDetails(farm) {
            this.selectedFarm = farm;
            this.investmentAmount = '';
            this.investmentError = '';
            document.body.style.overflow = 'hidden';
        },
        closeFarmDetails() {
            this.selectedFarm = null;
            this.investmentAmount = '';
            this.investmentError = '';
            document.body.style.overflow = 'auto';
        },
        async investInSelectedFarm() {
            if (!AuthService.isAuthenticated()) {
                this.$router.push('/login');
                return;
            }

            if (!AuthService.isInvestor()) {
                this.investmentError = this.$t('opportunities.errors.investorsOnly');
                return;
            }

            this.investing = true;
            this.investmentError = '';
            try {
                await InvestmentService.investInLand(this.selectedFarm.id, Number(this.investmentAmount));
                this.closeFarmDetails();
                this.$router.push('/investor');
            } catch (error) {
                this.investmentError = error.response?.data?.message || error.message || this.$t('opportunities.errors.investFailed');
            } finally {
                this.investing = false;
            }
        }
    }
}
</script>

<style scoped>
.container {
    max-width: 1280px;
}

.farm-card {
    position: relative;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-ribbon {
    position: absolute;
    top: 20px;
    padding: 8px 30px;
    color: white;
    font-weight: 500;
    transform: rotate(45deg);
    z-index: 10;
}

[dir="rtl"] .status-ribbon {
    transform: rotate(-45deg);
}
</style>
