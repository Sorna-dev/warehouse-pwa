import { ContainerData } from '../types';

const STORAGE_KEY = 'warehouse-containers';

export function saveContainer(container: ContainerData): void {
  const containers = getAllContainers();
  const index = containers.findIndex(c => c.id === container.id);
  
  if (index >= 0) {
    containers[index] = container;
  } else {
    containers.push(container);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(containers));
}

export function getAllContainers(): ContainerData[] {
  if (typeof window === 'undefined') return [];
  
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function getContainerById(id: string): ContainerData | null {
  const containers = getAllContainers();
  return containers.find(c => c.id === id) || null;
}

export function deleteContainer(id: string): void {
  const containers = getAllContainers();
  const filtered = containers.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getContainersByStatus(status: 'draft' | 'completed'): ContainerData[] {
  const containers = getAllContainers();
  return containers.filter(c => c.status === status);
}

export function clearAllContainers(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportContainersAsJSON(): string {
  const containers = getAllContainers();
  return JSON.stringify(containers, null, 2);
}

export function importContainersFromJSON(jsonString: string): void {
  try {
    const containers = JSON.parse(jsonString);
    if (Array.isArray(containers)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(containers));
    }
  } catch (error) {
    console.error('Failed to import containers:', error);
    throw new Error('Invalid JSON format');
  }
}