<template>
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6 flex flex-wrap justify-between items-center gap-4">
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">{{ $t('admin.lands.title') }}</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">{{ $t('admin.lands.subtitle') }}</p>
            </div>
            <button @click="loadLands" class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                {{ $t('common.refresh') }}
            </button>
        </div>

        <div v-if="error" class="mx-4 mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

        <div class="border-t border-gray-200">
            <div v-if="loading" class="p-6 text-sm text-gray-600">{{ $t('admin.lands.loading') }}</div>
            <div v-else-if="!lands.length" class="p-6 text-sm text-gray-600">{{ $t('admin.lands.empty') }}</div>
            <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.lands.land') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.lands.owner') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.lands.details') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.status') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="land in lands" :key="land._id">
                            <td class="px-6 py-4 align-top">
                                <p class="text-sm font-medium text-gray-900">{{ land.name }}</p>
                                <p class="text-sm text-gray-500">{{ land.location }}</p>
                                <p v-if="land.notes" class="mt-1 max-w-xs text-xs text-gray-500">{{ land.notes }}</p>
                            </td>
                            <td class="px-6 py-4 align-top text-sm text-gray-700">
                                <p>{{ ownerName(land.owner) }}</p>
                                <p class="text-gray-500">{{ land.owner?.email }}</p>
                                <p class="text-gray-500">{{ land.owner?.phoneNumber }}</p>
                            </td>
                            <td class="px-6 py-4 align-top text-sm text-gray-600">
                                <p>{{ $t('common.size') }}: {{ land.size || $t('common.notProvided') }}</p>
                                <p>{{ $t('admin.lands.electricity') }}: {{ land.electricity ? $t('common.yes') : $t('common.no') }}</p>
                                <p>{{ $t('admin.lands.trees') }}: {{ land.hasTrees ? $t('common.yes') : $t('common.no') }}</p>
                                <p>{{ $t('admin.lands.water') }}: {{ land.water ? $t('common.yes') : $t('common.no') }}</p>
                            </td>
                            <td class="px-6 py-4 align-top">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize" :class="statusClass(land.status)">
                                    {{ statusLabel(land.status) }}
                                </span>
                                <p v-if="land.rejectionReason" class="mt-2 max-w-xs text-xs text-red-600">{{ land.rejectionReason }}</p>
                            </td>
                            <td class="px-6 py-4 align-top text-sm whitespace-nowrap">
                                <button v-if="land.status !== 'approved'" class="text-green-700 hover:text-green-900 mr-3" @click="updateLandStatus(land, 'approved')">
                                    {{ $t('admin.lands.approve') }}
                                </button>
                                <button v-if="land.status !== 'rejected'" class="text-red-700 hover:text-red-900 mr-3" @click="rejectLand(land)">
                                    {{ $t('admin.lands.decline') }}
                                </button>
                                <button v-if="land.status !== 'pending'" class="text-yellow-700 hover:text-yellow-900 mr-3" @click="updateLandStatus(land, 'pending')">
                                    {{ $t('common.pending') }}
                                </button>
                                <button class="text-gray-600 hover:text-gray-900" @click="deleteLand(land)">
                                    {{ $t('common.delete') }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import LandService from '../../services/LandService';

export default {
    name: 'AdminLands',
    data() {
        return {
            lands: [],
            loading: false,
            error: ''
        };
    },
    async created() {
        await this.loadLands();
    },
    methods: {
        async loadLands() {
            this.loading = true;
            this.error = '';
            try {
                const response = await LandService.getAllLands();
                this.lands = response.data || [];
            } catch (error) {
                this.error = error.response?.data?.message || error.message || this.$t('admin.lands.loadFailed');
            } finally {
                this.loading = false;
            }
        },
        async updateLandStatus(land, status, rejectionReason = '') {
            try {
                const response = await LandService.updateStatus(land._id, status, rejectionReason);
                const index = this.lands.findIndex((item) => item._id === land._id);
                if (index !== -1) this.lands.splice(index, 1, response.data);
            } catch (error) {
                this.error = error.response?.data?.message || error.message || this.$t('admin.lands.updateFailed');
            }
        },
        async rejectLand(land) {
            const rejectionReason = window.prompt(this.$t('admin.lands.reasonPrompt'), land.rejectionReason || '');
            if (rejectionReason === null) return;
            await this.updateLandStatus(land, 'rejected', rejectionReason);
        },
        async deleteLand(land) {
            const confirmed = window.confirm(this.$t('admin.lands.deleteConfirm', { name: land.name }));
            if (!confirmed) return;
            try {
                await LandService.deleteLand(land._id);
                this.lands = this.lands.filter((item) => item._id !== land._id);
            } catch (error) {
                this.error = error.response?.data?.message || error.message || this.$t('admin.lands.deleteFailed');
            }
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
        }
    }
};
</script>
