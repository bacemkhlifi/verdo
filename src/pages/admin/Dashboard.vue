<template>
    <div>
        <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-semibold text-gray-900">{{ $t('admin.dashboard.title') }}</h1>
                <p class="mt-1 text-sm text-gray-500">{{ $t('admin.dashboard.subtitle') }}</p>
            </div>
            <button @click="loadDashboard" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {{ $t('common.refresh') }}
            </button>
        </div>

        <div v-if="error" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ error }}
        </div>

        <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="card in statCards" :key="card.label" class="bg-white overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                    <dt class="text-sm font-medium text-gray-500 truncate">{{ card.label }}</dt>
                    <dd class="mt-2 text-2xl font-semibold text-gray-900">{{ card.value }}</dd>
                </div>
            </div>
        </div>

        <section class="mt-8 rounded-lg bg-white shadow">
            <div class="border-b border-gray-200 px-4 py-5 sm:px-6">
                <h2 class="text-lg font-medium text-gray-900">{{ $t('admin.dashboard.pendingApprovalTitle') }}</h2>
                <p class="mt-1 text-sm text-gray-500">{{ $t('admin.dashboard.pendingApprovalSubtitle') }}</p>
            </div>

            <div v-if="loading" class="p-6 text-sm text-gray-600">{{ $t('admin.dashboard.loading') }}</div>
            <div v-else-if="!pendingLands.length" class="p-6 text-sm text-gray-600">{{ $t('admin.dashboard.noPending') }}</div>
            <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.lands.land') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.lands.owner') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.dashboard.conditions') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.dashboard.submitted') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        <tr v-for="land in pendingLands" :key="land._id">
                            <td class="px-6 py-4">
                                <p class="text-sm font-medium text-gray-900">{{ land.name }}</p>
                                <p class="text-sm text-gray-500">{{ land.location }} - {{ land.size || $t('admin.dashboard.noSize') }}</p>
                                <p v-if="land.notes" class="mt-1 max-w-sm text-xs text-gray-500">{{ land.notes }}</p>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-700">
                                <p>{{ ownerName(land.owner) }}</p>
                                <p class="text-gray-500">{{ land.owner?.email }}</p>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">
                                <p>{{ $t('admin.lands.electricity') }}: {{ land.electricity ? $t('common.yes') : $t('common.no') }}</p>
                                <p>{{ $t('admin.lands.trees') }}: {{ land.hasTrees ? $t('common.yes') : $t('common.no') }}</p>
                                <p>{{ $t('admin.lands.water') }}: {{ land.water ? $t('common.yes') : $t('common.no') }}</p>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(land.createdAt) }}</td>
                            <td class="px-6 py-4 text-sm">
                                <button @click="updateLandStatus(land, 'approved')" class="mr-3 rounded-md bg-green-600 px-3 py-2 text-white hover:bg-green-700">
                                    {{ $t('admin.lands.approve') }}
                                </button>
                                <button @click="updateLandStatus(land, 'rejected')" class="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700">
                                    {{ $t('admin.dashboard.reject') }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="mt-8 rounded-lg bg-white shadow">
            <div class="border-b border-gray-200 px-4 py-5 sm:px-6">
                <h2 class="text-lg font-medium text-gray-900">{{ $t('admin.dashboard.allSubmissions') }}</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.lands.land') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.lands.owner') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.status') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.dashboard.reviewed') }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        <tr v-for="land in lands" :key="`all-${land._id}`">
                            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ land.name }}</td>
                            <td class="px-6 py-4 text-sm text-gray-700">{{ ownerName(land.owner) }}</td>
                            <td class="px-6 py-4">
                                <span class="rounded-full px-2 py-1 text-xs font-semibold capitalize" :class="statusClass(land.status)">
                                    {{ statusLabel(land.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500">{{ land.reviewedAt ? formatDate(land.reviewedAt) : $t('admin.dashboard.notReviewed') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="mt-8 rounded-lg bg-white shadow">
            <div class="border-b border-gray-200 px-4 py-5 sm:px-6">
                <h2 class="text-lg font-medium text-gray-900">{{ $t('admin.dashboard.recentActivity') }}</h2>
            </div>
            <ul class="divide-y divide-gray-200">
                <li v-for="activity in summary.recentActivities" :key="`${activity.title}-${activity.date}`" class="px-4 py-4 sm:px-6">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-olive-dark truncate">{{ activity.title }}</p>
                        <span class="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">{{ activity.type }}</span>
                    </div>
                    <p class="mt-2 text-sm text-gray-500">{{ activity.description }}</p>
                    <p class="mt-1 text-xs text-gray-400">{{ formatDate(activity.date) }}</p>
                </li>
            </ul>
        </section>
    </div>
</template>

<script>
import AdminService from '../../services/AdminService';
import LandService from '../../services/LandService';

export default {
    name: 'AdminDashboard',
    data() {
        return {
            summary: {
                totalUsers: 0,
                totalLands: 0,
                totalInvestments: 0,
                totalVisits: 0,
                uniqueVisitors: 0,
                pendingLands: 0,
                approvedLands: 0,
                recentActivities: []
            },
            lands: [],
            loading: false,
            error: ''
        };
    },
    computed: {
        pendingLands() {
            return this.lands.filter((land) => land.status === 'pending');
        },
        statCards() {
            return [
                { label: this.$t('admin.dashboard.totalUsers'), value: this.summary.totalUsers },
                { label: this.$t('admin.dashboard.totalLands'), value: this.summary.totalLands },
                { label: this.$t('admin.dashboard.totalInvestments'), value: `${Number(this.summary.totalInvestments || 0).toLocaleString()} DT` },
                { label: this.$t('admin.dashboard.websiteVisits'), value: this.summary.totalVisits },
                { label: this.$t('admin.dashboard.uniqueVisitors'), value: this.summary.uniqueVisitors },
                { label: this.$t('admin.dashboard.pendingLands'), value: this.summary.pendingLands }
            ];
        }
    },
    async created() {
        await this.loadDashboard();
    },
    methods: {
        async loadDashboard() {
            this.loading = true;
            this.error = '';
            try {
                const [summaryResponse, landsResponse] = await Promise.all([
                    AdminService.getSummary(),
                    LandService.getAllLands()
                ]);
                this.summary = summaryResponse.data || this.summary;
                this.lands = landsResponse.data || [];
            } catch (error) {
                this.error = error.response?.data?.message || error.message || this.$t('admin.dashboard.loadFailed');
            } finally {
                this.loading = false;
            }
        },
        async updateLandStatus(land, status) {
            const response = await LandService.updateStatus(land._id, status);
            const index = this.lands.findIndex((item) => item._id === land._id);
            if (index !== -1) this.lands.splice(index, 1, response.data);
            await this.refreshSummary();
        },
        async refreshSummary() {
            const response = await AdminService.getSummary();
            this.summary = response.data || this.summary;
        },
        ownerName(owner) {
            if (!owner) return this.$t('admin.lands.unknownOwner');
            return `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || owner.email || this.$t('admin.lands.unknownOwner');
        },
        statusLabel(status) {
            if (status === 'approved') return this.$t('common.approved');
            if (status === 'rejected') return this.$t('common.rejected');
            return this.$t('common.pending');
        },
        statusClass(status) {
            if (status === 'approved') return 'bg-green-100 text-green-800';
            if (status === 'rejected') return 'bg-red-100 text-red-800';
            return 'bg-yellow-100 text-yellow-800';
        },
        formatDate(value) {
            if (!value) return this.$t('common.unknown');
            return new Date(value).toLocaleString();
        }
    }
};
</script>
