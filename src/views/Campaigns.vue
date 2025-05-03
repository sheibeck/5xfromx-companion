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
        <router-link
          :to="`/campaigns/${campaign.id}`"
          class="card h-100 text-decoration-none text-light"
        >
          <div class="card-body">
            <h5 class="card-title">{{ campaign.name }}</h5>
            <p class="card-text">
              {{ campaign?.system && gameSystemDisplayName[campaign.system as keyof typeof gameSystemDisplayName] }}
            </p>
            <div v-html="renderMarkdown(campaign?.description || '')" class="text-secondary"></div>
          </div>
        </router-link>
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
                  <option value=0>Forgotten Ruin</option>
                  <option value=1>5 Leagues From the Borderlands</option>
                  <option value=2>5 Parsecs From Home</option>
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
import { marked } from 'marked'
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { gameSystemDisplayName } from '../enums/gameSystemDisplayName'

const client = generateClient<Schema>();

// create a reactive reference to the array of todos
const campaigns = ref<Array<Schema['Campaign']['type']>>([]);

const loading = ref(true)
const showModal = ref(false)

//Get client enum
const gameSystems = client.enums.CampaignSystem.values()

// 4. Use it in your form
const newCampaign = ref<{
  name: string
  system: number
}>({
  name: '',
  system: 0
})

async function createCampaign() {
  const campaign = {
    name: newCampaign.value.name,
    system: gameSystems[newCampaign.value.system],
  }

  const { errors } = await client.models.Campaign.create(campaign)

  if (errors) {
    console.error(errors)
    return
  }

  newCampaign.value.name = '';
  newCampaign.value.system = 0;
  showModal.value = false;

  fetchCampaigns();
}

async function fetchCampaigns() {
  const { data: items, errors } = await client.models.Campaign.list();
  if (errors) {
    console.log("Errors:", errors);
  }
  campaigns.value = items; 

  loading.value = false;
}

function renderMarkdown(input: string) {
  return marked.parse(input)
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
