<template>
    <div class="min-h-screen bg-gray-100 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-white shadow rounded-lg p-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ $t('investor.dashboard') }}</h1>
                
                <div v-if="loading" class="text-center py-8">
                    <p class="text-gray-500">{{ $t('investor.loading') }}</p>
                </div>
                
                <template v-else>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-green-50 p-4 rounded-lg shadow">
                            <h2 class="text-lg font-medium text-gray-900 mb-2">{{ $t('investor.totalInvested') }}</h2>
                            <p class="text-3xl font-bold text-olive-dark">{{ formatCurrency(stats.totalInvested) }}</p>
                        </div>
                        <div class="bg-blue-50 p-4 rounded-lg shadow">
                            <h2 class="text-lg font-medium text-gray-900 mb-2">{{ $t('investor.activeInvestments') }}</h2>
                            <p class="text-3xl font-bold text-blue-600">{{ stats.activeInvestments }}</p>
                        </div>
                        <div class="bg-yellow-50 p-4 rounded-lg shadow">
                            <h2 class="text-lg font-medium text-gray-900 mb-2">{{ $t('investor.totalReturns') }}</h2>
                            <p class="text-3xl font-bold text-yellow-600">{{ formatCurrency(stats.totalReturns) }}</p>
                        </div>
                    </div>
                    
                    <div v-if="investments.length > 0" class="bg-gray-50 p-6 rounded-lg shadow mb-8">
                        <h2 class="text-xl font-medium text-gray-900 mb-4">{{ $t('investor.yourInvestments') }}</h2>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('investor.project') }}</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('investor.amount') }}</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('investor.date') }}</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('investor.returns') }}</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('investor.status') }}</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('investor.actions') }}</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="inv in investments" :key="inv._id || inv.id">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ inv.project || inv.land?.name || 'N/A' }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(inv.amount) }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(inv.date) }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(inv.returns) }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span :class="getStatusClass(inv.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">{{ inv.status }}</span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button class="text-indigo-600 hover:text-indigo-900">{{ $t('investor.viewDetails') }}</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div v-else class="bg-gray-50 p-6 rounded-lg shadow mb-8 text-center">
                        <p class="text-gray-500 mb-4">{{ $t('investor.noInvestments') }}</p>
                    </div>
                    
                    <div class="flex justify-center">
                        <router-link to="/opportunities" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-dark hover:bg-olive-medium">
                            {{ $t('investor.exploreOpportunities') }}
                        </router-link>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import AuthService from '../../services/AuthService';
import InvestmentService from '../../services/InvestmentService';

export default {
    name: 'InvestorDashboard',
    data() {
        return {
            loading: true,
            investments: [],
            stats: {
                totalInvested: 0,
                activeInvestments: 0,
                totalReturns: 0
            }
        };
    },
    async created() {
        if (!AuthService.isInvestor()) {
            this.$router.push('/unauthorized');
            return;
        }
        await this.loadData();
    },
    methods: {
        async loadData() {
            try {
                const response = await InvestmentService.getMyInvestments();
                this.investments = response.data || [];
                this.calculateStats();
            } catch (error) {
                console.error('Error loading investments:', error);
                this.investments = [];
            } finally {
                this.loading = false;
            }
        },
        calculateStats() {
            this.stats.totalInvested = this.investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
            this.stats.activeInvestments = this.investments.filter(inv => ['Pending', 'Completed'].includes(inv.status)).length;
            this.stats.totalReturns = 0;
        },
        formatCurrency(value) {
            return value ? value.toLocaleString() + ' TND' : '0 TND';
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString();
        },
        getStatusClass(status) {
            const classes = {
                active: 'bg-green-100 text-green-800',
                completed: 'bg-blue-100 text-blue-800',
                pending: 'bg-yellow-100 text-yellow-800'
            };
            return classes[String(status || '').toLowerCase()] || 'bg-gray-100 text-gray-800';
        }
    }
}
</script>
