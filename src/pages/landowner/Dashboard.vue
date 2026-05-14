<template>
    <div class="min-h-screen bg-gray-100 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-white shadow rounded-lg p-6">
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ $t('landowner.title') }}</h1>
                        <p class="text-sm text-gray-600">{{ $t('landowner.subtitle') }}</p>
                    </div>
                    <button @click="loadLands" class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        {{ $t('common.refresh') }}
                    </button>
                </div>

                <div v-if="message" class="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {{ message }}
                </div>
                <div v-if="error" class="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {{ error }}
                </div>

                <div class="my-8 rounded-xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                    <h2 class="text-xl font-medium text-gray-900 mb-2">{{ $t('landowner.addTitle') }}</h2>
                    <p class="text-sm text-gray-600 mb-6">{{ $t('landowner.addSubtitle') }}</p>

                    <form class="grid gap-6" @submit.prevent="handleAddLand">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('landowner.propertyName') }}</label>
                                <input v-model="newLand.name" type="text" required class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.location') }}</label>
                                <input v-model="newLand.location" type="text" required class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.size') }}</label>
                                <input v-model="newLand.size" type="text" :placeholder="$t('landowner.sizePlaceholder')" class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none" />
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                                <input v-model="newLand.electricity" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                <span class="text-sm font-medium text-gray-700">{{ $t('landowner.electricity') }}</span>
                            </label>
                            <label class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                                <input v-model="newLand.hasTrees" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                <span class="text-sm font-medium text-gray-700">{{ $t('landowner.hasTrees') }}</span>
                            </label>
                            <label class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                                <input v-model="newLand.water" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                <span class="text-sm font-medium text-gray-700">{{ $t('landowner.water') }}</span>
                            </label>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('landowner.notes') }}</label>
                            <textarea v-model="newLand.notes" rows="3" class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none" :placeholder="$t('landowner.notesPlaceholder')"></textarea>
                        </div>

                        <div class="flex justify-end">
                            <button type="submit" :disabled="saving" class="inline-flex items-center px-5 py-3 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 disabled:opacity-60">
                                {{ saving ? $t('common.saving') : $t('landowner.submit') }}
                            </button>
                        </div>
                    </form>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-green-50 p-4 rounded-lg shadow">
                        <h2 class="text-lg font-medium text-gray-900 mb-2">{{ $t('landowner.total') }}</h2>
                        <p class="text-3xl font-bold text-olive-dark">{{ lands.length }}</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg shadow">
                        <h2 class="text-lg font-medium text-gray-900 mb-2">{{ $t('landowner.approved') }}</h2>
                        <p class="text-3xl font-bold text-blue-600">{{ approvedCount }}</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded-lg shadow">
                        <h2 class="text-lg font-medium text-gray-900 mb-2">{{ $t('landowner.pending') }}</h2>
                        <p class="text-3xl font-bold text-yellow-600">{{ pendingCount }}</p>
                    </div>
                </div>

                <div class="bg-gray-50 p-6 rounded-lg shadow">
                    <h2 class="text-xl font-medium text-gray-900 mb-4">{{ $t('landowner.yourProperties') }}</h2>
                    <div v-if="loading" class="rounded-lg bg-white p-5 text-sm text-gray-600">{{ $t('landowner.loading') }}</div>
                    <div v-else-if="!lands.length" class="rounded-lg bg-white p-5 text-sm text-gray-600">{{ $t('landowner.empty') }}</div>
                    <div v-else class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('landowner.propertyName') }}</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.location') }}</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.size') }}</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.status') }}</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('landowner.submitted') }}</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="land in lands" :key="land._id">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ land.name }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ land.location }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ land.size || $t('common.notProvided') }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="statusClass(land.status)">
                                            {{ statusLabel(land.status) }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(land.createdAt) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AuthService from '../../services/AuthService';
import LandService from '../../services/LandService';

export default {
    name: 'LandownerDashboard',
    data() {
        return {
            newLand: this.emptyLand(),
            lands: [],
            loading: false,
            saving: false,
            error: '',
            message: ''
        };
    },
    computed: {
        approvedCount() {
            return this.lands.filter((land) => land.status === 'approved').length;
        },
        pendingCount() {
            return this.lands.filter((land) => land.status === 'pending').length;
        }
    },
    async created() {
        if (!AuthService.isLandowner()) {
            this.$router.push('/unauthorized');
            return;
        }
        await this.loadLands();
    },
    methods: {
        emptyLand() {
            return {
                name: '',
                location: '',
                size: '',
                electricity: false,
                hasTrees: false,
                water: false,
                notes: ''
            };
        },
        async loadLands() {
            this.loading = true;
            this.error = '';
            try {
                const response = await LandService.getMyLands();
                this.lands = response.data || [];
            } catch (error) {
                this.error = error.response?.data?.message || error.message || this.$t('landowner.loadFailed');
            } finally {
                this.loading = false;
            }
        },
        async handleAddLand() {
            this.saving = true;
            this.error = '';
            this.message = '';
            try {
                const response = await LandService.createLand(this.newLand);
                this.lands.unshift(response.data);
                this.newLand = this.emptyLand();
                this.message = this.$t('landowner.success');
            } catch (error) {
                this.error = error.response?.data?.message || error.message || this.$t('landowner.submitFailed');
            } finally {
                this.saving = false;
            }
        },
        statusClass(status) {
            if (status === 'approved') return 'bg-green-100 text-green-800';
            if (status === 'rejected') return 'bg-red-100 text-red-800';
            return 'bg-yellow-100 text-yellow-800';
        },
        statusLabel(status) {
            if (status === 'approved') return this.$t('common.approved');
            if (status === 'rejected') return this.$t('common.rejected');
            return this.$t('common.pending');
        },
        formatDate(value) {
            if (!value) return this.$t('common.unknown');
            return new Date(value).toLocaleDateString();
        }
    }
}
</script>
