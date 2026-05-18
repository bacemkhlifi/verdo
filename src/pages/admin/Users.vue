<template>
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center gap-4">
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">{{ $t('admin.users.title') }}</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">{{ $t('admin.users.subtitle') }}</p>
            </div>
            <div class="flex gap-3">
                <button @click="loadUsers" class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    {{ $t('common.refresh') }}
                </button>
                <button @click="showAddUserModal = true"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    {{ $t('admin.users.addNew') }}
                </button>
            </div>
        </div>

        <div v-if="error" class="mx-4 mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ error }}
        </div>

        <div class="border-t border-gray-200">
            <div v-if="loading" class="p-6 text-sm text-gray-600">{{ $t('admin.users.loading') }}</div>
            <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.users.name') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.users.email') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('admin.users.role') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.status') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="user in users" :key="user._id">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {{ roleLabel(user.roles?.join(', ') || user.role) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                    {{ user.active ? $t('admin.users.active') : $t('admin.users.inactive') }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button class="text-indigo-600 hover:text-indigo-900 mr-3" @click="toggleActive(user)">
                                    {{ user.active ? $t('admin.users.deactivate') : $t('admin.users.activate') }}
                                </button>
                                <button class="text-red-600 hover:text-red-900" @click="deleteUser(user)">{{ $t('common.delete') }}</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="showAddUserModal" class="fixed inset-0 overflow-y-auto h-full w-full z-50 bg-gray-900/30">
            <div class="relative top-16 mx-auto p-8 w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">{{ $t('admin.users.addNew') }}</h3>
                    <button @click="showAddUserModal = false" class="text-gray-400 hover:text-gray-600">{{ $t('admin.users.close') }}</button>
                </div>

                <form @submit.prevent="addUser" class="space-y-4">
                    <input v-model="newUser.firstName" type="text" required :placeholder="$t('admin.users.firstName')" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <input v-model="newUser.lastName" type="text" required :placeholder="$t('admin.users.lastName')" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <input v-model="newUser.email" type="email" required :placeholder="$t('admin.users.email')" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <input v-model="newUser.phoneNumber" type="tel" required :placeholder="$t('admin.users.phoneNumber')" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <input v-model="newUser.password" type="password" required :placeholder="$t('admin.users.temporaryPassword')" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <select v-model="newUser.role" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="">{{ $t('admin.users.selectRole') }}</option>
                        <option value="admin">{{ $t('admin.users.adminRole') }}</option>
                        <option value="investor">{{ $t('admin.users.investorRole') }}</option>
                        <option value="landowner">{{ $t('admin.users.landownerRole') }}</option>
                    </select>
                    <select v-model="newUser.entityType" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="individual">{{ $t('admin.users.individual') }}</option>
                        <option value="group">{{ $t('admin.users.group') }}</option>
                        <option value="company">{{ $t('admin.users.company') }}</option>
                        <option value="organization">{{ $t('admin.users.organization') }}</option>
                    </select>
                    <select v-model="newUser.active" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option :value="true">{{ $t('admin.users.active') }}</option>
                        <option :value="false">{{ $t('admin.users.inactive') }}</option>
                    </select>

                    <div class="flex justify-end space-x-3 pt-2">
                        <button type="button" @click="showAddUserModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                            {{ $t('admin.users.cancel') }}
                        </button>
                        <button type="submit" :disabled="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60">
                            {{ saving ? $t('common.saving') : $t('admin.users.addUser') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import AdminService from '../../services/AdminService';

export default {
    name: 'AdminUsers',
    data() {
        return {
            showAddUserModal: false,
            users: [],
            loading: false,
            saving: false,
            error: '',
            newUser: this.emptyUser()
        }
    },
    async created() {
        await this.loadUsers();
    },
    methods: {
        emptyUser() {
            return {
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                password: '',
                role: '',
                entityType: 'individual',
                active: true
            };
        },
        async loadUsers() {
            this.loading = true;
            this.error = '';
            try {
                const response = await AdminService.getUsers();
                this.users = response.data || [];
            } catch (error) {
                this.error = error.response?.data?.message || error.message || this.$t('admin.users.loadFailed');
            } finally {
                this.loading = false;
            }
        },
        async addUser() {
            this.saving = true;
            this.error = '';
            try {
                const response = await AdminService.createUser(this.newUser);
                this.users.unshift(response.data);
                this.showAddUserModal = false;
                this.newUser = this.emptyUser();
            } catch (error) {
                this.error = error.response?.data?.message || error.message || this.$t('admin.users.addFailed');
            } finally {
                this.saving = false;
            }
        },
        async toggleActive(user) {
            const response = await AdminService.updateUser(user._id, { active: !user.active });
            const index = this.users.findIndex((item) => item._id === user._id);
            if (index !== -1) this.users.splice(index, 1, response.data);
        },
        async deleteUser(user) {
            await AdminService.deleteUser(user._id);
            this.users = this.users.filter((item) => item._id !== user._id);
        },
        roleLabel(role) {
            return role || this.$t('admin.users.noRole');
        }
    }
}
</script>
