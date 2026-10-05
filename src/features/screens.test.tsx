import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';

describe('week plan', () => {
  it('assigns a recipe to an empty day and clears it again', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(await screen.findByRole('button', { name: 'Add recipe to Sat Oct 10' }));
    const dialog = screen.getByRole('dialog', { name: 'Dinner for Sat Oct 10' });
    await user.click(within(dialog).getByRole('button', { name: /Minestrone Soup/ }));

    const day = screen.getByLabelText('Sat Oct 10');
    expect(await within(day).findByRole('link', { name: 'Minestrone Soup' })).toBeInTheDocument();

    await user.click(within(day).getByRole('button', { name: 'Clear Sat Oct 10' }));
    expect(await within(day).findByText('Nothing planned')).toBeInTheDocument();
  });

  it('accepting a use-it-up suggestion fills the open day', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const day = await screen.findByLabelText('Wed Oct 7');
    await user.click(await within(day).findByRole('button', { name: /^Plan / }));
    expect(await within(day).findByRole('button', { name: 'Swap Wed Oct 7' })).toBeInTheDocument();
  });
});

describe('grocery list', () => {
  it('merges ingredients, shows sources, and checks items off', async () => {
    const user = userEvent.setup();
    renderApp('/groceries');
    const tortillas = await screen.findByRole('checkbox', { name: /Flour tortillas/ });
    expect(tortillas).toHaveTextContent('from: Beef Tacos');
    expect(tortillas).toHaveAttribute('aria-checked', 'false');
    await user.click(tortillas);
    await waitFor(() => expect(tortillas).toHaveAttribute('aria-checked', 'true'));
  });
});

describe('use soon', () => {
  it('lists leftovers nearing expiry with urgency labels', async () => {
    renderApp('/use-soon');
    expect(await screen.findByRole('heading', { name: 'Ground beef' })).toBeInTheDocument();
    expect(screen.getAllByText('2 days left').length).toBeGreaterThanOrEqual(2);
  });
});

describe('recipe form', () => {
  it('shows validation errors and renders user text as plain text', async () => {
    const user = userEvent.setup();
    renderApp('/recipes/new');
    await user.click(await screen.findByRole('button', { name: 'Save recipe' }));
    expect(screen.getAllByText('Required').length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText(/^Name/), '<img src=x onerror=alert(1)>');
    await user.type(screen.getByLabelText(/^Ingredient 1 name/), 'Rice');
    await user.type(screen.getByLabelText(/^Ingredient 1 quantity/), '1');
    await user.type(screen.getByLabelText(/^Ingredient 1 unit/), 'cup');
    await user.click(screen.getByRole('button', { name: 'Save recipe' }));

    expect(await screen.findByRole('heading', { name: '<img src=x onerror=alert(1)>' })).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });
});
