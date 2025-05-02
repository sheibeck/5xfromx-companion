<template>
    <div class="container my-5">
      <h1 class="mb-4 d-flex justify-content-between align-items-center">
        Edit Campaign: {{ campaign?.name }}
        <button class="btn btn-danger" @click="confirmDeleteCampaign">Delete Campaign</button>
      </h1>
  
      <div v-if="loading">Loading...</div>
  
      <div v-else>
        <!-- Create Character Group -->
        <h2 class="mt-4">Character Groups</h2>
        <form @submit.prevent="createGroup" class="mb-3 row g-3">
          <div class="col-md-5">
            <input v-model="newGroup.name" class="form-control" placeholder="Group name" required />
          </div>
          <div class="col-md-5">
            <input v-model="newGroup.description" class="form-control" placeholder="Group description" />
          </div>
          <div class="col-md-2">
            <button type="submit" class="btn btn-success w-100">Add Group</button>
          </div>
        </form>
  
        <!-- Groups + Nested Characters -->
        <div v-for="group in characterGroups" :key="group.id" class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ group.name }}</strong> – {{ group.description }}
            </div>
            <button class="btn btn-sm btn-danger" @click="confirmDeleteGroup(group.id)">Delete Group</button>
          </div>
          <div class="card-body">
            <ul class="list-group mb-3">
              <li
                v-for="char in groupCharacters[group.id] || []"
                :key="char.id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  <strong>{{ char.name }}</strong>
                  <span v-if="char.description"> – {{ char.description }}</span>
                </span>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteCharacter(group.id, char.id)">Delete</button>
              </li>
            </ul>
  
            <!-- Add Character -->
            <form @submit.prevent="createCharacter(group.id)" class="row g-3">
              <div class="col-md-5">
                <input v-model="newCharacter[group.id].name" class="form-control" placeholder="Character name" required />
              </div>
              <div class="col-md-5">
                <input v-model="newCharacter[group.id].description" class="form-control" placeholder="Character description (optional)" />
              </div>
              <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100">Add</button>
              </div>
            </form>
          </div>
        </div>
  
        <!-- Confirmation Modal -->
        <div class="modal fade show" style="display: block; z-index: 1055" v-if="modal.visible">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Confirm Deletion</h5>
                <button type="button" class="btn-close" @click="modal.visible = false"></button>
              </div>
              <div class="modal-body">
                <p>Are you sure you want to delete this {{ modal.type }}?</p>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="modal.visible = false">Cancel</button>
                <button class="btn btn-danger" @click="deleteConfirmed">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { generateClient } from 'aws-amplify/data'
  import type { Schema } from '../../amplify/data/resource'
  
  const route = useRoute()
  const router = useRouter()
  const client = generateClient<Schema>()
  
  const campaign = ref<Schema['Campaign']['type'] | null>(null)
  const loading = ref(true)
  
  const characterGroups = ref<Schema['CharacterGroup']['type'][]>([])
  const groupCharacters = ref<Record<string, Schema['Character']['type'][]>>({})
  const newGroup = ref({ name: '', description: '' })
  const newCharacter = ref<Record<string, { name: string; description?: string }>>({})
  
  const modal = ref({
    visible: false,
    type: '' as 'group' | 'character' | 'campaign',
    groupId: '',
    characterId: ''
  })
  
  async function loadCampaign() {
    const id = route.params.id as string
    const { data } = await client.models.Campaign.get({ id })
    campaign.value = data
  }
  
  async function loadCharactersForGroup(groupId: string) {
    const { data } = await client.models.Character.list({ filter: { characterGroupId: { eq: groupId } } })
    return data
  }
  
  async function loadGroupsWithCharacters() {
    if (!campaign.value?.id) return
    const { data } = await client.models.CharacterGroup.list({ filter: { campaignId: { eq: campaign.value.id } } })
    for (const group of data) {
      groupCharacters.value[group.id] = await loadCharactersForGroup(group.id)
      newCharacter.value[group.id] = { name: '', description: '' }
    }
    characterGroups.value = data
  }
  
  async function createGroup() {
    if (!campaign.value?.id) return
    await client.models.CharacterGroup.create({ ...newGroup.value, campaignId: campaign.value.id })
    newGroup.value = { name: '', description: '' }
    await loadGroupsWithCharacters()
  }
  
  async function createCharacter(groupId: string) {
    const entry = newCharacter.value[groupId]
    if (!entry.name) return
    await client.models.Character.create({ ...entry, characterGroupId: groupId })
    newCharacter.value[groupId] = { name: '', description: '' }
    groupCharacters.value[groupId] = await loadCharactersForGroup(groupId)
  }
  
  function confirmDeleteGroup(groupId: string) {
    modal.value = { visible: true, type: 'group', groupId, characterId: '' }
  }
  
  function confirmDeleteCharacter(groupId: string, characterId: string) {
    modal.value = { visible: true, type: 'character', groupId, characterId }
  }
  
  function confirmDeleteCampaign() {
    modal.value = { visible: true, type: 'campaign', groupId: '', characterId: '' }
  }
  
  async function deleteConfirmed() {
    const { type, groupId, characterId } = modal.value
  
    if (type === 'group') {
      const characters = groupCharacters.value[groupId] || []
      for (const char of characters) await client.models.Character.delete({ id: char.id })
      await client.models.CharacterGroup.delete({ id: groupId })
    } else if (type === 'character') {
      await client.models.Character.delete({ id: characterId })
    } else if (type === 'campaign' && campaign.value?.id) {
      const groupList = await client.models.CharacterGroup.list({ filter: { campaignId: { eq: campaign.value.id } } })
      for (const group of groupList.data) {
        const chars = await client.models.Character.list({ filter: { characterGroupId: { eq: group.id } } })
        for (const c of chars.data) await client.models.Character.delete({ id: c.id })
        await client.models.CharacterGroup.delete({ id: group.id })
      }
      await client.models.Campaign.delete({ id: campaign.value.id })
      router.push('/campaigns')
    }
  
    modal.value.visible = false
    await loadGroupsWithCharacters()
  }
  
  onMounted(async () => {
    await loadCampaign()
    await loadGroupsWithCharacters()
    loading.value = false
  })
  </script>
  