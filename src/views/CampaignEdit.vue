<template>
  <div class="container my-5">
    <div class="d-print-none">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
        <div>
          <div v-if="editingCampaign" class="d-flex flex-column gap-2">
            <input v-model="campaignForm.name" class="form-control mb-2" placeholder="Campaign Name" />
            <textarea v-model="campaignForm.description" class="form-control" rows="4" placeholder="Campaign Description (Markdown supported)"></textarea>
            <div class="mt-2">
              <button class="btn btn-primary btn-sm me-2" @click="saveCampaign">Save</button>
              <button class="btn btn-secondary btn-sm" @click="editingCampaign = false">Cancel</button>
            </div>
          </div>
          <div v-else>
            <h1 class="mb-0">{{ campaign?.name }}</h1>
            <small class="text-secondary">
              {{ campaign?.system && gameSystemDisplayName[campaign.system as keyof typeof gameSystemDisplayName] }}
            </small>
            <div v-html="renderMarkdown(campaign?.description || '')" class="mt-2"></div>
          </div>
        </div>
        <div class="d-flex gap-2 mt-3 mt-md-0">
          <button v-if="!editingCampaign" class="btn btn-outline-primary btn-sm" @click="editCampaign">Edit</button>
          <button class="btn btn-danger btn-sm" @click="confirmDeleteCampaign">Delete Campaign</button>
        </div>
      </div>
      
      <div v-if="loading">Loading...</div>

      <div class="my-2" v-else>
        <div class="mb-3">
          <button class="btn btn-outline-success" @click="showGroupForm = !showGroupForm">
            {{ showGroupForm ? 'Cancel' : `Add New ${groupNameLabel}` }}
          </button>
        </div>

        <form v-if="showGroupForm" @submit.prevent="createGroup" class="mb-3 row g-3">
          <div class="col-md-5">
            <input v-model="newGroup.name" class="form-control" :placeholder="`${groupNameLabel} Name`" required />
          </div>
          <div class="col-md-5">
            <textarea
              v-model="newGroup.description"
              class="form-control"
              :placeholder="`${groupNameLabel} description (Markdown supported)`"
              rows="5"
            ></textarea>
          </div>
          <div class="col-md-2">
            <button type="submit" class="btn btn-success w-100">Add {{groupNameLabel}}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-for="group in characterGroups" :key="group.id" class="card mb-4">
      <div class="card-header d-flex flex-wrap justify-content-between align-items-center">
        <strong>{{ group.name }}</strong>
        <div class="d-flex flex-wrap gap-2 mt-2 mt-sm-0 d-print-none">
          <button class="btn btn-sm btn-outline-primary" @click="toggleGroupCollapse(group.id)">
            {{ collapsedGroups[group.id] ? 'Expand' : 'Collapse' }}
          </button>
          <button class="btn btn-sm btn-outline-secondary" @click="startEditingGroup(group)">Edit</button>
          <button class="btn btn-sm btn-outline-secondary" style="display:none;" @click="printGroup(group.id)">Print</button>
          <button class="btn btn-sm btn-danger" @click="confirmDeleteGroup(group.id)">Delete</button>
        </div>
      </div>

      <div class="card-body px-2 px-sm-4" v-if="!collapsedGroups[group.id]" :id="`print-${group.id}`">
        <div v-if="editingGroupId === group.id" class="d-print-none">
          <form @submit.prevent="updateGroup(group.id)" class="row g-3">
            <div class="col-md-5">
              <input v-model="editGroup.name" class="form-control" required />
            </div>
            <div class="col-md-5">
              <textarea v-model="editGroup.description" class="form-control" rows="5"></textarea>
            </div>
            <div class="col-md-2 d-flex gap-2">
              <button type="submit" class="btn btn-primary">Save</button>
              <button type="button" class="btn btn-secondary" @click="cancelEditingGroup">Cancel</button>
            </div>
          </form>
        </div>
        <div v-else>
          <div v-html="renderMarkdown(group.description || '')" class="mb-3"></div>
        </div>

        <div class="row">
          <div
            v-for="char in groupCharacters[group.id] || []"
            :key="char.id"
            class="col-12 col-md-6 mb-3"
          >
            <div class="p-2 p-sm-3 border bg-dark text-light">
              <div v-if="editingCharacterId === char.id" class="d-print-none">
                <input v-model="editCharacter.name" class="form-control mb-2" required />
                <textarea v-model="editCharacter.description" class="form-control" rows="4"></textarea>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <button class="btn btn-sm btn-primary" @click="updateCharacter(group.id, char.id)">Save</button>
                  <button class="btn btn-sm btn-secondary" @click="cancelEditingCharacter">Cancel</button>
                </div>
              </div>
              <div v-else>
                <strong>{{ char.name }}</strong>
                <div v-html="renderMarkdown(char.description || '')"></div>
                <div class="d-flex flex-wrap gap-2 mt-2 d-print-none">
                  <button class="btn btn-sm btn-outline-secondary" @click="startEditingCharacter(char)">Edit</button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteCharacter(group.id, char.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-2 d-print-none">
          <button class="btn btn-outline-primary btn-sm" @click="toggleCharacterForm(group.id)">
            {{ showCharacterForm[group.id] ? 'Cancel' : 'Add Character' }}
          </button>
        </div>

        <form v-if="showCharacterForm[group.id]" @submit.prevent="createCharacter(group.id)" class="row g-3 d-print-none">
          <div class="col-md-5">
            <input v-model="newCharacter[group.id].name" class="form-control" placeholder="Character name" required />
          </div>
          <div class="col-md-5">
            <textarea
              v-model="newCharacter[group.id].description"
              class="form-control"
              placeholder="Character description (Markdown supported)"
              rows="4"
            ></textarea>
          </div>
          <div class="col-md-2">
            <button type="submit" class="btn btn-primary w-100">Add</button>
          </div>
        </form>
      </div>
    </div>

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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { marked } from 'marked'
import templates from '../templates/groupTemplates'
import characterTemplates from '../templates/characterTemplates'
import { gameSystemDisplayName, groupSystemDisplayName} from '../enums/gameSystemDisplayName'

const route = useRoute()
const router = useRouter()
const client = generateClient<Schema>()

const loading = ref(true)
const groupNameLabel = ref("Group")

const campaign = ref<Schema['Campaign']['type'] | null>(null)
const campaignForm = ref<{ name: string; description: string }>({ name: '', description: '' })
const editingCampaign = ref(false)

const characterGroups = ref<Schema['CharacterGroup']['type'][]>([])
const groupCharacters = ref<Record<string, Schema['Character']['type'][]>>({})
const newGroup = ref({ name: '', description: '' })
const newCharacter = ref<Record<string, { name: string; description?: string }>>({})

const editingGroupId = ref<string | null>(null)
const editGroup = ref<{ name: string; description: string }>({ name: '', description: '' })

const editingCharacterId = ref<string | null>(null)
const editCharacter = ref<{ name: string; description?: string }>({ name: '', description: '' })

const showGroupForm = ref(false)
const showCharacterForm = ref<Record<string, boolean>>({})
const collapsedGroups = ref<Record<string, boolean>>({})

const modal = ref({
  visible: false,
  type: '' as 'group' | 'character' | 'campaign',
  groupId: '',
  characterId: ''
})

function editCampaign() {
  if (!campaign.value) return
  editingCampaign.value = true
  campaignForm.value = {
    name: campaign.value.name,
    description: campaign.value.description || ''
  }
}

async function saveCampaign() {
  if (!campaign.value?.id) return
  const { name, description } = campaignForm.value
  await client.models.Campaign.update({ id: campaign.value.id, name, description })
  editingCampaign.value = false
  await loadCampaign()
}

function renderMarkdown(input: string) {
  return marked.parse(input)
}

async function loadCampaign() {
  const id = route.params.id as string
  const { data } = await client.models.Campaign.get({ id })
  campaign.value = data

  if (campaign.value?.system && templates[campaign.value.system]) {
    newGroup.value.description = templates[campaign.value.system]
  }
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
    newCharacter.value[group.id] = { name: '', description: campaign.value?.system ? characterTemplates[campaign.value.system] : '' }
  }
  characterGroups.value = data
}

async function createGroup() {
  if (!campaign.value?.id) return
  await client.models.CharacterGroup.create({ ...newGroup.value, campaignId: campaign.value.id })
  newGroup.value = { name: '', description: campaign.value.system ? templates[campaign.value.system] : '' }
  await loadGroupsWithCharacters()
}

function startEditingGroup(group: Schema['CharacterGroup']['type']) {
  editingGroupId.value = group.id
  editGroup.value = { name: group.name, description: group.description || '' }
}

function cancelEditingGroup() {
  editingGroupId.value = null
  editGroup.value = { name: '', description: '' }
}

async function updateGroup(groupId: string) {
  await client.models.CharacterGroup.update({ id: groupId, ...editGroup.value })
  editingGroupId.value = null
  editGroup.value = { name: '', description: '' }
  await loadGroupsWithCharacters()
}

async function createCharacter(groupId: string) {
  const entry = newCharacter.value[groupId]
  if (!entry.name) return
  await client.models.Character.create({ ...entry, characterGroupId: groupId })
  newCharacter.value[groupId] = { name: '', description: campaign.value?.system ? characterTemplates[campaign.value.system] : ''}
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
    router.push('/')
  }

  modal.value.visible = false
  await loadGroupsWithCharacters()
}

function startEditingCharacter(char: Schema['Character']['type']) {
  editingCharacterId.value = char.id
  editCharacter.value = { name: char.name, description: char.description || '' }
}

function cancelEditingCharacter() {
  editingCharacterId.value = null
  editCharacter.value = { name: '', description: '' }
}

async function updateCharacter(groupId: string, characterId: string) {
  await client.models.Character.update({ id: characterId, ...editCharacter.value })
  editingCharacterId.value = null
  editCharacter.value = { name: '', description: '' }
  groupCharacters.value[groupId] = await loadCharactersForGroup(groupId)
}

function toggleCharacterForm(groupId: string) {
  showCharacterForm.value[groupId] = !showCharacterForm.value[groupId]
}

function toggleGroupCollapse(groupId: string) {
  collapsedGroups.value[groupId] = !collapsedGroups.value[groupId]
}

function printGroup(groupId: string) {
  const el = document.getElementById(`print-${groupId}`)
  if (!el) return
  const printContent = el.innerHTML
  const printWindow = window.open('', '', 'height=600,width=800')
  if (printWindow) {
    printWindow.document.write('<html><head><title>Print Character Group</title>')
    printWindow.document.write('<link rel="stylesheet" href="/style.css">')
    printWindow.document.write('</head><body>')
    printWindow.document.write(printContent)
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
}

onMounted(async () => {
  await loadCampaign()
  await loadGroupsWithCharacters()
  loading.value = false

  groupNameLabel.value = campaign?.value ? `${groupSystemDisplayName[campaign.value.system as keyof typeof groupSystemDisplayName]}` : "Group";
})
</script>

<style scoped>
</style>
