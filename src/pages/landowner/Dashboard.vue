<template>
    <div class="min-h-screen bg-gray-100 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-white shadow rounded-lg p-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-6">Landowner Dashboard</h1>

                <div class="mb-8 rounded-xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                    <h2 class="text-xl font-medium text-gray-900 mb-2">Add New Land</h2>
                    <p class="text-sm text-gray-600 mb-6">Register a land plot and mark the basic conditions before sending it to analysis.</p>

                    <form class="grid gap-6" @submit.prevent="handleAddLand">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                                <input v-model="newLand.name" type="text" required class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input v-model="newLand.location" type="text" required class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                <input v-model="newLand.size" type="text" placeholder="e.g. 12 hectares" class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none" />
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                                <input v-model="newLand.electricity" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                <span class="text-sm font-medium text-gray-700">Electricity exists</span>
                            </label>
                            <label class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                                <input v-model="newLand.hasTrees" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                <span class="text-sm font-medium text-gray-700">There are trees on the land</span>
                            </label>
                            <label class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                                <input v-model="newLand.water" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                <span class="text-sm font-medium text-gray-700">Water is available</span>
                            </label>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea v-model="newLand.notes" rows="3" class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none" placeholder="Extra details about access, soil, or fencing"></textarea>
                        </div>

                        <div class="flex justify-end">
                            <button type="submit" class="inline-flex items-center px-5 py-3 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800">
                                Add Land
                            </button>
                        </div>
                    </form>
                </div>

                <div v-if="lands.length" class="mb-8 bg-gray-50 p-6 rounded-lg shadow">
                    <h2 class="text-xl font-medium text-gray-900 mb-4">Submitted Land</h2>
                    <div class="grid gap-4 md:grid-cols-2">
                        <article v-for="land in lands" :key="land.id" class="rounded-xl border border-gray-200 bg-white p-5">
                            <div class="flex items-start justify-between gap-3">
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900">{{ land.name }}</h3>
                                    <p class="text-sm text-gray-500">{{ land.location }}</p>
                                </div>
                                <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">
                                    Pending
                                </span>
                            </div>
                            <p class="mt-3 text-sm text-gray-600">Size: {{ land.size || 'Not provided' }}</p>
                            <ul class="mt-3 space-y-1 text-sm text-gray-600">
                                <li>&bull; Electricity: {{ land.electricity ? 'Yes' : 'No' }}</li>
                                <li>&bull; Trees on land: {{ land.hasTrees ? 'Yes' : 'No' }}</li>
                                <li>&bull; Water: {{ land.water ? 'Yes' : 'No' }}</li>
                            </ul>
                            <p v-if="land.notes" class="mt-3 text-sm text-gray-500">{{ land.notes }}</p>
                        </article>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-green-50 p-4 rounded-lg shadow">
                        <h2 class="text-lg font-medium text-gray-900 mb-2">Total Land</h2>
                        <p class="text-3xl font-bold text-olive-dark">25 acres</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg shadow">
                        <h2 class="text-lg font-medium text-gray-900 mb-2">Active Projects</h2>
                        <p class="text-3xl font-bold text-blue-600">3</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded-lg shadow">
                        <h2 class="text-lg font-medium text-gray-900 mb-2">Total Revenue</h2>
                        <p class="text-3xl font-bold text-yellow-600">$12,500</p>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-6 rounded-lg shadow mb-8">
                    <h2 class="text-xl font-medium text-gray-900 mb-4">Your Properties</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Name</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Olive Grove East</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Tuscany, Italy</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10 acres</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button class="text-indigo-600 hover:text-indigo-900">Manage</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Olive Grove West</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Andalusia, Spain</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8 acres</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button class="text-indigo-600 hover:text-indigo-900">Manage</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Olive Grove North</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Crete, Greece</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7 acres</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button class="text-indigo-600 hover:text-indigo-900">Manage</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="flex justify-center">
                    <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-dark hover:bg-olive-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-dark">
                        Register New Property
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AuthService from '../../services/AuthService';

export default {
    name: 'LandownerDashboard',
    data() {
        return {
            newLand: {
                name: '',
                location: '',
                size: '',
                electricity: false,
                hasTrees: false,
                water: false,
                notes: ''
            },
            lands: []
        };
    },
    created() {
        // Redirect if not a landowner
        if (!AuthService.isLandowner()) {
            this.$router.push('/unauthorized');
        }
    },
    methods: {
        handleAddLand() {
            this.lands.unshift({
                id: Date.now(),
                ...this.newLand
            });

            this.newLand = {
                name: '',
                location: '',
                size: '',
                electricity: false,
                hasTrees: false,
                water: false,
                notes: ''
            };
        }
    }
}
</script> 
