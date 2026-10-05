import type { ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AppShell } from './components/AppShell';
import { AccountPage } from './features/account/AccountPage';
import { EmptyState } from './components/EmptyState';
import { ClockProvider } from './data/ClockContext';
import type { Repositories } from './data/repositories';
import { RepositoryProvider } from './data/RepositoryContext';
import type { IsoDate } from './domain/schemas';
import { GroceryPage } from './features/grocery/GroceryPage';
import { WeekPlanPage } from './features/plan/WeekPlanPage';
import { RecipeDetailPage } from './features/recipes/RecipeDetailPage';
import { RecipeFormPage } from './features/recipes/RecipeFormPage';
import { RecipesPage } from './features/recipes/RecipesPage';
import { ThemeProvider } from './features/theme/ThemeContext';
import { UseSoonPage } from './features/useSoon/UseSoonPage';
import { WeekProvider } from './features/week/WeekContext';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<WeekPlanPage />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="recipes/new" element={<RecipeFormPage />} />
        <Route path="recipes/:id" element={<RecipeDetailPage />} />
        <Route path="recipes/:id/edit" element={<RecipeFormPage />} />
        <Route path="groceries" element={<GroceryPage />} />
        <Route path="use-soon" element={<UseSoonPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="*" element={<EmptyState title="Page not found" />} />
      </Route>
    </Routes>
  );
}

/** Wires providers around the routes. Which repositories to use is decided by the caller. */
export function AppProviders({
  repositories,
  today,
  children,
}: {
  repositories: Repositories;
  today: IsoDate;
  children: ReactNode;
}) {
  return (
    <RepositoryProvider repositories={repositories}>
      <ClockProvider today={today}>
        <ThemeProvider>
          <WeekProvider>{children}</WeekProvider>
        </ThemeProvider>
      </ClockProvider>
    </RepositoryProvider>
  );
}

export function App({ repositories, today }: { repositories: Repositories; today: IsoDate }) {
  return (
    <AppProviders repositories={repositories} today={today}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
