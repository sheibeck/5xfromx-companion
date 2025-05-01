<template>
  <div class="container my-5">
    <h1 class="mb-4">Campaigns</h1>

    <div class="mb-3">
      <button class="btn btn-primary" @click="showModal = true">
        Add New Campaign
      </button>
    </div>

    <div v-if="loading">Loading campaigns...</div>

    <div v-else-if="campaigns.length === 0" class="text-muted">
      No campaigns yet.
    </div>

    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" v-else>
      <div class="col" v-for="campaign in campaigns" :key="campaign.id">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ campaign.name }}</h5>
            <p class="card-text">
              System: {{ campaign.system }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      class="modal fade show"
      tabindex="-1"
      style="display: block"
      v-if="showModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Campaign</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createCampaign">
              <div class="mb-3">
                <label class="form-label">Campaign Name</label>
                <input v-model="newCampaign.name" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">System</label>
                <select v-model="newCampaign.system" class="form-select" required>
                  <option disabled value="">Select a system</option>
                  <option>Forgotten Ruin</option>
                  <option>5 Leagues</option>
                  <option>5 Parsecs</option>
                </select>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="showModal = false">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade show" v-if="showModal"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// create a reactive reference to the array of todos
const campaigns = ref<Array<Schema['Campaign']['type']>>([]);

const loading = ref(true)
const showModal = ref(false)

type GameSystem = 'FORGOTTEN_RUIN' | 'FIVE_LEAGUES' | 'FIVE_PARSECS'

const newCampaign = ref<{
  name: string
  system: GameSystem | ''
}>({
  name: '',
  system: 'FORGOTTEN_RUIN',
})

async function createCampaign() {
  if (!newCampaign.value.name || !newCampaign.value.system) return;

  await client.models.Campaign.create({
    name: newCampaign.value.name,
    system: newCampaign.value.system,
  });

  newCampaign.value.name = '';
  newCampaign.value.system = '';
  showModal.value = false;
}

async function fetchCampaigns() {
  const { data: items, errors } = await client.models.Campaign.list();
  campaigns.value = items; 
}

onMounted(() => {
  fetchCampaigns()
})
</script>


<style scoped>
.modal {
  display: block;
}
</style>
