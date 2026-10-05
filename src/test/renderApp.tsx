import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AppProviders, AppRoutes } from '../App';
import { createMemoryRepositories } from '../data/memory';
import { buildMockPlan } from '../mock/plan';
import { mockRecipes } from '../mock/recipes';

export const TODAY = '2026-10-05';

/** Render the whole app on fresh mock data at a fixed "today". */
export function renderApp(path = '/') {
  const repositories = createMemoryRepositories({ recipes: mockRecipes, plan: buildMockPlan(TODAY) });
  const utils = render(
    <AppProviders repositories={repositories} today={TODAY}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>,
  );
  return { ...utils, repositories };
}
