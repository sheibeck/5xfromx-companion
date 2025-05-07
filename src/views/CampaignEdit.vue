<template>
  <div class="container my-5">

    <div class="d-flex flex-column">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
        <div class="w-100">
          <div v-if="editingCampaign" class="d-flex flex-column gap-2 card">
            <input v-model="campaignForm.name" class="form-control mb-2" placeholder="Campaign Name" />
            <textarea v-model="campaignForm.description" class="form-control" :rows="editRows" placeholder="Campaign Description (Markdown supported)"></textarea>
            <div class="mt-2">
              <button class="btn btn-primary btn-sm me-2" @click="saveCampaign">Save</button>
              <button class="btn btn-secondary btn-sm" @click="editingCampaign = false">Cancel</button>
            </div>
          </div>
          <div v-else>
            <h1 class="mb-0">{{ campaign?.name }}</h1>
            <small class="text-secondary">
              {{ campaign?.system && gameSystemDisplayName[campaign.system as keyof typeof gameSystemDisplayName] }} Campaign
            </small>
            <div class="d-flex gap-2 mt-2">
              <button class="btn btn-outline-primary btn-sm" @click="editCampaign">Edit</button>
              <button class="btn btn-sm btn-outline-secondary" @click="printCampaign()">Print</button>
              <button class="btn btn-outline-secondary btn-sm" @click="toggleCampaignDescription">
                {{ showCampaignDescription ? 'Hide' : 'Show' }}
              </button>
              <button class="btn btn-danger btn-sm" @click="confirmDeleteCampaign">Delete</button>
            </div>
            <div id="campaignDescription" v-if="showCampaignDescription" v-html="renderMarkdown(campaign?.description || '')" class="mt-2 card"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading">Loading...</div>

    <!-- Character Groups -->
    <div class="my-4" v-if="!loading">
      <h3>{{groupNameLabel}}s</h3>
      <div class="mb-3">
        <button class="btn btn-outline-success" @click="showGroupForm = !showGroupForm">
          {{ showGroupForm ? 'Cancel' : `Add New ${groupNameLabel}` }}
        </button>
      </div>

      <div v-if="showGroupForm" class="w-100">
        <div class="d-flex flex-column gap-2 card">
          <input v-model="newGroup.name" class="form-control" :placeholder="`${groupNameLabel} Name`" required />
          <textarea
            v-model="newGroup.description"
            class="form-control"
            :placeholder="`${groupNameLabel} description (Markdown supported)`"
            :rows="editRows"
          ></textarea>
        </div>
        <div class="mt-2">
          <button class="btn btn-primary btn-sm me-2" @click="createGroup">Add {{groupNameLabel}}</button>
          <button class="btn btn-secondary btn-sm me-2" @click="showGroupForm = !showGroupForm">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Characters -->
    <div v-if="!loading" v-for="group in characterGroups" :key="group.id" class="card mb-4">
      <div class="card-header d-flex flex-wrap justify-content-between align-items-center">
        <strong>{{ group.name }}</strong>
        <div class="d-flex flex-wrap gap-2 mt-2 mt-sm-0 d-print-none">
          <button class="btn btn-sm btn-outline-primary" @click="toggleGroupCollapse(group.id)">
            {{ collapsedGroups[group.id] ? 'Show' : 'Hide' }}
          </button>
          <button class="btn btn-sm btn-outline-secondary" @click="startEditingGroup(group)">Edit</button>
          <button class="btn btn-sm btn-outline-secondary" @click="printGroup(group.id)">Print</button>
          <button class="btn btn-sm btn-danger" @click="confirmDeleteGroup(group.id)">Delete</button>
        </div>
      </div>

      <div class="card-body px-2 px-sm-4" v-if="!collapsedGroups[group.id]" :id="`print-${group.id}`">
        <div class="w-100">
          <div v-if="editingGroupId === group.id" class="d-flex flex-column gap-2 card">
            <input v-model="editGroup.name" class="form-control" required  :placeholder="`${groupNameLabel} Name (Markdown Supported)`" />
            <textarea v-model="editGroup.description" class="form-control" :rows="editRows" :placeholder="`${groupNameLabel} Description (Markdown Supported)`"></textarea>
            <div class="mt-2">
              <button class="btn btn-primary btn-sm me-2" @click="updateGroup(group.id)">Save</button>
              <button class="btn btn-secondary btn-sm me-2" @click="cancelEditingGroup">Cancel</button>
            </div>
          </div>
          <div v-else>
            <div v-html="renderMarkdown(group.description || '')" class="mb-3"></div>
          </div>
        </div>

        <!-- Characters -->
        <h3 class="d-print-none">Characters</h3>
        <div class="row">
          <draggable
            :list="groupCharacters[group.id]"
            group="characters"
            item-key="id"
            class="row"
            @end="onCharacterDragEnd(group.id)"
          >
            <template #item="{ element: char }">
              <div class="col-12 col-md-6 mb-3">
                <div class="p-2 p-sm-3 border bg-dark text-light">
                  <div v-if="editingCharacterId === char.id" class="d-print-none">
                    <input v-model="editCharacter.name" class="form-control mb-2" required />
                    <textarea v-model="editCharacter.description" class="form-control" :rows="editRows"></textarea>
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
            </template>
          </draggable>
        </div>

        <div class="mb-2 d-print-none">
          <button class="btn btn-outline-primary btn-sm" @click="toggleCharacterForm(group.id)">
            {{ showCharacterForm[group.id] ? 'Cancel' : 'Add Character' }}
          </button>
        </div>

        <div v-if="showCharacterForm[group.id]" class="w-100">
          <div class="d-flex flex-column gap-2 card">
            <div class="d-flex align-items-center">
              <input
                v-model="newCharacter[group.id].name"
                class="form-control me-2"
                placeholder="Character name"
                required
              />
              <button class="btn btn-outline-secondary" type="button" @click="generateCharacterName(group.id)">🎲</button>
            </div>

            <textarea
              v-model="newCharacter[group.id].description"
              class="form-control"
              placeholder="Character description (Markdown supported)"
              :rows="editRows"
            ></textarea>
            <div class="mt-1">
              <button class="btn btn-primary btn-sm me-2" @click="createCharacter(group.id)">Add</button>
              <button class="btn btn-secondary btn-sm me-2" @click="toggleCharacterForm(group.id)">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaign Turns -->
    <div v-if="!loading" class="my-4">
      <h3 class="mb-2">Campaign Turns</h3>

      <div class="mb-3">
        <button class="btn btn-outline-success" @click="showTurnForm = !showTurnForm">
          {{ showTurnForm ? 'Cancel' : 'Add New Turn' }}
        </button>
      </div>

      <div v-if="showTurnForm" class="w-100">
        <div class="d-flex flex-column gap-2 card">
         
          <input type="number" v-model.number="newTurn.turnNumber" class="form-control" min="1" required />
          <textarea v-model="newTurn.description" class="form-control" :rows="editRows"></textarea>

          <div class="mt-2">
            <button class="btn btn-primary btn-sm me-2" @click="createTurn">Add Turn</button>
            <button class="btn btn-secondary btn-sm me-2" @click="showTurnForm = !showTurnForm">Cancel</button>
          </div>
        </div>
      </div>

      <div v-for="turn in sortedTurns" :key="turn.id" class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <strong>Turn {{ turn.turnNumber }}</strong>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary" @click="toggleTurnCollapse(turn.id)">
              {{ !collapsedTurns[turn.id] ? 'Show' : 'Hide' }}
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="startEditingTurn(turn)">Edit</button>
            <button class="btn btn-sm btn-outline-secondary" @click="printTurn(turn.id)">Print</button>
            <button class="btn btn-sm btn-danger" @click="confirmDeleteTurn(turn.id)">Delete</button>
          </div>
        </div>
        <div class="card-body" v-if="collapsedTurns[turn.id]" :id="`print-${turn.id}`">
          <div v-if="editingTurnId === turn.id">
            <div class="w-100">
              <div class="row g-2">
                <input type="number" v-model.number="editTurn.turnNumber" class="form-control" min="1" required />
                <textarea v-model="editTurn.description" class="form-control" :rows="editRows"></textarea>
              </div>
              <div class="mt-2">
                <button class="btn btn-primary btn-sm me-2" @click="updateTurn(turn.id)">Save</button>
                <button class="btn btn-secondary btn-sm me-2" @click="cancelEditingTurn">Cancel</button>
              </div>
            </div>
          </div>
          <div v-else v-html="renderMarkdown(turn.description || '')"></div>
        </div>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { marked } from 'marked'
import characterTemplates from '../templates/characterTemplates'
import turnTemplates from '../templates/turnTemplates';
import groupTamplates from '../templates/groupTemplates';
import { gameSystemDisplayName, groupSystemDisplayName} from '../enums/gameSystemDisplayName'
import { uniqueNamesGenerator, type Config } from 'unique-names-generator';
import {fantasy_names, fantasy_surnames, scifi_names, scifi_surnames, modern_names, modern_surnames} from '../templates/randomNames';
import draggable from 'vuedraggable'

const route = useRoute()
const router = useRouter()
const client = generateClient<Schema>()

const editRows = ref(10);

const loading = ref(true)
const groupNameLabel = ref("Group")

const showCampaignDescription = ref(true)
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

const campaignTurns = ref<Schema['CampaignTurn']['type'][]>([]);
const collapsedTurns = ref<Record<string, boolean>>({});
const editingTurnId = ref<string | null>(null);
const newTurn = ref({ turnNumber: 1, description: '' });
const editTurn = ref({ turnNumber: 1, description: '' });

const showTurnForm = ref(false);

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

  if (campaign.value?.system && groupTamplates[campaign.value.system]) {
    newGroup.value.description = groupTamplates[campaign.value.system];
  }

  if (campaign.value?.system && turnTemplates[campaign.value.system]) {
    newTurn.value.description = turnTemplates[campaign.value.system];
  }
}

async function loadCharactersForGroup(groupId: string) {
  const { data } = await client.models.Character.list({ filter: { characterGroupId: { eq: groupId } } })
  return data.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
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
  await client.models.CharacterGroup.create({ ...newGroup.value, campaignId: campaign.value.id });
  showGroupForm.value = !showGroupForm;

  newGroup.value = { name: '', description: campaign.value?.system ? groupTamplates[campaign.value.system] : '' }
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
  await client.models.Character.create({
    ...entry,
    characterGroupId: groupId,
    sortOrder: groupCharacters.value[groupId]?.length || 0,
  });

  toggleCharacterForm(groupId);

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
    router.push('/campaigns')
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

function toggleCampaignDescription() {
  showCampaignDescription.value = !showCampaignDescription.value
}

function toggleCharacterForm(groupId: string) {
  showCharacterForm.value[groupId] = !showCharacterForm.value[groupId]
}

function toggleGroupCollapse(groupId: string) {
  collapsedGroups.value[groupId] = !collapsedGroups.value[groupId]
}

function printCampaign() {
  const el = document.getElementById(`campaignDescription`);
  if (!el) return;
  const printContent = el.innerHTML;
  const printWindow = window.open('', '', 'height=600,width=800');

  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Campaign</title>
          <link 
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" 
            rel="stylesheet" 
            integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" 
            crossorigin="anonymous"
          >
          <link rel="stylesheet" type="text/css" href="/print.css">
        </head>
        <body>
          <div class="container">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for stylesheets to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }
}

function printGroup(groupId: string) {
  const el = document.getElementById(`print-${groupId}`);
  if (!el) return;
  const printContent = el.innerHTML;
  const printWindow = window.open('', '', 'height=600,width=800');

  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Group</title>
          <link 
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" 
            rel="stylesheet" 
            integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" 
            crossorigin="anonymous"
          >
          <link rel="stylesheet" type="text/css" href="/print.css">
        </head>
        <body>
          <div class="container">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for stylesheets to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }
}

function printTurn(turnId: string) {
  const el = document.getElementById(`print-${turnId}`);
  if (!el) return;
  const printContent = el.innerHTML;
  const printWindow = window.open('', '', 'height=600,width=800');

  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Campaign Turn</title>
          <link 
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" 
            rel="stylesheet" 
            integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" 
            crossorigin="anonymous"
          >
          <link rel="stylesheet" type="text/css" href="/print.css">
        </head>
        <body>
          <div class="container">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for stylesheets to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }
}

function generateCharacterName(groupId: string) {
  const system = campaign.value?.system
  if (!newCharacter.value[groupId]) newCharacter.value[groupId] = { name: '' }
  if (system === 'FIVE_PARSECS') {
    const fpConfig: Config = {
      dictionaries: [scifi_names, scifi_surnames],
      separator: ' ',
      length: 2,
    };
    newCharacter.value[groupId].name = uniqueNamesGenerator(fpConfig);
  } else if (system === 'FIVE_LEAGUES') {
    const flConfig: Config = {
      dictionaries: [fantasy_names, fantasy_surnames],
      separator: ' ',
      length: 2,
    };
    newCharacter.value[groupId].name = uniqueNamesGenerator(flConfig);
  } else {
    const frConfig: Config = {
      dictionaries: [modern_names, modern_surnames],
      separator: ' ',
      length: 2,
    };
    newCharacter.value[groupId].name = uniqueNamesGenerator(frConfig);
  }
}

async function onCharacterDragEnd(groupId: string) {
  const characters = groupCharacters.value[groupId] || []
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i]
    if (char.sortOrder !== i) {
      await client.models.Character.update({ id: char.id, sortOrder: i })
    }
  }
}

const sortedTurns = computed(() =>
  [...campaignTurns.value].sort((a, b) => (b.turnNumber ?? 0) - (a.turnNumber ?? 0))
);

async function loadTurns() {
  if (!campaign.value?.id) return;
  const { data } = await client.models.CampaignTurn.list({
    filter: { campaignId: { eq: campaign.value.id } },
  });

  campaignTurns.value = data;
  newTurn.value.turnNumber = campaignTurns.value.length+1;
}

async function createTurn() {
  if (!campaign.value?.id) return;
  await client.models.CampaignTurn.create({
    ...newTurn.value,
    campaignId: campaign.value.id,
  });
  newTurn.value = {
    turnNumber: campaignTurns.value?.length+1,
    description: campaign.value?.system ? turnTemplates[campaign.value.system] : ''
  };

  showTurnForm.value = !showTurnForm;

  await loadTurns();
}

function toggleTurnCollapse(turnId: string) {
  collapsedTurns.value[turnId] = !collapsedTurns.value[turnId];
}

function startEditingTurn(turn: Schema['CampaignTurn']['type']) {
  editingTurnId.value = turn.id;
  editTurn.value = { turnNumber: turn.turnNumber ?? campaignTurns.value.length+1, description: turn.description || '' };
}

function cancelEditingTurn() {
  editingTurnId.value = null;
  editTurn.value = { turnNumber: campaignTurns.value.length+1, description: '' };
}

async function updateTurn(turnId: string) {
  await client.models.CampaignTurn.update({ id: turnId, ...editTurn.value });
  editingTurnId.value = null;
  await loadTurns();
}

async function confirmDeleteTurn(turnId: string) {
  if (confirm('Are you sure you want to delete this turn?')) {
    await client.models.CampaignTurn.delete({ id: turnId });
    await loadTurns();
  }
}

onMounted(async () => {
  await loadCampaign()
  await loadGroupsWithCharacters()
  await loadTurns();

  loading.value = false
  groupNameLabel.value = campaign?.value ? `${groupSystemDisplayName[campaign.value.system as keyof typeof groupSystemDisplayName]}` : "Group";
})
</script>

<style scoped>
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ccc;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
