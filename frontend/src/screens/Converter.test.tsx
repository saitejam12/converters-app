import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Converter from './Converter';

/**
 * The From and To pickers both list every unit of the category, so a unit
 * button has to be found inside its own row. The row is the element wrapping
 * the "From"/"To" caption and the button strip.
 */
function unitRow(caption: 'From' | 'To'): HTMLElement {
  const label = screen.getByText(caption, { selector: 'span' });
  const header = label.parentElement as HTMLElement;
  return header.parentElement as HTMLElement;
}

async function pickUnit(
  user: ReturnType<typeof userEvent.setup>,
  caption: 'From' | 'To',
  symbol: string
): Promise<void> {
  await user.click(within(unitRow(caption)).getByRole('button', { name: symbol }));
}

describe('Converter result formatting', () => {
  it('shows nothing and advertises the precision before a value is entered', () => {
    render(<Converter />);

    expect(screen.getByLabelText('Result in mile')).toHaveValue('');
    expect(screen.getByText('6 significant figures')).toBeInTheDocument();
  });

  it('AC-032: shows a long decimal result to about 6 significant figures', async () => {
    const user = userEvent.setup();
    render(<Converter />);

    await user.type(screen.getByLabelText('Value in kilometre'), '1');

    expect(screen.getByLabelText('Result in mile')).toHaveValue('0.621371');
  });

  it('AC-032: rounds the unit rate hint to the same precision', async () => {
    const user = userEvent.setup();
    render(<Converter />);

    await user.type(screen.getByLabelText('Value in kilometre'), '1');

    expect(screen.getByText('1 km = 0.621371 mi')).toBeInTheDocument();
  });

  it('AC-033: trims trailing zeros so a result reads as 2.5', async () => {
    const user = userEvent.setup();
    render(<Converter />);

    await pickUnit(user, 'To', 'm');
    await user.type(screen.getByLabelText('Value in kilometre'), '0.0025');

    expect(screen.getByLabelText('Result in metre')).toHaveValue('2.5');
  });

  it('AC-033: trims trailing zeros so a whole result reads as 5', async () => {
    const user = userEvent.setup();
    render(<Converter />);

    await pickUnit(user, 'To', 'm');
    await user.type(screen.getByLabelText('Value in kilometre'), '0.005');

    expect(screen.getByLabelText('Result in metre')).toHaveValue('5');
  });

  it('AC-034: falls back to exponential notation for 1 byte in terabytes', async () => {
    const user = userEvent.setup();
    render(<Converter />);

    await user.click(screen.getByRole('button', { name: 'Data' }));
    await pickUnit(user, 'From', 'B');
    await pickUnit(user, 'To', 'TB');
    await user.type(screen.getByLabelText('Value in byte'), '1');

    expect(screen.getByLabelText('Result in terabyte (decimal)')).toHaveValue('1e-12');
  });

  it('AC-034: falls back to exponential notation for a very large result', async () => {
    const user = userEvent.setup();
    render(<Converter />);

    await user.click(screen.getByRole('button', { name: 'Data' }));
    await pickUnit(user, 'From', 'TB');
    await pickUnit(user, 'To', 'B');
    await user.type(screen.getByLabelText('Value in terabyte (decimal)'), '1');

    expect(screen.getByLabelText('Result in byte')).toHaveValue('1e+12');
  });

  it('AC-035: suppresses a floating-point artefact in the displayed result', async () => {
    const user = userEvent.setup();
    render(<Converter />);

    await user.click(screen.getByRole('button', { name: 'Volume' }));
    await pickUnit(user, 'To', 'ml');
    await user.type(screen.getByLabelText('Value in litre'), '0.1');

    // The raw arithmetic is 100.00000000000001.
    expect(screen.getByLabelText('Result in millilitre')).toHaveValue('100');
  });

  it('AC-035: suppresses an artefact produced by the keypad as well', async () => {
    const user = userEvent.setup();
    render(<Converter />);

    await user.click(screen.getByRole('button', { name: 'Volume' }));
    await pickUnit(user, 'To', 'ml');
    await user.click(screen.getByRole('button', { name: '.' }));
    await user.click(screen.getByRole('button', { name: '1' }));

    expect(screen.getByLabelText('Value in litre')).toHaveValue('0.1');
    expect(screen.getByLabelText('Result in millilitre')).toHaveValue('100');
  });
});
