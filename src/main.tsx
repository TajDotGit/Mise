import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './config/env';
import './index.css';
import { App } from './App';
import { createMemoryRepositories } from './data/memory';
import { toIsoDate } from './domain/dates';
import { buildMockPlan } from './mock/plan';
import { mockRecipes } from './mock/recipes';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

// Composition root: Phase 0 uses in-memory repositories seeded with mock data.
// A later phase swaps this line for the Supabase implementation.
const today = toIsoDate(new Date());
const repositories = createMemoryRepositories({ recipes: mockRecipes, plan: buildMockPlan(today) });

createRoot(container).render(
  <StrictMode>
    <App repositories={repositories} today={today} />
  </StrictMode>,
);
