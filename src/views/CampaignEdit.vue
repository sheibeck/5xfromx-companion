<template>
  <div class="container my-5">
    <h1 class="mb-4 d-flex justify-content-between align-items-center">
      {{ campaign?.name }}
      <button class="btn btn-danger" @click="confirmDeleteCampaign">Delete Campaign</button>
    </h1>

    <div v-if="loading">Loading...</div>

    <div v-else>
      <!-- Toggle Add Group Form -->
      <div class="mb-3">
        <button class="btn btn-outline-success" @click="showGroupForm = !showGroupForm">
          {{ showGroupForm ? 'Cancel' : 'Add New Group' }}
        </button>
      </div>

      <!-- Create Character Group -->
      <form v-if="showGroupForm" @submit.prevent="createGroup" class="mb-3 row g-3">
        <div class="col-md-5">
          <input v-model="newGroup.name" class="form-control" placeholder="Group name" required />
        </div>
        <div class="col-md-5">
          <textarea
            v-model="newGroup.description"
            class="form-control"
            placeholder="Group description (Markdown supported)"
            rows="5"
          ></textarea>
        </div>
        <div class="col-md-2">
          <button type="submit" class="btn btn-success w-100">Add Group</button>
        </div>
      </form>

      <!-- Groups + Nested Characters -->
      <div v-for="group in characterGroups" :key="group.id" class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ group.name }}</strong>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary" @click="toggleGroupCollapse(group.id)">
              {{ collapsedGroups[group.id] ? 'Expand' : 'Collapse' }}
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="startEditingGroup(group)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="confirmDeleteGroup(group.id)">Delete</button>
          </div>
        </div>

        <div class="card-body" v-if="!collapsedGroups[group.id]">
          <div v-if="editingGroupId === group.id">
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

          <ul class="list-group mb-3">
            <li
              v-for="char in groupCharacters[group.id] || []"
              :key="char.id"
              class="list-group-item text-light bg-dark"
            >
              <div v-if="editingCharacterId === char.id" class="row g-2">
                <div class="col-md-5">
                  <input v-model="editCharacter.name" class="form-control" required />
                </div>
                <div class="col-md-5">
                  <textarea v-model="editCharacter.description" class="form-control" rows="4"></textarea>
                </div>
                <div class="col-md-2 d-flex gap-2">
                  <button class="btn btn-sm btn-primary" @click="updateCharacter(group.id, char.id)">Save</button>
                  <button class="btn btn-sm btn-secondary" @click="cancelEditingCharacter">Cancel</button>
                </div>
              </div>
              <div v-else class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ char.name }}</strong>
                  <div v-html="renderMarkdown(char.description || '')"></div>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-secondary" @click="startEditingCharacter(char)">Edit</button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteCharacter(group.id, char.id)">Delete</button>
                </div>
              </div>
            </li>
          </ul>

          <!-- Toggle Character Form -->
          <div class="mb-2">
            <button class="btn btn-outline-primary btn-sm" @click="toggleCharacterForm(group.id)">
              {{ showCharacterForm[group.id] ? 'Cancel' : 'Add Character' }}
            </button>
          </div>

          <!-- Add Character -->
          <form v-if="showCharacterForm[group.id]" @submit.prevent="createCharacter(group.id)" class="row g-3">
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
import { marked } from 'marked'
import templates from '../templates/groupTemplates'
import characterTemplates from '../templates/characterTemplates'

const route = useRoute()
const router = useRouter()
const client = generateClient<Schema>()

const campaign = ref<Schema['Campaign']['type'] | null>(null)
const loading = ref(true)

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

onMounted(async () => {
  await loadCampaign()
  await loadGroupsWithCharacters()
  loading.value = false
})
</script>
