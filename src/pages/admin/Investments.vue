<template>
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center gap-4">
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">Investments Management</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">Investments are loaded from MongoDB</p>
            </div>
            <div class="flex gap-3">
                <button @click="loadInvestments" class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Refresh</button>
                <button @click="showAddInvestmentModal = true"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    Add New Investment
                </button>
            </div>
        </div>

        <div v-if="error" class="mx-4 mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

        <div class="border-t border-gray-200">
            <div v-if="loading" class="p-6 text-sm text-gray-600">Loading investments...</div>
            <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investor</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="investment in investments" :key="investment._id">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ investment.project }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ investment.investorName }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ Number(investment.amount).toLocaleString() }} DT</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(investment.date) }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="statusClass(investment.status)">
                                    {{ investment.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button class="text-red-600 hover:text-red-900" @click="deleteInvestment(investment)">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="showAddInvestmentModal" class="fixed inset-0 overflow-y-auto h-full w-full z-50 bg-gray-900/30">
            <div class="relative top-20 mx-auto p-8 w-96 rounded-2xl bg-white border border-gray-200 shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Add New Investment</h3>
                    <button @click="showAddInvestmentModal = false" class="text-gray-400 hover:text-gray-600">Close</button>
                </div>

                <form @submit.prevent="addInvestment" class="space-y-4">
                    <input v-model="newInvestment.project" type="text" required placeholder="Project" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <input v-model="newInvestment.investorName" type="text" required placeholder="Investor" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <input v-model="newInvestment.amount" type="number" min="0" step="0.01" required placeholder="Amount (DT)" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <input v-model="newInvestment.date" type="date" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <select v-model="newInvestment.status" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <div class="flex justify-end space-x-3">
                        <button type="button" @click="showAddInvestmentModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" :disabled="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60">{{ saving ? 'Saving...' : 'Add Investment' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import AdminService from '../../services/AdminService';

export default {
    name: 'AdminInvestments',
    data() {
        return {
            showAddInvestmentModal: false,
            investments: [],
            loading: false,
            saving: false,
            error: '',
            newInvestment: this.emptyInvestment()
        }
    },
    async created() {
        await this.loadInvestments();
    },
    methods: {
        emptyInvestment() {
            return { project: '', investorName: '', amount: '', date: '', status: 'Pending' };
        },
        async loadInvestments() {
            this.loading = true;
            this.error = '';
            try {
                const response = await AdminService.getInvestments();
                this.investments = response.data || [];
            } catch (error) {
                this.error = error.response?.data?.message || error.message || 'Failed to load investments.';
            } finally {
                this.loading = false;
            }
        },
        async addInvestment() {
            this.saving = true;
            try {
                const response = await AdminService.createInvestment({
                    ...this.newInvestment,
                    amount: Number(this.newInvestment.amount)
                });
                this.investments.unshift(response.data);
                this.showAddInvestmentModal = false;
                this.newInvestment = this.emptyInvestment();
            } catch (error) {
                this.error = error.response?.data?.message || error.message || 'Failed to add investment.';
            } finally {
                this.saving = false;
            }
        },
        async deleteInvestment(investment) {
            await AdminService.deleteInvestment(investment._id);
            this.investments = this.investments.filter((item) => item._id !== investment._id);
        },
        statusClass(status) {
            if (status === 'Completed') return 'bg-green-100 text-green-800';
            if (status === 'Cancelled') return 'bg-red-100 text-red-800';
            return 'bg-yellow-100 text-yellow-800';
        },
        formatDate(value) {
            if (!value) return 'Unknown';
            return new Date(value).toLocaleDateString();
        }
    }
}
</script>
