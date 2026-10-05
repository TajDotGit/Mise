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
  it('shows validation errors before anything is picked', async () => {
    const user = userEvent.setup();
    renderApp('/recipes/new');
    await user.click(await screen.findByRole('button', { name: 'Save recipe' }));
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Pick an ingredient from the list')).toBeInTheDocument();
  });

  it('picks ingredients from the catalog with typo-tolerant search, autofills the unit, and saves steps, time, and link', async () => {
    const user = userEvent.setup();
    renderApp('/recipes/new');

    await user.type(await screen.findByLabelText(/^Name/), '<img src=x onerror=alert(1)>');
    await user.type(screen.getByLabelText(/^Time/), '15');
    await user.type(screen.getByLabelText(/^Video or recipe link/), 'https://www.tiktok.com/@someone/video/1');

    await user.click(screen.getByRole('button', { name: 'Ingredient 1: choose ingredient' }));
    const picker = screen.getByRole('dialog', { name: 'Choose ingredient' });
    await user.type(within(picker).getByRole('searchbox', { name: 'Search ingredients' }), 'cheddr');
    await user.click(within(picker).getByRole('button', { name: /^Cheddar/ }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Ingredient 1: Cheddar' })).toBeInTheDocument();
    expect(screen.getByLabelText('Ingredient 1 unit')).toHaveValue('cup');
    await user.type(screen.getByLabelText('Ingredient 1 quantity'), '1');

    await user.type(screen.getByLabelText('Step 1'), 'Grate the cheese');
    await user.click(screen.getByRole('button', { name: 'Add step' }));
    await user.type(screen.getByLabelText('Step 2'), 'Melt');
    await user.click(screen.getByRole('button', { name: 'Save recipe' }));

    expect(await screen.findByRole('heading', { name: '<img src=x onerror=alert(1)>' })).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Watch video/ })).toHaveAttribute('href', 'https://www.tiktok.com/@someone/video/1');
    expect(screen.getByRole('link', { name: /Watch video/ })).toHaveAttribute('rel', 'noopener noreferrer nofollow');
    const steps = screen.getByRole('heading', { name: 'Steps' }).parentElement as HTMLElement;
    expect(within(steps).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['1Grate the cheese', '2Melt']);
  });

  it('filters the picker by section', async () => {
    const user = userEvent.setup();
    renderApp('/recipes/new');
    await user.click(await screen.findByRole('button', { name: 'Ingredient 1: choose ingredient' }));
    const picker = screen.getByRole('dialog', { name: 'Choose ingredient' });
    await user.click(within(picker).getByRole('button', { name: 'Dairy & eggs' }));
    expect(within(picker).getByRole('button', { name: /^Cheddar/ })).toBeInTheDocument();
    expect(within(picker).queryByRole('button', { name: /^Ground beef/ })).toBeNull();
  });

  it('rejects a javascript: link', async () => {
    const user = userEvent.setup();
    renderApp('/recipes/tacos/edit');
    const link = await screen.findByLabelText(/^Video or recipe link/);
    await user.clear(link);
    await user.type(link, 'javascript:alert(1)');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByText(/full web link/)).toBeInTheDocument();
  });
});

describe('account', () => {
  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('switches to dark mode and remembers it on this device', async () => {
    const user = userEvent.setup();
    renderApp('/account');
    await user.click(await screen.findByRole('radio', { name: /Dark/ }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('mise.theme')).toBe('dark');
  });

  it('shows the household members and marks future features as coming soon', async () => {
    renderApp('/account');
    expect(await screen.findByText('Alex Example')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Invite to household/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Sync now/ })).toBeDisabled();
  });
});
